"use strict";
const steps=["identity","references","interview","guide","test"];
const titles=["Your world","Your work","Interview","Creative DNA","Test it"];
const $=id=>document.getElementById(id);
const htmlEscape=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fresh=()=>({stage:"identity",artist:"",engine:"",medium:"Art",intent:"",exclusions:"",references:[],observations:[],patterns:[],history:[],insights:[],conflicts:[],gaps:[],coverage:{},modelCoverage:{},northStar:{emotion:"",concept:"",tradeoffs:""},focusDimension:"",reviews:[],readiness:0,guide:null,summary:"",lastTest:null});
let a=fresh(),pending=false,images={};
try{const stored=JSON.parse(localStorage.getItem("musehouse_creator_draft")||"null");if(stored&&typeof stored==="object")a={...fresh(),...stored,lastTest:null};}catch(_){}
function inform(message){const el=$("studio-toast");el.textContent=message;el.style.display="block";clearTimeout(inform.t);inform.t=setTimeout(()=>el.style.display="none",4200)}
function saveLocal(){try{if(typeof saveProfileDraft==="function"){saveProfileDraft()}else{localStorage.setItem("musehouse_creator_draft",JSON.stringify({...a,lastTest:null,references:a.references.map(({data,...r})=>r)}))}}catch(_){inform("Storage full. Export your private guide.")}}
function gather(){
 a.artist=$("a-name").value.trim();a.engine=$("a-engine").value.trim();a.medium=$("a-medium").value;
 a.intent=$("a-intent").value.trim();a.exclusions=$("a-exclusions").value.trim();saveLocal();
}
function drawSidebar(){
 if(typeof updateDNACoverage==="function")updateDNACoverage();
 $("readiness").innerHTML=Math.round(a.readiness||0)+"<span>%</span>";
 $("coverage-bars").innerHTML=DNA_DIMENSIONS.map(([k,label])=>'<div class="coverage-row"><span title="'+htmlEscape(label)+'">'+htmlEscape(label)+'</span><div class="coverage-track"><div class="coverage-fill" style="width:'+Math.min(100,Math.max(0,a.coverage[k]||0))+'%"></div></div><span>'+Math.round(a.coverage[k]||0)+'</span></div>').join("");
 $("insight-list").innerHTML=a.insights.length?a.insights.slice(-6).map(i=>'<div class="insight-item">'+htmlEscape(i.fact||i)+'<small>'+htmlEscape(i.source||"artist")+'</small></div>').join(""):'<p class="muted">Show the curator your work and how you think.</p>';
 $("gap-list").innerHTML=a.gaps.length?a.gaps.slice(0,6).map(i=>'<div class="gap-item">'+htmlEscape(i)+'</div>').join(""):'<p class="muted">Your open questions will appear here.</p>';
 if($("conflict-list"))$("conflict-list").innerHTML=(a.conflicts||[]).length?a.conflicts.slice(-5).map(i=>'<div class="gap-item">'+htmlEscape(i)+'</div>').join(""):'<p class="muted">Unresolved artistic tensions will appear here.</p>';
}
function renderReferences(){
 $("reference-cards").innerHTML=a.references.map(r=>'<article class="ref-card"><div class="ref-top">'+(r.kind==="image"&&images[r.id]?'<img src="'+images[r.id]+'" alt="Artist reference work" class="ref-thumb">':'<div class="ref-thumb file-thumb">'+(r.kind==="pdf"?"▤":"✳")+'</div>')+'<div><strong>'+htmlEscape(r.name)+'</strong><small>'+htmlEscape(r.kind)+' · '+(images[r.id]||r.kind==="text"?"ready":"notes saved; re-upload to analyze")+'</small></div></div>'+
 '<label class="field"><span>How should the curator interpret this?</span><select data-ref-role="'+htmlEscape(r.id)+'"><option value="signature" '+(!r.role||r.role==="signature"?"selected":"")+'>Signature piece — unmistakably my work</option><option value="exception" '+(r.role==="exception"?"selected":"")+'>Intentional exception — a rule I sometimes break</option><option value="near-miss" '+(r.role==="near-miss"?"selected":"")+'>Near miss — looks similar but gets my style wrong</option></select></label>'+
 '<label class="field"><span>What makes this piece right or wrong? Describe specific choices and feelings.</span><textarea data-ref-note="'+htmlEscape(r.id)+'" rows="3" placeholder="The emotion comes from what is missing, not the object shown; in this almost-right sample the symmetry ruins the tension...">'+htmlEscape(r.note||"")+'</textarea></label><button class="remove-ref" data-ref-remove="'+htmlEscape(r.id)+'">Remove ×</button></article>').join("");
}
function renderChat(){
 $("analysis-overview").textContent=a.patterns.length?"Visible patterns to discuss: "+a.patterns.slice(0,5).join(" · "):"The curator is here to understand decisions, tradeoffs and intentions—not just describe visual effects.";
 $("conversation").innerHTML=a.history.length?a.history.map(m=>'<div class="bubble '+(m.role==="artist"?"artist":"ai")+'"><div class="bubble-label">'+(m.role==="artist"?"YOU":"✳ AI CURATOR")+'</div>'+htmlEscape(m.text)+'</div>').join(""):'<div class="bubble ai">What creative decision makes this approach distinctively yours?</div>';
 $("conversation").scrollTop=$("conversation").scrollHeight;
}
function renderGuide(){
 $("guide-summary").textContent=a.summary||"A working creative guide assembled from your answers. Edit and correct it until it accurately represents your choices.";
 if(!a.guide){$("guide-fields").innerHTML='<article class="guide-field wide">No compiled guide yet. Continue the interview and select “Distill my creative DNA.”</article>';return}
 const fields=[["Creative thesis","creativeThesis"],["Emotional logic","emotionalLogic"],["Conceptual logic","conceptualLogic"],["Priority hierarchy","priorityHierarchy"],["Signature","signature"],["Composition","composition"],["Color","color"],["Light","light"],["Texture","texture"],["Subject adaptation","subjectLogic"],["Decision rules","decisionRules"],["Counterexamples","counterexamples"],["Avoid","avoid"],["Constraints","constraints"],["Quality checks","qualityChecks"],["Provenance","provenance"],["Uncertainties","uncertainties"]];
 $("guide-fields").innerHTML=fields.map(([label,k])=>'<article class="guide-field '+(["decisionRules","qualityChecks","uncertainties","emotionalLogic","conceptualLogic","priorityHierarchy","counterexamples"].includes(k)?"wide":"")+'"><h3>'+label+'</h3>'+(Array.isArray(a.guide[k])?'<ul>'+a.guide[k].map(x=>'<li>'+htmlEscape(typeof x==="object"?JSON.stringify(x):x)+'</li>').join("")+'</ul>':'<p>'+htmlEscape(a.guide[k]||"Not yet established")+'</p>')+'</article>').join("");
}
function renderTest(){
 $("test-output").innerHTML=a.lastTest?'<img alt="Generated AI engine test" src="'+a.lastTest+'">':'<span class="muted">Your first AI test appears here.</span>';
 $("test-good").disabled=!a.lastTest;$("test-bad").disabled=!a.lastTest;
}
function goto(stage){
 if(!steps.includes(stage))return;
 if(stage!=="identity"&&(!a.artist||!a.engine)){inform("Name your artist and engine first.");stage="identity"}
 a.stage=stage;
 document.querySelectorAll(".atelier-stage").forEach(el=>el.hidden=el.dataset.stage!==stage);
 $("steps").innerHTML=steps.map((x,i)=>'<button class="atelier-step '+(x===stage?"active":steps.indexOf(stage)>i?"done":"")+'" data-go-stage="'+x+'"><small>0'+(i+1)+'</small><b>'+titles[i]+'</b></button>').join("");
 if(stage==="references")renderReferences();if(stage==="interview"){restoreNorthStar();renderChat();renderDNASummary()}if(stage==="guide")renderGuide();if(stage==="test")renderTest();
 drawSidebar();saveLocal();
}
function busy(flag,label){
 pending=flag;$("curator-mode").textContent=label|| (flag?"Thinking…":"AI curator");
 for(const el of document.querySelectorAll(".atelier-stage button"))el.disabled=flag;
}
