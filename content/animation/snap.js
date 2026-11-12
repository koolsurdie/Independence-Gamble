const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+__dirname+'/index.html#render');await p.waitForFunction(()=>window.READY);
const sc=await p.evaluate(()=>SCENES);console.log('TOTAL',await p.evaluate(()=>TOTAL),JSON.stringify(sc.map(s=>s.map(v=>+v.toFixed(2)))));
const ts=(process.argv[2]?process.argv[2].split(',').map(Number):sc.map(s=>s[1]-0.6));
for(let i=0;i<ts.length;i++){await p.evaluate(t=>renderAt(t),ts[i]);await p.screenshot({path:`snap_${String(i).padStart(2,'0')}.png`})}
await b.close()})();
