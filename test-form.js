const { FormData } = require('undici');
const f = new FormData();
f.append('name', 'uday');
console.log(f.get('name') || 'N/A');
console.log(f ? String(f.get('phone') || 'N/A') : 'N/A');
