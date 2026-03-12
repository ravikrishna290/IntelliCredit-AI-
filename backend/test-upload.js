const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function upload() {
    const filePath = 'd:/Hydrabad Hackathon/Mock_Financial_Statement.pdf';
    const form = new FormData();
    form.append('document', fs.createReadStream(filePath));

    console.log('Sending to backend...');
    const res = await fetch('http://127.0.0.1:5000/api/analyze-document', {
        method: 'POST',
        body: form
    });

    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
}
upload();
