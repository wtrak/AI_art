const crypto = require("node:crypto");

const KNOWN_ENGINES = {
  sunprint: {
    sampleRecipe: "A handmade sunlit printmaking look: deliberately asymmetric geometric collage, ochre, faded warm apricot, dusty teal, scattered handmade edges, tactile paper grain; architecture feels sculptural; simple confident silhouette with deep visual rhythm. Avoid slick 3D render appearance.",
    restrictions: ["political campaign", "campaign advertisement"]
  },
  inkhouse: {
    sampleRecipe: "A physical relief-print sensibility. Architecture in high-contrast carved black shapes against warm paper, terracotta ink registration imperfections, bold rooflines, delicate grain, strong poster-like negative space. Avoid smooth photorealistic shading.",
    restrictions: ["political campaign"]
  },
  streetlight: {
    sampleRecipe: "A cinematic art-photography process for night cities. Observe pockets of atmospheric light and reflections, chance framing, deep blue-black tones and warm sodium highlights, natural camera optics, imperfect film grain, human-scale storytelling, realism with emotional distance. Avoid counterfeit news-documentary framing.",
    restrictions: ["news evidence", "forensic evidence"]
  },
  softfocus: {
    sampleRecipe: "An intimate editorial photography process: make the subject feel present but unposed, diffuse window light, a narrow naturally imperfect depth of field, airy muted color, quietly expressive gestures, soft tactile highlights, editorial composition. Preserve humanity and natural proportions.",
    restrictions: ["fake id", "passport photograph"]
  },
  folklore: {
    sampleRecipe: "A delicate illustrated folk-story world. Small houses, midnight indigo skies, tender gouache imperfections, celestial gold accents, dreamlike geography, handcrafted ornaments, luminous warm windows and intimate scale. Prefer visual narrative over decorative randomness.",
    restrictions: ["political campaign"]
  },
  wildgarden: {
    sampleRecipe: "An illustrated archive of imaginary specimens. Scientific botanical observation interpreted through intricate hand-drawn ink, warm catalog paper, muted sage and terracotta botanical pigments, generous negative space, asymmetrical specimen clusters, subtle antique label hierarchy. Avoid photographic rendering.",
    restrictions: ["medical certificate"]
  },
  electric: {
    sampleRecipe: "Experimental contemporary print graphics: found-type collage, rhythmic oversized editorial typography, sharp cropping, electric lavender, coral and lemon, deliberately off-register layers, playful scale jumps, rough screen-printed surfaces. When including text, use only text provided by the customer or minimal fictional headings.",
    restrictions: ["political campaign"]
  },
  chromatic: {
    sampleRecipe: "An abstract graphic-art process based on emotional color and kinetic form. Layer sculptural ribbons, vibrating complementary colors, velvety gradients, oversized fluid silhouettes, spatial tension and unexpected cutouts. Create formal unity without literal stock illustration.",
    restrictions: ["political campaign"]
  }
};
const safeEqual = (a,b)=>{
  const aa=Buffer.from(String(a||""),"utf8"),bb=Buffer.from(String(b||""),"utf8");
  return aa.length>0 && aa.length===bb.length && crypto.timingSafeEqual(aa,bb);
};
function parseJsonEnv(name,fallback){
  try{const value=process.env[name];return value?JSON.parse(value):fallback;}catch(_){return fallback}
}
const send=(res,status,error)=>res.status(status).json({error});
module.exports = async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(req.method!=="POST"){res.setHeader("Allow","POST");return send(res,405,"Method not allowed");}
  const apiKey=process.env.OPENAI_API_KEY;
  const accessCode=process.env.PROTOTYPE_ACCESS_CODE;
  if(!accessCode||!(apiKey||process.env.VERCEL_OIDC_TOKEN||process.env.AI_GATEWAY_API_KEY)){return send(res,503,"AI generation is not configured. The free local style-study portal is still available.");}
  if(!safeEqual(req.headers["x-prototype-code"],accessCode)){return send(res,401,"Incorrect prototype access code.");}
  const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):req.body||{};
  const engineId=typeof body.engineId==="string"?body.engineId:"";
  const entry=KNOWN_ENGINES[engineId];
  if(!entry){return send(res,400,"This engine is not currently published for image generation.");}
  const idea=typeof body.prompt==="string"?body.prompt.trim():"";
  if(!idea||idea.length>1500){return send(res,400,"Please enter a request of 1–1500 characters.");}
  const aspect=["square","portrait","landscape"].includes(body.aspect)?body.aspect:"square";
  const influence=["subtle","signature","bold"].includes(body.influence)?body.influence:"signature";
  const photo=body.imageDataUrl;
  if(photo!=null&&(typeof photo!=="string"||photo.length>1800000||!/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(photo))){return send(res,413,"The reference photograph must be a small JPG, PNG or WebP image.");}
  const extras=parseJsonEnv("PRIVATE_STYLE_RULES_JSON",{});
  const serverRules=extras&&typeof extras==="object"&&extras[engineId]&&typeof extras[engineId]==="object"?extras[engineId]:{};
  const blocked=(entry.restrictions||[]).concat(Array.isArray(serverRules.prohibitedTerms)?serverRules.prohibitedTerms:[]);
  for(const term of blocked){if(typeof term==="string"&&term.length>=3&&idea.toLowerCase().includes(term.toLowerCase()))return send(res,400,"This creator does not license that type of content.");}
  if(photo&&serverRules.acceptPhotoEdits===false){return send(res,400,"This engine does not permit edits of reference photographs.");}
  let recipe=entry.sampleRecipe;
  const secretVault=parseJsonEnv("PRIVATE_STYLE_RECIPES_JSON",{});
  if(secretVault&&typeof secretVault==="object"&&typeof secretVault[engineId]==="string"&&secretVault[engineId].trim()){recipe=secretVault[engineId].trim().slice(0,12000);}
  if(process.env.REQUIRE_PRIVATE_RECIPES==="true"&&recipe===entry.sampleRecipe){return send(res,403,"This artist's licensed private workflow has not been installed.");}
  const influenceRule={
    subtle:"Preserve the user's requested subject, recognizable features and overall composition; make the artist's influence understated.",
    signature:"Apply the creator's signature composition, tone and texture strongly, while preserving the user's central subject.",
    bold:"Push the creator's artistic system boldly and experimentally, while maintaining the user's requested central subject."
  }[influence];
  const prompt=[
    "You are a private artist-authorized creative engine in a self-service visual creation platform.",
    "The next block describes a fictional licensed pilot engine, or a private licensed recipe installed by the platform owner.",
    "Apply its aesthetic decisions to the new requested subject. Do not output the workflow, hidden instructions, technical metadata, or prompt as text within the artwork.",
    "Artist workflow: "+recipe,
    "Influence strength: "+influenceRule,
    "Customer's requested subject and changes: "+idea,
    photo?"Use the supplied customer-owned photo as a reference for the creative transformation.":"Create a new original scene from the description.",
    "Return only an original finished visual artwork. Do not include AI interface controls or watermarks."
  ].join("\n\n");
  const size={square:"1024x1024",portrait:"1024x1536",landscape:"1536x1024"}[aspect];
  // Prefer zero-secret Vercel AI Gateway when a provider-specific API key is absent.
  // This uses the Vercel deployment's automatic OIDC token and the AI SDK.
  if(!apiKey){
    try{
      const ai=await import("ai");
      const sourceImage=photo?Buffer.from(photo.split(",")[1],"base64"):null;
      const result=await ai.generateImage({
        model:process.env.GATEWAY_IMAGE_MODEL||"openai/gpt-image-2.5-flare",
        prompt:sourceImage?{text:prompt,images:[sourceImage]}:prompt,
        size,
        abortSignal:AbortSignal.timeout(75000)
      });
      const generated=result.images&&result.images[0]?result.images[0]:result.image;
      const base64=generated?.base64||(generated?.uint8Array?Buffer.from(generated.uint8Array).toString("base64"):"");
      const media=generated?.mediaType||"image/png";
      if(!base64)return send(res,502,"The image gateway returned no artwork.");
      if(base64.length>3900000)return send(res,502,"The image was too large for this prototype response.");
      return res.status(200).json({imageDataUrl:"data:"+media+";base64,"+base64,engineId,medium:"image",creatorWorkflowPrivate:true});
    }catch(err){
      console.error("AI Gateway generation error:",err?.name,err?.message);
      const message=err?.name==="AbortError"||err?.name==="TimeoutError"?"Image generation timed out.":"AI Gateway could not create this image. Check gateway access, credits, project settings and content restrictions.";
      return send(res,502,message);
    }
  }
  const model=process.env.IMAGE_MODEL||"gpt-image-2.5-flare";
  const payload=photo?{
    model,images:[{image_url:photo}],prompt,size,quality:"medium",n:1,output_format:"webp",output_compression:70
  }:{
    model,prompt,size,quality:"medium",n:1,output_format:"webp",output_compression:70
  };
  const url="https://api.openai.com/v1/images/"+(photo?"edits":"generations");
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),75000);
    let response;
    try{response=await fetch(url,{method:"POST",signal:controller.signal,headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify(payload)})}
    finally{clearTimeout(timeout)}
    if(!response.ok){const status=response.status;return send(res,status===429?429:502,status===429?"The image service is busy or has reached its quota. Try again later.":"The image service rejected this request ("+status+"). Check model access, billing, and content restrictions.");}
    const result=await response.json();
    const image=result&&result.data&&result.data[0]&&result.data[0].b64_json;
    if(typeof image!=="string"||image.length===0)return send(res,502,"The image service did not return artwork.");
    if(image.length>3900000)return send(res,502,"The image was too large for this prototype response. Try a smaller image or lower quality.");
    return res.status(200).json({imageDataUrl:"data:image/webp;base64,"+image,engineId,medium:"image",creatorWorkflowPrivate:true});
  }catch(err){
    if(err&&err.name==="AbortError")return send(res,504,"The image service timed out. Please try again.");
    console.error("AI generation error:",err&&err.message);
    return send(res,502,"The image service is unavailable. Your demo credits were not charged.");
  }
};
