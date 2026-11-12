const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');
const FPS=30,W=+process.env.WORKERS||4;
(async()=>{const b=await chromium.launch();
 const mk=async()=>{const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:2});await p.addInitScript(v=>{window.VO=v},JSON.parse(fs.readFileSync(__dirname+'/../vo/vo.json')));
   await p.goto('file://'+__dirname+'/index.html#render');await p.waitForFunction(()=>window.READY);return p};
 const p0=await mk();const total=await p0.evaluate(()=>TOTAL);fs.writeFileSync('write.json',JSON.stringify(await p0.evaluate(()=>WRITE)));fs.writeFileSync('scenes.json',JSON.stringify(await p0.evaluate(()=>SCENES)));
 const N=Math.ceil(total*FPS),per=Math.ceil(N/W);console.log('frames',N);
 const job=async(w,p)=>{const a=w*per,e=Math.min(N,a+per);
   const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',''+FPS,'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','16','-pix_fmt','yuv420p','-r',''+FPS,`seg${w}.mp4`]);
   const done=new Promise(r=>ff.on('close',r));
   for(let i=a;i<e;i++){await p.evaluate(t=>renderAt(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:94});
     if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(w===0&&i%100===0)console.log('w0',i-a,'/',e-a)}
   ff.stdin.end();await done};
 const pages=[p0];for(let w=1;w<W;w++)pages.push(await mk());
 await Promise.all(pages.map((p,w)=>job(w,p)));await b.close();
 fs.writeFileSync('segs.txt',[...Array(W).keys()].map(w=>`file 'seg${w}.mp4'`).join('\n'));console.log('ok')})();
