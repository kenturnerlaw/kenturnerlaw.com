/* Florida child support calculator UI logic. Guideline schedule is loaded from guidelines.js. */
(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2});
const pct = (v) => (v*100).toFixed(1)+"%";
const n = (id) => Math.max(0,Number($(id).value)||0);
const MINIMUM_WAGE = new Date() >= new Date("2026-09-30T00:00:00-04:00") ? 15 : 14;
const MINIMUM_MONTHLY_GROSS = MINIMUM_WAGE * 40 * 52 / 12;
const SS_WAGE_BASE = 184500;
const OVER_10000_RATES = [0.05,0.075,0.095,0.11,0.12,0.125];

const guidelinePromise = fetch("/child-support-calculator/guidelines.js")
  .then((response) => { if(!response.ok) throw new Error("Guideline table could not be loaded."); return response.text(); })
  .then((text) => {
    const start=text.indexOf("[");
    const end=text.indexOf("];",start);
    if(start<0||end<0) throw new Error("Guideline table is invalid.");
    return JSON.parse(text.slice(start,end+1));
  });

function bracketTax(taxable,status){
  const tops=status==="Married filing jointly"?[24800,100800,211400,403550,512450,768700]:
    status==="Head of household"?[17700,67450,105700,201750,256200,640600]:
    status==="Married filing separately"?[12400,50400,105700,201775,256225,384350]:
    [12400,50400,105700,201775,256225,640600];
  const rates=[.10,.12,.22,.24,.32,.35,.37];
  let tax=0,last=0;
  tops.forEach((top,i)=>{tax+=Math.max(0,Math.min(taxable,top)-last)*rates[i];last=top;});
  if(taxable>last) tax+=(taxable-last)*.37;
  return tax;
}

function parentIncome(side){
  const grossMonthly=n("gross"+side),grossAnnual=grossMonthly*12;
  const status=$("status"+side).value,type=$("type"+side).value,deps=n("dependents"+side);
  const isSE=type==="se";
  const seTaxable=isSE?grossAnnual*.9235:0;
  const ssBase=Math.min(isSE?seTaxable:grossAnnual,SS_WAGE_BASE);
  const socialSecurity=ssBase*(isSE?.124:.062);
  const medicare=(isSE?seTaxable:grossAnnual)*(isSE?.029:.0145);
  const halfSE=isSE?(socialSecurity+medicare)/2:0;
  const standard=status==="Married filing jointly"?32200:status==="Head of household"?24150:16100;
  const taxable=Math.max(0,grossAnnual-halfSE-standard);
  const federalBeforeCredits=bracketTax(taxable,status);
  const creditThreshold=status==="Married filing jointly"?400000:200000;
  const creditPhaseout=Math.max(0,Math.ceil(Math.max(0,grossAnnual-creditThreshold)/1000)*50);
  const potentialChildCredit=Math.max(0,deps*2200-creditPhaseout);
  const childCreditUsed=Math.min(federalBeforeCredits,potentialChildCredit);
  const federal=Math.max(0,federalBeforeCredits-childCreditUsed);
  const taxes=(federal+socialSecurity+medicare)/12;
  const allowed=["union","retirement","insurance","otherSupport","alimony"].reduce((sum,key)=>sum+n(key+side),0);
  return {grossMonthly,grossAnnual,status,isSE,seTaxable,standard,taxable,federalBeforeCredits,potentialChildCredit,childCreditUsed,federal,socialSecurity,medicare,taxes,allowed,net:Math.max(0,grossMonthly-taxes-allowed)};
}

function guidelineNeed(rows,combined,count){
  const idx=Math.min(Math.max(Math.round(count),1),6);
  if(combined<800)return null;
  if(combined>10000)return rows[rows.length-1][idx]+(combined-10000)*OVER_10000_RATES[idx-1];
  let row=rows[0];
  for(const candidate of rows){if(candidate[0]<=combined)row=candidate;else break;}
  return row[idx];
}

function text(id,value){$(id).textContent=value;}
function cash(id,value){text(id,typeof value==="number"?money.format(value):value);}
function showParentMath(side,p){
  cash("mathGross"+side,p.grossMonthly);
  cash("mathAnnual"+side,p.grossAnnual);
  cash("mathStandard"+side,p.standard);
  cash("mathHalfSE"+side,p.isSE?p.socialSecurity/2+p.medicare/2:0);
  cash("mathTaxable"+side,p.taxable);
  cash("mathFedBefore"+side,p.federalBeforeCredits);
  cash("mathCredit"+side,p.childCreditUsed);
  cash("mathFederal"+side,p.federal/12);
  cash("mathSS"+side,p.socialSecurity/12);
  cash("mathMedicare"+side,p.medicare/12);
  cash("mathAllowed"+side,p.allowed);
  cash("mathNet"+side,p.net);
}
function showMessage(amount,direction,combined,a,b,basic,additions,method,explanation){
  $("result").hidden=false;
  text("amount",amount);text("direction",direction);
  cash("combined",combined);cash("netA",a.net);cash("netB",b.net);cash("basic",basic);cash("additions",additions);
  text("method",method);text("explanation",explanation);
  showParentMath("A",a);showParentMath("B",b);
}
function updateOvernights(){
  const value=Math.min(365,Math.max(0,Math.round(n("overnightsA"))));
  $("overnightsA").value=value;$("overnightsB").value=365-value;
}

