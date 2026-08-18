import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

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

const expectedHash = 'sha384-' + crypto
  .createHash('sha384')
  .update(bundle, 'utf8')
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');
assert(html.includes(`<meta name="amp-script-src" content="${expectedHash}">`), 'AMP script hash is missing or stale');

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
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(handler);
    },
    reset() {},
  };
}

for (const id of ids) elements.set(id, makeElement(id));

const get = (id) => elements.get(id);
const setInitial = (id, value) => {
  assert(get(id), `Expected page element #${id}`);
  get(id).value = String(value);
};
const fire = (id, event, eventValue) => {
  const el = get(id);
  assert(el, `Expected page element #${id}`);
  const handlers = el.listeners.get(event) || [];
  assert(handlers.length, `No ${event} listener attached to #${id}`);
  const target = typeof eventValue === 'undefined' ? el : {id, value:String(eventValue)};
  for (const handler of handlers) handler({type:event, target, preventDefault() {}});
};

for (const side of ['A', 'B']) {
  setInitial(`gross${side}`, '');
  setInitial(`type${side}`, 'w2');
  setInitial(`status${side}`, 'Single');
  setInitial(`dependents${side}`, 0);
  for (const key of ['union','retirement','insurance','otherSupport','alimony']) setInitial(`${key}${side}`, 0);
}
setInitial('children', 1);
setInitial('overnightsA', 182);
setInitial('overnightsB', 183);
for (const side of ['A', 'B']) {
  for (const key of ['childcare','health','medical']) setInitial(`${key}${side}`, 0);
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

assert((get('calculateSupport').listeners.get('click') || []).length, 'Calculate click listener was not attached');
assert((get('grossA').listeners.get('keyup') || []).length, 'Parent A keyup listener was not attached');
assert((get('overnightsA').listeners.get('keyup') || []).length, 'Parent A overnight keyup listener was not attached');
assert((get('overnightsB').listeners.get('change') || []).length, 'Parent B overnight change listener was not attached');

// Simulate WorkerDOM's one-way synchronization: event.target has the new user value,
// while the worker's previously copied DOM element remains stale until our code records it.
fire('grossA', 'keyup', 5000);
fire('grossB', 'keyup', 4000);
assert(get('grossA').value === '', 'Test setup accidentally synchronized grossA DOM value');
assert(get('liveTaxesA').textContent && get('liveTaxesA').textContent !== '$0', 'Live Parent A taxes did not calculate from event state');
assert(get('liveNetA').textContent && get('liveNetA').textContent !== '$0', 'Live Parent A net income did not calculate from event state');

fire('overnightsA', 'keyup', 100);
assert(get('overnightsA').value === 100 || get('overnightsA').value === '100', 'Parent A overnight edit was not applied');
assert(get('overnightsB').value === 265 || get('overnightsB').value === '265', 'Parent A overnight edit did not update Parent B to 265');

fire('overnightsB', 'change', 120);
assert(get('overnightsA').value === 245 || get('overnightsA').value === '245', 'Parent B overnight edit did not update Parent A to 245');
assert(get('overnightsB').value === 120 || get('overnightsB').value === '120', 'Parent B overnight edit was not applied');

fire('calculateSupport', 'click');
assert(get('result').hidden === false, 'Calculate did not reveal the result');
assert(/^\$[\d,]+/.test(get('amount').textContent), 'Calculate did not produce a dollar support result');
assert(get('mathNetA').textContent && get('mathNetA').textContent !== '$0', 'Detailed Parent A net-income math was not populated');
assert(get('mathFederalA').textContent, 'Detailed Parent A federal-tax math was not populated');
assert(get('shareA').textContent.includes('%'), 'Parent A income share was not populated');
assert(get('overnightPctA').textContent.includes('%'), 'Parent A overnight percentage was not populated');
assert(get('supportMath').textContent.includes('Estimated transfer'), 'Support formula explanation was not populated');

console.log(`Calculator WorkerDOM-state test passed: ${get('amount').textContent}, A taxes ${get('liveTaxesA').textContent}, overnights ${get('overnightsA').value}/${get('overnightsB').value}.`);
