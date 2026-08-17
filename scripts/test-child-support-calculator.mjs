import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('child-support-calculator/index.html', 'utf8');
const bundle = fs.readFileSync('child-support-calculator/calculator-amp.js', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('id="liveTaxesA"'), 'Parent A live tax output is missing from generated HTML');
assert(html.includes('id="liveTaxesB"'), 'Parent B live tax output is missing from generated HTML');
assert(/id="overnightsB"[^>]*min="0"[^>]*max="365"/i.test(html), 'Parent B overnight input is not editable');
assert(!/id="overnightsB"[^>]*\breadonly\b/i.test(html), 'Parent B overnight input is still readonly');
assert(html.includes('id="calculateSupport"'), 'Calculate button is missing');

const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const elements = new Map();

function makeElement(id) {
  return {
    id,
    value: '',
    textContent: '',
    hidden: id === 'result',
    listeners: new Map(),
    addEventListener(type, handler) {
      this.listeners.set(type, handler);
    },
    reset() {},
  };
}

for (const id of ids) elements.set(id, makeElement(id));

const get = (id) => elements.get(id);
const set = (id, value) => {
  assert(get(id), `Expected page element #${id}`);
  get(id).value = String(value);
};
const fire = (id, event) => {
  const el = get(id);
  assert(el, `Expected page element #${id}`);
  const handler = el.listeners.get(event);
  assert(handler, `No ${event} listener attached to #${id}`);
  handler({type:event, target:el, preventDefault() {}});
};

for (const side of ['A', 'B']) {
  set(`gross${side}`, side === 'A' ? 5000 : 4000);
  set(`type${side}`, 'w2');
  set(`status${side}`, 'Single');
  set(`dependents${side}`, 0);
  for (const key of ['union','retirement','insurance','otherSupport','alimony']) {
    set(`${key}${side}`, 0);
  }
}
set('children', 1);
set('overnightsA', 182);
set('overnightsB', 183);
for (const side of ['A', 'B']) {
  for (const key of ['childcare','health','medical']) set(`${key}${side}`, 0);
}

const context = vm.createContext({
  document: {
    getElementById(id) {
      return elements.get(id) || null;
    },
  },
  Intl,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  console,
});

vm.runInContext(bundle, context, {filename:'calculator-amp.js'});

assert(get('calculateSupport').listeners.has('click'), 'Calculate click listener was not attached');
assert(get('overnightsA').listeners.has('input'), 'Parent A overnight listener was not attached');
assert(get('overnightsB').listeners.has('input'), 'Parent B overnight listener was not attached');

fire('grossA', 'input');
assert(get('liveTaxesA').textContent && get('liveTaxesA').textContent !== '$0', 'Live Parent A taxes did not calculate after income input');
assert(get('liveNetA').textContent && get('liveNetA').textContent !== '$0', 'Live Parent A net income did not calculate');

set('overnightsA', 100);
fire('overnightsA', 'input');
assert(get('overnightsB').value === 265 || get('overnightsB').value === '265', 'Parent A overnight edit did not update Parent B to 265');

set('overnightsB', 120);
fire('overnightsB', 'input');
assert(get('overnightsA').value === 245 || get('overnightsA').value === '245', 'Parent B overnight edit did not update Parent A to 245');

fire('calculateSupport', 'click');
assert(get('result').hidden === false, 'Calculate did not reveal the result');
assert(/^\$[\d,]+/.test(get('amount').textContent), 'Calculate did not produce a dollar support result');
assert(get('mathNetA').textContent && get('mathNetA').textContent !== '$0', 'Detailed Parent A net-income math was not populated');
assert(get('mathFederalA').textContent, 'Detailed Parent A federal-tax math was not populated');
assert(get('shareA').textContent.includes('%'), 'Parent A income share was not populated');
assert(get('overnightPctA').textContent.includes('%'), 'Parent A overnight percentage was not populated');
assert(get('supportMath').textContent.includes('Estimated transfer'), 'Support formula explanation was not populated');

console.log(`Calculator functional test passed: ${get('amount').textContent}, A taxes ${get('liveTaxesA').textContent}, overnights ${get('overnightsA').value}/${get('overnightsB').value}.`);
