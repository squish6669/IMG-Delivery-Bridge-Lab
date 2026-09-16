import fs from 'node:fs';
const p='index.html';
let s=fs.readFileSync(p,'utf8');
function rep(a,b,label){if(!s.includes(a))throw new Error('Missing marker: '+label);s=s.replace(a,b)}
rep('Support Services proof of delivery pilot · build 2026.09.09.1','Support Services proof of delivery pilot · build 2026.09.16.1','build');
rep('<div style="margin-top:10px"><label>Recipient Signature</label><canvas id="sig"></canvas>','<div style="margin-top:10px"><label>Signed By (print name) *</label><input id="signerName" autocomplete="name" placeholder="Full name of person signing"></div><div style="margin-top:10px"><label>Recipient Signature *</label><canvas id="sig"></canvas>','signer input');
rep("photoData=null;photoFile=null;sigHasInk=false;$('photo').value='';$('completionNotes').value='';clearSig();","photoData=null;photoFile=null;sigHasInk=false;$('photo').value='';$('signerName').value='';$('completionNotes').value='';clearSig();",'reset signer');
rep("['Completed',fmt(d.completed_at)],['Equipment',d.equipment]","['Completed',fmt(d.completed_at)],['Signed By',d.signer_name],['Equipment',d.equipment]",'receipt signer line');
rep("if(!sigHasInk)return alert('Recipient signature is required before completing the delivery.');try{const completedAt=new Date().toISOString(),completionNotes=$('completionNotes').value.trim();","if(!sigHasInk)return alert('Recipient signature is required before completing the delivery.');const signerName=$('signerName').value.trim();if(!signerName)return alert('Type the full name of the person signing for the delivery.');try{const completedAt=new Date().toISOString(),completionNotes=$('completionNotes').value.trim();",'require signer');
rep("receiptDelivery={...j.delivery,completion_notes:completionNotes};","receiptDelivery={...j.delivery,completion_notes:completionNotes,signer_name:signerName};",'receipt signer data');
fs.writeFileSync(p,s);
console.log('Signer name patch applied');
