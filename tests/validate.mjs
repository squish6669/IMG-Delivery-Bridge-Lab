import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const worker=fs.readFileSync('worker/src/index.js','utf8');
const schema=fs.readFileSync('worker/schema.sql','utf8');
const requiredHtml=['IMG Delivery','Upcoming','New Delivery','Completed','Settings','saveDelivery','startDrop','completeDelivery','sharePdf','apiUrl','workspace'];
const requiredWorker=['/health','/deliveries','workspace_required','env.DB','crypto.randomUUID'];
const requiredSchema=['CREATE TABLE IF NOT EXISTS deliveries','workspace_id','completed_at'];
const missing=[...requiredHtml.filter(x=>!html.includes(x)).map(x=>'html:'+x),...requiredWorker.filter(x=>!worker.includes(x)).map(x=>'worker:'+x),...requiredSchema.filter(x=>!schema.includes(x)).map(x=>'schema:'+x)];
if(missing.length){console.error('Missing required markers:',missing);process.exit(1)}
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(!scripts.length){console.error('No inline script found');process.exit(1)}
fs.writeFileSync('/tmp/img-delivery-inline.js',scripts.join('\n'));
console.log('Frontend, Worker and schema markers: PASS');
