"use strict";
async function curator(action,more={}){
 const access=$("curator-code").value.trim();
 if(!access)throw Error("Enter the owner pilot access code to use the AI curator.");
 const payload={action,context:{
  artist:a.artist,engine:a.engine,medium:a.medium,intent:a.intent,exclusions:a.exclusions,
  artistStatement:a.intent,observations:a.observations,patterns:a.patterns,history:a.history,guide:a.guide,
  northStar:a.northStar,insights:a.insights,conflicts:a.conflicts,reviews:a.reviews,focusDimension:a.focusDimension,coverage:a.coverage
 },...more};
 const response=await fetch("/api/artist-guide",{method:"POST",headers:{"Content-Type":"application/json","x-prototype-code":access},body:JSON.stringify(payload)});
 const result=await response.json().catch(()=>({error:"The curator returned an unreadable response."}));
 if(!response.ok){
   const alert=document.getElementById("curator-billing-alert");
   if(alert && result.code==="GATEWAY_PAYMENT_VERIFICATION_REQUIRED")alert.hidden=false;
   throw Error(result.error||"The AI curator is unavailable.");
 }
 const alert=document.getElementById("curator-billing-alert");
 if(alert)alert.hidden=true;
 return result;
}
async function analyzeWork(){
 gather();
 if(!a.intent&&!a.references.length){inform("Add reference artwork or describe your creative process.");return}
 busy(true);$("analysis-pending").textContent="Examining your references…";
 try{
  const refs=a.references.map(r=>({...r,data:images[r.id]||""})).filter(r=>r.kind==="text"||r.data);
  const result=await curator("analyze",{references:refs});
  a.observations=Array.isArray(result.observations)?result.observations.slice(0,10):[];
  a.patterns=Array.isArray(result.patterns)?result.patterns.slice(0,15):[];
  a.gaps=Array.isArray(result.gaps)?result.gaps.slice(0,12):[];
  a.readiness=Math.max(5,Math.min(30,Number(result.confidence||25)*.3));
  if(result.firstQuestion){
    const q=String(result.firstQuestion).slice(0,2500);
    if(!a.history.length||!a.history.some(m=>m.text===q))a.history.push({role:"assistant",text:q,dimension:"concept"});
  }
  if(Array.isArray(result.tensions))addDNAConflicts(result.tensions);
  updateDNACoverage();
  goto("interview");inform("Analysis complete. The curator has its first question.");
 }catch(err){$("analysis-pending").textContent=err.message;inform(err.message)}
 finally{busy(false);drawSidebar()}
}
function startInterview(){
 gather();
 if(!a.history.length)a.history.push({role:"assistant",text:a.medium==="Photography"?"What do you consistently choose to include in a frame, and what do you intentionally exclude?":"What creative choice do you make repeatedly that another artist might not notice?"});
 a.gaps=["Composition","Adapting unfamiliar subjects","Artist's non-negotiable boundaries"];
 goto("interview");inform("Interview started. A pilot access code enables live AI follow-up questions.");
}
async function answerQuestion(){
 if(pending)return;
 captureNorthStar();
 const reply=$("chat-input").value.trim();
 if(!reply){inform("Write your answer to the curator first.");return}
 a.history.push({role:"artist",text:reply,dimension:a.focusDimension||""});
 $("chat-input").value="";
 updateDNACoverage();saveLocal();renderChat();busy(true,"Interviewing…");
 $("chat-status").textContent="Checking this against the artist's accumulated Creative DNA…";
 try{
  const result=await curator("interview");
  applyInterviewResponse(result);
  inform("The curator has retained this response in the cumulative Creative DNA record.");
 }catch(err){inform(err.message);$("chat-status").textContent="Your answer is saved. You can retry the AI curator."}
 finally{busy(false);$("chat-status").textContent="Answer the next question or run a blind-spot audit."}
}
async function auditInterview(){
 if(pending)return;
 captureNorthStar();
 busy(true,"Finding blind spots…");
 try{
  const result=await curator("audit");
  applyInterviewResponse(result);
  inform("Deep audit complete: the curator selected the most consequential unanswered question.");
 }catch(err){inform(err.message)}
 finally{busy(false)}
}

