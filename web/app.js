import {TYPES,object,template,validate,render,backgroundPage,pageAt} from './engine.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let project=template('Sine, from a circle'),selected=project.objects[0].id,time=0,playing=false,last=0,exporting=false;
try{const saved=localStorage.getItem('mathmotion');if(saved)project=validate(JSON.parse(saved));selected=project.objects[0]?.id;}catch{}
const status=message=>$('status').textContent=message;
function persist(){try{localStorage.setItem('mathmotion',JSON.stringify(project));}catch{status('Browser storage is unavailable. Use Save project to keep your work.');}}
function draw(){render(ctx,project,time);syncPage();$('scrub').value=time;$('time').textContent=`${time.toFixed(1)} / ${project.duration.toFixed(1)} s`;}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
const filename=()=>project.title.replace(/[^a-z0-9_-]/gi,'-')||'mathmotion';
function refresh(inspector=true){$('title').value=project.title;$('duration').value=project.duration;$('scrub').max=project.duration;$('count').textContent=project.objects.length;$('objects').replaceChildren();$('tracks').replaceChildren();
 for(const o of project.objects){const b=document.createElement('button');b.className=o.id===selected?'selected':'';const dot=document.createElement('span');dot.className='swatch';dot.style.background=o.color;b.append(dot,document.createTextNode(o.label||o.type));b.onclick=()=>{selected=o.id;refresh()};$('objects').append(b);const track=document.createElement('div'),bar=document.createElement('span');track.className='track';bar.style.left=`${Math.min(100,o.start/project.duration*100)}%`;bar.style.width=`${Math.max(0,Math.min(o.end,project.duration)-o.start)/project.duration*100}%`;bar.style.borderColor=o.color;bar.textContent=o.label;track.append(bar);$('tracks').append(track);}
 if(inspector)properties();persist();draw();}
function properties(){const o=project.objects.find(x=>x.id===selected);$('properties').replaceChildren();$('selected-name').textContent=o?o.type[0].toUpperCase()+o.type.slice(1):'Add an object';$('duplicate').disabled=$('delete').disabled=!o;if(!o)return;
 const fields=[['label','Label / text','text'],['color','Color','color'],['size','Size','number'],['x','Start X','number'],['y','Start Y','number'],['toX','End X','number'],['toY','End Y','number'],['start','Appears at (s)','number'],['draw','Draw time (s)','number'],['end','Ends at (s)','number'],['stroke','Line width','number'],['opacity','Opacity (0–1)','number'],['rotation','Rotation (°)','number'],['fadeOut','Fade out (s)','number'],['easing','Movement easing','select']];
 if(o.type==='text')fields.push(['font','Typeface','select'],['italic','Italic text','checkbox']);
 if(['curve','area'].includes(o.type))fields.push(['rangeMin','Graph X min','number'],['rangeMax','Graph X max','number']);
 if(['area','rings'].includes(o.type))fields.push(['gradient','Color gradient','checkbox'],['endColor','End color','color'],['fillOpacity','Fill opacity','number']);
 if(['area','rings'].includes(o.type))fields.push(['bars',o.type==='rings'?'Ring count':'Rectangles','number']);
 if(o.type==='curve'||o.type==='area')fields.push(['curve','Function','select']);
 for(const [key,title,type] of fields){const label=document.createElement('label');label.textContent=title;if(key==='label'||key==='curve')label.className='wide';const input=document.createElement(type==='select'?'select':key==='label'?'textarea':'input');if(type==='select'){for(const name of (key==='font'?['serif','sans','mono']:key==='easing'?['smooth','linear','ease-in']:['sine','cosine','parabola','cubic'])){const option=document.createElement('option');option.value=name;option.textContent=name;input.append(option)}}else input.type=type;input.value=o[key];if(type==='checkbox')input.checked=o[key];input.name=key;if(type==='text')input.maxLength=300;if(type==='number'){input.step='.1';input.min=['size','draw'].includes(key)?'.1':['start','end'].includes(key)?'0':'-100';input.max=key==='size'?'10':['start','draw','end'].includes(key)?'120':'100';}
 if(type==='number'&&['stroke','opacity','rotation','fadeOut','bars','rangeMin','rangeMax','fillOpacity'].includes(key)){const limits={stroke:[.5,20,.5],opacity:[0,1,.05],rotation:[-360,360,1],fadeOut:[0,120,.1],bars:[2,100,1],rangeMin:[-20,20,.1],rangeMax:[-20,20,.1],fillOpacity:[0,1,.05]}[key];[input.min,input.max,input.step]=limits;}
 input.onchange=()=>{const previous=o[key];o[key]=type==='checkbox'?input.checked:type==='number'?Number(input.value):input.value;try{validate(project);refresh(false);}catch(e){o[key]=previous;input.value=previous;status(e.message);}};label.append(input);$('properties').append(label);}}
for(const name of ['Sine, from a circle','Vectors in motion','The shape of a function','Area under a curve','A circle made of rings']){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{if(!confirm('Replace this scene? Save your project first if you want to keep it.'))return;playing=false;project=template(name);selected=project.objects[0].id;time=0;$('play').textContent='▶ Play';refresh()};$('templates').append(b);}
for(const type of TYPES){const b=document.createElement('button');b.textContent='+ '+type;b.onclick=()=>{if(project.objects.length>=100)return status('Maximum 100 objects.');const o=object(type,{end:project.duration});project.objects.push(o);selected=o.id;refresh()};$('tools').append(b);}
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
 $('page').value=active.id;
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

function tick(now){if(playing&&!exporting){time=Math.min(project.duration,time+(now-last)/1000);if(time>=project.duration){playing=false;$('play').textContent='▶ Play'}draw()}last=now;requestAnimationFrame(tick)}refresh();requestAnimationFrame(tick);
