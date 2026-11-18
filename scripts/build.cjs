// AI-generated with OpenAI Codex. See AI-GENERATED.md and LICENSE.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,'dist',name),'utf8').replace(/\r\n?/g,'\n');
let html=read('index.html');
const license=fs.readFileSync(path.join(root,'LICENSE'),'utf8');
html=html.replace('<head>',()=>'<head>\n<!-- AI-generated with OpenAI Codex from Jack\'s concept and direction.\n\n'+license+'\n-->');
html=html.replace('<link rel="stylesheet" href="styles.css">',()=>'<style>\n'+read('styles.css')+'\n</style>');
html=html.replace('<script src="model.js"></script>',()=>'<script>\n'+read('model.js')+'\n</script>');
html=html.replace('<script src="app.js"></script>',()=>'<script>\n'+read('app.js')+'\n</script>');
const hashes=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>"'sha256-"+crypto.createHash('sha256').update(m[1]).digest('base64')+"'");
if(hashes.length!==2)throw Error('Expected exactly two bundled scripts.');
html=html.replace("script-src 'self'",()=>"script-src "+hashes.join(' '));
fs.writeFileSync(path.join(root,'Faceboard.html'),html);
console.log('Built Faceboard.html ('+Buffer.byteLength(html)+' bytes).');
