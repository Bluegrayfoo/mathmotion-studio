export const TYPES = ['text','circle','vector','curve','rectangle','area','rings','pi'];
export const CURVES = {sine:x=>Math.sin(x),cosine:x=>Math.cos(x),parabola:x=>x*x/4,cubic:x=>x*x*x/12};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const STYLE={stroke:3,opacity:1,rotation:0,font:'serif',easing:'smooth',fadeOut:0,bars:24,rangeMin:-3,rangeMax:3,endColor:'#83c167',gradient:false,fillOpacity:.65,italic:false,expression:'happy',gazeX:0,gazeY:0,blink:true,bubble:''};
export function object(type, extra={}) { return {id:crypto.randomUUID(),type,label:type==='text'?'A beautiful idea':type,color:'#78dcca',x:0,y:0,toX:0,toY:0,size:1,start:0,draw:1.5,end:12,curve:'sine',...STYLE,...extra}; }
export function sample(o,t){const p=clamp((t-o.start)/Math.max(.1,o.draw));const move=clamp((t-o.start-o.draw)/Math.max(.1,o.end-o.start-o.draw));const ease=o.easing==='linear'?move:o.easing==='ease-in'?move*move:move*move*(3-2*move);return {visible:t>=o.start&&t<=o.end,p,x:o.x+(o.toX-o.x)*ease,y:o.y+(o.toY-o.y)*ease};}
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
 for(const o of project.objects){const s=sample(o,time);if(!s.visible||!s.p)continue;ctx.save();ctx.translate(s.x*S,-s.y*S);ctx.strokeStyle=o.color;ctx.fillStyle=o.color;ctx.lineWidth=o.stroke??3;ctx.globalAlpha=(o.opacity??1)*(o.fadeOut?clamp((o.end-time)/o.fadeOut):1);ctx.rotate(-(o.rotation??0)*Math.PI/180);const r=o.size*S;ctx.beginPath();
 if(o.type==='pi'){ctx.globalAlpha*=s.p;drawPi(ctx,o,r,time-o.start);}
 if(o.type==='text'){ctx.globalAlpha*=s.p;ctx.font=`${o.italic?'italic ':''}${r*.65}px ${{serif:'Georgia,serif',sans:'Arial,sans-serif',mono:'monospace'}[o.font??'serif']}`;ctx.textAlign='center';o.label.split('\n').forEach((line,index)=>ctx.fillText(line,0,index*r*.8));}
 if(o.type==='circle'){ctx.arc(0,0,r,-Math.PI/2,-Math.PI/2+Math.PI*2*s.p);ctx.stroke();}
 if(o.type==='rectangle'){const points=[[-r,-r*.6],[r,-r*.6],[r,r*.6],[-r,r*.6],[-r,-r*.6]];const progress=s.p*4;ctx.moveTo(...points[0]);for(let i=0;i<4;i++){const f=clamp(progress-i);ctx.lineTo(points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f);}ctx.stroke();}
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
