(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const n = (id) => Math.max(0,Number($(id).value)||0);
const MINIMUM_WAGE = new Date() >= new Date("2026-09-30T00:00:00-04:00") ? 15 : 14;
const MINIMUM_MONTHLY_GROSS = MINIMUM_WAGE * 40 * 52 / 12;
$("minimumIncomeLabel").textContent=money.format(MINIMUM_MONTHLY_GROSS)+" per month";
$("grossA").min=MINIMUM_MONTHLY_GROSS.toFixed(2);$("grossB").min=MINIMUM_MONTHLY_GROSS.toFixed(2);

function bracketTax(taxable,status){
  const tops=status==="Married filing jointly"?[24800,100800,211400,403550,512450,768700]:
    status==="Head of household"?[17700,67450,105700,201750,256200,640600]:
    status==="Married filing separately"?[12400,50400,105700,201775,256225,384350]:
    [12400,50400,105700,201775,256225,640600];
  const rates=[.10,.12,.22,.24,.32,.35,.37];
  let tax=0,last=0;
  tops.forEach((top,i)=>{tax+=Math.max(0,Math.min(taxable,top)-last)*rates[i];last=top;});
  if(taxable>last) tax+=(taxable-last)*rates.at(-1);
  return tax;
}
function parentIncome(side){
  const grossMonthly=n("gross"+side),grossAnnual=grossMonthly*12;
  const status=$("status"+side).value,type=$("type"+side).value,deps=n("dependents"+side);
  const isSE=type==="se";
  const seTaxable=isSE?grossAnnual*.9235:0;
  const socialSecurity=Math.min(isSE?seTaxable:grossAnnual,184500)*(isSE?.124:.062);
  const medicare=(isSE?seTaxable:grossAnnual)*(isSE?.029:.0145);
  const halfSE=isSE?(socialSecurity+medicare)/2:0;
  const standard=status==="Married filing jointly"?32200:status==="Head of household"?24150:16100;
  const taxable=Math.max(0,grossAnnual-halfSE-standard);
  const federalBeforeCredits=bracketTax(taxable,status);
  const creditThreshold=status==="Married filing jointly"?400000:200000;
  const creditPhaseout=Math.max(0,Math.ceil((grossAnnual-creditThreshold)/1000)*50);
  const childCredit=Math.max(0,deps*2200-creditPhaseout);
  const federal=Math.max(0,federalBeforeCredits-Math.min(federalBeforeCredits,childCredit));
  const taxes=(federal+socialSecurity+medicare)/12;
  const allowed=["union","retirement","insurance","otherSupport","alimony"].reduce((sum,key)=>sum+n(key+side),0);
  return {grossMonthly,taxes,allowed,net:Math.max(0,grossMonthly-taxes-allowed)};
}
function guidelineNeed(combined,count){
  const idx=Math.min(Math.max(Math.round(count),1),6);
  if(combined<800)return null;
  if(combined>10000)return GUIDELINE_ROWS.at(-1)[idx]+(combined-10000)*OVER_10000_RATES[idx-1];
  let row=GUIDELINE_ROWS[0];
  for(const candidate of GUIDELINE_ROWS){if(candidate[0]<=combined)row=candidate;else break;}
  return row[idx];
}
function updateOvernights(){
  const value=Math.min(365,Math.max(0,Math.round(n("overnightsA"))));
  $("overnightsA").value=value;$("overnightsB").value=365-value;
}
function showMessage(amount,direction,combined,netA,netB,basic,additions,method,explanation){
  $("result").hidden=false;$("amount").textContent=amount;$("direction").textContent=direction;
  $("combined").textContent=typeof combined==="number"?money.format(combined):combined;
  $("netA").textContent=typeof netA==="number"?money.format(netA):netA;
  $("netB").textContent=typeof netB==="number"?money.format(netB):netB;
  $("basic").textContent=typeof basic==="number"?money.format(basic):basic;
  $("additions").textContent=typeof additions==="number"?money.format(additions):additions;
  $("method").textContent=method;$("explanation").textContent=explanation;$("result").focus();
}
$("overnightsA").addEventListener("input",updateOvernights);
$("calculator").addEventListener("reset",()=>setTimeout(()=>{$("result").hidden=true;updateOvernights();},0));
$("calculator").addEventListener("submit",(event)=>{
  event.preventDefault();
  const a=parentIncome("A"),b=parentIncome("B");
  if(a.grossMonthly<MINIMUM_MONTHLY_GROSS||b.grossMonthly<MINIMUM_MONTHLY_GROSS){
    showMessage("Income below public-calculator limit","Talk with an attorney for an individualized calculation","—","—","—","—","—","Minimum-wage limitation","Each parent's gross earned income must be at least the full-time Florida minimum-wage equivalent of "+money.format(MINIMUM_MONTHLY_GROSS)+" per month for this public calculator.");
    return;
  }
  const combined=a.net+b.net,children=Number($("children").value),basic=guidelineNeed(combined,children);
  if(combined>10000&&!window.confirm("Combined estimated monthly net income is more than $10,000. The statutory calculation continues above the guideline table, but higher-income cases should be reviewed by an attorney. Continue with the estimate?"))return;
  if(combined<800){
    showMessage("Separate analysis required","Combined monthly net income is below the statutory schedule.",combined,a.net,b.net,"Not calculated","—","Low-income rule","Florida law requires a case-specific low-income calculation. Please speak with an attorney.");
    return;
  }
  const shareA=a.net/combined,shareB=b.net/combined;
  const prepaidA=n("childcareA")+n("healthA")+n("medicalA");
  const prepaidB=n("childcareB")+n("healthB")+n("medicalB");
  const additions=prepaidA+prepaidB;
  const overA=n("overnightsA"),overB=365-overA,pctA=overA/365,pctB=overB/365,shared=pctA>=.2&&pctB>=.2;
  let from,to,transfer;
  if(shared){
    const aOwes=basic*1.5*shareA*pctB+additions*shareA-prepaidA;
    const bOwes=basic*1.5*shareB*pctA+additions*shareB-prepaidB;
    if(aOwes>=bOwes){from="Parent A";to="Parent B";transfer=aOwes-bOwes;}else{from="Parent B";to="Parent A";transfer=bOwes-aOwes;}
  }else if(overA>=overB){from="Parent B";to="Parent A";transfer=(basic+additions)*shareB-prepaidB;}
  else{from="Parent A";to="Parent B";transfer=(basic+additions)*shareA-prepaidA;}
  transfer=Math.max(0,transfer);
  const highIncome=combined>10000?" Combined net income exceeds $10,000; talk with an attorney about the result.":"";
  showMessage(money.format(transfer),transfer?from+" pays "+to:"No transfer shown from these inputs",combined,a.net,b.net,basic,additions,shared?"Substantial time-sharing":"Regular guideline",(shared?"Both parents have at least 73 overnights, so the substantial time-sharing method is applied.":"Only one parent has at least 73 overnights, so the regular guideline allocation is applied.")+highIncome);
});
$("print").addEventListener("click",()=>window.print());
})();
