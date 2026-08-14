(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const n = (id) => Math.max(0, Number($(id).value) || 0);
function guidelineNeed(combined, count){
  const idx=Math.min(Math.max(Math.round(count),1),6);
  if(combined<800) return null;
  if(combined>10000) return GUIDELINE_ROWS[GUIDELINE_ROWS.length-1][idx]+(combined-10000)*OVER_10000_RATES[idx-1];
  let row=GUIDELINE_ROWS[0];
  for(const candidate of GUIDELINE_ROWS){if(candidate[0]<=combined) row=candidate; else break;}
  return row[idx];
}
function paid(amount,payer){
  if(payer==="a") return {a:amount,b:0};
  if(payer==="b") return {a:0,b:amount};
  if(payer==="both") return {a:amount/2,b:amount/2};
  return {a:0,b:0};
}
function updateOvernights(){
  const value=Math.min(365,Math.max(0,Math.round(n("overnightsA"))));
  $("overnightsA").value=value;
  $("overnightsB").value=365-value;
}
$("overnightsA").addEventListener("input",updateOvernights);
$("calculator").addEventListener("reset",()=>setTimeout(()=>{$("result").hidden=true;updateOvernights();},0));
$("calculator").addEventListener("submit",(event)=>{
  event.preventDefault();
  const incomeA=n("incomeA"),incomeB=n("incomeB"),combined=incomeA+incomeB;
  if(combined<800){
    $("result").hidden=false;
    $("amount").textContent="Separate analysis required";
    $("direction").textContent="Combined monthly net income is below the statutory schedule.";
    $("combined").textContent=money.format(combined);
    $("basic").textContent="Not calculated";$("additions").textContent="—";$("method").textContent="Low-income rule";
    $("explanation").textContent="Florida law requires a case-specific calculation that includes the obligor's income and the current federal poverty guideline. This calculator will not display a misleading table estimate.";
    $("result").focus();return;
  }
  if(!incomeA&&!incomeB) return;
  const children=Number($("children").value),basic=guidelineNeed(combined,children);
  const shareA=incomeA/combined,shareB=incomeB/combined;
  const care=paid(n("childcare"),$("childcarePayer").value);
  const health=paid(n("health"),$("healthPayer").value);
  const medical=paid(n("medical"),$("medicalPayer").value);
  const additions=n("childcare")+n("health")+n("medical");
  const prepaidA=care.a+health.a+medical.a,prepaidB=care.b+health.b+medical.b;
  const overA=n("overnightsA"),overB=365-overA,pctA=overA/365,pctB=overB/365;
  const shared=pctA>=.2&&pctB>=.2;
  let aOwes,bOwes,from,to,transfer;
  if(shared){
    aOwes=basic*1.5*shareA*pctB+additions*shareA-prepaidA;
    bOwes=basic*1.5*shareB*pctA+additions*shareB-prepaidB;
    if(aOwes>=bOwes){from="Parent A";to="Parent B";transfer=aOwes-bOwes;}
    else{from="Parent B";to="Parent A";transfer=bOwes-aOwes;}
  }else if(overA>=overB){
    from="Parent B";to="Parent A";transfer=(basic+additions)*shareB-prepaidB;
  }else{
    from="Parent A";to="Parent B";transfer=(basic+additions)*shareA-prepaidA;
  }
  transfer=Math.max(0,transfer);
  $("result").hidden=false;
  $("amount").textContent=money.format(transfer);
  $("direction").textContent=transfer ? from+" pays "+to : "No transfer shown from these inputs";
  $("combined").textContent=money.format(combined);
  $("basic").textContent=money.format(basic);
  $("additions").textContent=money.format(additions);
  $("method").textContent=shared?"Substantial time-sharing":"Regular guideline";
  $("explanation").textContent=shared
    ?"Both parents have at least 73 overnights, so the statutory substantial time-sharing gross-up method is applied."
    :"Only one parent has at least 73 overnights, so the regular guideline allocation is applied.";
  $("result").focus();
});
$("print").addEventListener("click",()=>window.print());
})();
