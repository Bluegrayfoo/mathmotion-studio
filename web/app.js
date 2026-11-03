import {TYPES,object,template,validate,render,backgroundPage,pageAt,sample} from './engine.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let project=template('Sine, from a circle'),selected=project.objects[0].id,time=0,playing=false,last=0,exporting=false;
try{const saved=localStorage.getItem('mathmotion');if(saved)project=validate(JSON.parse(saved));selected=project.objects[0]?.id;}catch{}
let history=[],future=[],historyState=JSON.stringify(project),restoring=false,inspectorTab='format';
const overlay=$('overlay'),oc=overlay.getContext('2d');
const status=message=>$('status').textContent=message;
function persist(){const next=JSON.stringify(project);if(!restoring&&next!==historyState){history.push(historyState);if(history.length>60)history.shift();future=[];historyState=next;} $('undo').disabled=!history.length;$('redo').disabled=!future.length;try{localStorage.setItem('mathmotion',JSON.stringify(project));}catch{status('Browser storage is unavailable. Use Save project to keep your work.');}}
function draw(){render(ctx,project,time);drawSelection();syncPage();$('scrub').value=time;$('time').textContent=`${time.toFixed(1)} / ${project.duration.toFixed(1)} s`;}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
const filename=()=>project.title.replace(/[^a-z0-9_-]/gi,'-')||'mathmotion';
function refresh(inspector=true){$('title').value=project.title;$('duration').value=project.duration;$('scrub').max=project.duration;$('count').textContent=project.objects.length;$('objects').replaceChildren();$('tracks').replaceChildren();
 for(const o of project.objects){const b=document.createElement('button');b.className=o.id===selected?'selected':'';const dot=document.createElement('span');dot.className='swatch';dot.style.background=o.color;b.append(dot,document.createTextNode(o.label||o.type));b.onclick=()=>{selectObject(o)};$('objects').append(b);const track=document.createElement('div'),bar=document.createElement('span');track.className='track';bar.style.left=`${Math.min(100,o.start/project.duration*100)}%`;bar.style.width=`${Math.max(0,Math.min(o.end,project.duration)-o.start)/project.duration*100}%`;bar.style.borderColor=o.color;bar.textContent=o.label;track.append(bar);$('tracks').append(track);}
 if(inspector)properties();persist();draw();renderSlides();}
