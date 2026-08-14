const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const source = fs.readFileSync(__dirname + "/guidelines.js", "utf8")
  .replace("const GUIDELINE_ROWS", "globalThis.GUIDELINE_ROWS")
  .replace("const OVER_10000_RATES", "globalThis.OVER_10000_RATES");
const context = {};
vm.runInNewContext(source, context);

function guidelineNeed(combined, count) {
  const idx = Math.min(Math.max(Math.round(count), 1), 6);
  if (combined < 800) return null;
  if (combined > 10000) return context.GUIDELINE_ROWS.at(-1)[idx] +
    (combined - 10000) * context.OVER_10000_RATES[idx - 1];
  let row = context.GUIDELINE_ROWS[0];
  for (const candidate of context.GUIDELINE_ROWS) {
    if (candidate[0] <= combined) row = candidate;
    else break;
  }
  return row[idx];
}

assert.equal(context.GUIDELINE_ROWS.length, 185);
assert.equal(guidelineNeed(800, 1), 190);
assert.equal(guidelineNeed(7000, 1), 1212);
assert.equal(guidelineNeed(10000, 6), 3666);
assert.equal(guidelineNeed(12000, 2), 2378);
assert.equal(guidelineNeed(799, 1), null);

const ids = ["minimumIncomeLabel","grossA","grossB","typeA","typeB","statusA","statusB","dependentsA","dependentsB",
  "unionA","unionB","retirementA","retirementB","insuranceA","insuranceB","otherSupportA","otherSupportB","alimonyA","alimonyB",
  "overnightsA","overnightsB","children","childcareA","childcareB","healthA","healthB","medicalA","medicalB",
  "calculator","result","amount","direction","combined","netA","netB","basic","additions","method","explanation","print"];
const elements = Object.fromEntries(ids.map((id) => [id,{value:"0",textContent:"",hidden:true,min:"",listeners:{},
  addEventListener(type,fn){this.listeners[type]=fn;},focus(){}}]));
Object.assign(elements.grossA,{value:"4000"});
Object.assign(elements.grossB,{value:"3000"});
Object.assign(elements.typeA,{value:"w2"});Object.assign(elements.typeB,{value:"w2"});
Object.assign(elements.statusA,{value:"Single"});Object.assign(elements.statusB,{value:"Single"});
Object.assign(elements.overnightsA,{value:"100"});Object.assign(elements.children,{value:"1"});
const browserContext = {
  GUIDELINE_ROWS: context.GUIDELINE_ROWS,OVER_10000_RATES:context.OVER_10000_RATES,
  document:{getElementById:(id)=>elements[id]},window:{confirm:()=>true,print:()=>{}},
  Intl,Date,setTimeout:(fn)=>fn()
};
vm.runInNewContext(fs.readFileSync(__dirname+"/calculator.js","utf8"),browserContext);
elements.calculator.listeners.submit({preventDefault(){}});
assert.equal(elements.netA.textContent,"$3,396");
assert.equal(elements.netB.textContent,"$2,592");
assert.equal(elements.method.textContent,"Substantial time-sharing");
console.log("Calculator guideline tests passed.");
