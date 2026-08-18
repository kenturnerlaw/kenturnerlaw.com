(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0});
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const state = Object.create(null);

const readDomValue = (id) => {
  const el = $(id);
  return el ? el.value : "";
};
const getValue = (id) => Object.prototype.hasOwnProperty.call(state, id) ? state[id] : readDomValue(id);
const remember = (id, value) => {
  state[id] = value == null ? "" : String(value);
};
const rememberEvent = (id, event) => {
  if (event && event.target && typeof event.target.value !== "undefined") remember(id, event.target.value);
  else remember(id, readDomValue(id));
};
const n = (id) => Math.max(0, Number(getValue(id)) || 0);
const setText = (id, value) => {
  const el = $(id);
  if (el) el.textContent = value;
};
const on = (id, event, handler) => {
  const el = $(id);
  if (el) el.addEventListener(event, handler);
};

const MINIMUM_WAGE = new Date() >= new Date("2026-09-30T00:00:00-04:00") ? 15 : 14;
const MINIMUM_MONTHLY_GROSS = MINIMUM_WAGE * 40 * 52 / 12;

function bracketTax(taxable, status) {
  const tops = status === "Married filing jointly" ? [24800,100800,211400,403550,512450,768700] :
    status === "Head of household" ? [17700,67450,105700,201750,256200,640600] :
    status === "Married filing separately" ? [12400,50400,105700,201775,256225,384350] :
    [12400,50400,105700,201775,256225,640600];
  const rates = [.10,.12,.22,.24,.32,.35,.37];
  let tax = 0;
  let last = 0;
  tops.forEach((top, i) => {
    tax += Math.max(0, Math.min(taxable, top) - last) * rates[i];
    last = top;
  });
  if (taxable > last) tax += (taxable - last) * rates[rates.length - 1];
  return tax;
}

function parentIncome(side) {
  const grossMonthly = n("gross" + side);
  const grossAnnual = grossMonthly * 12;
  const status = getValue("status" + side) || "Single";
  const type = getValue("type" + side) || "w2";
  const deps = n("dependents" + side);
  const isSE = type === "se";
  const seTaxable = isSE ? grossAnnual * .9235 : 0;
  const ssAnnual = Math.min(isSE ? seTaxable : grossAnnual, 184500) * (isSE ? .124 : .062);
  const medicareAnnual = (isSE ? seTaxable : grossAnnual) * (isSE ? .029 : .0145);
  const halfSE = isSE ? (ssAnnual + medicareAnnual) / 2 : 0;
  const standard = status === "Married filing jointly" ? 32200 :
    status === "Head of household" ? 24150 : 16100;
  const taxable = Math.max(0, grossAnnual - halfSE - standard);
  const federalBeforeCredits = bracketTax(taxable, status);
  const creditThreshold = status === "Married filing jointly" ? 400000 : 200000;
  const creditPhaseout = Math.max(0, Math.ceil((grossAnnual - creditThreshold) / 1000) * 50);
  const availableChildCredit = Math.max(0, deps * 2200 - creditPhaseout);
  const childCreditUsed = Math.min(federalBeforeCredits, availableChildCredit);
  const federalAnnual = Math.max(0, federalBeforeCredits - childCreditUsed);
  const federalMonthly = federalAnnual / 12;
  const socialSecurityMonthly = ssAnnual / 12;
  const medicareMonthly = medicareAnnual / 12;
  const taxes = federalMonthly + socialSecurityMonthly + medicareMonthly;
  const allowed = ["union","retirement","insurance","otherSupport","alimony"]
    .reduce((sum, key) => sum + n(key + side), 0);
  const net = Math.max(0, grossMonthly - taxes - allowed);
  return {
    grossMonthly, grossAnnual, standard, halfSE, taxable, federalBeforeCredits,
    childCreditUsed, federalMonthly, socialSecurityMonthly, medicareMonthly,
    taxes, allowed, net
  };
}

function guidelineNeed(combined, count) {
  const idx = Math.min(Math.max(Math.round(count), 1), 6);
  if (combined < 800) return null;
  if (combined > 10000) {
    return GUIDELINE_ROWS[GUIDELINE_ROWS.length - 1][idx] +
      (combined - 10000) * OVER_10000_RATES[idx - 1];
  }
  let row = GUIDELINE_ROWS[0];
  for (const candidate of GUIDELINE_ROWS) {
    if (candidate[0] <= combined) row = candidate;
    else break;
  }
  return row[idx];
}

