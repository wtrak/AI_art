"use strict";
(function initialize(){
 $("a-name").value=a.artist;$("a-engine").value=a.engine;$("a-medium").value=a.medium;
 $("a-intent").value=a.intent;$("a-exclusions").value=a.exclusions;
 for(const id of ["a-name","a-engine","a-medium","a-intent","a-exclusions"])$(id).addEventListener("change",gather);
 $("to-references").addEventListener("click",()=>{gather();goto("references")});
 $("reference-input").addEventListener("change",async e=>{await addReferences(e.target.files);e.target.value=""});
 $("analyze-refs").addEventListener("click",analyzeWork);
 $("check-curator").addEventListener("click",async()=>{
  const button=$("check-curator"),status=$("connection-status");
  button.disabled=true;status.textContent="Checking your AI connection with one small request…";
  try{
    const result=await curator("check");
    status.textContent="✓ Connected to "+(result.provider==="anthropic-direct"?"Claude directly":"Vercel AI Gateway")+" using "+(result.model||"the selected model")+".";
    inform("AI connection works. You can continue the interview.");
  }catch(error){
    status.textContent=error.message;
    inform("Connection test failed. The detailed error is now in your Vercel logs.");
  }finally{button.disabled=false}
 });
 $("manual-interview").addEventListener("click",startInterview);
 $("chat-form").addEventListener("submit",e=>{e.preventDefault();answerQuestion()});
 $("compile-guide").addEventListener("click",assembleGuide);
 $("refine-guide").addEventListener("click",refineGuide);
 $("back-interview").addEventListener("click",()=>goto("interview"));
 $("to-test").addEventListener("click",()=>goto("test"));
 $("to-guide").addEventListener("click",()=>goto("guide"));
 $("try-ai-test").addEventListener("click",testGuide);
 $("download-guide").addEventListener("click",exportGuide);
 $("edit-json").addEventListener("click",()=>{
  if(!a.guide){inform("Compile a guide before editing.");return}
  $("guide-edit-area").hidden=!$("guide-edit-area").hidden;
  $("guide-json").value=JSON.stringify(a.guide,null,2);
 });
 $("save-guide-edit").addEventListener("click",()=>{
  try{const obj=JSON.parse($("guide-json").value);if(!obj||Array.isArray(obj)||typeof obj!=="object")throw Error("Guide must be an object");
   a.guide=obj;saveLocal();renderGuide();$("guide-edit-area").hidden=true;inform("Manual changes saved locally.");
  }catch(e){inform("The guide is not valid JSON: "+e.message)}
 });
 $("save-session").addEventListener("click",()=>{gather();saveLocal();inform("Local engine draft saved in this browser.")});
 $("new-session").addEventListener("click",()=>{
  if(!confirm("Start a new engine? This replaces the current local draft. Export any important guide first."))return;
  a=fresh();images={};$("a-name").value="";$("a-engine").value="";$("a-medium").value="Art";$("a-intent").value="";$("a-exclusions").value="";$("chat-input").value="";
  $("test-output").innerHTML="";$("guide-edit-area").hidden=true;goto("identity");inform("New creative engine draft started.");
 });
 $("test-good").addEventListener("click",()=>{
  a.insights.push({fact:"Artist approved a test result as visually aligned.",source:"Artist review"});
  a.readiness=Math.min(100,Math.round(a.readiness+5));drawSidebar();saveLocal();inform("Approval recorded locally. More varied tests are still recommended.");
 });
 $("test-bad").addEventListener("click",()=>{
  $("refine-feedback").value=$("test-feedback").value.trim()||"The latest test output did not accurately reflect my creative practice. Ask me what needs fixing.";
  goto("guide");inform("Describe what felt wrong and ask the curator to revise your guide.");
 });
 $("carry-test-feedback").addEventListener("click",()=>{
  const comment=$("test-feedback").value.trim();if(!comment){inform("Write what needs adjusting first.");return}
  $("refine-feedback").value=comment;goto("guide");inform("Your test feedback is ready for refinement.");
 });
 document.addEventListener("click",e=>{
  const stage=e.target.closest("[data-go-stage]");if(stage){gather();goto(stage.dataset.goStage);return}
  const sample=e.target.closest("[data-test-sample]");if(sample){$("test-prompt").value=sample.dataset.testSample;return}
  const remove=e.target.closest("[data-ref-remove]");if(remove){
   const id=remove.dataset.refRemove;a.references=a.references.filter(r=>r.id!==id);delete images[id];renderReferences();saveLocal();return
  }
 });
 document.addEventListener("input",e=>{
  if(!e.target.matches("[data-ref-note]"))return;
  const ref=a.references.find(r=>r.id===e.target.dataset.refNote);if(ref){ref.note=e.target.value;saveLocal()}
 });
 goto(steps.includes(a.stage)?a.stage:"identity");
 if(location.protocol==="file:")$("curator-mode").textContent="Local draft only";
})();
