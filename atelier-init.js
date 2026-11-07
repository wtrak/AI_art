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
 $("audit-interview").addEventListener("click",auditInterview);
 ["dna-emotion","dna-concept","dna-tradeoffs"].forEach(id=>$(id).addEventListener("change",captureNorthStar));
 $("refine-guide").addEventListener("click",refineGuide);
 $("back-interview").addEventListener("click",()=>goto("interview"));
 $("undo-guide").addEventListener("click",()=>{
  if(pending)return;
  if(!Array.isArray(a.guideVersions)||!a.guideVersions.length){inform("No previous guide version to restore.");return}
  const previous=a.guideVersions.pop();
  a.guide=previous.guide;
  a.summary=previous.summary||"Previous creative guide restored.";
  saveLocal();goto("guide");
  inform("Last refinement undone. The previous private guide was restored.");
 });
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
 initProfileLibraryUI();
 $("test-good").addEventListener("click",()=>{
  ensureDNA();
  a.reviews.push({outcome:"approved",feedback:$("test-feedback").value.trim().slice(0,1200),request:$("test-prompt").value.trim().slice(0,400),at:Date.now()});
  a.reviews=a.reviews.slice(-20);
  a.insights.push({fact:"Artist approved a generated test as consistent with the intended creative rules.",dimension:"evaluation",source:"artist test review",status:"artist-confirmed",evidence:$("test-feedback").value.trim().slice(0,500)});
  updateDNACoverage();drawSidebar();saveLocal();
  inform("Test approval recorded. Compare more varied subjects before publishing an engine.");
 });
 $("test-bad").addEventListener("click",()=>{
  ensureDNA();
  const feedback=$("test-feedback").value.trim();
  a.reviews.push({outcome:"needs-revision",feedback:feedback.slice(0,1200),request:$("test-prompt").value.trim().slice(0,400),at:Date.now()});
  a.reviews=a.reviews.slice(-20);updateDNACoverage();saveLocal();
  $("refine-feedback").value=feedback||"The latest test output did not accurately reflect my creative practice. Ask about the emotional or conceptual rule it missed, and correct the guide.";
  goto("guide");inform("Failed test recorded. Your correction can be applied to the private guide.");
 });
 $("carry-test-feedback").addEventListener("click",()=>{
  const comment=$("test-feedback").value.trim();if(!comment){inform("Write what needs adjusting first.");return}
  $("refine-feedback").value=comment;goto("guide");inform("Your test feedback is ready for refinement.");
 });
 document.addEventListener("click",e=>{
  const accepted=e.target.closest("[data-insight-approve]");
  if(accepted){
    const insight=a.insights[Number(accepted.dataset.insightApprove)];
    if(insight && typeof insight==="object"){
      insight.artistReviewed=true;insight.status="artist-confirmed";insight.source="explicit artist approval";
      updateDNACoverage();saveLocal();drawSidebar();renderDNASummary();
      inform("Artist-approved rule saved to your private Creative DNA record.");
    }
    return;
  }
  const disputed=e.target.closest("[data-insight-dispute]");
  if(disputed){
    const insight=a.insights[Number(disputed.dataset.insightDispute)];
    if(insight && typeof insight==="object"){
      insight.artistReviewed=false;insight.status="rejected";
      addDNAConflicts(["Artist disagrees with the AI interpretation: "+insight.fact]);
      saveLocal();goto("interview");
      $("chat-input").value="The curator misunderstood this rule: "+insight.fact+"\\nWhat I actually mean is: ";
      $("chat-input").focus();
      inform("Correct the AI in your own words. Your correction will be retained for future questions and guide revisions.");
    }
    return;
  }
  const stage=e.target.closest("[data-go-stage]");if(stage){gather();goto(stage.dataset.goStage);return}
  const sample=e.target.closest("[data-test-sample]");if(sample){$("test-prompt").value=sample.dataset.testSample;return}
  const remove=e.target.closest("[data-ref-remove]");if(remove){
   const id=remove.dataset.refRemove;a.references=a.references.filter(r=>r.id!==id);delete images[id];renderReferences();saveLocal();return
  }
 });
 document.addEventListener("change",e=>{
  if(!e.target.matches("[data-ref-role]"))return;
  const ref=a.references.find(r=>r.id===e.target.dataset.refRole);
  if(ref){ref.role=e.target.value;saveLocal()}
 });
 document.addEventListener("input",e=>{
  if(!e.target.matches("[data-ref-note]"))return;
  const ref=a.references.find(r=>r.id===e.target.dataset.refNote);if(ref){ref.note=e.target.value;saveLocal()}
 });
 goto(steps.includes(a.stage)?a.stage:"identity");
 if(location.protocol==="file:")$("curator-mode").textContent="Local draft only";
})();
