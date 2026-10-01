import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rules } from './rules-loader.mjs';
const unit=(id,color,r,c)=>({id,color,r,c,angle:0});
test('movement only reaches empty orthogonal neighbors',()=>{
 const pieces=[unit('r','red',1,1),unit('b','blue',1,2)];
 const moves=rules.getValidMoves(1,1,rules.buildGrid(pieces));
 assert.deepEqual(moves,[{r:0,c:1},{r:2,c:1},{r:1,c:0}]);
});
test('a move can capture on both axes; presentation must retain both victims',()=>{
 const pieces=[unit('r1','red',1,1),unit('r2','red',1,2),unit('r3','red',2,1),
   unit('b1','blue',1,3),unit('b2','blue',3,1)];
 const result=rules.checkEatingCondition(rules.buildGrid(pieces),1,1,'red');
 assert.deepEqual(result.eatenPieces.map(p=>p.id).sort(),['b1','b2']);
 assert.equal(new Set(result.attackers.map(p=>p.id)).size,3);
});
test('four units in a line preserve crowding protection',()=>{
 const pieces=[unit('r1','red',1,0),unit('r2','red',1,1),unit('b1','blue',1,2),unit('b2','blue',1,3)];
 assert.equal(rules.checkEatingCondition(rules.buildGrid(pieces),1,1,'red').eatenPieces.length,0);
});
test('three sequential captures end at one enemy and choose the correct winner',()=>{
 let pieces=[...Array.from({length:4},(_,c)=>unit('r-'+c,'red',0,c)),...Array.from({length:4},(_,c)=>unit('b-'+c,'blue',3,c))];
 const turns=[['r-1',1,1],['b-1',2,1],['r-2',1,2],['b-1',2,2],['r-1',2,1],['b-3',2,3],['r-3',1,3],['b-2',3,3]];
 let captures=0;
 for(const [id,r,c] of turns){
  const moving=pieces.find(p=>p.id===id);
  assert.ok(rules.getValidMoves(moving.r,moving.c,rules.buildGrid(pieces)).some(m=>m.r===r&&m.c===c));
  pieces=pieces.map(p=>p.id===id?{...p,r,c}:p);
  const result=rules.checkEatingCondition(rules.buildGrid(pieces),r,c,moving.color);
  captures+=result.eatenPieces.length;
  pieces=pieces.filter(p=>!result.eatenPieces.some(v=>v.id===p.id));
 }
 assert.equal(captures,3);
 assert.deepEqual(rules.checkWinCondition(pieces),{hasWinner:true,winner:'blue'});
});