function renderLive(side) {
  const data = parentIncome(side);
  setText("liveFederal" + side, money.format(data.federalMonthly));
  setText("liveSS" + side, money.format(data.socialSecurityMonthly));
  setText("liveMedicare" + side, money.format(data.medicareMonthly));
  setText("liveTaxes" + side, money.format(data.taxes));
  setText("liveNet" + side, money.format(data.net));
  return data;
}

function renderDetailed(side, data) {
  setText("mathGross" + side, money.format(data.grossMonthly));
  setText("mathAnnual" + side, money.format(data.grossAnnual));
  setText("mathStandard" + side, money.format(data.standard));
  setText("mathHalfSE" + side, money.format(data.halfSE));
  setText("mathTaxable" + side, money.format(data.taxable));
  setText("mathFedBefore" + side, money.format(data.federalBeforeCredits));
  setText("mathCredit" + side, money.format(data.childCreditUsed));
  setText("mathFederal" + side, money.format(data.federalMonthly));
  setText("mathSS" + side, money.format(data.socialSecurityMonthly));
  setText("mathMedicare" + side, money.format(data.medicareMonthly));
  setText("mathAllowed" + side, money.format(data.allowed));
  setText("mathNet" + side, money.format(data.net));
}

function syncOvernights(sourceSide, event) {
  const otherSide = sourceSide === "A" ? "B" : "A";
  const sourceId = "overnights" + sourceSide;
  const otherId = "overnights" + otherSide;
  rememberEvent(sourceId, event);
  const value = Math.min(365, Math.max(0, Math.round(Number(getValue(sourceId)) || 0)));
  const otherValue = 365 - value;
  remember(sourceId, value);
  remember(otherId, otherValue);
  const source = $(sourceId);
  const other = $(otherId);
  if (source) source.value = value;
  if (other) other.value = otherValue;
}

function showMessage(amount, direction, combined, netA, netB, basic, additions, method, explanation) {
  const result = $("result");
  if (result) result.hidden = false;
  setText("amount", amount);
  setText("direction", direction);
  setText("combined", typeof combined === "number" ? money.format(combined) : combined);
  setText("netA", typeof netA === "number" ? money.format(netA) : netA);
  setText("netB", typeof netB === "number" ? money.format(netB) : netB);
  setText("basic", typeof basic === "number" ? money.format(basic) : basic);
  setText("additions", typeof additions === "number" ? money.format(additions) : additions);
  setText("method", method);
  setText("explanation", explanation);
}

function calculateSupport() {
  syncOvernights("A");
  const a = renderLive("A");
  const b = renderLive("B");
  renderDetailed("A", a);
  renderDetailed("B", b);

  if (a.grossMonthly < MINIMUM_MONTHLY_GROSS || b.grossMonthly < MINIMUM_MONTHLY_GROSS) {
    showMessage(
      "Income below public-calculator limit",
      "Talk with an attorney for an individualized calculation",
      "—","—","—","—","—",
      "Minimum-wage limitation",
      "Each parent's gross earned income must be at least the full-time Florida minimum-wage equivalent of " +
        money.format(MINIMUM_MONTHLY_GROSS) + " per month for this public calculator."
    );
    setText("calcStatus", "Enter monthly gross income for both parents at or above the calculator's minimum-income floor.");
    return;
  }

  const combined = a.net + b.net;
  const children = Number(getValue("children") || 1);
  const basic = guidelineNeed(combined, children);

  if (combined < 800) {
    showMessage(
      "Separate analysis required",
      "Combined monthly net income is below the statutory schedule.",
      combined, a.net, b.net, "Not calculated", "—",
      "Low-income rule",
      "Florida law requires a case-specific low-income calculation. Please speak with an attorney."
    );
    setText("calcStatus", "A separate low-income calculation is required.");
    return;
  }

  const shareA = a.net / combined;
  const shareB = b.net / combined;
  const prepaidA = n("childcareA") + n("healthA") + n("medicalA");
  const prepaidB = n("childcareB") + n("healthB") + n("medicalB");
  const additions = prepaidA + prepaidB;
  const overA = n("overnightsA");
  const overB = 365 - overA;
  const pctA = overA / 365;
  const pctB = overB / 365;
  const shared = pctA >= .2 && pctB >= .2;

  let from;
  let to;
  let transfer;
  let formula;

  if (shared) {
    const aOwes = basic * 1.5 * shareA * pctB + additions * shareA - prepaidA;
    const bOwes = basic * 1.5 * shareB * pctA + additions * shareB - prepaidB;
    if (aOwes >= bOwes) {
      from = "Parent A";
      to = "Parent B";
      transfer = aOwes - bOwes;
    } else {
      from = "Parent B";
      to = "Parent A";
      transfer = bOwes - aOwes;
    }
    formula =
      "Substantial time-sharing: basic need " + money.format(basic) +
      " × 1.5, allocated by each parent's net-income share and the other parent's overnight percentage, " +
      "then adjusted for child expenses already paid. Parent A obligation before offset: " + money.format(aOwes) +
      "; Parent B obligation before offset: " + money.format(bOwes) + ".";
  } else if (overA >= overB) {
    from = "Parent B";
    to = "Parent A";
    transfer = (basic + additions) * shareB - prepaidB;
    formula =
      "Regular guideline: (" + money.format(basic) + " basic need + " + money.format(additions) +
      " child expenses) × Parent B's " + pct(shareB) + " income share − " +
      money.format(prepaidB) + " already paid by Parent B.";
  } else {
    from = "Parent A";
    to = "Parent B";
    transfer = (basic + additions) * shareA - prepaidA;
    formula =
      "Regular guideline: (" + money.format(basic) + " basic need + " + money.format(additions) +
      " child expenses) × Parent A's " + pct(shareA) + " income share − " +
      money.format(prepaidA) + " already paid by Parent A.";
  }

  transfer = Math.max(0, transfer);
  const highIncome = combined > 10000
    ? " Combined net income exceeds $10,000; the statutory above-guideline percentage is included, but the result should be reviewed individually."
    : "";

  showMessage(
    money.format(transfer),
    transfer ? from + " pays " + to : "No transfer shown from these inputs",
    combined, a.net, b.net, basic, additions,
    shared ? "Substantial time-sharing" : "Regular guideline",
    (shared
      ? "Both parents have at least 73 overnights, so the substantial time-sharing method is applied."
      : "Only one parent has at least 73 overnights, so the regular guideline allocation is applied.") + highIncome
  );

  setText("shareA", pct(shareA));
  setText("shareB", pct(shareB));
  setText("overnightPctA", pct(pctA));
  setText("overnightPctB", pct(pctB));
  setText("supportMath", formula + " Estimated transfer: " + money.format(transfer) + " per month.");
  setText("calcStatus", "Calculation updated.");
}

