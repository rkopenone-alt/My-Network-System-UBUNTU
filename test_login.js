fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '919000000001', password: '123456' })
}).then(res => res.json()).then(console.log).catch(console.error);