function properties(){const o=project.objects.find(x=>x.id===selected);$('properties').replaceChildren();$('selected-name').textContent=o?o.type[0].toUpperCase()+o.type.slice(1):'Add an object';$('duplicate').disabled=$('delete').disabled=!o;if(!o)return;
 const fields=[['label','Label / text','text'],['color','Color','color'],['size','Size','number'],['x','Start X','number'],['y','Start Y','number'],['toX','End X','number'],['toY','End Y','number'],['start','Appears at (s)','number'],['draw','Draw time (s)','number'],['end','Ends at (s)','number'],['stroke','Line width','number'],['opacity','Opacity (0–1)','number'],['rotation','Rotation (°)','number'],['fadeOut','Fade out (s)','number'],['easing','Movement easing','select']];
 if(o.type==='pi')fields.push(['expression','Expression','select'],['gazeX','Look X (−1 to 1)','number'],['gazeY','Look Y (−1 to 1)','number'],['blink','Auto blink','checkbox'],['bubble','Speech bubble','text']);
 if(o.type==='text')fields.push(['font','Typeface','select'],['italic','Italic text','checkbox']);
 if(['curve','area'].includes(o.type))fields.push(['rangeMin','Graph X min','number'],['rangeMax','Graph X max','number']);
 if(['area','rings'].includes(o.type))fields.push(['gradient','Color gradient','checkbox'],['endColor','End color','color'],['fillOpacity','Fill opacity','number']);
 if(['area','rings'].includes(o.type))fields.push(['bars',o.type==='rings'?'Ring count':'Rectangles','number']);
 if(o.type==='curve'||o.type==='area')fields.push(['curve','Function','select']);
 for(const [key,title,type] of fields){const animation=['start','draw','end','fadeOut','easing'];const arrange=['x','y','toX','toY','size','rotation'];if(inspectorTab==='animate'?!animation.includes(key):inspectorTab==='arrange'?!arrange.includes(key):animation.includes(key)||arrange.includes(key))continue;const label=document.createElement('label');label.textContent=title;if(key==='label'||key==='curve'||key==='bubble')label.className='wide';const input=document.createElement(type==='select'?'select':['label','bubble'].includes(key)?'textarea':'input');if(type==='select'){for(const name of (key==='expression'?['happy','thinking','surprised','sad','talking']:key==='font'?['serif','sans','mono']:key==='easing'?['smooth','linear','ease-in']:['sine','cosine','parabola','cubic'])){const option=document.createElement('option');option.value=name;option.textContent=name;input.append(option)}}else if(input.tagName==='INPUT')input.type=type;input.value=o[key];if(type==='checkbox')input.checked=o[key];input.name=key;if(type==='text')input.maxLength=key==='bubble'?120:300;if(type==='number'){input.step='.1';input.min=['size','draw'].includes(key)?'.1':['start','end'].includes(key)?'0':'-100';input.max=key==='size'?'10':['start','draw','end'].includes(key)?'120':'100';}
 if(type==='number'&&['stroke','opacity','rotation','fadeOut','bars','rangeMin','rangeMax','fillOpacity','gazeX','gazeY'].includes(key)){const limits={stroke:[.5,20,.5],opacity:[0,1,.05],rotation:[-360,360,1],fadeOut:[0,120,.1],bars:[2,100,1],rangeMin:[-20,20,.1],rangeMax:[-20,20,.1],fillOpacity:[0,1,.05],gazeX:[-1,1,.1],gazeY:[-1,1,.1]}[key];[input.min,input.max,input.step]=limits;}
 input.onchange=()=>{const previous=o[key];o[key]=type==='checkbox'?input.checked:type==='number'?Number(input.value):input.value;try{validate(project);refresh(false);}catch(e){o[key]=previous;input.value=previous;status(e.message);}};label.append(input);$('properties').append(label);}}
for(const name of ['Sine, from a circle','Vectors in motion','The shape of a function','Area under a curve','A circle made of rings','Meet your pi presenter']){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(!confirm('Replace this scene? Save your project first if you want to keep it.'))return;playing=false;project=template(name);selected=project.objects[0].id;time=0;$('play').textContent='▶ Play';refresh()};$('templates').append(b);}
for(const type of TYPES){const b=document.createElement('button');b.className='part';b.dataset.search=type;const icon=document.createElement('span');icon.textContent=({text:'T',circle:'○',vector:'↗',curve:'∿',rectangle:'▭',area:'▥',rings:'◎',pi:'π'})[type];const caption=document.createElement('small');caption.textContent=type==='pi'?'Pi presenter':type;b.append(icon,caption);b.onclick=()=>{if(project.objects.length>=100)return status('Maximum 100 objects.');const o=object(type,{start:Math.min(time,project.duration-.2),draw:.5,end:project.duration});time=Math.min(project.duration,o.start+.5);project.objects.push(o);selected=o.id;refresh()};$('tools').append(b);}
$('title').onchange=()=>{project.title=$('title').value;persist()};$('duration').onchange=()=>{const d=Number($('duration').value);if(d<1||d>120||!Number.isFinite(d))return refresh();if(project.pages.some(page=>page.start>=d)){status('Move or delete pages starting after the new duration first.');return refresh();}project.duration=d;time=Math.min(time,d);refresh()};
$('play').onclick=()=>{if(time>=project.duration)time=0;playing=!playing;$('play').textContent=playing?'Ⅱ Pause':'▶ Play'};$('restart').onclick=()=>{time=0;draw()};$('scrub').oninput=()=>{time=Number($('scrub').value);draw()};
$('delete').onclick=()=>{project.objects=project.objects.filter(o=>o.id!==selected);selected=project.objects[0]?.id;refresh()};$('duplicate').onclick=()=>{const o=project.objects.find(o=>o.id===selected);if(!o||project.objects.length>=100)return;const copy={...o,id:crypto.randomUUID(),label:o.label+' copy'};project.objects.push(copy);selected=copy.id;refresh()};
$('save').onclick=()=>download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),filename()+'.json');$('open').onclick=()=>$('file').click();$('file').onchange=async()=>{try{const file=$('file').files[0];if(!file)return;if(file.size>1e6)throw Error('Project files must be under 1 MB.');const next=validate(JSON.parse(await file.text()));project=next;selected=project.objects[0]?.id;time=0;playing=false;$('play').textContent='▶ Play';refresh();status('Project opened.');}catch(e){status(e.message)}finally{$('file').value=''}};
$('export').onclick=async()=>{
 if(!window.MediaRecorder||!canvas.captureStream)return status('Video export is unavailable in this browser. Try a current Chrome or Edge.');
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime)return status('No supported video format. Try Chrome or Edge.');
 playing=false;exporting=true;const previous=time;const controls=[...document.querySelectorAll('button,input,select,textarea')];const disabled=controls.map(e=>e.disabled);controls.forEach(e=>e.disabled=true);let stream;
 try{time=0;draw();stream=canvas.captureStream(30);const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000}),chunks=[];const done=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||Error('Recording failed'));});recorder.start();status('Recording video… keep this tab visible until the download starts.');const start=performance.now();await new Promise(resolve=>{function frame(now){time=Math.min((now-start)/1000,project.duration);draw();if(time<project.duration)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});recorder.stop();await done;download(new Blob(chunks,{type:mime}),filename()+(mime.startsWith('video/mp4')?'.mp4':'.webm'));status('Video exported at 1080p. Save your project to edit it later.');}catch(e){status('Export failed: '+e.message);}finally{stream?.getTracks().forEach(t=>t.stop());exporting=false;time=previous;controls.forEach((e,i)=>e.disabled=disabled[i]);$('play').textContent='▶ Play';syncPage(true);draw();}
};

