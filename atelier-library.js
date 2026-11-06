"use strict";
// Multiple independent artist/engine drafts in the CURRENT browser only.
// This is not a multi-user account store. Never put sensitive reference binaries in localStorage.
const MH_PROFILE_INDEX="musehouse_artist_profile_index_v1";
const MH_PROFILE_ACTIVE="musehouse_artist_profile_active_v1";
const MH_PROFILE_PREFIX="musehouse_artist_profile_v1:";
let profileIndex=[],activeProfileId=null,referenceImageCache={};
function profileId(){
 return typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function"?"profile_"+crypto.randomUUID():"profile_"+Date.now()+"_"+Math.floor(Math.random()*1e9);
}
function safeReadJSON(key,fallback){
 try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(_){return fallback}
}
function cleanDraft(raw){
 const copy=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const result={...fresh(),...copy};
 for(const key of ["references","history","observations","patterns","insights","gaps"]){
   if(!Array.isArray(result[key]))result[key]=[];
 }
 result.references=result.references.slice(0,6).filter(x=>x&&typeof x==="object")
   .map(({data,...rest})=>({...rest,id:String(rest.id||profileId()),name:String(rest.name||"Reference").slice(0,160),note:String(rest.note||"").slice(0,1200)}));
 result.stage=steps.includes(result.stage)?result.stage:"identity";
 result.lastTest=null;
 return result;
}
function readDraft(id){
 const v=safeReadJSON(MH_PROFILE_PREFIX+id,null);
 return cleanDraft(v);
}
function metaFor(id,draft,prior){
 return {id,artist:String(draft.artist||"").slice(0,100),engine:String(draft.engine||"").slice(0,100),
   medium:String(draft.medium||"Art").slice(0,30),stage:String(draft.stage||"identity"),
   updatedAt:Date.now(),createdAt:prior?.createdAt||Date.now(),
   hasGuide:!!draft.guide,answers:(draft.history||[]).filter(x=>x?.role==="artist").length};
}
function writeProfileIndex(){
 localStorage.setItem(MH_PROFILE_INDEX,JSON.stringify(profileIndex));
 localStorage.setItem(MH_PROFILE_ACTIVE,activeProfileId||"");
}
function saveProfileDraft(){
 if(!activeProfileId)return;
 const sanitized=cleanDraft(a);
 localStorage.setItem(MH_PROFILE_PREFIX+activeProfileId,JSON.stringify(sanitized));
 const at=profileIndex.findIndex(x=>x.id===activeProfileId);
 const prior=at>=0?profileIndex[at]:null,entry=metaFor(activeProfileId,sanitized,prior);
 if(at>=0)profileIndex[at]=entry;else profileIndex.unshift(entry);
 writeProfileIndex();
 renderProfileLibrary();
}
function initializeProfileLibrary(){
 const index=safeReadJSON(MH_PROFILE_INDEX,[]);
 profileIndex=Array.isArray(index)?index.filter(x=>x&&typeof x.id==="string"&&x.id.length<120):[];
 // If a previous version saved a single draft, safely migrate it rather than overwriting it.
 if(!profileIndex.length){
   const old=safeReadJSON("musehouse_creator_draft",null);
   const id=profileId();
   const draft=cleanDraft(old&&typeof old==="object"?old:fresh());
   activeProfileId=id;a=draft;
   profileIndex=[metaFor(id,draft)];
   saveProfileDraft();
 }else{
   activeProfileId=localStorage.getItem(MH_PROFILE_ACTIVE);
   if(!profileIndex.some(x=>x.id===activeProfileId))activeProfileId=profileIndex[0].id;
   a=readDraft(activeProfileId);
   // Preserve the draft in the previous key as a backup during migration.
   writeProfileIndex();
 }
}
function preserveEditorInputs(){
 if(!$("a-name"))return;
 gather(); // Persists current identity to the active draft.
 a.uiDraft={
   chat:$("chat-input")?.value||"",
   testPrompt:$("test-prompt")?.value||"",
   refine:$("refine-feedback")?.value||"",
   testFeedback:$("test-feedback")?.value||""
 };
 saveProfileDraft();
}
function restoreEditorInputs(){
 $("a-name").value=a.artist||"";$("a-engine").value=a.engine||"";
 $("a-medium").value=a.medium||"Art";$("a-intent").value=a.intent||"";$("a-exclusions").value=a.exclusions||"";
 $("chat-input").value=a.uiDraft?.chat||"";
 $("test-prompt").value=a.uiDraft?.testPrompt||"";
 $("refine-feedback").value=a.uiDraft?.refine||"";
 $("test-feedback").value=a.uiDraft?.testFeedback||"";
 $("guide-edit-area").hidden=true;
 $("analysis-pending").textContent="";$("chat-status").textContent="Your conversation is saved to this profile.";
}
function selectProfile(id){
 if(!profileIndex.some(x=>x.id===id)||id===activeProfileId)return;
 if(pending){inform("Finish the current AI request before changing profiles.");return}
 preserveEditorInputs();
 referenceImageCache[activeProfileId]=images;
 activeProfileId=id;
 a=readDraft(id);
 images=referenceImageCache[id]||{};
 restoreEditorInputs();goto(a.stage||"identity");
 inform("Opened "+(a.engine||a.artist||"untitled profile")+".");
}
function createProfile(duplicate){
 if(pending){inform("Finish the current AI request first.");return}
 preserveEditorInputs();
 referenceImageCache[activeProfileId]=images;
 const prior=a;
 a=duplicate?cleanDraft(JSON.parse(JSON.stringify(prior))):fresh();
 if(duplicate){a.engine=(a.engine||"Untitled engine")+" (copy)";a.lastTest=null;a.stage="identity";}
 activeProfileId=profileId();images={};
 restoreEditorInputs();goto("identity");
 inform(duplicate?"A separate copy of the profile was created.":"New blank profile created. Your earlier profiles are still saved.");
}
function deleteProfile(id){
 if(pending){inform("Finish the current AI request first.");return}
 const meta=profileIndex.find(x=>x.id===id);
 if(!meta)return;
 const name=meta.engine||meta.artist||"Untitled draft";
 if(!confirm('Permanently delete "'+name+'" from this browser? Export the profile first if you need a backup.'))return;
 if(id!==activeProfileId)preserveEditorInputs();
 try{localStorage.removeItem(MH_PROFILE_PREFIX+id)}catch(_){}
 delete referenceImageCache[id];
 profileIndex=profileIndex.filter(x=>x.id!==id);
 if(!profileIndex.length){
   activeProfileId=profileId();a=fresh();images={};
   profileIndex=[metaFor(activeProfileId,a)];
   restoreEditorInputs();goto("identity");
 }else if(id===activeProfileId){
   activeProfileId=profileIndex[0].id;a=readDraft(activeProfileId);images=referenceImageCache[activeProfileId]||{};
   restoreEditorInputs();goto(a.stage||"identity");
 }else{writeProfileIndex();renderProfileLibrary()}
 inform("Deleted the selected local profile.");
}
function resetProfile(){
 if(pending){inform("Finish the current AI request first.");return}
 if(!confirm("Reset this profile to a blank draft? This clears its interview and private guide. Other profiles will be preserved. Export a backup first if necessary."))return;
 a=fresh();images={};referenceImageCache[activeProfileId]={};
 restoreEditorInputs();goto("identity");inform("Current profile reset. Your other artist profiles are unchanged.");
}
function exportProfile(id){
 if(id===activeProfileId)preserveEditorInputs();
 const draft=id===activeProfileId?a:readDraft(id);
 if(!draft)return;
 const snapshot={type:"musehouse-artist-profile",schemaVersion:1,exportedAt:new Date().toISOString(),
   profile:{...cleanDraft(draft),lastTest:null},note:"Reference images and PDFs are not included; this is a confidential local artist draft."};
 const blob=new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.download="musehouse-"+(draft.artist||"artist")+"-"+(draft.engine||"engine")+".json";
 link.download=link.download.toLowerCase().replace(/[^a-z0-9._-]+/g,"-").slice(0,125);
 link.href=url;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
 inform("Profile exported. Share the private JSON file directly with the reviewer you trust.");
}
async function importProfile(file){
 if(!file)return;
 if(file.size>1250000){inform("Choose a JSON draft smaller than 1.25 MB.");return}
 try{
   const json=JSON.parse(await file.text());
   const source=json?.type==="musehouse-artist-profile"?json.profile:json;
   if(!source||typeof source!=="object"||Array.isArray(source)||(!source.artist&&!source.engine)){
     throw new Error("This is not a Musehouse profile export.");
   }
   if(pending)throw new Error("Finish the current AI request first.");
   preserveEditorInputs();referenceImageCache[activeProfileId]=images;
   a=cleanDraft(source);a.stage=steps.includes(a.stage)?a.stage:"identity";images={};
   activeProfileId=profileId();restoreEditorInputs();goto(a.stage);
   inform("Imported "+(a.engine||"artist profile")+" as a new independent draft.");
 }catch(err){inform("Import failed: "+(err.message||"unreadable file"))}
}
function renderProfileLibrary(){
 const area=$("profile-list");if(!area)return;
 const ordered=[...profileIndex].sort((x,y)=>(y.updatedAt||0)-(x.updatedAt||0));
 $("profile-count").textContent=profileIndex.length===1?"1 draft":profileIndex.length+" drafts";
 area.innerHTML=ordered.map(p=>{
   const current=p.id===activeProfileId;
   const status=p.hasGuide?"Creative DNA assembled":(p.answers||0)+" interview answer"+(p.answers===1?"":"s");
   return '<article class="atelier-library-card '+(current?"selected":"")+'">'+
     '<div class="atelier-library-card-head"><span class="atelier-artist-monogram">'+htmlEscape((p.artist||"✳").slice(0,1).toUpperCase())+'</span><div><div class="atelier-profile-artist">'+htmlEscape(p.artist||"New artist")+'</div><h3>'+htmlEscape(p.engine||"Untitled creative engine")+'</h3></div></div>'+
     '<div class="atelier-profile-tagline">'+htmlEscape(p.medium||"Art")+' · '+htmlEscape(status)+'</div>'+
     '<div class="atelier-profile-actions">'+
     '<button type="button" class="button '+(current?"pale":"orange")+' small" data-profile-open="'+htmlEscape(p.id)+'">'+(current?"Current draft":"Open draft")+'</button>'+
     '<button type="button" class="atelier-icon-action" title="Duplicate draft" aria-label="Duplicate '+htmlEscape(p.engine||"profile")+'" data-profile-duplicate="'+htmlEscape(p.id)+'">⧉</button>'+
     '<button type="button" class="atelier-icon-action" title="Export profile JSON" aria-label="Export '+htmlEscape(p.engine||"profile")+'" data-profile-export="'+htmlEscape(p.id)+'">↓</button>'+
     '<button type="button" class="atelier-icon-action destructive" title="Delete local draft" aria-label="Delete '+htmlEscape(p.engine||"profile")+'" data-profile-delete="'+htmlEscape(p.id)+'">×</button>'+
     '</div></article>';
 }).join("");
}
function initProfileLibraryUI(){
 renderProfileLibrary();
 $("add-profile").addEventListener("click",()=>createProfile(false));
 $("new-session").addEventListener("click",()=>createProfile(false));
 $("reset-profile").addEventListener("click",resetProfile);
 $("import-profile").addEventListener("change",async e=>{const f=e.target.files?.[0];if(f)await importProfile(f);e.target.value=""});
 $("copy-studio-link").addEventListener("click",async()=>{
   const link="https://musehouse-ai-art.vercel.app/atelier.html";
   try{await navigator.clipboard.writeText(link);inform("Studio link copied. Invitees need pilot access for live AI requests.");}
   catch(_){inform("Share this link: "+link)}
 });
 document.addEventListener("click",e=>{
   const op=e.target.closest("[data-profile-open]");
   const du=e.target.closest("[data-profile-duplicate]");
   const ex=e.target.closest("[data-profile-export]");
   const del=e.target.closest("[data-profile-delete]");
   if(op)selectProfile(op.dataset.profileOpen);
   if(du){if(du.dataset.profileDuplicate!==activeProfileId)selectProfile(du.dataset.profileDuplicate);createProfile(true)}
   if(ex)exportProfile(ex.dataset.profileExport);
   if(del)deleteProfile(del.dataset.profileDelete);
 });
}
initializeProfileLibrary();
