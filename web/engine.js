export const TYPES = ['text','circle','vector','curve','rectangle'];
export const CURVES = {sine:x=>Math.sin(x),cosine:x=>Math.cos(x),parabola:x=>x*x/4,cubic:x=>x*x*x/12};
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function object(type, extra={}) { return {id:crypto.randomUUID(),type,label:type==='text'?'A beautiful idea':type,color:'#78dcca',x:0,y:0,toX:0,toY:0,size:1,start:0,draw:1.5,end:12,curve:'sine',...extra}; }
export function sample(o,t){const p=clamp((t-o.start)/Math.max(.1,o.draw));const move=clamp((t-o.start-o.draw)/Math.max(.1,o.end-o.start-o.draw));const ease=move*move*(3-2*move);return {visible:t>=o.start&&t<=o.end,p,x:o.x+(o.toX-o.x)*ease,y:o.y+(o.toY-o.y)*ease};}
export function validate(p){
 if(!p||p.version!==1||typeof p.title!=='string'||p.title.length>100||!Number.isFinite(p.duration)||p.duration<1||p.duration>120||!Array.isArray(p.objects)||p.objects.length>100)throw Error('Invalid project: expected a MathMotion v1 project (1–120 seconds, up to 100 objects).');
 const ids=new Set();
 for(const o of p.objects){if(!o||!TYPES.includes(o.type)||typeof o.id!=='string'||ids.has(o.id)||typeof o.label!=='string'||o.label.length>300||!/^#[0-9a-f]{6}$/i.test(o.color)||!Object.hasOwn(CURVES,o.curve))throw Error('Invalid object data.');ids.add(o.id);
 for(const k of ['x','y','toX','toY','size','start','draw','end'])if(!Number.isFinite(o[k])||Math.abs(o[k])>1000)throw Error('Invalid object coordinates or timing.');
 if(o.size<=0||o.size>10||o.start<0||o.draw<.1||o.end<=o.start||o.end>120)throw Error('Object timing or size is out of range.');}
 return {...p,grid:!!p.grid};
}
export function template(name){const base={version:1,title:name,duration:12,grid:true,objects:[]};
 if(name==='Sine, from a circle')base.objects=[object('text',{label:'A circle becomes a wave',y:3.3,toY:3.3,size:.6,color:'#e9edf1'}),object('circle',{x:-4,toX:-4,size:1.5,start:.5}),object('vector',{x:-4,toX:-4,size:1.5,start:1,color:'#efbe78'}),object('curve',{x:2,toX:2,size:1.4,start:2,color:'#79b8ff'}),object('text',{label:'y = sin(x)',x:2,toX:2,y:-2.6,toY:-2.6,size:.55,start:3,color:'#79b8ff'})];
 if(name==='Vectors in motion')base.objects=[object('text',{label:'A vector is a journey',y:3.3,toY:3.3,size:.6,color:'#e9edf1'}),object('vector',{x:-3,toX:1,y:-1,toY:1,size:2,color:'#78dcca'}),object('vector',{x:-3,toX:-3,y:-1,toY:-1,size:1,start:1,color:'#efbe78'}),object('text',{label:'Same direction. New perspective.',y:-3,toY:-3,size:.4,start:2})];
 if(name==='The shape of a function')base.objects=[object('text',{label:'Small changes. Beautiful patterns.',y:3.4,toY:3.4,size:.55,color:'#e9edf1'}),object('curve',{curve:'parabola',size:1,start:.5,color:'#bb9af7'}),object('text',{label:'y = x² / 4',y:-3,toY:-3,size:.6,start:2,color:'#bb9af7'})];return base;}
export function render(ctx,project,time){
 const W=ctx.canvas.width,H=ctx.canvas.height,S=W/16;ctx.clearRect(0,0,W,H);ctx.fillStyle='#0b1018';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.lineCap='round';ctx.lineJoin='round';
 if(project.grid){ctx.strokeStyle='#1b2836';ctx.lineWidth=1;ctx.beginPath();for(let x=-8;x<=8;x++){ctx.moveTo(x*S,-H/2);ctx.lineTo(x*S,H/2)}for(let y=-4;y<=4;y++){ctx.moveTo(-W/2,y*S);ctx.lineTo(W/2,y*S)}ctx.stroke();ctx.strokeStyle='#415368';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-W/2,0);ctx.lineTo(W/2,0);ctx.moveTo(0,-H/2);ctx.lineTo(0,H/2);ctx.stroke();}
 for(const o of project.objects){const s=sample(o,time);if(!s.visible||!s.p)continue;ctx.save();ctx.translate(s.x*S,-s.y*S);ctx.strokeStyle=o.color;ctx.fillStyle=o.color;ctx.lineWidth=4;const r=o.size*S;ctx.beginPath();
 if(o.type==='text'){ctx.globalAlpha=s.p;ctx.font=`${r*.65}px Georgia,serif`;ctx.textAlign='center';ctx.fillText(o.label,0,0);}
 if(o.type==='circle'){ctx.arc(0,0,r,-Math.PI/2,-Math.PI/2+Math.PI*2*s.p);ctx.stroke();}
 if(o.type==='rectangle'){const points=[[-r,-r*.6],[r,-r*.6],[r,r*.6],[-r,r*.6],[-r,-r*.6]];const progress=s.p*4;ctx.moveTo(...points[0]);for(let i=0;i<4;i++){const f=clamp(progress-i);ctx.lineTo(points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f);}ctx.stroke();}
 if(o.type==='vector'){const x=r*s.p,y=-r*.65*s.p;ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.stroke();ctx.translate(x,y);ctx.rotate(-Math.atan(.65));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-18,-9);ctx.lineTo(-18,9);ctx.closePath();ctx.fill();}
 if(o.type==='curve'){ctx.save();ctx.beginPath();ctx.rect(-W/2-s.x*S,-H/2+s.y*S,W,H);ctx.clip();ctx.beginPath();const steps=Math.ceil(300*s.p);for(let i=0;i<=steps;i++){const x=-3+6*i/300,y=CURVES[o.curve](x);if(i===0)ctx.moveTo(x*r,-y*r);else ctx.lineTo(x*r,-y*r)}ctx.stroke();ctx.restore();}ctx.restore();}
 ctx.restore();
}
