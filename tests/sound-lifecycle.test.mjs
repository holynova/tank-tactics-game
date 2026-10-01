import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source=await fs.readFile(new URL('../src/utils/soundEngine.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText.replaceAll('import.meta.env.BASE_URL', "'/'");
const {SoundEngine}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));

function setup({deferred=false,failOgg=false}={}) {
  const nodes=[],requests=[];
  const parameter=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
  class Node {
    constructor(kind){this.kind=kind;this.gain=parameter();this.pan=parameter();this.playbackRate=parameter();this.threshold=parameter();this.knee=parameter();this.ratio=parameter();this.attack=parameter();this.release=parameter();this.started=false;this.stopped=false;nodes.push(this);}
    connect(){} disconnect(){} start(){this.started=true;} stop(){this.stopped=true;this.onended?.();}
  }
  class Context {
    currentTime=0;state='running';destination={};
    createGain(){return new Node('gain');}
    createDynamicsCompressor(){return new Node('compressor');}
    createStereoPanner(){return new Node('pan');}
    createBufferSource(){return new Node('source');}
    decodeAudioData(data){return Promise.resolve(data);}
  }
  globalThis.window={AudioContext:Context};
  globalThis.document={hidden:false};
  globalThis.fetch=url=>{
    const response={ok:!failOgg||!url.endsWith('.ogg'),status:404,arrayBuffer:async()=>({url})};
    if(!deferred){requests.push({url});return Promise.resolve(response);}
    return new Promise(resolve=>requests.push({url,resolve:()=>resolve(response)}));
  };
  return {engine:new SoundEngine(),nodes,requests,voices:()=>nodes.filter(n=>n.kind==='source')};
}
test('muting cancels a sample that is still loading',async()=>{
  const s=setup({deferred:true});
  const pending=s.engine.play('fire','land');
  s.engine.configure(false,.55);
  s.requests[0].resolve();await pending;
  assert.equal(s.voices().length,0);
});
test('muting stops active voices immediately and zeros the master',async()=>{
  const s=setup();
  await s.engine.play('motor','land');
  assert.equal(s.voices().filter(v=>v.started).length,1);
  s.engine.configure(false,.55);
  assert.ok(s.voices().every(v=>v.stopped));
  assert.equal(s.nodes.find(n=>n.kind==='gain').gain.value,0);
});
test('rapid terrain switching cannot start the old ambient sample late',async()=>{
  const s=setup({deferred:true});s.engine.init();
  const land=s.engine.setAmbient('land');
  const sea=s.engine.setAmbient('sea');
  s.requests.find(r=>r.url.includes('sea')).resolve();await sea;
  s.requests.find(r=>r.url.includes('land')).resolve();await land;
  assert.equal(s.voices().length,1);
  assert.ok(s.voices()[0].buffer.url.includes('sea'));
});
test('reset cancels an ambient load and all queued sound playback',async()=>{
  const s=setup({deferred:true});s.engine.init();
  const ambience=s.engine.setAmbient('land');
  const effect=s.engine.play('explode','land');
  s.engine.stopAll();
  for(const r of s.requests)r.resolve();
  await Promise.all([ambience,effect]);
  assert.equal(s.voices().length,0);
});
test('WAV fallback plays when Vorbis is unavailable',async()=>{
  const s=setup({failOgg:true});
  await s.engine.play('click','land');
  assert.equal(s.requests.length,2);
  assert.ok(s.voices()[0].buffer.url.endsWith('.wav'));
});
test('voices are bounded while old voices are released',async()=>{
  const s=setup();
  for(let i=0;i<12;i++)await s.engine.play('fire','sea');
  assert.equal(s.voices().filter(v=>v.started&&!v.stopped).length,8);
  s.engine.stopAll();
  assert.ok(s.voices().every(v=>v.stopped));
});
