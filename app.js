(function(){
"use strict";
const creators=[
{id:"sol",name:"Sol Rivera",field:"Painter & printmaker",bio:"Color-saturated spaces, tactile printmaking and playful architectural forms. Every composition feels like a warm afternoon you can take home.",initials:"SR",bg:"#ffb88c",color:"#7f3c2c",home:"Mexico City",engines:2},
{id:"lena",name:"Lena Voss",field:"Art photographer",bio:"Atmosphere, shadow, chance encounters. Lena's photographic workflows turn ordinary places and moments into cinematic worlds.",initials:"LV",bg:"#b4cbd8",color:"#24495c",home:"Berlin",engines:2},
{id:"nori",name:"Nori Imai",field:"Illustrator & visual storyteller",bio:"Dreamlike places, handcrafted botanical details and the soft logic of old storybooks, interpreted through a modern lens.",initials:"NI",bg:"#c2d8a3",color:"#44552d",home:"Kyoto",engines:2},
{id:"theo",name:"Theo Marlowe",field:"Graphic artist",bio:"Visual noise with intention. Theo builds layered print systems, striking typography and art that refuses to blend into the background.",initials:"TM",bg:"#d0b6ed",color:"#594179",home:"London",engines:2}
];
const engines=[
{id:"sunprint",creator:"sol",name:"Sunprint Worlds",medium:"Visual Art",type:"collage",description:"Warm painterly collage, cut-paper shapes and impossibly sunny places.",palette:["#f2dfb3","#c96243","#f09f50","#527874","#372e37"],tags:["Collage","Landscape"],examples:["A dream house beside the sea","A little lemon market in Sicily","A flower shop at sunrise"]},
{id:"inkhouse",creator:"sol",name:"The Ink House",medium:"Visual Art",type:"ink",description:"Print-room textures, bold architectural shadows, and tactile imperfections.",palette:["#e8d5bd","#282b2c","#b75238","#947b5d","#f4e7d1"],tags:["Printmaking","Architecture"],examples:["An old bookstore in the rain","A mountain train station","A café hidden in a narrow street"]},
{id:"streetlight",creator:"lena",name:"After-Hours Street",medium:"Photography",type:"street",description:"Wet streets, cinematic grain and the vivid loneliness of cities after dark.",palette:["#171d31","#ec734d","#2b6287","#ffe0a7","#131824"],tags:["Street","Cinematic"],examples:["A record store at 2 AM in Tokyo","A diner on a rainy night","An empty subway platform at dawn"]},
{id:"softfocus",creator:"lena",name:"Soft Focus Stories",medium:"Photography",type:"portrait",description:"Dreamy editorial portraiture with delicate light and intimate character.",palette:["#e6d0c4","#8a6878","#b99f83","#f5ebe2","#514555"],tags:["Portrait","Editorial"],examples:["A dancer in a quiet Paris apartment","A portrait in a greenhouse","A bride in a sunlit garden"]},
{id:"folklore",creator:"nori",name:"Pocket Folklore",medium:"Visual Art",type:"folklore",description:"Tiny fables, glowing windows, woodland creatures and a midnight-blue hush.",palette:["#203b54","#e8c57e","#9dbda6","#d5a18e","#172e49"],tags:["Storybook","Whimsical"],examples:["A cottage on the edge of a forest","A tiny observatory under the stars","A fox wandering through a snowy village"]},
{id:"wildgarden",creator:"nori",name:"Wildgarden Notes",medium:"Visual Art",type:"botanical",description:"Botanical linework, pressed-paper colors and delicate collected wonders.",palette:["#f0e9d5","#527b5d","#ad8d60","#c97965","#3f5947"],tags:["Botanical","Drawing"],examples:["An illustrated garden of rare herbs","A bouquet of wild poppies","A study of woodland mushrooms"]},
{id:"electric",creator:"theo",name:"Electric Ephemera",medium:"Design",type:"poster",description:"Punchy found-type posters, unexpected collision and bright visual rhythm.",palette:["#e8deef","#3a2c70","#f45c53","#e7c74d","#25213f"],tags:["Posters","Typography"],examples:["A music festival for astronauts","A fictional Italian racing team","A poster for a midnight dance party"]},
{id:"chromatic",creator:"theo",name:"Chromatic Motion",medium:"Design",type:"abstract",description:"Surreal color fields, sculptural forms and high-voltage experimental graphics.",palette:["#201846","#fe6d77","#edbd63","#698fe0","#e8dcec"],tags:["Experimental","Abstract"],examples:["The feeling of a summer road trip","Sound waves turning into flowers","An imaginary city in the clouds"]},
{id:"percussion",creator:"amari",artistName:"Amari Okoye",name:"Percussive Motion",medium:"Music",type:"music",description:"Rhythm-forward electronic and Afro-Cuban production ideas. Audio engine adapter in development.",palette:["#30214e","#e57b54","#f7d88a","#8353c2","#212040"],tags:["Production","Rhythm"],upcoming:true,examples:[]}
];
const $=function(s){return document.querySelector(s)};
const $$=function(s){return Array.from(document.querySelectorAll(s))};
const read=function(key,fallback){try{const v=localStorage.getItem("musehouse_"+key);return v?JSON.parse(v):fallback}catch(_){return fallback}};
const save=function(key,val){try{localStorage.setItem("musehouse_"+key,JSON.stringify(val))}catch(e){console.warn("Local demo storage is full",e)}};
const esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]})};
let drafts=read("drafts",[]),history=read("history",[]),favorites=read("favorites",[]),usage=read("usage",[]),credits=read("credits",30);
let state={page:"discover",engine:"sunprint",aspect:"square",influence:"signature",filter:"All",search:"",image:null,photo:null,lastMode:"study",seed:1,aiReady:false,accessCode:"",savedCurrent:false};
const getCreator=function(id){return creators.find(function(x){return x.id===id})||null};
const getEngines=function(){return engines.concat(drafts.map(function(d){return {id:d.id,creator:"draft",artistName:d.artist,name:d.name,medium:d.medium==="Art"?"Visual Art":d.medium,type:d.medium==="Photography"?"portrait":d.medium==="Design"?"poster":d.medium==="Music"?"music":"collage",description:"Locally drafted engine · not published",palette:["#ead4ba","#a67d78","#514b76","#e5b55e","#45414c"],tags:["Draft","Unpublished"],upcoming:d.medium==="Music",isDraft:true,examples:["A little house at the edge of the forest","A city at sunrise","An imaginary place"]}}))};
const getEngine=function(id){return getEngines().find(function(e){return e.id===id})};
const creatorName=function(e){return e.artistName||(getCreator(e.creator)||{}).name||"Guest creator"};
const toast=function(message){const e=$("#toast");e.textContent=message;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display="none"},3400)};
const strHash=function(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng=function(s){let a=s>>>0;return function(){a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
const color=function(p,i){return p[((i%p.length)+p.length)%p.length]};
function renderArt(canvas,e,seed,photo){
  if(!canvas||!e)return;
  const w=canvas.width,h=canvas.height,ctx=canvas.getContext("2d"),p=e.palette||["#e9ddbc","#d57654","#233c52","#d5b3a0","#29352a"];
  const random=rng(strHash(String(seed)+e.id));
  const R=function(a,b){return a+(b-a)*random()};
  ctx.save();ctx.scale(w/600,h/760);ctx.fillStyle=p[0];ctx.fillRect(0,0,600,760);
  function ellipse(x,y,rx,ry,c){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill()}
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function poly(pts,c){ctx.beginPath();pts.forEach(function(pt,i){i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1])});ctx.closePath();ctx.fillStyle=c;ctx.fill()}
  function line(x1,y1,x2,y2,c,l){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=c;ctx.lineWidth=l||2;ctx.stroke()}
  function grain(opacity,n){ctx.globalAlpha=opacity;for(let i=0;i<n;i++){rect(R(0,600),R(0,760),R(.4,2.4),R(.4,2.4),random()>.5?"#fff":"#151515")}ctx.globalAlpha=1}
  function stars(n,c){for(let i=0;i<n;i++){let x=R(15,585),y=R(15,550),s=R(2,9);line(x-s,y,x+s,y,c,1);line(x,y-s,x,y+s,c,1)}}
  if(photo){const iw=photo.width,ih=photo.height,scale=Math.max(600/iw,760/ih),sw=iw*scale,sh=ih*scale;ctx.save();ctx.filter=e.type==="street"?"contrast(1.5) saturate(.72) brightness(.72)":e.type==="portrait"?"saturate(.75) sepia(.2) contrast(.86)":"sepia(.22) saturate(1.05) contrast(1.11)";ctx.drawImage(photo,(600-sw)/2,(760-sh)/2,sw,sh);ctx.restore();ctx.fillStyle=p[1];ctx.globalAlpha=e.type==="street"?.32:.13;ctx.fillRect(0,0,600,760);ctx.globalAlpha=1;if(e.type==="poster"){rect(30,40,540,150,p[2]);ctx.fillStyle=p[0];ctx.font="bold 80px Arial";ctx.fillText("MAKE",45,145)}if(e.type==="botanical"){for(let i=0;i<9;i++){line(R(0,600),700,R(0,600),R(0,150),p[1],3)}}if(e.type==="street"){for(let i=0;i<17;i++){line(R(0,600),R(50,700),R(0,600),R(50,700),p[2],R(1,4))}}grain(.25,2200);ctx.restore();return}
  const type=e.type;
  if(type==="collage"){
    rect(0,0,600,760,p[0]);ellipse(420,190,152,156,p[2]);poly([[0,470],[120,330],[260,410],[370,300],[600,410],[600,760],[0,760]],p[3]);poly([[0,555],[160,470],[300,532],[430,455],[600,540],[600,760],[0,760]],p[2]);poly([[160,415],[330,300],[470,420],[470,595],[160,595]],p[1]);poly([[128,424],[319,258],[500,425]],p[4]);rect(301,466,70,129,p[4]);rect(195,470,70,66,p[0]);for(let i=0;i<8;i++){ellipse(R(0,600),R(610,780),R(13,34),R(50,100),i%2?p[3]:p[4])}for(let i=0;i<9;i++){line(R(0,600),R(410,740),R(0,600),R(380,700),p[0],R(1,5))}grain(.2,3000)
  }else if(type==="street"){
    rect(0,0,600,760,p[0]);let sky=ctx.createLinearGradient(0,0,0,760);sky.addColorStop(0,p[0]);sky.addColorStop(1,p[2]);rect(0,0,600,760,sky);ellipse(355,290,190,140,p[2]);for(let i=0;i<10;i++){const x=i*75-35,y=R(110,420);rect(x,y,R(55,100),760-y,p[4]);for(let j=0;j<10;j++){if(random()>.52)rect(x+R(8,48),y+R(10,350),R(3,9),R(5,24),random()>.4?p[3]:p[1])}}poly([[0,530],[600,560],[600,760],[0,760]],p[0]);for(let i=0;i<24;i++){let x=R(30,570),y=R(520,740);line(x,y,x+R(-20,23),y+R(10,65),random()>.5?p[1]:p[3],R(1,6))}ellipse(415,410,30,30,p[1]);ellipse(415,410,85,85,"#ee73443a");grain(.4,4500)
  }else if(type==="portrait"){
    let g=ctx.createLinearGradient(0,0,600,760);g.addColorStop(0,p[3]);g.addColorStop(.6,p[0]);g.addColorStop(1,p[1]);rect(0,0,600,760,g);for(let i=0;i<4;i++)ellipse(R(-100,650),R(40,720),R(80,260),R(80,300),"#ffffff20");ellipse(305,612,260,240,p[4]);ellipse(306,278,149,184,p[1]);ellipse(296,321,105,155,p[0]);ellipse(262,315,8,6,p[4]);ellipse(344,315,8,6,p[4]);line(292,373,324,373,p[4],4);ellipse(153,240,88,174,p[1]);ellipse(399,177,93,155,p[1]);poly([[100,760],[193,540],[355,570],[493,760]],p[2]);ctx.globalAlpha=.28;rect(0,0,600,760,p[3]);ctx.globalAlpha=1;grain(.26,3000)
  }else if(type==="folklore"){
    rect(0,0,600,760,p[0]);ellipse(430,170,84,84,p[1]);ellipse(455,148,83,83,p[0]);stars(85,p[1]);poly([[0,490],[100,335],[185,455],[285,300],[405,470],[505,350],[600,460],[600,760],[0,760]],p[2]);poly([[0,565],[120,470],[235,560],[380,444],[600,544],[600,760],[0,760]],p[4]);for(let i=0;i<15;i++){let x=R(0,600),y=R(505,730);poly([[x-20,y],[x,y-R(70,135)],[x+20,y]],p[0]);rect(x-4,y,8,30,p[0])}poly([[215,565],[305,485],[400,565],[400,690],[215,690]],p[3]);poly([[194,567],[300,448],[425,567]],p[4]);rect(288,585,52,71,p[1]);ellipse(314,617,50,50,"#e8c57e35");grain(.27,2300)
  }else if(type==="botanical"){
    rect(0,0,600,760,p[0]);rect(31,31,538,698,"#f9f5e7");ctx.strokeStyle=p[2];ctx.lineWidth=2;ctx.strokeRect(46,46,508,668);
    for(let i=0;i<10;i++){let x=R(75,535),y=R(480,700),top=R(105,340);line(x,y,x+R(-60,60),top,p[1],R(2,5));let ax=x;for(let j=0;j<7;j++){let yy=y+(top-y)*j/7,xx=x+Math.sin(j+i)*23;ellipse(xx-17,yy,16,33,p[1]);ellipse(xx+17,yy-13,14,28,p[3])}ellipse(x,top,28,30,p[4]);for(let j=0;j<6;j++)ellipse(x+Math.cos(j*Math.PI/3)*26,top+Math.sin(j*Math.PI/3)*24,18,25,p[2])}
    ctx.fillStyle=p[4];ctx.font="italic 23px Georgia";ctx.fillText("HERBARIUM / No. 07",75,97);ctx.font="17px Georgia";ctx.fillText("collected fragments",360,685);grain(.17,2000)
  }else if(type==="ink"){
    rect(0,0,600,760,p[0]);rect(0,0,600,300,p[4]);ellipse(460,160,96,96,p[1]);for(let j=0;j<25;j++)line(0,310+j*12,600,300+j*12,p[2],j%3===0?2:1);
    poly([[105,680],[105,300],[330,210],[495,300],[495,680]],p[1]);poly([[80,307],[325,150],[525,307]],p[2]);rect(160,355,120,140,p[0]);rect(335,355,100,140,p[0]);rect(280,520,75,160,p[2]);for(let i=0;i<25;i++){let y=370+i*11;line(104,y,496,y,p[2],1.5)}for(let i=0;i<15;i++){line(R(0,600),R(0,760),R(0,600),R(0,760),p[1],R(1,3))}grain(.38,6000)
  }else if(type==="poster"){
    rect(0,0,600,760,p[1]);ellipse(390,230,265,265,p[3]);ellipse(390,230,180,180,p[2]);ellipse(390,230,102,102,p[0]);poly([[0,450],[600,230],[600,760],[0,760]],p[4]);for(let i=0;i<5;i++){ctx.save();ctx.translate(50,300+i*93);ctx.rotate(-.14);ctx.font="bold 86px Arial";ctx.fillStyle=i%2===0?p[0]:p[3];ctx.fillText(["CREATE","YOUR","OWN","UNIVERSE","NOW"][i],0,0);ctx.restore()}grain(.22,2700)
  }else if(type==="abstract"){
    let gradient=ctx.createLinearGradient(0,0,600,760);gradient.addColorStop(0,p[0]);gradient.addColorStop(.48,p[3]);gradient.addColorStop(1,p[1]);rect(0,0,600,760,gradient);for(let i=0;i<7;i++){ctx.save();ctx.translate(R(0,600),R(0,760));ctx.rotate(R(-2,2));ctx.beginPath();ctx.ellipse(0,0,R(50,190),R(130,290),0,0,2*Math.PI);ctx.fillStyle=color(p,i+1);ctx.globalAlpha=R(.5,.9);ctx.fill();ctx.restore()}for(let i=0;i<26;i++){ctx.beginPath();ctx.arc(R(0,600),R(0,760),R(3,63),0,Math.PI*2);ctx.strokeStyle=random()>.5?p[2]:p[4];ctx.lineWidth=R(2,11);ctx.stroke()}grain(.18,1500)
  }else{rect(0,0,600,760,p[0]);ellipse(300,360,180,180,p[2]);poly([[0,600],[600,240],[600,760],[0,760]],p[1]);grain(.2,1100)}
  if(seed&&String(seed).length>0){const variation=strHash(String(seed));const pos=(variation%400)+100;ctx.globalAlpha=.18;ellipse(pos,580,75,75,p[3]);ctx.globalAlpha=1}
  ctx.restore();
}
function renderAllArt(root){
 (root||document).querySelectorAll("canvas[data-engine-art],canvas[data-hero-engine]").forEach(function(c){let id=c.getAttribute("data-engine-art")||c.getAttribute("data-hero-engine");let e=getEngine(id);if(e){c.width=600;c.height=760;renderArt(c,e,"cover-"+id)}});
}
function cardHTML(e){
 let favorited=favorites.indexOf(e.id)>=0;
 return '<article class="engine-card"><div class="engine-preview"><canvas data-engine-art="'+esc(e.id)+'" width="600" height="760" aria-label="'+esc(e.name)+' style study"></canvas><span class="floating-tag">'+esc(e.upcoming?"Coming soon":e.medium)+'</span></div><div class="engine-body"><h3 class="engine-title">'+esc(e.name)+'</h3><div class="engine-byline">by <button class="link" data-artist="'+esc(e.creator)+'">'+esc(creatorName(e))+'</button></div><p class="muted" style="line-height:1.55;font-size:12px;min-height:38px">'+esc(e.description)+'</p><div class="engine-foot"><strong>✳ '+esc(e.upcoming?"Future audio engine":e.isDraft?"Local draft":"1 credit / creation")+'</strong><div style="display:flex;gap:6px"><button class="icon-button" aria-label="'+(favorited?"Unsave":"Save")+' engine" data-heart="'+esc(e.id)+'">'+(favorited?"♥":"♡")+'</button><button class="button small" data-engine="'+esc(e.id)+'" '+(e.upcoming?"disabled":"")+'>Try it ↗</button></div></div></div></article>'
}
function drawGallery(target,items){const c=$(target);if(!c)return;c.innerHTML=items.length?items.map(cardHTML).join(""):'<p class="muted">No creative engines match that search. Try another category.</p>';renderAllArt(c)}
function renderFilters(target,filter){const c=$(target);if(!c)return;c.innerHTML=["All","Visual Art","Photography","Design","Music","Saved"].map(function(f){return '<button class="chip '+(filter===f?"active":"")+'" data-filter="'+esc(f)+'" data-filter-target="'+target+'">'+esc(f==="Visual Art"?"Fine art":f)+'</button>'}).join("")}
function filtered(list,filter,query){return list.filter(function(e){if(filter==="Saved"&&favorites.indexOf(e.id)<0)return false;if(filter!=="All"&&filter!=="Saved"&&e.medium!==filter)return false;const text=[e.name,e.description,creatorName(e),e.medium,(e.tags||[]).join(" ")].join(" ").toLowerCase();return !query||text.indexOf(query.toLowerCase())>=0})}
function renderHome(){
 renderFilters("#featured-filters",state.filter);drawGallery("#featured-gallery",filtered(engines,state.filter,"").slice(0,8));$("#home-creators").innerHTML=creators.map(function(c){return '<article class="creator-card"><div class="portrait" style="background:'+c.bg+';color:'+c.color+'">'+c.initials+'</div><div class="eyebrow" style="font-size:9px;color:#8a7662">'+esc(c.field)+'</div><h3>'+esc(c.name)+'</h3><p>'+esc(c.bio.slice(0,100))+'…</p><div class="bottom"><span style="font-size:12px;font-weight:800">'+c.engines+' engines</span><button class="link" data-artist="'+c.id+'">Meet the artist ↗</button></div></article>'}).join("");renderAllArt();
}
function renderExplore(){
 renderFilters("#explore-filters",state.filter);drawGallery("#explore-gallery",filtered(getEngines(),state.filter,state.search));
}
function renderProfile(id){
 const c=getCreator(id);if(!c){navigate("explore");return}
 $("#profile-heading").innerHTML='<div class="profile-top"><div class="profile-portrait" style="background:'+c.bg+';color:'+c.color+'">'+esc(c.initials)+'</div><div><button class="profile-back" data-go="discover">← Back to the clubhouse</button><div class="eyebrow" style="margin-top:19px">'+esc(c.field)+' · '+esc(c.home)+'</div><h1>'+esc(c.name)+'</h1><p>'+esc(c.bio)+'</p><div class="profile-badges"><span>✳ '+c.engines+' original engines</span><span>Private artist-built workflows</span><span>100% self-serve</span></div></div></div>';
 drawGallery("#profile-engines",engines.filter(function(e){return e.creator===id}));
}
function renderPicker(){
 const list=getEngines().filter(function(e){return !e.upcoming});$("#engine-picker").innerHTML=list.map(function(e){return '<button type="button" class="'+(e.id===state.engine?"selected":"")+'" data-pick="'+esc(e.id)+'"><div class="mini-swatch"><canvas data-engine-art="'+esc(e.id)+'"></canvas></div><span><b>'+esc(e.name)+'</b><small>'+esc(creatorName(e))+(e.isDraft?" · local draft":"")+'</small></span><span style="margin-left:auto;font-size:16px">›</span></button>'}).join("");renderAllArt($("#engine-picker"));
 const e=getEngine(state.engine);if(e){$("#sample-prompts").innerHTML=(e.examples||[]).map(function(p){return '<button type="button" data-sample="'+esc(p)+'">'+esc(p)+'</button>'}).join("");$("#api-status").textContent=e.isDraft?"This locally drafted engine is not published to the AI server. Try a free style study.":(state.aiReady?"Live AI server connected. AI generation requires the site owner's access code.":"AI backend is not configured. Free local style studies work now.");}
}
function navigate(page,id){
 if(page==="profile"){if(id)state.profile=id;if(!state.profile){page="discover"}else renderProfile(state.profile)}
 if(page==="portal"){if(id&&getEngine(id)&&!getEngine(id).upcoming)state.engine=id;renderPicker()}
 if(page==="discover")renderHome();if(page==="explore")renderExplore();if(page==="workshop")renderDrafts();if(page==="economics")renderEconomics();
 $$(".page").forEach(function(x){x.classList.toggle("active",x.dataset.page===page)});$$("[data-route]").forEach(function(x){x.classList.toggle("active",x.dataset.route===page)});
 state.page=page;const hash="#"+page+(page==="portal"?"/"+state.engine:page==="profile"?"/"+(state.profile||""):"");if(location.hash!==hash)location.hash=hash;window.scrollTo({top:0,behavior:"auto"});
}
function updateCredits(){$("#credit-pill").innerHTML='<i class="dot"></i>'+credits+' demo credits'}
function selectedTab(group,key,value){$$("[data-"+key+"]").forEach(function(b){if(b.closest(group))b.classList.toggle("selected",b.dataset[key]===value)})}
function imageFromData(data){return new Promise(function(resolve,reject){const img=new Image();img.onload=function(){resolve(img)};img.onerror=reject;img.src=data})}
function setCanvasAspect(canvas,aspect){const dims={square:[960,960],portrait:[900,1200],landscape:[1200,900]};const d=dims[aspect]||dims.square;canvas.width=d[0];canvas.height=d[1]}
function snapshotCanvas(canvas){const small=document.createElement("canvas");small.width=310;small.height=310;const x=small.getContext("2d");const ratio=Math.max(310/canvas.width,310/canvas.height),sw=canvas.width*ratio,sh=canvas.height*ratio;x.drawImage(canvas,(310-sw)/2,(310-sh)/2,sw,sh);return small.toDataURL("image/jpeg",.68)}
function recordHistory(mode,data){
 const e=getEngine(state.engine),title=e?e.name:"Artwork";
 const item={id:Date.now()+"-"+Math.round(Math.random()*999),engine:state.engine,title:title,mode:mode,prompt:$("#user-prompt").value.trim().slice(0,120),image:data,when:new Date().toLocaleDateString(),saved:false};
 history.unshift(item);history=history.slice(0,9);save("history",history);renderHistory();
}
function showOutput(mode,image){
 $("#result-empty").style.display="none";$("#result-canvas").style.display=mode==="study"?"block":"none";$("#result-image").style.display=mode==="ai"?"block":"none";
 if(mode==="ai")$("#result-image").src=image;
 $("#result-heading").textContent=mode==="ai"?"Look what you made.":"A first look at the feeling.";
 $("#result-tag").textContent=mode==="ai"?"AI generated":"Procedural style study";
 $("#result-note").textContent=mode==="ai"?"Created with AI using a server-side private creator recipe. The artist is not contacted.":"This procedural preview is NOT an AI image. It visualizes an engine's aesthetic direction while the live AI service is unconfigured.";
 $("#download-btn").disabled=false;$("#variation-btn").disabled=false;$("#save-btn").disabled=false;$("#save-btn").textContent="♡ Save to collection";state.savedCurrent=false;state.lastMode=mode;
}
async function createStudy(){
 const e=getEngine(state.engine);if(!e||e.upcoming){toast("Select an available visual engine first.");return}
 const canvas=$("#result-canvas");setCanvasAspect(canvas,state.aspect);
 let photo=null;if(state.photo){try{photo=await imageFromData(state.photo)}catch(err){toast("Sorry, that reference image could not be loaded.");return}}
 state.seed++;renderArt(canvas,e,($("#user-prompt").value||"An imaginary world")+"-"+state.seed+"-"+state.influence,photo);showOutput("study");
 recordHistory("style study",snapshotCanvas(canvas));toast("Style study created. Try the same idea with another engine.");
}
function renderHistory(){
 const target=$("#history-grid");if(!history.length){target.innerHTML='<p class="muted">Your experiments will appear here after you make something.</p>';return}
 target.innerHTML=history.map(function(x){return '<div class="history-card"><img src="'+x.image+'" alt="'+esc(x.title)+' creation"><strong style="font-size:12px;display:block;margin-top:8px">'+esc(x.title)+'</strong><p>'+esc(x.mode)+' · '+esc(x.when)+'</p></div>'}).join("");
}
function download(){
 const name="musehouse-"+state.engine+"-"+Date.now()+".png";const a=document.createElement("a");a.download=name;
 if(state.lastMode==="ai"){a.href=$("#result-image").src}else{a.href=$("#result-canvas").toDataURL("image/png")}
 document.body.appendChild(a);a.click();a.remove();
}
function saveCurrent(){
 if(state.savedCurrent)return;
 let data=state.lastMode==="ai"?$("#result-image").src:snapshotCanvas($("#result-canvas"));
 if(state.lastMode==="ai"){const canvas=document.createElement("canvas");const img=$("#result-image");canvas.width=310;canvas.height=310;canvas.getContext("2d").drawImage(img,0,0,310,310);data=canvas.toDataURL("image/jpeg",.7)}
 recordHistory("saved "+state.lastMode,data);state.savedCurrent=true;$("#save-btn").textContent="♥ Saved";toast("Saved to your local collection.");
}
function renderDrafts(){
 const c=$("#draft-list");c.innerHTML=drafts.length?drafts.map(function(d){return '<div class="draft-item"><div><strong>'+esc(d.name)+'</strong><small>'+esc(d.artist)+' · '+esc(d.medium)+' · locally stored</small></div><div style="display:flex;gap:7px"><button class="button pale small" data-engine="'+esc(d.id)+'" '+(d.medium==="Music"?"disabled":"")+'>Test</button><button class="button pale small" data-delete-draft="'+esc(d.id)+'">×</button></div></div>'}).join(""):'<p class="muted">Your first locally drafted engine will appear here.</p>';
}
function renderEconomics(){
 const sample=[{n:"Sol Rivera",v:16,c:"#e58b62"},{n:"Lena Voss",v:12,c:"#8ab1cd"},{n:"Nori Imai",v:8,c:"#a0be88"},{n:"Theo Marlowe",v:4,c:"#b29bda"}];const total=sample.reduce(function(a,b){return a+b.v},0);
 $("#royalty-chart").innerHTML=sample.map(function(s){return '<div class="bar-row"><span>'+s.n+'</span><div class="bar"><div class="fill" style="width:'+s.v/total*100+'%;background:'+s.c+'"></div></div><span>$'+(7.2*s.v/total).toFixed(2)+'</span></div>'}).join("");
 const totalUses=usage.length;const counts={};usage.forEach(function(u){counts[u.engine]=(counts[u.engine]||0)+1});
 $("#usage-ledger").innerHTML='<div class="credit-line"><span>Demo completed AI generations</span><strong>'+totalUses+'</strong></div><div class="credit-line"><span>Remaining demo credits</span><strong>'+credits+'</strong></div>'+Object.keys(counts).map(function(k){const e=getEngine(k);return '<div class="credit-line"><span>'+esc(e?creatorName(e)+" · "+e.name:k)+'</span><strong>'+counts[k]+' use'+(counts[k]===1?"":"s")+'</strong></div>'}).join("");
}
async function probeAPI(){
 if(location.protocol==="file:"){state.aiReady=false;$("#api-status").textContent="Running as a local file. Style studies work offline; deploy to activate server AI.";return}
 try{const r=await fetch("/api/status",{cache:"no-store"});if(!r.ok)throw Error("Unavailable");const v=await r.json();state.aiReady=!!v.aiConfigured;$("#api-status").textContent=state.aiReady?"Live AI server connected. Site-owner access code required.":"Live AI not configured yet. The free style-study portal is ready."; }
 catch(_){state.aiReady=false;$("#api-status").textContent="Live AI is not connected yet. Free style studies are available."}
}
async function generateAI(){
 const e=getEngine(state.engine);if(!e||e.isDraft||e.upcoming){toast("Only published image engines can use the server AI.");return}
 if(!state.aiReady){toast("The live AI server needs its API key configured. Free style studies already work.");return}
 if(credits<=0){toast("This demo credit wallet is empty. No actual billing is available.");return}
 let access=$("#access-code").value.trim(),prompt=$("#user-prompt").value.trim();if(!access){toast("Enter the site's prototype access code.");return}
 if(!prompt){prompt="An expressive, original piece of visual art";$("#user-prompt").value=prompt}
 if(state.photo&&state.photo.length>1800000){toast("Reference image too large. Please choose a smaller image.");return}
 $("#run-ai").disabled=true;$("#run-ai").textContent="Creating with AI…";
 try{
  const resp=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json","x-prototype-code":access},body:JSON.stringify({engineId:e.id,prompt:prompt,aspect:state.aspect,influence:state.influence,imageDataUrl:state.photo||null})});
  const data=await resp.json();if(!resp.ok)throw Error(data.error||"Image service unavailable");
  if(!data.imageDataUrl)throw Error("The generator returned no image.");
  const img=await imageFromData(data.imageDataUrl);$("#result-image").src=img.src;showOutput("ai",img.src);
  const thumb=document.createElement("canvas");thumb.width=310;thumb.height=310;thumb.getContext("2d").drawImage(img,0,0,310,310);recordHistory("AI image",thumb.toDataURL("image/jpeg",.7));
  usage.push({engine:e.id,at:Date.now()});save("usage",usage);credits--;save("credits",credits);updateCredits();
  $("#access-modal").classList.remove("visible");$("#access-code").value="";state.accessCode=access;toast("AI artwork generated. Artist usage recorded in this browser.");
 }catch(err){toast(err.message||"Generation failed");}
 finally{$("#run-ai").disabled=false;$("#run-ai").textContent="Generate AI image · 1 demo credit"}
}
function saveDraft(){
 const artist=$("#draft-artist").value.trim(),name=$("#draft-name").value.trim(),workflow=$("#draft-workflow").value.trim(),restrictions=$("#draft-restrictions").value.trim(),medium=$("#draft-medium").value;
 if(!artist||!name||!workflow){toast("Add an artist name, engine name and a description of their creative decisions.");return}
 const d={id:"draft-"+Date.now(),artist:artist,name:name,workflow:workflow,restrictions:restrictions,medium:medium};
 drafts.unshift(d);save("drafts",drafts);renderDrafts();toast("Saved locally—not published, and not uploaded to any server.");
 ["#draft-name","#draft-workflow","#draft-restrictions"].forEach(function(id){$(id).value=""});
}
function onClick(event){
 let t=event.target.closest("[data-go],[data-route],[data-engine],[data-artist],[data-filter],[data-heart],[data-pick],[data-sample],[data-delete-draft]");
 if(!t)return;
 if(t.dataset.go)navigate(t.dataset.go);
 if(t.dataset.route)navigate(t.dataset.route);
 if(t.dataset.engine){if(getEngine(t.dataset.engine)?.upcoming)return;state.engine=t.dataset.engine;navigate("portal")}
 if(t.dataset.artist){if(getCreator(t.dataset.artist))navigate("profile",t.dataset.artist);else toast("This artist is a private local draft, not a published profile yet.")}
 if(t.dataset.pick){state.engine=t.dataset.pick;renderPicker()}
 if(t.dataset.sample){$("#user-prompt").value=t.dataset.sample}
 if(t.dataset.filter){state.filter=t.dataset.filter;if(state.page==="discover")renderHome();else renderExplore()}
 if(t.dataset.heart){const id=t.dataset.heart;favorites=favorites.includes(id)?favorites.filter(function(x){return x!==id}):favorites.concat([id]);save("favorites",favorites);if(state.page==="discover")renderHome();else if(state.page==="profile")renderProfile(state.profile);else renderExplore()}
 if(t.dataset.deleteDraft){drafts=drafts.filter(function(d){return d.id!==t.dataset.deleteDraft});save("drafts",drafts);renderDrafts();toast("Local draft removed.");}
}
function init(){
 document.addEventListener("click",onClick);$("#my-studio").addEventListener("click",function(){navigate("portal")});$("#browse-engines").addEventListener("click",function(){navigate("explore")});
 $("#engine-search").addEventListener("input",function(){state.search=this.value;renderExplore()});
 $$("#aspect-options button").forEach(function(b){b.addEventListener("click",function(){state.aspect=b.dataset.aspect;selectedTab("#aspect-options","aspect",state.aspect)})});
 $$("#influence-options button").forEach(function(b){b.addEventListener("click",function(){state.influence=b.dataset.influence;selectedTab("#influence-options","influence",state.influence)})});
 $("#study-btn").addEventListener("click",createStudy);$("#ai-btn").addEventListener("click",function(){if(!state.aiReady){toast("Live AI needs to be configured on the server. Try a free style study.");return}$("#access-modal").classList.add("visible")});
 $("#close-modal").addEventListener("click",function(){$("#access-modal").classList.remove("visible")});$("#access-modal").addEventListener("click",function(ev){if(ev.target===this)this.classList.remove("visible")});
 $("#run-ai").addEventListener("click",generateAI);$("#download-btn").addEventListener("click",download);
 $("#variation-btn").addEventListener("click",function(){if(state.lastMode==="ai"){if(!state.aiReady){toast("Live AI generation unavailable");return}$("#access-modal").classList.add("visible")}else createStudy()});
 $("#save-btn").addEventListener("click",saveCurrent);$("#save-draft").addEventListener("click",saveDraft);
 $("#clear-history").addEventListener("click",function(){history=[];save("history",[]);renderHistory();toast("Local history cleared.")});
 $("#photo-input").addEventListener("change",async function(){const file=this.files&&this.files[0];if(!file)return;if(file.size>8*1024*1024){toast("Choose an image under 8 MB.");this.value="";return}try{const data=await new Promise(function(resolve,reject){const fr=new FileReader();fr.onload=function(){resolve(fr.result)};fr.onerror=reject;fr.readAsDataURL(file)});const image=await imageFromData(data),resize=document.createElement("canvas");const ratio=Math.min(1,1150/Math.max(image.width,image.height));resize.width=Math.max(1,Math.round(image.width*ratio));resize.height=Math.max(1,Math.round(image.height*ratio));resize.getContext("2d").drawImage(image,0,0,resize.width,resize.height);state.photo=resize.toDataURL("image/jpeg",.75);$("#upload-preview").innerHTML='<img src="'+state.photo+'" alt="Your uploaded reference photo">';$("#photo-placeholder").style.display="none";$("#remove-photo").style.display="inline";toast("Reference photo loaded. You can now create a style study or request an AI edit.")}catch(_){toast("Could not open that image.")}});
 $("#remove-photo").addEventListener("click",function(){state.photo=null;$("#upload-preview").innerHTML="";$("#photo-placeholder").style.display="block";$("#remove-photo").style.display="none";$("#photo-input").value=""});
 updateCredits();renderHome();renderHistory();renderDrafts();renderEconomics();renderPicker();probeAPI();
 let hash=location.hash.slice(1).split("/");if(["discover","explore","workshop","economics"].includes(hash[0]))navigate(hash[0]);else if(hash[0]==="portal")navigate("portal",hash[1]);else if(hash[0]==="profile"&&getCreator(hash[1]))navigate("profile",hash[1]);else navigate("discover");
 window.addEventListener("hashchange",function(){const h=location.hash.slice(1).split("/");if(h[0]==="profile"&&getCreator(h[1])&&!(state.page==="profile"&&state.profile===h[1]))navigate("profile",h[1]);else if(h[0]==="portal"&&getEngine(h[1])&&!(state.page==="portal"&&state.engine===h[1]))navigate("portal",h[1]);else if(["discover","explore","workshop","economics"].includes(h[0])&&state.page!==h[0])navigate(h[0])});
}
document.addEventListener("DOMContentLoaded",init);
})();
