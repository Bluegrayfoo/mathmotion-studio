export const TYPES = ['text','circle','vector','curve','rectangle','area','rings','pi','line','ellipse','triangle','polygon','star','arc','dot'];
export const CURVES = {sine:x=>Math.sin(x),cosine:x=>Math.cos(x),parabola:x=>x*x/4,cubic:x=>x*x*x/12};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const STYLE={stroke:3,opacity:1,rotation:0,font:'serif',easing:'smooth',fadeOut:0,bars:24,rangeMin:-3,rangeMax:3,endColor:'#83c167',gradient:false,fillOpacity:.65,italic:false,scaleX:1,scaleY:1,fill:false,fillColor:'#58c4dd',dash:'solid',sides:6,arcAngle:180,bold:false,align:'center',lineHeight:.8,hidden:false,locked:false,keyframes:[],entrance:'draw',expression:'happy',gazeX:0,gazeY:0,blink:true,bubble:''};
export function object(type, extra={}) { return {id:crypto.randomUUID(),type,label:type==='text'?'A beautiful idea':type,color:'#78dcca',x:0,y:0,toX:0,toY:0,size:1,start:0,draw:1.5,end:12,curve:'sine',...STYLE,keyframes:[],...extra}; }
function baseSample(o,t){const p=clamp((t-o.start)/Math.max(.1,o.draw));const move=clamp((t-o.start-o.draw)/Math.max(.1,o.end-o.start-o.draw));const ease=o.easing==='linear'?move:o.easing==='ease-in'?move*move:move*move*(3-2*move);return {visible:t>=o.start&&t<=o.end,p,x:o.x+(o.toX-o.x)*ease,y:o.y+(o.toY-o.y)*ease};}
export function sample(o,t){
 const pose=baseSample(o,t);
 const frames=o.keyframes??[];
 if(!frames.length)return {...pose,size:o.size,rotation:o.rotation,opacity:o.opacity,color:o.color};
 const first=frames[0],last=frames.at(-1);
 let a=first,b=first;
 if(t>=last.time){a=b=last;}else if(t>first.time){for(let i=1;i<frames.length;i++)if(t<=frames[i].time){a=frames[i-1];b=frames[i];break;}}
 const u=a===b?0:clamp((t-a.time)/(b.time-a.time)),e=o.easing==='linear'?u:u*u*(3-2*u);
 for(const k of ['x','y','size','rotation','opacity'])pose[k]=a[k]+(b[k]-a[k])*e;
 pose.color=mixColor(a.color,b.color,e);return pose;
}
export function keyframe(o,time){const s=sample(o,time);return {time,x:s.x,y:s.y,size:s.size,rotation:s.rotation,opacity:s.opacity,color:s.color};}
export const PAGE_STYLE={originX:0,originY:0,ticks:false};
export function backgroundPage(extra={}) {
 return {id:crypto.randomUUID(),name:'Page 1',start:0,color:'#0b1018',grid:true,gridColor:'#1b2836',axisColor:'#415368',axes:true,...PAGE_STYLE,...extra};
}
// Pages cover consecutive time ranges; a boundary belongs to the new page.
export function pageAt(project,time) {
 return [...project.pages].reverse().find(page=>time>=page.start)||project.pages[0];
}
export function validate(p){
 if(!p||p.version!==1||typeof p.title!=='string'||p.title.length>100||!Number.isFinite(p.duration)||p.duration<1||p.duration>120||!Array.isArray(p.objects)||p.objects.length>100)throw Error('Invalid project: expected a MathMotion v1 project (1–120 seconds, up to 100 objects).');
 const objects=p.objects.map(o=>({...STYLE,...o}));
 const ids=new Set();
 for(const o of objects){if(!o||!TYPES.includes(o.type)||typeof o.id!=='string'||ids.has(o.id)||typeof o.label!=='string'||o.label.length>300||!/^#[0-9a-f]{6}$/i.test(o.color)||!Object.hasOwn(CURVES,o.curve))throw Error('Invalid object data.');ids.add(o.id);
 for(const k of ['x','y','toX','toY','size','start','draw','end'])if(!Number.isFinite(o[k])||Math.abs(o[k])>1000)throw Error('Invalid object coordinates or timing.');
 if(o.size<=0||o.size>10||o.start<0||o.draw<.1||o.end<=o.start||o.end>120)throw Error('Object timing or size is out of range.');}
 for(const o of objects){
 if(!['serif','sans','mono'].includes(o.font)||!['smooth','linear','ease-in'].includes(o.easing)||!Number.isFinite(o.stroke)||o.stroke<.5||o.stroke>20||!Number.isFinite(o.opacity)||o.opacity<0||o.opacity>1||!Number.isFinite(o.rotation)||Math.abs(o.rotation)>360||!Number.isFinite(o.fadeOut)||o.fadeOut<0||o.fadeOut>120||!Number.isInteger(o.bars)||o.bars<2||o.bars>100)throw Error('Invalid object style settings.');
 if(!Number.isFinite(o.rangeMin)||!Number.isFinite(o.rangeMax)||o.rangeMin>=o.rangeMax||Math.abs(o.rangeMin)>20||Math.abs(o.rangeMax)>20||!/^#[0-9a-f]{6}$/i.test(o.endColor)||typeof o.gradient!=='boolean'||typeof o.italic!=='boolean'||!Number.isFinite(o.fillOpacity)||o.fillOpacity<0||o.fillOpacity>1)throw Error('Invalid graph range, gradient, or fill settings.');
 }
 for(const o of objects){if(!['happy','thinking','surprised','sad','talking'].includes(o.expression)||!Number.isFinite(o.gazeX)||Math.abs(o.gazeX)>1||!Number.isFinite(o.gazeY)||Math.abs(o.gazeY)>1||typeof o.blink!=='boolean'||typeof o.bubble!=='string'||o.bubble.length>120)throw Error('Invalid pi character settings.');}
 for(const o of objects)if(!['draw','fade','none','grow','spin'].includes(o.entrance))throw Error('Invalid entrance animation.');
 for(const o of objects){
 for(const k of ['scaleX','scaleY'])if(!Number.isFinite(o[k])||o[k]<.1||o[k]>10)throw Error('Stretch must be 0.1–10.');
 if(!/^#[0-9a-f]{6}$/i.test(o.fillColor)||!['solid','dashed','dotted'].includes(o.dash)||!Number.isInteger(o.sides)||o.sides<3||o.sides>32||!Number.isFinite(o.arcAngle)||o.arcAngle<1||o.arcAngle>360||!Number.isFinite(o.lineHeight)||o.lineHeight<.2||o.lineHeight>3||!['left','center','right'].includes(o.align)||!['fill','bold','hidden','locked'].every(k=>typeof o[k]==='boolean'))throw Error('Invalid shape or text options.');
 if(!Array.isArray(o.keyframes)||o.keyframes.length>100)throw Error('Maximum 100 keyframes per object.');
 for(let i=0;i<o.keyframes.length;i++){const f=o.keyframes[i];if(!f||!Number.isFinite(f.time)||f.time<0||f.time>120||(i&&f.time<=o.keyframes[i-1].time)||!/^#[0-9a-f]{6}$/i.test(f.color))throw Error('Keyframe times must increase and have valid colors.');for(const k of ['x','y','size','rotation','opacity'])if(!Number.isFinite(f[k])||Math.abs(f[k])>1000)throw Error('Invalid keyframe value.');if(f.size<.1||f.size>10||f.opacity<0||f.opacity>1)throw Error('Invalid keyframe size or opacity.');}
 }
 const pages=p.pages===undefined?[backgroundPage({grid:!!p.grid,axes:!!p.grid})]:p.pages;
 if(!Array.isArray(pages)||!pages.length||pages.length>100)throw Error('A project needs 1–100 background pages.');
 const pageIds=new Set();
 for(let i=0;i<pages.length;i++){
  const page=pages[i];
  if(!page||typeof page.id!=='string'||pageIds.has(page.id)||typeof page.name!=='string'||page.name.length>100||typeof page.grid!=='boolean'||(page.axes!==undefined&&typeof page.axes!=='boolean')||!Number.isFinite(page.start)||page.start<0||page.start>=p.duration||(i===0?page.start!==0:page.start<=pages[i-1].start)||!['color','gridColor','axisColor'].every(key=>/^#[0-9a-f]{6}$/i.test(page[key])))throw Error('Invalid background page: use unique, increasing start times within the video, beginning at 0.');
  for(const key of ['originX','originY'])if(page[key]!==undefined&&(!Number.isFinite(page[key])||Math.abs(page[key])>8))throw Error('Axis origin must be within −8 to 8.');
  if(page.ticks!==undefined&&typeof page.ticks!=='boolean')throw Error('Invalid axis tick setting.');
  pageIds.add(page.id);
 }
 const {grid,...rest}=p;
 return {...rest,objects,pages:pages.map(page=>({...PAGE_STYLE,axes:page.grid,...page}))};
}
export function template(name){const base={version:1,title:name,duration:12,pages:[backgroundPage()],objects:[]};
 if(name==='Sine, from a circle')base.objects=[object('text',{label:'A circle becomes a wave',y:3.3,toY:3.3,size:.6,color:'#e9edf1'}),object('circle',{x:-4,toX:-4,size:1.5,start:.5}),object('vector',{x:-4,toX:-4,size:1.5,start:1,color:'#efbe78'}),object('curve',{x:2,toX:2,size:1.4,start:2,color:'#79b8ff'}),object('text',{label:'y = sin(x)',x:2,toX:2,y:-2.6,toY:-2.6,size:.55,start:3,color:'#79b8ff'})];
 if(name==='Vectors in motion')base.objects=[object('text',{label:'A vector is a journey',y:3.3,toY:3.3,size:.6,color:'#e9edf1'}),object('vector',{x:-3,toX:1,y:-1,toY:1,size:2,color:'#78dcca'}),object('vector',{x:-3,toX:-3,y:-1,toY:-1,size:1,start:1,color:'#efbe78'}),object('text',{label:'Same direction. New perspective.',y:-3,toY:-3,size:.4,start:2})];
 if(name==='The shape of a function')base.objects=[object('text',{label:'Small changes. Beautiful patterns.',y:3.4,toY:3.4,size:.55,color:'#e9edf1'}),object('curve',{curve:'parabola',size:1,start:.5,color:'#bb9af7'}),object('text',{label:'y = x² / 4',y:-3,toY:-3,size:.6,start:2,color:'#bb9af7'})];
 if(name==='Area under a curve'){
 base.pages=[backgroundPage({color:'#000000',grid:false,axes:true,axisColor:'#888888',originX:-4,originY:-2.5,ticks:true})];
 base.objects=[object('text',{label:'From little pieces to a whole',y:3.6,toY:3.6,size:.65,color:'#ffffff'}),object('area',{curve:'parabola',x:-4,toX:-4,y:-2.5,toY:-2.5,rangeMin:0,rangeMax:4,color:'#58c4dd',gradient:true,fillOpacity:.85,start:1,draw:3}),object('curve',{curve:'parabola',x:-4,toX:-4,y:-2.5,toY:-2.5,rangeMin:-1,rangeMax:4.5,color:'#58c4dd',start:.5,draw:2}),object('text',{label:'Area ≈ ∑ f(x) Δx',x:4,toX:4,y:0,toY:0,size:.5,start:4,color:'#ffff00'})];
 }
 if(name==='A circle made of rings'){
 base.pages=[backgroundPage({color:'#000000',grid:false,axes:false})];
 base.objects=[object('text',{label:'A circle, one ring at a time',y:3.3,toY:3.3,size:.65,color:'#ffffff'}),object('rings',{x:-3,toX:-3,size:2.2,bars:28,color:'#58c4dd',endColor:'#83c167',gradient:true,fillOpacity:.85,start:.5,draw:4}),object('text',{label:'Each thin ring\nadds a little area.',x:3,toX:3,y:1,toY:1,size:.5,color:'#ffffff',start:2}),object('text',{label:'ΔA ≈ 2πr Δr',x:3,toX:3,y:-1,toY:-1,size:.6,color:'#83c167',italic:true,start:4})];
 }
 if(name==='Meet your pi presenter'){
 base.pages=[backgroundPage({color:'#000000',grid:false,axes:false})];
 base.objects=[object('text',{label:'Every idea starts with a question',y:3.4,toY:3.4,size:.6,color:'#ffffff'}),object('pi',{label:'Pi presenter',x:-4,toX:-4,y:-1,toY:-1,size:1.3,color:'#58c4dd',expression:'talking',gazeX:.7,gazeY:.2,bubble:'What happens if we look a little closer?',start:.5}),object('circle',{x:3,toX:3,size:1.5,color:'#83c167',start:2}),object('text',{label:'A = πr²',x:3,toX:3,y:-2.5,toY:-2.5,size:.6,color:'#83c167',start:3,italic:true})];
 }
 return base;}
export function mixColor(a,b,t){
 const channel=i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0');
 return '#'+[1,3,5].map(channel).join('');
}
// Deterministic blinking works identically when scrubbing and exporting.
export function eyeOpen(time,blink=true){const phase=((time%4)+4)%4;return blink&&phase>3.7?Math.max(.06,Math.abs(phase-3.85)/.15):1;}
export function bubbleLines(text){
 const lines=[];
 for(const paragraph of text.split('\n')){
 let line='';
 for(const word of paragraph.split(/\s+/)){
 for(const chunk of word.match(/.{1,26}/g)||['']){
 if(line.length+chunk.length+1>26){lines.push(line);line='';}
 line+=(line?' ':'')+chunk;
 }
 }
 lines.push(line);
 }
 return lines;
}
export function drawPi(ctx,o,r,time){
 ctx.strokeStyle=o.color;ctx.lineWidth=r*.18;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(-r*.78,-r*.35);ctx.quadraticCurveTo(-r*.72,-r*.58,-r*.45,-r*.58);ctx.lineTo(r*.75,-r*.58);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-r*.3,-r*.55);ctx.quadraticCurveTo(-r*.28,r*.25,-r*.52,r*.82);ctx.moveTo(r*.35,-r*.55);ctx.quadraticCurveTo(r*.25,r*.6,r*.55,r*.82);ctx.stroke();
 ctx.fillStyle=o.color;ctx.beginPath();ctx.roundRect(-r*.45,-r*.61,r*.9,r*.48,r*.12);ctx.fill();
 const open=eyeOpen(time,o.blink),gx=(o.gazeX??0)*r*.06,gy=-(o.gazeY??0)*r*.07;
 for(const x of [-.2,.22]){
 ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(x*r,-r*.7,r*.16,r*.23*open,0,0,Math.PI*2);ctx.fill();
 if(open>.2){ctx.fillStyle='#111111';ctx.beginPath();ctx.ellipse(x*r+gx,-r*.7+gy*open,r*.065,r*.09*open,0,0,Math.PI*2);ctx.fill();}
 }
 ctx.strokeStyle='#101010';ctx.fillStyle='#101010';ctx.lineWidth=r*.035;ctx.beginPath();
 if(o.expression==='surprised'||o.expression==='talking'){
 const height=o.expression==='talking'?.045+.09*(.5+.5*Math.sin(time*12)):.13;
 ctx.ellipse(0,-r*.35,r*.11,r*height,0,0,Math.PI*2);ctx.fill();
 }else{ctx.moveTo(-r*.13,-r*.36);ctx.quadraticCurveTo(0,r*(o.expression==='sad'?-.52:o.expression==='thinking'?-.36:-.2),r*.13,-r*.36);ctx.stroke();}
 if(o.expression==='thinking'){ctx.strokeStyle=o.color;ctx.lineWidth=r*.045;ctx.beginPath();ctx.moveTo(-r*.37,-r*1.02);ctx.lineTo(-r*.08,-r*.96);ctx.moveTo(r*.08,-r*1.04);ctx.lineTo(r*.37,-r*1.1);ctx.stroke();}
 if(o.bubble){
 const lines=bubbleLines(o.bubble),x=r*.65,w=r*3.5,h=r*(.5+lines.length*.29),bottom=-r*1.25,y=bottom-h;
 ctx.fillStyle='#000000';ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,r*.2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(x+r*.45,bottom-1);ctx.lineTo(r*.4,-r*.9);ctx.lineTo(x+r*.9,bottom-1);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffffff';ctx.font=`${r*.24}px Georgia,serif`;ctx.textAlign='left';lines.forEach((line,i)=>ctx.fillText(line,x+r*.2,y+r*(.38+i*.29),w-r*.4));
 }
}
export function render(ctx,project,time){
 const page=pageAt(project,time);
 const W=ctx.canvas.width,H=ctx.canvas.height,S=W/16;ctx.clearRect(0,0,W,H);ctx.fillStyle=page.color;ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.lineCap='round';ctx.lineJoin='round';
 if(page.grid){ctx.strokeStyle=page.gridColor;ctx.lineWidth=1;ctx.beginPath();for(let x=-8;x<=8;x++){ctx.moveTo(x*S,-H/2);ctx.lineTo(x*S,H/2)}for(let y=-4;y<=4;y++){ctx.moveTo(-W/2,y*S);ctx.lineTo(W/2,y*S)}ctx.stroke();}
 if(page.axes??page.grid){
 const ox=(page.originX??0)*S,oy=-(page.originY??0)*S;
 ctx.strokeStyle=page.axisColor;ctx.fillStyle=page.axisColor;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-W/2,oy);ctx.lineTo(W/2,oy);ctx.moveTo(ox,-H/2);ctx.lineTo(ox,H/2);ctx.stroke();
 if(page.ticks){
 ctx.font=`${S*.22}px Georgia,serif`;ctx.textAlign='center';
 for(let n=-16;n<=16;n++){
 const x=ox+n*S,y=oy-n*S;
 if(x>-W/2+25&&x<W/2-25){ctx.beginPath();ctx.moveTo(x,oy-6);ctx.lineTo(x,oy+6);ctx.stroke();if(n!==0)ctx.fillText(String(n),x,oy+S*.3);}
 if(y>-H/2+25&&y<H/2-25){ctx.beginPath();ctx.moveTo(ox-6,y);ctx.lineTo(ox+6,y);ctx.stroke();if(n!==0){ctx.textAlign='right';ctx.fillText(String(n),ox-12,y+7);ctx.textAlign='center';}}
 }
 ctx.font=`italic ${S*.3}px Georgia,serif`;ctx.fillText('x',W/2-25,oy-15);ctx.fillText('y',ox+22,-H/2+30);
 }
 }
 for(const o of project.objects){const s=sample(o,time);if(o.hidden||!s.visible||!s.p)continue;ctx.save();ctx.translate(s.x*S,-s.y*S);if(o.entrance==='fade'){ctx.globalAlpha=s.p;}ctx.strokeStyle=s.color??o.color;ctx.fillStyle=s.color??o.color;ctx.lineWidth=o.stroke??3;ctx.globalAlpha=(o.entrance==='fade'?s.p:1)*(s.opacity??o.opacity??1)*(o.fadeOut?clamp((o.end-time)/o.fadeOut):1);ctx.rotate(-((s.rotation??o.rotation??0)+(o.entrance==='spin'?(1-s.p)*180:0))*Math.PI/180);ctx.scale((o.scaleX??1)*(o.entrance==='grow'?Math.max(.001,s.p):1),(o.scaleY??1)*(o.entrance==='grow'?Math.max(.001,s.p):1));ctx.setLineDash(o.dash==='dashed'?[14,9]:o.dash==='dotted'?[2,8]:[]);const r=(s.size??o.size)*S;if(o.entrance==='fade'||o.entrance==='none'||o.entrance==='grow'||o.entrance==='spin')s.p=1;ctx.beginPath();
 if(['line','ellipse','triangle','polygon','star','arc','dot'].includes(o.type)){
 if(o.type==='line'){ctx.moveTo(-r,0);ctx.lineTo(-r+2*r*s.p,0);}
 if(o.type==='ellipse')ctx.ellipse(0,0,r,r*.6,0,-Math.PI/2,-Math.PI/2+Math.PI*2*s.p);
 if(o.type==='arc')ctx.arc(0,0,r,0,-(o.arcAngle??180)*Math.PI/180*s.p,true);
 if(o.type==='dot'){ctx.arc(0,0,r*.12,0,Math.PI*2);ctx.fill();}
 if(['triangle','polygon','star'].includes(o.type)){
 const n=o.type==='triangle'?3:o.type==='star'?10:o.sides;
 const count=Math.ceil(n*s.p);for(let i=0;i<=count;i++){const k=Math.min(i,n*s.p),j=Math.floor(k),u=k-j;const vertex=v=>{const rad=o.type==='star'&&v%2?r*.45:r,angle=v/n*Math.PI*2-Math.PI/2;return [Math.cos(angle)*rad,Math.sin(angle)*rad]};const a=vertex(j),b=vertex(j+1),x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
 }
 if(o.fill&&o.type!=='line'){ctx.fillStyle=o.fillColor;ctx.fill();}ctx.stroke();
 }
 if(o.type==='pi'){ctx.globalAlpha*=s.p;drawPi(ctx,o,r,time-o.start);}
 if(o.type==='text'){ctx.globalAlpha*=s.p;ctx.font=`${o.italic?'italic ':''}${o.bold?'bold ':''}${r*.65}px ${{serif:'Georgia,serif',sans:'Arial,sans-serif',mono:'monospace'}[o.font??'serif']}`;ctx.textAlign=o.align??'center';o.label.split('\n').forEach((line,index)=>ctx.fillText(line,0,index*r*(o.lineHeight??.8)));}
 if(o.type==='circle'){ctx.arc(0,0,r,-Math.PI/2,-Math.PI/2+Math.PI*2*s.p);if(o.fill){ctx.fillStyle=o.fillColor;ctx.fill();}ctx.stroke();}
 if(o.type==='rectangle'){const points=[[-r,-r*.6],[r,-r*.6],[r,r*.6],[-r,r*.6],[-r,-r*.6]];const progress=s.p*4;ctx.moveTo(...points[0]);for(let i=0;i<4;i++){const f=clamp(progress-i);ctx.lineTo(points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f);}if(o.fill){ctx.fillStyle=o.fillColor;ctx.fill();}ctx.stroke();}
 if(o.type==='vector'){const x=r*s.p,y=-r*.65*s.p;ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();ctx.translate(x,y);ctx.rotate(-Math.atan(.65));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-18,-9);ctx.lineTo(-18,9);ctx.closePath();ctx.fill();}
 if(o.type==='area'){
 const count=o.bars??24,min=o.rangeMin??-3,max=o.rangeMax??3,dx=(max-min)/count;
 for(let i=0;i<count;i++){
  const reveal=clamp(s.p*count-i),x=min+i*dx,y=CURVES[o.curve](x+dx/2);
  if(!reveal)continue;
  ctx.fillStyle=o.gradient?mixColor(o.color,o.endColor,i/Math.max(1,count-1)):o.color;ctx.strokeStyle=o.color;ctx.save();ctx.globalAlpha*=o.fillOpacity??.65;ctx.fillRect(x*r,-y*r*reveal,dx*r,y*r*reveal);ctx.restore();
  ctx.strokeRect(x*r,-y*r*reveal,dx*r,y*r*reveal);
 }
 }
 if(o.type==='rings'){
 const count=o.bars??24;
 for(let i=0;i<count;i++){
 const reveal=clamp(s.p*count-i);if(!reveal)continue;
 ctx.strokeStyle=o.gradient?mixColor(o.color,o.endColor,i/Math.max(1,count-1)):o.color;
 ctx.save();ctx.globalAlpha*=o.fillOpacity??.65;ctx.lineWidth=r/count*.92;ctx.beginPath();ctx.arc(0,0,(i+.5)*r/count,-Math.PI/2,-Math.PI/2+2*Math.PI*reveal);ctx.stroke();ctx.restore();
 }
 }
 if(o.type==='curve'){ctx.save();ctx.beginPath();ctx.rect(-W/2-s.x*S,-H/2+s.y*S,W,H);ctx.clip();ctx.beginPath();const steps=Math.ceil(300*s.p);for(let i=0;i<=steps;i++){const x=(o.rangeMin??-3)+((o.rangeMax??3)-(o.rangeMin??-3))*i/300,y=CURVES[o.curve](x);if(i===0)ctx.moveTo(x*r,-y*r);else ctx.lineTo(x*r,-y*r)}ctx.stroke();ctx.restore();}ctx.restore();}
 ctx.restore();
}
