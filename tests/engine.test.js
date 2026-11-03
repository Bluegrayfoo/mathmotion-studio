import test from 'node:test';
import assert from 'node:assert/strict';
import {template,validate,object,sample,CURVES,backgroundPage,pageAt,render} from '../web/engine.js';
test('all starter projects are valid and round trip',()=>{for(const name of ['Sine, from a circle','Vectors in motion','The shape of a function','Area under a curve']){const p=template(name);assert.deepEqual(validate(JSON.parse(JSON.stringify(p))),p);}});
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
 render(ctx,p,4);assert.equal(rectangles.length,10);assert.ok(rectangles.every(r=>r.every(Number.isFinite)));assert.equal(rectangles[0][2],72);
});
