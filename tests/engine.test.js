import test from 'node:test';
import assert from 'node:assert/strict';
import {template,validate,object,sample,CURVES,backgroundPage,pageAt,render,mixColor,eyeOpen,bubbleLines} from '../web/engine.js';
test('all starter projects are valid and round trip',()=>{for(const name of ['Sine, from a circle','Vectors in motion','The shape of a function','Area under a curve','A circle made of rings','Meet your pi presenter']){const p=template(name);assert.deepEqual(validate(JSON.parse(JSON.stringify(p))),p);}});
// Compare stable fields separately because IDs are generated for each scene.
test('timing interpolates endpoints and hides out-of-range objects',()=>{const o=object('circle',{x:1,toX:5,start:2,draw:2,end:8});assert.equal(sample(o,1).visible,false);assert.equal(sample(o,2).p,0);assert.equal(sample(o,4).x,1);assert.equal(sample(o,8).x,5);assert.equal(sample(o,9).visible,false);assert.equal(sample(o,6).x,3);});
test('malformed imports reject invalid coordinates, duplicate IDs and unsupported curves',()=>{for(const mutate of [p=>p.duration=Infinity,p=>p.objects[0].x='bad',p=>p.objects.push(p.objects[0]),p=>p.objects[0].curve='__proto__',p=>p.objects[0].color='red',p=>p.objects[0].size=-1]){const p=template('Vectors in motion');mutate(p);assert.throws(()=>validate(p));}});
test('known curves have expected values',()=>{assert.equal(CURVES.sine(0),0);assert.equal(CURVES.parabola(2),1);});

test('legacy projects migrate without losing the grid setting',()=>{
 for(const grid of [true,false]){
  const legacy=template('Vectors in motion');delete legacy.pages;legacy.grid=grid;
  const migrated=validate(legacy);
  assert.equal(migrated.pages.length,1);assert.equal(migrated.pages[0].grid,grid);
  assert.equal(migrated.pages[0].start,0);assert.equal(migrated.pages[0].color,'#0b1018');
  assert.deepEqual(validate(JSON.parse(JSON.stringify(migrated))),migrated);
 }
});

test('background pages switch exactly at boundaries and render their own settings',()=>{
 const p=template('Vectors in motion');p.objects=[];
 p.pages=[backgroundPage({grid:false,axes:false,color:'#000000'}),backgroundPage({start:3,color:'#ffffff',gridColor:'#123456',axisColor:'#654321'})];
 validate(p);
 assert.equal(pageAt(p,2.999),p.pages[0]);assert.equal(pageAt(p,3),p.pages[1]);assert.equal(pageAt(p,12),p.pages[1]);
 const fills=[],strokes=[];
 const ctx=new Proxy({canvas:{width:1920,height:1080},fillRect(){fills.push(this.fillStyle)},stroke(){strokes.push(this.strokeStyle)}},{get:(target,key)=>key in target?target[key]:()=>{}});
 render(ctx,p,0);assert.deepEqual(fills,['#000000']);assert.deepEqual(strokes,[]);
 render(ctx,p,3);assert.deepEqual(fills,['#000000','#ffffff']);assert.deepEqual(strokes,['#123456','#654321']);
 p.pages[1].grid=false;assert.equal(p.pages[0].grid,false);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(p))),p);
});
test('invalid background pages are rejected',()=>{
 for(const mutate of [p=>p.pages=[],p=>p.pages[0].start=1,p=>p.pages[0].color='bad',p=>p.pages[0].grid='false',p=>p.pages.push({...p.pages[0]}),p=>p.pages.push(backgroundPage({start:12})),p=>p.pages.push(backgroundPage({start:NaN}))]){
  const p=template('Vectors in motion');mutate(p);assert.throws(()=>validate(p));
 }
});

