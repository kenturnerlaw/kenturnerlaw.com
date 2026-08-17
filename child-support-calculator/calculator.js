(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US", {style:"currency", currency:"USD", maximumFractionDigits:0});
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const n = (id) => {
  const el = $(id);
  return el ? Math.max(0, Number(el.value) || 0) : 0;
};
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
  const statusEl = $("status" + side);
  const typeEl = $("type" + side);
  const status = statusEl ? statusEl.value : "Single";
  const type = typeEl ? typeEl.value : "w2";
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

function syncOvernights(sourceSide) {
  const otherSide = sourceSide === "A" ? "B" : "A";
  const source = $("overnights" + sourceSide);
  const other = $("overnights" + otherSide);
  if (!source || !other) return;
  const value = Math.min(365, Math.max(0, Math.round(Number(source.value) || 0)));
  source.value = value;
  other.value = 365 - value;
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
  const childrenEl = $("children");
  const children = childrenEl ? Number(childrenEl.value) : 1;
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

["A","B"].forEach((side) => {
  ["gross","dependents","union","retirement","insurance","otherSupport","alimony"].forEach((name) => {
    on(name + side, "input", () => renderLive(side));
  });
  ["type","status"].forEach((name) => {
    on(name + side, "change", () => renderLive(side));
  });
});

on("overnightsA", "input", () => syncOvernights("A"));
on("overnightsB", "input", () => syncOvernights("B"));
on("calculateSupport", "click", calculateSupport);
on("resetCalculator", "click", resetCalculator);
})();