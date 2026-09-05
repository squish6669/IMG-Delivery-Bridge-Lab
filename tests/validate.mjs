import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const required=['IMG Delivery Bridge Lab','runNetwork','testShare','photo','copyReport','downloadReport','supabase.com','firebase.google.com','cloudflare.com','netlify.com'];
const missing=required.filter(x=>!html.includes(x));
if(missing.length){console.error('Missing required markers:',missing);process.exit(1)}
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(!scripts.length){console.error('No inline script found');process.exit(1)}
fs.writeFileSync('/tmp/img-bridge-inline.js',scripts.join('\n'));
console.log('Static markers: PASS');