let shownPage='';
function syncPage(force=false){
 const active=pageAt(project,time);
 if(!force&&shownPage===active.id)return;
 shownPage=active.id;
 $('page').replaceChildren(...project.pages.map(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=`${p.name} · ${p.start}s`;return option;}));
 $('page').value=active.id;$('page-heading').textContent=active.name;document.querySelectorAll('.slide').forEach(b=>b.classList.toggle('active',b.dataset.id===active.id));
 $('page-name').value=active.name;$('page-start').value=active.start;
 $('page-start').disabled=exporting||active===project.pages[0];
 $('delete-page').disabled=exporting||project.pages.length===1;
 $('background').value=active.color;$('grid').checked=active.grid;
 $('axes').checked=active.axes??active.grid;
 $('ticks').checked=active.ticks??false;$('origin-x').value=active.originX??0;$('origin-y').value=active.originY??0;
 $('grid-color').value=active.gridColor;$('axis-color').value=active.axisColor;
}
$('math-style').onclick=()=>{Object.assign(pageAt(project,time),{color:'#000000',grid:false,axes:true,gridColor:'#222222',axisColor:'#888888'});syncPage(true);refresh(false);status('Math style applied to this page. Object colors remain editable in the inspector.');};
$('page').onchange=()=>{playing=false;$('play').textContent='▶ Play';time=project.pages.find(p=>p.id===$('page').value).start;draw();};
$('add-page').onclick=()=>{
 const start=Math.round(time*10)/10;
 if(project.pages.length>=100||start>=project.duration||project.pages.some(p=>Math.abs(p.start-start)<.001))return status('Scrub to an unused time before the end of the video to add a page.');
 project.pages.push(backgroundPage({...pageAt(project,time),id:crypto.randomUUID(),name:`Page ${project.pages.length+1}`,start}));
 project.pages.sort((a,b)=>a.start-b.start);time=start;syncPage(true);refresh(false);
};
$('delete-page').onclick=()=>{
 if(project.pages.length===1)return;
 const active=pageAt(project,time);project.pages=project.pages.filter(p=>p.id!==active.id);project.pages[0].start=0;syncPage(true);refresh(false);
};
for(const [id,key] of [['page-name','name'],['page-start','start'],['background','color'],['grid','grid'],['axes','axes'],['ticks','ticks'],['origin-x','originX'],['origin-y','originY'],['grid-color','gridColor'],['axis-color','axisColor']]){
 $(id).onchange=()=>{
  const active=pageAt(project,time),previous=active[key];
  active[key]=['grid','axes','ticks'].includes(key)?$(id).checked:['start','originX','originY'].includes(key)?Number($(id).value):$(id).value;
  try{validate(project);if(key==='start')time=active.start;persist();draw();}
  catch(e){active[key]=previous;status(e.message);}
  syncPage(true);
 };
}


