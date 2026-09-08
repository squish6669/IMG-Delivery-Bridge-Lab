import fs from 'node:fs';

const path='index.html';
let html=fs.readFileSync(path,'utf8');

function replaceExact(from,to,label){
  if(!html.includes(from)) throw new Error(`Patch marker not found: ${label}`);
  html=html.replace(from,to);
}

replaceExact(
`<button class="btn primary" id="sharePdf">Share Receipt</button>`,
`<button class="btn primary" id="sharePdf">Send Receipt</button>`,
'send button');

replaceExact(
`$('receiptInfo').textContent='Receipt created for '+receiptDelivery.recipient_name+'. Tap Share Receipt, choose Outlook, and the PDF plus proof photo will be attached.';`,
`$('receiptInfo').textContent='Receipt created for '+receiptDelivery.recipient_name+'. Tap Send Receipt, choose Outlook, add the recipient address if Outlook does not carry it over, then send.';`,
'receipt guidance');

replaceExact(
`const share={title:'IMG Proof of Delivery',text:'Proof of delivery for '+receiptDelivery.recipient_name,files};`,
`const share={title:'IMG Proof of Delivery'+(receiptDelivery.ticket?' - '+receiptDelivery.ticket:''),text:'Recipient: '+(receiptDelivery.recipient_email||receiptDelivery.recipient_name)+'\\nProof of delivery for '+receiptDelivery.recipient_name,files};`,
'share metadata');

fs.writeFileSync(path,html);
console.log('Single-action receipt sending patch applied.');