test('style defaults migrate and invalid style values reject',()=>{
 const p=template('Area under a curve');delete p.objects[0].stroke;delete p.objects[0].font;
 const migrated=validate(p);assert.equal(migrated.objects[0].stroke,3);assert.equal(migrated.objects[0].font,'serif');
 for(const [key,value] of [['opacity',2],['stroke',0],['font','bad'],['rotation',Infinity],['easing','bad'],['bars',1],['fadeOut',-1]]){
  const invalid=template('Area under a curve');invalid.objects[0][key]=value;assert.throws(()=>validate(invalid));
 }
});
test('linear and ease-in movement have different expected positions',()=>{
 const o=object('circle',{x:0,toX:8,start:0,draw:1,end:5,easing:'linear'});
 assert.equal(sample(o,2).x,2);o.easing='ease-in';assert.equal(sample(o,2).x,.5);
});
test('area rectangles follow the selected curve and rectangle count',()=>{
 const p=template('Area under a curve');const area=p.objects.find(o=>o.type==='area');p.objects=[area];area.bars=10;
 const rectangles=[];
 const ctx=new Proxy({canvas:{width:1920,height:1080},strokeRect(...args){rectangles.push(args)}},{get:(target,key)=>key in target?target[key]:()=>{}});
 render(ctx,p,4);assert.equal(rectangles.length,10);assert.ok(rectangles.every(r=>r.every(Number.isFinite)));assert.equal(rectangles[0][2],48);
});

test('color interpolation preserves endpoints',()=>{
 assert.equal(mixColor('#58c4dd','#83c167',0),'#58c4dd');assert.equal(mixColor('#58c4dd','#83c167',1),'#83c167');assert.equal(mixColor('#000000','#ffffff',.5),'#808080');
});
test('reference settings reject invalid ranges, fills, and axes',()=>{
 for(const edit of [p=>p.objects[0].rangeMax=-4,p=>p.objects[0].fillOpacity=2,p=>p.objects[0].endColor='bad',p=>p.objects[0].gradient='true',p=>p.pages[0].originX=Infinity,p=>p.pages[0].ticks='yes']){
 const p=template('A circle made of rings');edit(p);assert.throws(()=>validate(p));
 }
});
test('rings reveal progressively and multiline labels use separate baselines',()=>{
 const p=template('A circle made of rings');const rings=p.objects.find(o=>o.type==='rings');p.objects=[rings];rings.bars=10;
 const arcs=[],labels=[];const ctx=new Proxy({canvas:{width:1920,height:1080},arc(...args){arcs.push(args)},fillText(...args){labels.push(args)}},{get:(target,key)=>key in target?target[key]:()=>{}});
 render(ctx,p,rings.start+rings.draw/2);assert.equal(arcs.length,5);assert.ok(arcs.every(a=>a[2]>0));
 p.objects=[object('text',{label:'First\nSecond'})];render(ctx,p,2);assert.equal(labels.length,2);assert.equal(labels[0][0],'First');assert.ok(labels[1][2]>labels[0][2]);
});

test('pi blink is deterministic and can be disabled',()=>{
 assert.equal(eyeOpen(0),1);assert.equal(eyeOpen(3.85),.06);assert.equal(eyeOpen(7.85),.06);assert.equal(eyeOpen(3.85,false),1);
});
test('speech wraps long words and preserves explicit line breaks',()=>{
 assert.deepEqual(bubbleLines('Hello\nWorld'),['Hello','World']);
 const lines=bubbleLines('a'.repeat(60));assert.ok(lines.every(line=>line.length<=26));assert.equal(lines.join(''),'a'.repeat(60));
});
test('invalid pi settings reject and older objects receive defaults',()=>{
 for(const [key,value] of [['gazeX',2],['gazeY',NaN],['expression','angry'],['blink',1],['bubble','a'.repeat(121)]]){
 const p=template('Meet your pi presenter');p.objects[1][key]=value;assert.throws(()=>validate(p));
 }
 const p=template('Vectors in motion');delete p.objects[0].expression;assert.equal(validate(p).objects[0].expression,'happy');
});
test('pi expressions and bubbles render through the shared export renderer',()=>{
 const labels=[];const ctx=new Proxy({canvas:{width:1920,height:1080},fillText(text){labels.push(text)}},{get:(target,key)=>key in target?target[key]:()=>{}});
 const p=template('Meet your pi presenter');p.objects=[p.objects[1]];
 for(const expression of ['happy','thinking','surprised','sad','talking']){p.objects[0].expression=expression;render(ctx,p,2);}
 assert.ok(labels.includes('What happens if we look a'));
});