async function assembleGuide(){
 if(!a.history.length&&!a.intent){inform("First describe your creative process or answer questions.");return}
 busy(true,"Distilling…");
 try{
  const result=await curator("compile");
  if(!result.guide||typeof result.guide!=="object")throw Error("Guide synthesis returned no usable recipe.");
  a.guide=result.guide;a.summary=result.summary||"Your private draft is ready to edit.";
  if(Array.isArray(result.openQuestions))a.gaps=result.openQuestions.slice(0,12);
  updateDNACoverage();goto("guide");inform("Private creative guide assembled. Review and correct every important rule.");
 }catch(err){inform(err.message)}
 finally{busy(false)}
}
async function refineGuide(){
 if(!a.guide){inform("Compile a private guide first.");return}
 const feedback=$("refine-feedback").value.trim();if(!feedback){inform("Describe what needs correcting.");return}
 busy(true,"Revising…");
 try{
  const result=await curator("refine",{feedback});
  if(!result.guide)throw Error("The revision was not returned.");
  a.guide=result.guide;a.summary=result.summary||"Guide revised according to your feedback.";
  if(Array.isArray(result.openQuestions))a.gaps=result.openQuestions;
  a.history.push({role:"artist",text:"Private guide correction: "+feedback},{role:"assistant",text:a.summary});
  $("refine-feedback").value="";updateDNACoverage();goto("guide");inform("Guide revised and saved locally.");
 }catch(err){inform(err.message)}
 finally{busy(false)}
}
async function testGuide(){
 if(!a.guide){inform("Create a guide before testing.");goto("guide");return}
 const prompt=$("test-prompt").value.trim();if(!prompt){inform("Enter a new test subject.");return}
 busy(true,"Generating…");$("test-output").textContent="Generating a test from your private creative guide…";
 try{
  const result=await curator("test",{testPrompt:prompt});
  if(!result.imageDataUrl)throw Error("No image returned.");
  a.lastTest=result.imageDataUrl;renderTest();inform("AI test generated. Compare it with your own creative decisions.");
 }catch(err){$("test-output").textContent=err.message;inform(err.message)}
 finally{busy(false)}
}
function exportGuide(){
 if(!a.guide){inform("Compile your guide first.");return}
 const data={artist:a.artist,engine:a.engine,medium:a.medium,status:"private local draft",guide:a.guide,history:a.history,references:a.references.map(r=>({name:r.name,note:r.note}))};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
 link.download="musehouse-"+(a.engine||"engine").toLowerCase().replace(/[^a-z0-9]+/g,"-")+".json";link.href=url;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);inform("Private creative guide exported.");
}
function fileData(f){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error("File could not be read"));reader.readAsDataURL(f)})}
async function imageData(f){
 const data=await fileData(f);
 return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,980/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext("2d").drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",.68))};img.onerror=()=>reject(Error("Image could not be decoded"));img.src=data});
}
async function addReferences(files){
 for(const f of Array.from(files)){
  const kind=f.type.startsWith("image/")?"image":f.type==="application/pdf"?"pdf":f.type==="text/plain"?"text":"";
  if(!kind){inform("Unsupported file: "+f.name);continue}
  const prior=a.references.find(r=>r.name===f.name&&r.kind===kind&&(!images[r.id]||kind==="text"));
  if(!prior&&a.references.length>=6){inform("Six reference files maximum per engine.");break}
  if(f.size>6*1024*1024){inform("Please reduce the size of "+f.name);continue}
  try{
   let data="",body="";
   if(kind==="image")data=await imageData(f);
   else if(kind==="pdf"){if(f.size>900000){inform("PDF references must be under 900 KB in this pilot.");continue}data=await fileData(f)}
   else body=(await f.text()).slice(0,4500);
   if(prior){
     if(data)images[prior.id]=data;
     if(kind==="text")prior.text=body;
     prior.mime=f.type;
     inform("Reattached "+f.name+" to its original reference notes.");
   }else{
     const id="ref_"+Date.now()+"_"+Math.floor(Math.random()*100000);
     a.references.push({id,name:f.name,kind,mime:f.type,note:"",text:body});
     if(data)images[id]=data;
   }
  }catch(err){inform(err.message)}
 }
 renderReferences();saveLocal();
}
