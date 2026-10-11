// create-encrypted.js
const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Password for data.enc: ', (password) => {
  rl.close();
  const data = require('./public/data.json');
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([iv, cipher.update(JSON.stringify(data)), cipher.final()]);
  fs.writeFileSync('public/data.enc', encrypted);
  console.log('New data.enc created');
});