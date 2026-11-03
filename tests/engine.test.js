import test from 'node:test';
import assert from 'node:assert/strict';
import {template,validate,object,sample,CURVES} from '../web/engine.js';
test('all starter projects are valid and round trip',()=>{for(const name of ['Sine, from a circle','Vectors in motion','The shape of a function']){const p=template(name);assert.deepEqual(validate(JSON.parse(JSON.stringify(p))),p);}});
// Compare stable fields separately because IDs are generated for each scene.
test('timing interpolates endpoints and hides out-of-range objects',()=>{const o=object('circle',{x:1,toX:5,start:2,draw:2,end:8});assert.equal(sample(o,1).visible,false);assert.equal(sample(o,2).p,0);assert.equal(sample(o,4).x,1);assert.equal(sample(o,8).x,5);assert.equal(sample(o,9).visible,false);assert.equal(sample(o,6).x,3);});
test('malformed imports reject invalid coordinates, duplicate IDs and unsupported curves',()=>{for(const mutate of [p=>p.duration=Infinity,p=>p.objects[0].x='bad',p=>p.objects.push(p.objects[0]),p=>p.objects[0].curve='__proto__',p=>p.objects[0].color='red',p=>p.objects[0].size=-1]){const p=template('Vectors in motion');mutate(p);assert.throws(()=>validate(p));}});
test('known curves have expected values',()=>{assert.equal(CURVES.sine(0),0);assert.equal(CURVES.parabola(2),1);});