function selectedObject(){return project.objects.find(o=>o.id===selected)}
function stop(){playing=false;$('play').textContent='▶ Play'}
function selectObject(o){stop();selected=o.id;time=Math.min(o.end-.001,Math.max(time,o.start+o.draw));refresh()}
function bounds(o){const pose=sample(o,time),r=o.size;let w=r,h=r;
 if(o.type==='text'){w=Math.max(...o.label.split('\n').map(l=>l.length))*.2*r;h=.8*r*o.label.split('\n').length;}
 if(['curve','area'].includes(o.type)){w=Math.max(Math.abs(o.rangeMin),Math.abs(o.rangeMax))*r;h=3*r;}
 return {x:pose.x,y:pose.y,w:Math.max(.3,w),h:Math.max(.3,h)};
}
function drawSelection(){oc.clearRect(0,0,1920,1080);if(exporting)return;const o=selectedObject();if(!o||!sample(o,time).visible)return;const b=bounds(o),x=960+(b.x-b.w)*120,y=540-(b.y+b.h)*120,w=b.w*240,h=b.h*240;oc.strokeStyle='#168bff';oc.lineWidth=3;oc.setLineDash([8,5]);oc.strokeRect(x,y,w,h);oc.setLineDash([]);oc.fillStyle='white';oc.fillRect(x+w-8,y+h-8,16,16);oc.strokeRect(x+w-8,y+h-8,16,16);}
function renderSlides(){const active=pageAt(project,time);$('slides').replaceChildren();for(const [i,page] of project.pages.entries()){const b=document.createElement('button'),thumb=document.createElement('canvas'),label=document.createElement('span');b.className='slide'+(page.id===active.id?' active':'');b.dataset.id=page.id;thumb.width=320;thumb.height=180;const end=project.pages[i+1]?.start??project.duration;render(thumb.getContext('2d'),project,Math.min(end-.001,page.start+2));label.textContent=`${i+1}  ${page.name}`;b.append(thumb,label);b.onclick=()=>{stop();time=page.start;shownPage='';refresh()};$('slides').append(b);}}
function setTab(tab){inspectorTab=tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===tab)));$('object-panel').hidden=tab==='page';$('page-panel').hidden=tab!=='page';$('palette').hidden=tab!=='format';$('animation-presets').hidden=tab!=='animate';$('arrange-controls').hidden=tab!=='arrange';properties();}
for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>setTab(b.dataset.tab);
for(const color of ['#ffffff','#58c4dd','#83c167','#ffff00','#fc6255','#c55fdd','#ffad55','#888888']){const b=document.createElement('button');b.style.background=color;b.title=color;b.setAttribute('aria-label','Set color '+color);b.onclick=()=>{const o=selectedObject();if(o){o.color=color;refresh()}};$('palette').append(b);}
function library(open){$('library').hidden=!open;$('toggle-library').setAttribute('aria-expanded',String(open));if(open)$('library-search').focus()}
$('toggle-library').onclick=()=>library($('library').hidden);$('close-library').onclick=()=>library(false);
$('library-search').oninput=()=>{const q=$('library-search').value.toLowerCase();for(const b of [...$('tools').children,...$('templates').children])b.hidden=!(b.dataset.search||b.textContent).toLowerCase().includes(q)};
$('add-text').onclick=()=>[...$('tools').children].find(b=>b.dataset.search==='text').click();
$('toggle-tracks').onclick=()=>{const hidden=!$('tracks').hidden;$('tracks').hidden=hidden;$('toggle-tracks').textContent=hidden?'Show tracks':'Hide tracks';$('toggle-tracks').setAttribute('aria-expanded',String(!hidden))};
function restore(value){stop();restoring=true;project=validate(JSON.parse(value));historyState=JSON.stringify(project);selected=project.objects[0]?.id;time=Math.min(time,project.duration);shownPage='';refresh();restoring=false;}
$('undo').onclick=()=>{if(history.length){future.push(historyState);restore(history.pop())}};$('redo').onclick=()=>{if(future.length){history.push(historyState);restore(future.pop())}};
for(const b of document.querySelectorAll('[data-animation]'))b.onclick=()=>{const o=selectedObject();if(!o)return;const kind=b.dataset.animation;o.entrance=kind==='slide'?'fade':kind;o.draw=kind==='none'?.1:1;o.start=Math.min(time,project.duration-.2);o.end=Math.max(o.end,o.start+.1);if(kind==='slide'){o.toX=o.x;o.toY=o.y;o.x-=2;}time=Math.min(o.end,o.start+o.draw);refresh();};
function move(o,dx,dy,mode=$('position-mode').value){if(mode!=='end'){o.x+=dx;o.y+=dy}if(mode!=='start'){o.toX+=dx;o.toY+=dy}}
for(const axis of ['x','y'])$('center-'+axis).onclick=()=>{const o=selectedObject();if(o){const pose=sample(o,time);move(o,axis==='x'?-pose.x:0,axis==='y'?-pose.y:0);refresh()}};
for(const [id,delta] of [['backward',-1],['forward',1]])$(id).onclick=()=>{const i=project.objects.findIndex(o=>o.id===selected),j=i+delta;if(i>=0&&j>=0&&j<project.objects.length){[project.objects[i],project.objects[j]]=[project.objects[j],project.objects[i]];refresh()}};
$('position-mode').onchange=()=>{const o=selectedObject();if(o){stop();time=$('position-mode').value==='end'?o.end-.001:Math.min(o.end-.001,o.start+o.draw);draw()}};
function point(e){const r=overlay.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*16-8,y:4.5-(e.clientY-r.top)/r.height*9}}
let drag=null;
overlay.onpointerdown=e=>{if(exporting)return;stop();const p=point(e);let o=selectedObject(),resize=false;
 if(o&&sample(o,time).visible){const b=bounds(o);resize=Math.hypot(p.x-b.x-b.w,p.y-b.y+b.h)<.25;}
 if(!resize){o=[...project.objects].reverse().find(o=>{if(!sample(o,time).visible)return false;const b=bounds(o);return Math.abs(p.x-b.x)<=b.w&&Math.abs(p.y-b.y)<=b.h});}
 if(!o){selected=null;refresh();return}selected=o.id;const b=bounds(o);drag={o,original:{...o},p,b,resize};overlay.setPointerCapture(e.pointerId);overlay.focus();refresh();};