function resetCalculator() {
  const form = $("calculator");
  if (form && typeof form.reset === "function") form.reset();
  Object.keys(state).forEach((key) => delete state[key]);
  initializeState();
  remember("overnightsA", 182);
  remember("overnightsB", 183);
  const overA = $("overnightsA");
  const overB = $("overnightsB");
  if (overA) overA.value = 182;
  if (overB) overB.value = 183;
  const result = $("result");
  if (result) result.hidden = true;
  ["A","B"].forEach((side) => {
    setText("liveFederal" + side, "$0");
    setText("liveSS" + side, "$0");
    setText("liveMedicare" + side, "$0");
    setText("liveTaxes" + side, "$0");
    setText("liveNet" + side, "$0");
  });
  setText("calcStatus", "");
}

const trackedIds = [
  "children","overnightsA","overnightsB",
  ...["A","B"].flatMap((side) => [
    "gross" + side,"type" + side,"status" + side,"dependents" + side,
    "union" + side,"retirement" + side,"insurance" + side,"otherSupport" + side,"alimony" + side,
    "childcare" + side,"health" + side,"medical" + side,
  ]),
];

function initializeState() {
  trackedIds.forEach((id) => {
    const el = $(id);
    if (el) remember(id, el.value);
  });
}

function trackAndRender(id, side) {
  const handler = (event) => {
    rememberEvent(id, event);
    renderLive(side);
  };
  on(id, "input", handler);
  on(id, "keyup", handler);
  on(id, "change", handler);
}

initializeState();

["A","B"].forEach((side) => {
  ["gross","dependents","union","retirement","insurance","otherSupport","alimony"].forEach((name) => {
    trackAndRender(name + side, side);
  });
  ["type","status"].forEach((name) => {
    trackAndRender(name + side, side);
  });
  ["childcare","health","medical"].forEach((name) => {
    const id = name + side;
    const handler = (event) => rememberEvent(id, event);
    on(id, "input", handler);
    on(id, "keyup", handler);
    on(id, "change", handler);
  });
});

const childrenHandler = (event) => rememberEvent("children", event);
on("children", "change", childrenHandler);

const overnightAHandler = (event) => syncOvernights("A", event);
const overnightBHandler = (event) => syncOvernights("B", event);
["input","keyup","change"].forEach((eventName) => {
  on("overnightsA", eventName, overnightAHandler);
  on("overnightsB", eventName, overnightBHandler);
});

on("calculateSupport", "click", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  calculateSupport();
});
on("calculator", "submit", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  calculateSupport();
});
on("resetCalculator", "click", (event) => {
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  resetCalculator();
});
})();