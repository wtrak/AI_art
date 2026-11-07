"use strict";
// Artist DNA research coverage is a transparent checklist, NOT an objective style-quality score.
// The artist's review of generated tests is the actual style-fidelity validation.
const DNA_DIMENSIONS=[
  ["composition","Composition & framing"],
  ["color","Color hierarchy"],
  ["lighting","Light & atmosphere"],
  ["texture","Materials & mark-making"],
  ["emotion","Emotional purpose"],
  ["concept","Conceptual logic"],
  ["tradeoffs","Sacrifices & exceptions"],
  ["adaptation","New-subject translation"],
  ["boundaries","Must-never-do rules"],
  ["evaluation","What success looks like"]
];
const DNA_KEYS=DNA_DIMENSIONS.map(d=>d[0]);
function dnaDimension(key,text=""){
  const normalized=String(key||"").toLowerCase().replace(/[\s_-]/g,"");
  const aliases={
    framing:"composition",space:"composition",perspective:"composition",
    palette:"color",hue:"color",saturation:"color",
    light:"lighting",shadow:"lighting",
    materials:"texture",marks:"texture",medium:"texture",
    feeling:"emotion",mood:"emotion",emotionalintent:"emotion",purpose:"emotion",
    conceptual:"concept",meaning:"concept",story:"concept",narrative:"concept",symbolism:"concept",
    counterexample:"tradeoffs",counterfactual:"tradeoffs",exceptions:"tradeoffs",sacrifice:"tradeoffs",
    translation:"adaptation",transfer:"adaptation",newsubjects:"adaptation",
    exclusions:"boundaries",restrictions:"boundaries",negative:"boundaries",
    quality:"evaluation",assessment:"evaluation",success:"evaluation",testing:"evaluation"
  };
  if(DNA_KEYS.includes(normalized))return normalized;
  if(aliases[normalized])return aliases[normalized];
  const description=String(text||"").toLowerCase();
  for(const [match,dim] of [
    [/composition|fram(e|ing)|negative space|asymmetr|cropp|perspective|placement/, "composition"],
    [/palette|color|colour|hue|saturat|chromatic|pigment/, "color"],
    [/light|shadow|glow|illuminat|highlight|sunset/, "lighting"],
    [/texture|brush|paint|grain|medium|material|stroke|surface|mark-making/, "texture"],
    [/emotion|feel|grief|joy|memory|longing|tender|melanchol|psycholog/, "emotion"],
    [/concept|contradict|metaphor|meaning|narrative|story|consequence|displac|theme/, "concept"],
    [/sacrifice|trade.off|exception|instead|reject|omit|priority|choose|tension/, "tradeoffs"],
    [/adapt|transfer|translate|unfamiliar|new subject|other scene/, "adaptation"],
    [/never|avoid|prohibit|refuse|exclude|disallow|boundary/, "boundaries"],
    [/judge|success|fail|critique|quality|recogniz|test/, "evaluation"]
  ]){if(match.test(description))return dim}
  return "unclassified";
}
function ensureDNA(){
 if(!a.northStar||typeof a.northStar!=="object")a.northStar={emotion:"",concept:"",tradeoffs:""};
 if(!Array.isArray(a.insights))a.insights=[];
 if(!Array.isArray(a.conflicts))a.conflicts=[];
 if(!Array.isArray(a.reviews))a.reviews=[];
 if(!a.focusDimension)a.focusDimension="";
 if(!a.modelCoverage||typeof a.modelCoverage!=="object")a.modelCoverage={...a.coverage};
}
function addDNAInsights(items){
 ensureDNA();
 for(const raw of (Array.isArray(items)?items:[]).slice(0,8)){
  if(!raw||typeof raw!=="object"||!String(raw.fact||"").trim())continue;
  const fact=String(raw.fact).slice(0,900).trim();
  if(a.insights.some(i=>String(i.fact||i).toLowerCase()===fact.toLowerCase()))continue;
  a.insights.push({
    fact,dimension:dnaDimension(raw.dimension, fact),
    source:String(raw.source||"artist response").slice(0,120),
    evidence:String(raw.evidenceQuote||raw.evidence||"").slice(0,650),
    status:["artist-confirmed","observed","inferred","unresolved"].includes(raw.status)?raw.status:"inferred",
    effect:String(raw.effect||"").slice(0,400)
  });
 }
 a.insights=a.insights.slice(-120);
}
function addDNAConflicts(items){
 ensureDNA();
 for(const raw of (Array.isArray(items)?items:[]).slice(0,5)){
  const description=String(typeof raw==="string"?raw:(raw?.question||raw?.issue||"")).trim().slice(0,500);
  if(description && !a.conflicts.some(c=>c.toLowerCase()===description.toLowerCase()))a.conflicts.push(description);
 }
 a.conflicts=a.conflicts.slice(-35);
}
function updateDNACoverage(){
 ensureDNA();
 const counts={};const confirmed={};
 for(const item of a.insights){
  if(!item||item.status==="rejected")continue;
  const dim=dnaDimension(item.dimension, item.fact||item);if(!DNA_KEYS.includes(dim))continue;
  counts[dim]=(counts[dim]||0)+1;
  const source=String(item.source||"").toLowerCase();
  const human=item.artistReviewed===true||String(item.status||"").toLowerCase()==="artist-confirmed"||source.includes("artist")||!!item.evidence;
  if(human)confirmed[dim]=(confirmed[dim]||0)+1;
 }
 const concept=a.northStar;
 const guide=a.guide||{};
 const guideField={
  composition:"composition",color:"color",lighting:"light",texture:"texture",
  emotion:"creativeThesis",concept:"signature",tradeoffs:"decisionRules",
  adaptation:"subjectLogic",boundaries:"avoid",evaluation:"qualityChecks"
 };
 const known={...a.coverage};
 for(const dim of DNA_KEYS){
   const old=Math.max(0,Math.min(95,Number(known[dim])||0));
   const modelEstimate=Math.min(50,Math.max(0,Number(a.modelCoverage?.[dim])||0));
   let evidence=0;
   const total=counts[dim]||0, human=confirmed[dim]||0;
   if(total)evidence=22+Math.min(24,(total-1)*8);
   if(human)evidence=Math.max(evidence,52+Math.min(24,(human-1)*12));
   if((dim==="emotion"&&concept.emotion?.trim())||(dim==="concept"&&concept.concept?.trim())||(dim==="tradeoffs"&&concept.tradeoffs?.trim()))evidence=Math.max(evidence,70);
   const field=guide[guideField[dim]];
   if(field && (typeof field==="string"?field.trim().length>22:Array.isArray(field)&&field.length>0))evidence=Math.max(evidence,50);
   if(dim==="evaluation"&&a.reviews.length)evidence=Math.max(evidence,82);
   if(dim==="boundaries"&&a.exclusions?.trim())evidence=Math.max(evidence,50);
   known[dim]=Math.round(Math.max(old,modelEstimate,evidence));
 }
 a.coverage=known;
 const replies=a.history.filter(m=>m.role==="artist"&&String(m.text||"").trim().length>=30).length;
 const refCount=Array.isArray(a.observations)?a.observations.length:0;
 const distinct=DNA_KEYS.filter(dim=>confirmed[dim]||counts[dim]).length;
 const north=[concept.emotion,concept.concept,concept.tradeoffs].filter(v=>String(v||"").trim().length>25).length;
 const checklist=
   (a.artist&&a.engine&&a.intent?10: a.artist&&a.engine?5:0)
   +Math.min(8,refCount*2)
   +Math.min(20,replies*2)
   +Math.min(38,distinct*5)
   +north*5
   +(a.guide?7:0)
   +Math.min(5,a.reviews.length*2);
 // Preserve earlier user progress; never reduce coverage because of a model's fluctuating guess.
 a.readiness=Math.min(100,Math.round(Math.max(Number(a.readiness)||0,checklist)));
 return {score:a.readiness,replies,distinct,north,reviewed:a.reviews.length};
}
function captureNorthStar(){
 ensureDNA();
 for(const key of ["emotion","concept","tradeoffs"]){
  const input=$("dna-"+key);if(input)a.northStar[key]=input.value.trim().slice(0,1500);
 }
 updateDNACoverage();saveLocal();drawSidebar();
}
function restoreNorthStar(){
 ensureDNA();
 for(const key of ["emotion","concept","tradeoffs"]){
  const input=$("dna-"+key);if(input)input.value=a.northStar[key]||"";
 }
}
function renderDNASummary(){
 ensureDNA();
 const box=$("dna-learning-status");
 if(!box)return;
 const unresolved=a.conflicts.slice(-3);
 const what=a.insights.slice(-5).map(i=>i.fact||i);
 box.innerHTML='<strong>What the curator has learned</strong><p>'+
  (what.length?what.map(htmlEscape).join(" · "):"Your artistic decisions will appear here as you explain them.")+'</p>'+
  (unresolved.length?'<strong>Questions worth resolving</strong><p>'+unresolved.map(htmlEscape).join(" · ")+'</p>':'');
}
function applyInterviewResponse(result){
 ensureDNA();
 if(Array.isArray(result.insights))addDNAInsights(result.insights);
 if(Array.isArray(result.gaps))a.gaps=result.gaps.slice(0,15);
 if(Array.isArray(result.conflicts))addDNAConflicts(result.conflicts);
 if(result.coverage&&typeof result.coverage==="object"){
  for(const [key,value] of Object.entries(result.coverage)){
   if(DNA_KEYS.includes(key)&&Number.isFinite(Number(value)))a.modelCoverage[key]=Math.max(Number(a.modelCoverage[key])||0,Math.min(100,Number(value)));
  }
 }
 if(typeof result.focusDimension==="string")a.focusDimension=dnaDimension(result.focusDimension);
 if(result.reply)a.history.push({role:"assistant",text:String(result.reply).slice(0,3000),dimension:a.focusDimension});
 updateDNACoverage();saveLocal();renderChat();renderDNASummary();drawSidebar();
}