overlay.onpointermove=e=>{if(!drag)return;const p=point(e),{o,original,b}=drag;Object.assign(o,original);if(drag.resize){const before=Math.hypot(drag.p.x-b.x,drag.p.y-b.y),after=Math.hypot(p.x-b.x,p.y-b.y);o.size=Math.max(.1,Math.min(10,original.size*after/Math.max(.01,before)));}else{const dx=p.x-drag.p.x,dy=p.y-drag.p.y;move(o,e.shiftKey?Math.round(dx*2)/2:dx,e.shiftKey?Math.round(dy*2)/2:dy);}draw();};
overlay.onpointerup=()=>{if(drag){drag=null;refresh()}};overlay.onpointercancel=()=>{if(drag){Object.assign(drag.o,drag.original);drag=null;refresh()}};
document.addEventListener('keydown',e=>{if(exporting||e.target.matches('input,textarea,select'))return;const mod=e.metaKey||e.ctrlKey;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();return}if(e.key==='Escape'){library(false);return}const o=selectedObject();if(!o)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('delete').click()}const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};if(vectors[e.key]){e.preventDefault();const [x,y]=vectors[e.key],step=e.shiftKey?.5:.05;move(o,x*step,y*step);refresh()}});
setTab('format');
function tick(now){if(playing&&!exporting){time=Math.min(project.duration,time+(now-last)/1000);if(time>=project.duration){playing=false;$('play').textContent='▶ Play'}draw()}last=now;requestAnimationFrame(tick)}refresh();requestAnimationFrame(tick);
