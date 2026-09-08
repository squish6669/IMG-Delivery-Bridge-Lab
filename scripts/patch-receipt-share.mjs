import fs from 'node:fs';

const path='index.html';
let html=fs.readFileSync(path,'utf8');

function replaceExact(from,to,label){
  if(!html.includes(from)) throw new Error(`Patch marker not found: ${label}`);
  html=html.replace(from,to);
}

replaceExact(
`<section id="receipt" class="hidden"><div class="card"><h2>Receipt Ready</h2><div class="row"><button class="btn primary" id="sharePdf">Share PDF</button><button class="btn secondary" id="openEmail">Open Email</button><button class="btn secondary" id="backQueue">Back to Queue</button></div><div id="receiptInfo" class="muted" style="margin-top:10px"></div></div></section>`,
`<section id="receipt" class="hidden"><div class="card"><h2>Receipt Ready</h2><div class="row"><button class="btn primary" id="sharePdf">Share Receipt</button><button class="btn secondary" id="backQueue">Back to Queue</button></div><div id="receiptInfo" class="muted" style="margin-top:10px"></div></div></section>`,
'receipt buttons');

replaceExact(
`let deliveries=[],editingId=null,dropId=null,receiptBlob=null,receiptDelivery=null,photoData=null;`,
`let deliveries=[],editingId=null,dropId=null,receiptBlob=null,receiptDelivery=null,photoData=null,photoFile=null,sigHasInk=false;`,
'state');

replaceExact(
`window.startDrop=id=>{const d=deliveries.find(x=>x.id===id);if(!d)return;dropId=id;photoData=null;$('photo').value='';$('completionNotes').value='';clearSig();`,
`window.startDrop=id=>{const d=deliveries.find(x=>x.id===id);if(!d)return;dropId=id;photoData=null;photoFile=null;sigHasInk=false;$('photo').value='';$('completionNotes').value='';clearSig();`,
'dropoff reset');

replaceExact(
`$('photo').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f){photoData=null;return}const r=new FileReader();r.onload=()=>photoData=r.result;r.readAsDataURL(f)};`,
`$('photo').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f){photoData=null;photoFile=null;return}photoFile=f;const r=new FileReader();r.onload=()=>photoData=r.result;r.readAsDataURL(f)};`,
'photo handler');

replaceExact(
`const canvas=$('sig'),ctx=canvas.getContext('2d');function resizeSig(){const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.scale(dpr,dpr);ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#111'}resizeSig();window.addEventListener('resize',resizeSig);let drawing=false;`,
`const canvas=$('sig'),ctx=canvas.getContext('2d');function resizeSig(){const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#111'}resizeSig();window.addEventListener('resize',resizeSig);let drawing=false;`,
'signature resize');

replaceExact(
`canvas.onpointermove=e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(...p);ctx.stroke()};canvas.onpointerup=canvas.onpointercancel=()=>drawing=false;function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height)}$('clearSig').onclick=clearSig;`,
`canvas.onpointermove=e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(...p);ctx.stroke();sigHasInk=true};canvas.onpointerup=canvas.onpointercancel=()=>drawing=false;function clearSig(){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.restore();sigHasInk=false}$('clearSig').onclick=clearSig;`,
'signature tracking');

replaceExact(
`$('completeDelivery').onclick=async()=>{const d=deliveries.find(x=>x.id===dropId);if(!d)return;try{`,
`$('completeDelivery').onclick=async()=>{const d=deliveries.find(x=>x.id===dropId);if(!d)return;if(!photoData||!photoFile)return alert('Take a proof photo before completing the delivery.');if(!sigHasInk)return alert('Recipient signature is required before completing the delivery.');try{`,
'completion validation');

replaceExact(
`$('receiptInfo').textContent='Receipt created for '+receiptDelivery.recipient_name+'. Share PDF opens the iPhone share sheet so Outlook can receive the attachment.';`,
`$('receiptInfo').textContent='Receipt created for '+receiptDelivery.recipient_name+'. Tap Share Receipt, choose Outlook, and the PDF plus proof photo will be attached.';`,
'receipt guidance');

replaceExact(
`$('sharePdf').onclick=async()=>{if(!receiptBlob)return;const f=new File([receiptBlob],\`IMG-Delivery-\${receiptDelivery.ticket||receiptDelivery.id}.pdf\`,{type:'application/pdf'});try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({title:'IMG Proof of Delivery',files:[f]});else{const a=document.createElement('a');a.href=URL.createObjectURL(receiptBlob);a.download=f.name;a.click()}}catch(e){if(e.name!=='AbortError')alert(e.message)}};\n$('openEmail').onclick=()=>{if(!receiptDelivery)return;const sub=encodeURIComponent('IMG Proof of Delivery'+(receiptDelivery.ticket?' - '+receiptDelivery.ticket:''));const body=encodeURIComponent('Proof of delivery is ready. Attach the PDF generated by IMG Delivery.');location.href=\`mailto:\${encodeURIComponent(receiptDelivery.recipient_email||'')}?subject=\${sub}&body=\${body}\`};`,
`$('sharePdf').onclick=async()=>{if(!receiptBlob||!receiptDelivery)return;const base=receiptDelivery.ticket||receiptDelivery.id;const pdf=new File([receiptBlob],\`IMG-Delivery-\${base}.pdf\`,{type:'application/pdf'});const files=[pdf];if(photoFile){const type=photoFile.type||'image/jpeg';const ext=(photoFile.name&&photoFile.name.includes('.'))?'.'+photoFile.name.split('.').pop():(type.includes('png')?'.png':'.jpg');files.push(new File([photoFile],\`IMG-Delivery-Photo-\${base}\${ext}\`,{type}));}const share={title:'IMG Proof of Delivery',text:'Proof of delivery for '+receiptDelivery.recipient_name,files};try{if(navigator.canShare&&navigator.canShare({files}))await navigator.share(share);else if(navigator.canShare&&navigator.canShare({files:[pdf]}))await navigator.share({title:share.title,text:share.text,files:[pdf]});else{const a=document.createElement('a');a.href=URL.createObjectURL(receiptBlob);a.download=pdf.name;a.click();alert('This browser could not hand the receipt directly to Outlook. The PDF was downloaded instead.');}}catch(e){if(e.name!=='AbortError')alert(e.message)}};`,
'share handler');

fs.writeFileSync(path,html);
console.log('Receipt sharing patch applied.');
