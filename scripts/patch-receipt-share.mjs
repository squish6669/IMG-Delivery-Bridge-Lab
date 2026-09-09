import fs from 'node:fs';

const path='index.html';
let html=fs.readFileSync(path,'utf8');

function replaceExact(from,to,label){
  if(!html.includes(from)) throw new Error(`Patch marker not found: ${label}`);
  html=html.replace(from,to);
}

replaceExact(
`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">`,
`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">`,
'cache metadata');

replaceExact(
`<header><h1>IMG Delivery</h1><div class="sub">Support Services proof of delivery pilot</div><nav>`,
`<header><h1>IMG Delivery</h1><div class="sub">Support Services proof of delivery pilot · build 2026.09.09.1</div><nav>`,
'build label');

replaceExact(
`done.forEach(d=>$('completedList').insertAdjacentHTML('beforeend',\`<div class="delivery"><h3>\${esc(d.recipient_name)}</h3><div>\${esc(d.location||'')} · Completed \${esc(fmt(d.completed_at))}</div><div class="muted">\${esc(d.equipment||'')}</div></div>\`))}`,
`done.forEach(d=>$('completedList').insertAdjacentHTML('beforeend',\`<div class="delivery"><h3>\${esc(d.recipient_name)}</h3><div>\${esc(d.location||'')} · Completed \${esc(fmt(d.completed_at))}</div><div class="muted">\${esc(d.equipment||'')}</div><div class="row" style="margin-top:8px"><button class="btn primary" onclick="reopenReceipt('\${d.id}')">Reopen Receipt</button></div></div>\`))}`,
'completed reopen button');

replaceExact(
`$('refresh').onclick=loadQueue;`,
`$('refresh').onclick=loadQueue;\nconst RECEIPT_DB='img-delivery-receipts',RECEIPT_STORE='receipts';function receiptDb(){return new Promise((res,rej)=>{const r=indexedDB.open(RECEIPT_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(RECEIPT_STORE))r.result.createObjectStore(RECEIPT_STORE,{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}async function saveReceiptLocal(id,blob){const db=await receiptDb();await new Promise((res,rej)=>{const tx=db.transaction(RECEIPT_STORE,'readwrite');tx.objectStore(RECEIPT_STORE).put({id,blob,saved_at:new Date().toISOString()});tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}async function loadReceiptLocal(id){const db=await receiptDb();const row=await new Promise((res,rej)=>{const tx=db.transaction(RECEIPT_STORE,'readonly');const r=tx.objectStore(RECEIPT_STORE).get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)});db.close();return row}`,
'local receipt store');

replaceExact(
`receiptDelivery={...j.delivery,completion_notes:completionNotes};receiptBlob=await buildReceipt(receiptDelivery);$('receiptInfo').textContent='Receipt created for '+receiptDelivery.recipient_name+'. Tap Send Receipt, choose Outlook, add the recipient address if Outlook does not carry it over, then send.';show('receipt');await loadQueue()`,
`receiptDelivery={...j.delivery,completion_notes:completionNotes};receiptBlob=await buildReceipt(receiptDelivery);await saveReceiptLocal(receiptDelivery.id,receiptBlob);$('receiptInfo').textContent='Receipt ready. Tap Send Receipt, choose Outlook, then paste the recipient address into To. The address is copied automatically.';show('receipt');await loadQueue()`,
'completion save and guidance');

replaceExact(
`$('sharePdf').onclick=async()=>{`,
`window.reopenReceipt=async id=>{const d=deliveries.find(x=>x.id===id);if(!d)return;try{const saved=await loadReceiptLocal(id);if(!saved||!saved.blob)return alert('This receipt is not saved on this device. Receipts completed after this update can be reopened and resent here.');receiptDelivery=d;receiptBlob=saved.blob;photoFile=null;$('receiptInfo').textContent='Receipt reopened. Tap Send Receipt, choose Outlook, then paste the recipient address into To. The address is copied automatically.';show('receipt')}catch(e){alert('Could not reopen receipt: '+e.message)}};\nfunction copyRecipient(email){if(!email)return false;const t=document.createElement('textarea');t.value=email;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();t.setSelectionRange(0,99999);let ok=false;try{ok=document.execCommand('copy')}catch{}document.body.removeChild(t);return ok}\n$('sharePdf').onclick=async()=>{`,
'reopen and copy helpers');

replaceExact(
`if(!receiptBlob||!receiptDelivery)return;const base=receiptDelivery.ticket||receiptDelivery.id;const pdf=new File([receiptBlob],\`IMG-Delivery-\${base}.pdf\`,{type:'application/pdf'});const files=[pdf];if(photoFile){const type=photoFile.type||'image/jpeg';const ext=(photoFile.name&&photoFile.name.includes('.'))?'.'+photoFile.name.split('.').pop():(type.includes('png')?'.png':'.jpg');files.push(new File([photoFile],\`IMG-Delivery-Photo-\${base}\${ext}\`,{type}));}const share={title:'IMG Proof of Delivery'+(receiptDelivery.ticket?' - '+receiptDelivery.ticket:''),text:'Recipient: '+(receiptDelivery.recipient_email||receiptDelivery.recipient_name)+'\\nProof of delivery for '+receiptDelivery.recipient_name,files};try{if(navigator.canShare&&navigator.canShare({files}))await navigator.share(share);else if(navigator.canShare&&navigator.canShare({files:[pdf]}))await navigator.share({title:share.title,text:share.text,files:[pdf]});else{const a=document.createElement('a');a.href=URL.createObjectURL(receiptBlob);a.download=pdf.name;a.click();alert('This browser could not hand the receipt directly to Outlook. The PDF was downloaded instead.');}}catch(e){if(e.name!=='AbortError')alert(e.message)}};`,
`if(!receiptBlob||!receiptDelivery)return;const base=receiptDelivery.ticket||receiptDelivery.id;const pdf=new File([receiptBlob],\`IMG-Delivery-\${base}.pdf\`,{type:'application/pdf'});const files=[pdf];const email=receiptDelivery.recipient_email||'';const copied=copyRecipient(email);$('receiptInfo').textContent=(copied?'Recipient email copied: '+email+'. ':'')+'Choose Outlook, paste into To, and send. The PDF includes the proof photo and recipient signature.';const share={title:'IMG Proof of Delivery'+(receiptDelivery.ticket?' - '+receiptDelivery.ticket:''),text:'Proof of delivery for '+receiptDelivery.recipient_name,files};try{if(navigator.canShare&&navigator.canShare({files}))await navigator.share(share);else{const a=document.createElement('a');a.href=URL.createObjectURL(receiptBlob);a.download=pdf.name;a.click();alert('This browser could not hand the receipt directly to Outlook. The PDF was downloaded instead.');}}catch(e){if(e.name!=='AbortError')alert(e.message)}};`,
'simplified send handler');

html=html.replace(/<button class="btn secondary" id="openEmail">Open Email<\/button>/g,'');
html=html.replace(/\$\('openEmail'\)\.onclick=.*?;(?=\n|<\/script>)/g,'');

fs.writeFileSync(path,html);
console.log('Receipt resend/send-flow patch applied.');
