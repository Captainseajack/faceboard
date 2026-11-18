const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../dist/model.js');
test('backup references cannot resolve inherited object properties as photos',()=>{
 for(const name of ['toString','valueOf','hasOwnProperty','constructor','__proto__']){
  const d=M.empty(),g=M.group();g.chains[0].items=[{kind:'photo',id:name}];d.groups.push(g);
  assert.throws(()=>M.validate(d));assert.equal(M.find(d,name),undefined);
  assert.throws(()=>M.movePhoto(d,name,g.chains[0].id));assert.throws(()=>M.resizePhoto(d,name,200));
 }
 const d=M.demo(),first=Object.keys(d.photos)[0];d.groups[0].chains[0].items=[{kind:'photo',id:[first]}];
 assert.throws(()=>M.validate(d));
});
test('individual and global photo sizes survive backup and moving between chains',()=>{
 const d=M.demo(),id=Object.keys(d.photos)[0];M.resizePhoto(d,id,280);
 assert.equal(M.photoDimensions(d.photos[id]).width,280);
 assert.equal(M.photoDimensions(d.photos[id]).height,287);
 M.movePhoto(d,id,d.groups[2].chains[0].id);
 assert.equal(M.find(d,id).entity.size,280);
 let restored=M.validate(JSON.parse(JSON.stringify(d)));assert.equal(restored.photos[id].size,280);
 M.resizeAllPhotos(d,220);assert.equal(d.photoSize,220);assert.equal(d.photos[id].size,undefined);
 M.resizePhoto(d,id,360);restored=M.validate(JSON.parse(JSON.stringify(d)));
 assert.equal(restored.photoSize,220);assert.equal(restored.photos[id].size,360);
 const another=Object.values(restored.photos).find(p=>p.id!==id);assert.equal(M.photoDimensions(another,restored.photoSize).width,220);
});
test('older backups retain the original size and invalid resize data is rejected',()=>{
 const d=M.demo(),p=Object.values(d.photos)[0];assert.deepEqual(M.photoDimensions(p),{width:140,height:160,imageWidth:132,imageHeight:120});
 assert.deepEqual(M.validate(d),d);
 for(const invalid of [0,10000,'250',Infinity,145]){const bad=structuredClone(d);bad.photos[p.id].size=invalid;assert.throws(()=>M.validate(bad));}
 assert.throws(()=>M.resizePhoto(d,p.id,NaN));
});
test('inserting a junction preserves the rest of the chain and nested branches',()=>{
 const d=M.demo(),c=d.groups[0].chains[0],first=c.items[0],downstream=structuredClone(c.items.slice(1)),before=M.placed(d);
 const n=M.splitAfter(d,first.id);
 assert.deepEqual(n.chains[0].items,downstream);assert.equal(n.chains[1].items.length,0);
 assert.equal(c.items.length,2);assert.deepEqual(M.placed(d),before);assert.deepEqual(M.validate(JSON.parse(JSON.stringify(d))),d);
});
test('photos can reorder in place and move across nested chains without duplication',()=>{
 const d=M.demo(),c=d.groups[1].chains[0],[a,b]=c.items.map(p=>p.id);
 M.movePhoto(d,a,c.id,2);assert.deepEqual(c.items.map(p=>p.id),[b,a]);
 M.movePhoto(d,a,c.id,0);assert.deepEqual(c.items.map(p=>p.id),[a,b]);
 const nested=d.groups[0].chains[0].items.at(-1).chains[1];M.movePhoto(d,a,nested.id,0);
 assert.equal(nested.items[0].id,a);assert.equal(c.items.length,1);assert.equal(M.placed(d).size,10);M.validate(d);
});
test('dropping on a chain that ends in a junction inserts before the junction',()=>{
 const d=M.demo(),c=d.groups[0].chains[0],j=c.items.at(-1);const unplaced=Object.keys(d.photos).find(id=>!M.placed(d).has(id));
 M.movePhoto(d,unplaced,c.id);assert.equal(c.items.at(-1),j);assert.equal(c.items.at(-2).id,unplaced);M.validate(d);
});
test('removing a structure returns its photos to the tray and retains their image records',()=>{
 const d=M.demo(),count=Object.keys(d.photos).length,group=d.groups[0],n=M.countPhotos(group);M.removeEntity(d,group.id);
 assert.equal(Object.keys(d.photos).length,count);assert.equal(M.placed(d).size,10-n);M.validate(d);
 const only=d.groups[1].chains[0];M.removeEntity(d,only.id);assert.equal(d.groups[1].chains.length,1);assert.equal(d.groups[1].chains[0].items.length,0);M.validate(d);
});
test('backups round-trip all labels, notes, colors, unplaced photos, and nested branches',()=>{
 const d=M.demo();d.title='My board <&>';d.groups[0].description='Line one\nLine two';const n=M.splitAfter(d,d.groups[0].chains[0].items[0].id);n.chains.push(M.chain('Later branch'));
 assert.deepEqual(M.validate(JSON.parse(JSON.stringify(d))),d);
});
test('malformed backups are rejected before they can replace a board',()=>{
 const d=M.demo();let bad=structuredClone(d);bad.groups[0].id='\"><script>';assert.throws(()=>M.validate(bad));
 bad=structuredClone(d);bad.groups[1].chains[0].items.push(structuredClone(bad.groups[1].chains[0].items[0]));assert.throws(()=>M.validate(bad));
 bad=structuredClone(d);bad.groups[0].chains[0].items.push({kind:'photo',id:'missing'});assert.throws(()=>M.validate(bad));
 bad=structuredClone(d);bad.photos[Object.keys(bad.photos)[0]].src='https://unexpected.example/image';assert.throws(()=>M.validate(bad));
});
test('500 successive edits preserve structural invariants and all photo records',()=>{
 const d=M.demo(),photoIds=Object.keys(d.photos);let seed=42;const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};
 for(let i=0;i<500;i++){
  const list=M.chains(d),id=photoIds[rand(photoIds.length)],f=M.find(d,id);
  if(i%17===0&&f.chain&&list.length<80)M.splitAfter(d,id);
  else if(i%11===0)M.movePhoto(d,id,null);
  else {const c=list[rand(list.length)].entity;M.movePhoto(d,id,c.id,rand(c.items.length+1));}
  assert.equal(Object.keys(d.photos).length,12);assert.ok(M.placed(d).size<=12);M.validate(d);
 }
});
