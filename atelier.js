(function(){
"use strict";
const stages=["identity","references","interview","guide","test"];
const labels=["Your world","Your work","The conversation","Creative DNA","Test & refine"];
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const blank=()=>({stage:"identity",artist:"",engine:"",medium:"Art",intent:"",exclusions:"",references:[],observations:[],patterns:[],history:[],insights:[],gaps:[],coverage:{},readiness:0,guide:null,summary:"",openQuestions:[],lastTest:null});
let s=blank(),busy=false,referenceData={};
try{const d=JSON.parse(localStorage.getItem("musehouse_artist_atelier_v1")||"null");if(d&&typeof d==="object")s={...blank(),...d,references:(d.references||[]).map(r=>({...r,data:""}))};}catch(_){}
const toast=(m)=>{const el=$("#studio-toast");el.textContent=m;el.style.display="block";clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display="none",4500)};
function persist(){try{const copy={...s,references:s.references.map(({data,...rest})=>rest),lastTest:null};localStorage.setItem("musehouse_artist_atelier_v1",JSON.stringify(copy));}catch(_){toast("Local save failed. Export your guide before leaving.")}}
function sync(){s.artist=$("#a-name").value.trim();s.engine=$("#a-engine").value.trim();s.medium=$("#a-medium").value;s.intent=$("#a-intent").value.trim();s.exclusions=$("#a-exclusions").value.trim();persist()}
function updateFields(){$("#a-name").value=s.artist;$("#a-engine").value=s.engine;$("#a-medium").value=s.medium;$("#a-intent").value=s.intent;$("#a-exclusions").value=s.exclusions}
function renderProgress(){
 $("#steps").innerHTML=stages.map((stage,i)=>'<button class="atelier-step '+(s.stage===stage?"active":stages.indexOf(s.stage)>i?"done":"")+'" type="button" data-stage-link="'+stage+'"><small>0'+(i+1)+' / '+(stages.indexOf(s.stage)>i?"✓":"")+'</small><b>'+labels[i]+'</b></button>').join("");
 $("#readiness").innerHTML=Math.round(s.readiness||0)+'<span>%</span>';
 $("#coverage-bars").innerHTML=["composition","color","lighting","texture","adaptation","boundaries"].map(key=>'<div class="coverage-row"><span>'+key+'</span><div class="coverage-track"><div class="coverage-fill" style="width:'+Math.max(0,Math.min(100,s.coverage[key]||0))+'%"></div></div><span>'+Math.round(s.coverage[key]||0)+'</span></div>').join("");
 $("#insight-list").innerHTML=s.insights.length?s.insights.slice(-6).map(x=>'<div class="insight-item">'+esc(x.fact||x)+'<small>'+esc(x.source||"Artist discussion")+'</small></div>').join(""):'<p class="muted">Add reference work and discuss your creative decisions.</p>';
 $("#gap-list").innerHTML=s.gaps.length?s.gaps.slice(0,5).map(x=>'<div class="gap-item">'+esc(x)+'</div>').join(""):'<p class="muted">Unanswered questions appear here during the interview.</p>';
}
function go(stage){
 if(!stages.includes(stage))return;
 if(stage!=="identity"&&(!s.artist||!s.engine)){toast("Start by naming your creative engine.");stage="identity"}
 s.stage=stage;document.querySelectorAll(".atelier-stage").forEach(el=>el.hidden=el.dataset.stage!==stage);
 renderProgress();persist();
 if(stage==="references")renderReferences();
 if(stage==="interview")renderInterview();
 if(stage==="guide")renderGuide();
 if(stage==="test")renderTest();
 window.scrollTo({top:180,behavior:"smooth"})
}
function referenceDescription(r){return {id:r.id,name:r.name,kind:r.kind,mime:r.mime,note:r.note||"",text:r.text||"",data:referenceData[r.id]||r.data||""}}
function renderReferences(){
 const area=$("#reference-cards");
 area.innerHTML=s.references.map(r=>'<article class="ref-card"><div class="ref-top">'+(r.kind==="image"&&referenceData[r.id]?'<img class="ref-thumb" alt="Reference work" src="'+referenceData[r.id]+'">':'<div class="ref-thumb file-thumb">'+(r.kind==="pdf"?"▤":r.kind==="text"?"▥":"✳")+'</div>')+'<div><strong>'+esc(r.name)+'</strong><small>'+esc(r.kind==="image"?"Artwork / photograph":r.kind==="pdf"?"PDF portfolio":"Text reference")+(referenceData[r.id]?" · ready for analysis":" · saved note only")+'</small></div></div><label class="field"><span>What's special about this piece?</span><textarea rows="3" data-note="'+esc(r.id)+'" placeholder="What is unique? What was intentional?">'+esc(r.note||"")+'</textarea></label><button type="button" class="remove-ref" data-remove-ref="'+esc(r.id)+'">Remove reference ×</button></article>').join("");
}
function renderInterview(){
 const area=$("#conversation");
 $("#analysis-overview").textContent=s.patterns.length?"What I noticed: "+s.patterns.slice(0,5).join(" · "):"Start with why your artwork is different. The curator will ask a specific question and build an evolving understanding.";
 area.innerHTML=s.history.length?s.history.map(m=>'<div class="bubble '+(m.role==="artist"?"artist":"ai")+'"><div class="bubble-label">'+(m.role==="artist"?"You":"✳ Musehouse curator")+'</div>'+esc(m.text)+'</div>').join(""):'<div class="bubble ai"><div class="bubble-label">✳ Musehouse curator</div>What is one creative decision you make repeatedly that another artist might not?</div>';
 area.scrollTop=area.scrollHeight;
}
function renderGuide(){
 const g=s.guide;$("#guide-summary").textContent=s.summary||"This is a private working guide assembled from your examples and explanations. You can correct, expand and test it.";
 if(!g){$("#guide-fields").innerHTML='<div class="guide-field wide"><h3>No compiled guide yet</h3><p>Complete an interview, then ask the AI to distill it. You can return to the conversation at any time.</p></div>';return}
 const fields=[["Creative thesis","creativeThesis"],["Signature decisions","signature"],["Composition","composition"],["Color & palette","color"],["Light & atmosphere","light"],["Materials & texture","texture"],["Adapting to new subjects","subjectLogic"],["Ordered decision rules","decisionRules"],["Things to avoid","avoid"],["Constraints","constraints"],["Quality control","qualityChecks"],["Provenance","provenance"],["Still uncertain","uncertainties"]];
 $("#guide-fields").innerHTML=fields.map(([label,key])=>'<article class="guide-field '+(["decisionRules","qualityChecks","subjectLogic","uncertainties"].includes(key)?"wide":"")+'"><h3>'+label+'</h3>'+(Array.isArray(g[key])?'<ul>'+g[key].map(v=>'<li>'+esc(typeof v==="object"?JSON.stringify(v):v)+'</li>').join("")+'</ul>':'<p>'+esc(g[key]||"Not yet established")+'</p>')+'</article>').join("");
}
function renderTest(){
 $("#test-output").innerHTML=s.lastTest?'<img src="'+s.lastTest+'" alt="AI image test of artist engine">':'<span class="muted">Your first private engine test will appear here.</span>';
 $("#test-good").disabled=!s.lastTest;$("#test-bad").disabled=!s.lastTest;
}
function setBusy(v,tag){busy=v;for(const el of document.querySelectorAll("button")){if(el.id!=="new-session"&&el.id!=="save-session"&&el.id!=="download-guide")el.disabled=v}$("#curator-mode").textContent=v?"Curator thinking…":tag||"AI curator"}
async function callAI(action,more={}){
 const code=$("#curator-code").value.trim();
 if(!code)throw Error("Add the site owner's private pilot access code in the right sidebar to use AI.");
 const context={artist:s.artist,engine:s.engine,medium:s.medium,intent:s.intent,exclusions:s.exclusions,artistStatement:s.intent,observations:s.observations,patterns:s.patterns,history:s.history,guide:s.guide};
 const payload={action,context,...more};
 const reply=await fetch("/api/artist-guide",{method:"POST",headers:{"content-type":"application/json","x-prototype-code":code},body:JSON.stringify(payload)});
 const data=await reply.json().catch(()=>({error:"The server returned an unreadable response."}));
 if(!reply.ok)throw Error(data.error||"The AI curator is unavailable.");
 return data;
}
