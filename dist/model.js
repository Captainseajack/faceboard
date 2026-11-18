(function(root){
  'use strict';
  const uid=()=>globalThis.crypto?.randomUUID?.()||('id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  const palette=['#c78b6e','#8c9c68','#819eae','#ad8ba5','#c1a15e','#6c9e8b'];
  function normalizedSize(value){const n=Number(value);if(!Number.isFinite(n))throw Error('Choose a valid photo size.');return Math.max(100,Math.min(360,Math.round(n/10)*10));}
  function photoDimensions(photo,defaultSize=140){const width=normalizedSize(photo.size??defaultSize),imageWidth=width-8,imageHeight=Math.round(imageWidth*120/132);return {width,height:imageHeight+40,imageWidth,imageHeight};}
  function resizePhoto(data,id,size){if(!Object.hasOwn(data.photos,id))throw Error('Photo not found.');data.photos[id].size=normalizedSize(size);}
  function resizeAllPhotos(data,size){data.photoSize=normalizedSize(size);Object.values(data.photos).forEach(p=>delete p.size);}
  function chain(title='Main chain',items=[]){return {kind:'chain',id:uid(),title,description:'',items};}
  function node(items=[]){return {kind:'node',id:uid(),title:'New junction',description:'',chains:[chain('Branch 01',items),chain('Branch 02')]};}
  function group(n=0){return {kind:'group',id:uid(),title:'Untitled group',description:'',color:palette[n%palette.length],chains:[chain()]};}
  function walk(data,callback){
    function visitChain(c,parent,g){callback({entity:c,type:'chain',parent,group:g});c.items.forEach((item,index)=>{if(item.kind==='photo'){callback({entity:data.photos[item.id],type:'photo',chain:c,index,group:g});}else{callback({entity:item,type:'node',chain:c,index,group:g});item.chains.forEach(child=>visitChain(child,item,g));}});}
    data.groups.forEach((g,index)=>{callback({entity:g,type:'group',index,group:g});g.chains.forEach(c=>visitChain(c,g,g));});
  }
  function find(data,id){let result;walk(data,r=>{if(r.entity?.id===id)result=r;});if(!result&&Object.hasOwn(data.photos,id))result={entity:data.photos[id],type:'photo',chain:null,index:-1,group:null};return result;}
  function chains(data){const out=[];walk(data,r=>{if(r.type==='chain')out.push(r);});return out;}
  function placed(data){const out=new Set();walk(data,r=>{if(r.type==='photo')out.add(r.entity.id);});return out;}
  function countPhotos(entity){if(entity.kind==='photo')return 1;if(entity.kind==='chain')return entity.items.reduce((n,v)=>n+(v.kind==='photo'?1:countPhotos(v)),0);return entity.chains.reduce((n,c)=>n+countPhotos(c),0);}
  function movePhoto(data,id,chainId,index){
    const dest=chainId?find(data,chainId):null;if(chainId&&dest?.type!=='chain')throw Error('Choose a valid chain.');if(!Object.hasOwn(data.photos,id))throw Error('Photo not found.');
    const source=find(data,id);let insert=index??(dest?dest.entity.items.length:0);
    if(source.chain){if(source.chain===dest?.entity&&source.index<insert)insert--;source.chain.items.splice(source.index,1);}
    if(dest){const items=dest.entity.items;const limit=items.at(-1)?.kind==='node'?items.length-1:items.length;items.splice(Math.max(0,Math.min(insert,limit)),0,{kind:'photo',id});}
  }
  function splitAfter(data,photoId){const f=find(data,photoId);if(!f?.chain)throw Error('Place this photo in a chain first.');const rest=f.chain.items.splice(f.index+1);const n=node(rest);f.chain.items.push(n);return n;}
  function appendNode(data,chainId){const f=find(data,chainId);if(f?.type!=='chain')throw Error('Choose a chain.');const last=f.entity.items.at(-1);if(last?.kind==='node')return last;const n=node();f.entity.items.push(n);return n;}
  function removeEntity(data,id){const f=find(data,id);if(!f)return;if(f.type==='group')data.groups.splice(f.index,1);else if(f.type==='chain'){const index=f.parent.chains.indexOf(f.entity);f.parent.chains.splice(index,1);if(!f.parent.chains.length)f.parent.chains.push(chain());}else if(f.type==='node')f.chain.items.splice(f.index,1);else{if(f.chain)f.chain.items.splice(f.index,1);delete data.photos[id];}}
  function empty(){return {version:1,title:'My faceboard',groups:[],photos:{},demo:false};}
  function portrait(i){
    const backgrounds=['#d6dfd2','#e3d3c3','#d2dce1','#e0d7d0','#d7ddc7','#d6d0df','#dedabf','#cddcd9','#e7d3c7','#d3d9db','#d4dfcf','#dfd4dd'];
    const skins=['#cc9a79','#e0b393','#a57857','#d6a480','#e9c7a4','#b58869'];const skin=skins[i%6],hair=['#4b3c32','#655047','#332d29','#8a6950','#473b30','#967453'][i%6],bg=backgrounds[i%12];
    const long=i%3===1,glasses=i%4===2;const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="264" height="240" viewBox="0 0 264 240"><defs><radialGradient id="b"><stop stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#111" stop-opacity=".03"/></radialGradient></defs><path fill="${bg}" d="M0 0h264v240H0z"/><circle cx="210" cy="38" r="105" fill="#fff" opacity=".14"/>${long?`<path fill="${hair}" d="M70 240V98q0-73 62-73t64 73v142z"/>`:''}<path d="M32 240q12-61 69-69h62q58 8 70 69" fill="${['#647967','#a17c67','#6b7d89','#8c8471','#84936d','#7d7182'][i%6]}"/><path fill="${skin}" d="M111 145h42v42q-21 16-42 0z"/><path fill="#000" opacity=".06" d="M111 145h42v20q-21 16-42-1z"/><ellipse cx="132" cy="105" rx="52" ry="66" fill="${skin}"/><ellipse cx="80" cy="112" rx="6" ry="12" fill="${skin}"/><ellipse cx="184" cy="112" rx="6" ry="12" fill="${skin}"/><path d="M79 99q-8-60 43-69 55-14 65 41l-3 31-12-29q-46 4-58-12-10 22-30 27z" fill="${hair}"/><path d="M101 104q9-5 16-1m31 0q9-4 17 2" fill="none" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><ellipse cx="111" cy="113" rx="3" ry="3.5" fill="#40392f"/><ellipse cx="155" cy="113" rx="3" ry="3.5" fill="#40392f"/><path d="m132 115-5 18h8" fill="none" stroke="#805b43" opacity=".4" stroke-width="2" stroke-linecap="round"/><path d="M117 145q15 9 30-1" fill="none" stroke="#865648" stroke-width="2.5" stroke-linecap="round"/>${glasses?'<g fill="none" stroke="#554d40" stroke-width="3"><rect x="93" y="104" width="33" height="22" rx="8"/><rect x="140" y="104" width="33" height="22" rx="8"/><path d="M126 111h14m-47 0H81m92 0h11"/></g>':''}${i%3===0?`<path d="M99 139q10 32 33 31 26-1 34-32-12 17-34 17t-33-16" fill="${hair}" opacity=".7"/>`:''}<path d="m101 176 31 27 31-27" fill="none" stroke="#fff" opacity=".3" stroke-width="2"/><path fill="url(#b)" d="M0 0h264v240H0z"/></svg>`;
    return 'data:image/svg+xml;base64,'+(typeof btoa==='function'?btoa(svg):Buffer.from(svg).toString('base64'));
  }
  function demo(){const d={version:1,title:'Portrait connections',groups:[],photos:{},demo:true};const p=i=>{const id=uid();d.photos[id]={id,kind:'photo',title:'Portrait '+String(i+1).padStart(2,'0'),description:'Illustrated sample. Replace with your own photo, or move it anywhere.',src:portrait(i),sample:true};return {kind:'photo',id};};
    const a=group(0);a.title='First impressions';a.description='A starting point for a closer look.';const n=node([p(2)]);n.title='A closer look';n.description='A junction can branch into as many chains as you need.';n.chains[0].title='Set A';n.chains[1].title='Set B';n.chains[1].items=[p(3)];a.chains[0].title='Main thread';a.chains[0].items=[p(0),p(1),n];
    const b=group(1);b.title='Common threads';b.description='Keep a few possibilities side by side.';b.chains=[chain('Set A',[p(4),p(5)]),chain('Set B',[p(6),p(7)])];b.chains[0].description='Each chain has its own title and notes.';
    const c=group(2);c.title='Still exploring';c.description='Room for the next connection.';c.chains[0].title='Open collection';c.chains[0].items=[p(8),p(9)];d.groups=[a,b,c];p(10);p(11);return d;
  }
  function validate(input){
    if(!input||input.version!==1||!Array.isArray(input.groups)||!input.photos||typeof input.photos!=='object'||Array.isArray(input.photos))throw Error('This is not a Faceboard backup.');
    const text=(v,max=20000)=>{if(typeof v!=='string'||v.length>max)throw Error('Invalid text in backup.');return v;};
    const d={version:1,title:text(input.title,200),groups:[],photos:{},demo:!!input.demo};const ids=new Set();const usedPhotos=new Set();let total=0;
    function id(v){text(v,150);if(!/^[A-Za-z0-9_-]+$/.test(v)||ids.has(v)||['__proto__','prototype','constructor'].includes(v))throw Error('Duplicate or invalid identifier.');ids.add(v);if(++total>20000)throw Error('This board has too many entries.');return v;}
    for(const [key,p]of Object.entries(input.photos)){if(!p||p.id!==key)throw Error('Invalid photo.');const photoId=id(key);const src=text(p.src,30000000);if(!/^data:image\/(jpeg|png|webp|gif|avif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(src))throw Error('Backup photos must be embedded images.');d.photos[photoId]={kind:'photo',id:photoId,title:text(p.title,500),description:text(p.description),src,sample:!!p.sample};}
    function readChain(c,depth){if(depth>100||c?.kind!=='chain'||!Array.isArray(c.items))throw Error('Invalid branch structure.');const out={kind:'chain',id:id(c.id),title:text(c.title,500),description:text(c.description),items:[]};c.items.forEach((it,index)=>{if(it?.kind==='photo'){if(typeof it.id!=='string'||!Object.hasOwn(d.photos,it.id)||usedPhotos.has(it.id))throw Error('A photo is missing or appears twice.');usedPhotos.add(it.id);out.items.push({kind:'photo',id:it.id});}else if(it?.kind==='node'&&index===c.items.length-1){out.items.push(readParent(it,'node',depth+1));}else throw Error('A junction must be at the end of a chain.');});return out;}
    function readParent(p,kind,depth){if(p?.kind!==kind||!Array.isArray(p.chains)||!p.chains.length)throw Error('Invalid group or junction.');const out={kind,id:id(p.id),title:text(p.title,500),description:text(p.description),chains:p.chains.map(c=>readChain(c,depth+1))};if(kind==='group'){if(!/^#[a-fA-F0-9]{6}$/.test(p.color))throw Error('Invalid group color.');out.color=p.color;}return out;}
    if(input.photoSize!==undefined){if(!Number.isInteger(input.photoSize)||input.photoSize<100||input.photoSize>360||input.photoSize%10!==0)throw Error('Invalid default photo size.');d.photoSize=input.photoSize;}
    for(const [key,p]of Object.entries(input.photos)){if(p.size!==undefined){if(!Number.isInteger(p.size)||p.size<100||p.size>360||p.size%10!==0)throw Error('Invalid photo size.');d.photos[key].size=p.size;}}
    d.groups=input.groups.map(g=>readParent(g,'group',0));return d;
  }
  const api={uid,palette,chain,node,group,walk,find,chains,placed,countPhotos,movePhoto,splitAfter,appendNode,removeEntity,empty,demo,validate,photoDimensions,resizePhoto,resizeAllPhotos};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoardModel=api;
})(typeof window==='undefined'?globalThis:window);