$("overnightsA").addEventListener("input",updateOvernights);
$("resetCalculator").addEventListener("click",()=>{
  $("calculator").reset();
  $("overnightsB").value=183;
  $("result").hidden=true;
  text("calcStatus","");
});

$("calculateSupport").addEventListener("click",async()=>{
  text("calcStatus","Calculating…");
  try{
    const rows=await guidelinePromise;
    const a=parentIncome("A"),b=parentIncome("B");
    if(a.grossMonthly<MINIMUM_MONTHLY_GROSS||b.grossMonthly<MINIMUM_MONTHLY_GROSS){
      showMessage("Income below calculator limit","An individualized low-income analysis is required","—",a,b,"—","—","Minimum-wage limitation","For this public estimate, each parent's gross earned income must be at least "+money.format(MINIMUM_MONTHLY_GROSS)+" per month, based on Florida's applicable minimum wage on the calculation date.");
      text("supportMath","No guideline transfer was calculated because the public calculator's income floor was not met.");
      text("calcStatus","");return;
    }
    const combined=a.net+b.net,children=Number($("children").value),basic=guidelineNeed(rows,combined,children);
    if(combined<800){
      showMessage("Separate analysis required","Combined monthly net income is below the statutory schedule.",combined,a,b,"Not calculated",0,"Low-income rule","Florida law requires a case-specific low-income calculation.");
      text("supportMath","Combined net income is below $800, so this calculator stops rather than guessing at the low-income calculation.");
      text("calcStatus","");return;
    }
    const shareA=a.net/combined,shareB=b.net/combined;
    const prepaidA=n("childcareA")+n("healthA")+n("medicalA");
    const prepaidB=n("childcareB")+n("healthB")+n("medicalB");
    const additions=prepaidA+prepaidB;
    const overA=n("overnightsA"),overB=365-overA,pctA=overA/365,pctB=overB/365,shared=pctA>=.2&&pctB>=.2;
    let from,to,transfer,formula;
    if(shared){
      const aOwes=basic*1.5*shareA*pctB+additions*shareA-prepaidA;
      const bOwes=basic*1.5*shareB*pctA+additions*shareB-prepaidB;
      if(aOwes>=bOwes){from="Parent A";to="Parent B";transfer=aOwes-bOwes;}else{from="Parent B";to="Parent A";transfer=bOwes-aOwes;}
      formula="Substantial time-sharing: basic need × 150% × each parent's income share × the other parent's overnight share, then child expenses and prepaid credits are applied. Parent A obligation: "+money.format(aOwes)+"; Parent B obligation: "+money.format(bOwes)+"; difference: "+money.format(Math.abs(aOwes-bOwes))+".";
    }else if(overA>=overB){
      from="Parent B";to="Parent A";transfer=(basic+additions)*shareB-prepaidB;
      formula="Regular guideline: (basic need "+money.format(basic)+" + child expenses "+money.format(additions)+") × Parent B income share "+pct(shareB)+" − Parent B prepaid child expenses "+money.format(prepaidB)+" = "+money.format(Math.max(0,transfer))+".";
    }else{
      from="Parent A";to="Parent B";transfer=(basic+additions)*shareA-prepaidA;
      formula="Regular guideline: (basic need "+money.format(basic)+" + child expenses "+money.format(additions)+") × Parent A income share "+pct(shareA)+" − Parent A prepaid child expenses "+money.format(prepaidA)+" = "+money.format(Math.max(0,transfer))+".";
    }
    transfer=Math.max(0,transfer);
    text("shareA",pct(shareA));text("shareB",pct(shareB));
    text("overnightPctA",pct(pctA));text("overnightPctB",pct(pctB));
    text("supportMath",formula);
    const highIncome=combined>10000?" Combined net income exceeds $10,000; the statutory percentage extension above the table was used and the result should be reviewed carefully.":"";
    showMessage(money.format(transfer),transfer?from+" pays "+to:"No transfer shown from these inputs",combined,a,b,basic,additions,shared?"Substantial time-sharing":"Regular guideline",(shared?"Both parents have at least 20% of the overnights, so the substantial time-sharing method is applied.":"Only one parent has at least 20% of the overnights, so the regular guideline allocation is applied.")+highIncome);
    text("calcStatus","");
  }catch(error){
    text("calcStatus","The calculator could not complete the calculation. Please reload the page and try again.");
  }
});
})();
