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
console.log("Calculator guideline tests passed.");
