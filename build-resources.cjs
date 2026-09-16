// Run after changing any shipped resource, before publishing.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const game=fs.readFileSync(path.join(root,'game.html'),'utf8');
const urls=new Set(['index.html','game.html','launch.css','launch.js',...Array.from(game.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g),m=>m[1])]);
for(const f of fs.readdirSync(path.join(root,'assets')))if(/\.(png|jpe?g|webp|svg|mp3|ogg|wav)$/i.test(f))urls.add('assets/'+f);
const files=[...urls].sort().map(url=>{const file=path.join(root,url);let data=fs.readFileSync(file);if(/\.(html|css|js|svg)$/.test(url)){const text=data.toString('utf8').replace(/\r\n/g,'\n');if(text!==data.toString('utf8')){fs.writeFileSync(file,text);data=Buffer.from(text);}}return{url,bytes:data.length,revision:hash(data)};});
const version=hash(JSON.stringify(files)).slice(0,16);
fs.writeFileSync(path.join(root,'resource-manifest.js'),'self.GAME_RESOURCES='+JSON.stringify({version,files},null,2)+';\n');
const worker=path.join(root,'resource-worker.js');fs.writeFileSync(worker,fs.readFileSync(worker,'utf8').replace(/\/\/ manifest-version: .*/, '// manifest-version: '+version));
console.log(`${files.length} resources, ${(files.reduce((n,f)=>n+f.bytes,0)/1024/1024).toFixed(1)} MB; manifest ${version}`);
