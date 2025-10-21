# 🧮 DesHost: Self-Hosted Desmos Graph Showcase

**DesHost** lets you **self-host your own Desmos graph collection**. View, share, and compare your graphs easily from your own Vercel deployment.

Your graphs are **stored securely** in an encrypted `data.enc` file (so they remain private and portable), while still allowing you to view other people’s shared graphs by hash.

---

## 🚀 Features

* 📂 **Self-hosted Desmos gallery**: view all your graphs, even if Desmos is down.
* 🔐 **Encrypted storage**: graphs are stored locally in `data.enc` using AES-256 encryption.
* 🔗 **Share by link**: open any graph by hash:

  ```
  https://your-vercel-app.vercel.app/#<your_hash>
  https://your-vercel-app.vercel.app/?hash=<any_hash>
  ```
* 🔄 **Graph diffing**: compare two graphs side-by-side or see changes between versions:

  ```
  https://your-vercel-app.vercel.app/diff.html?hash1=<hash1>&hash2=<hash2>
  ```

Example: My hosted version [deshost.vercel.app](https://deshost.vercel.app). Try it out!

---

## 🧮 How It Works

* You export your Desmos graphs using a script.
* They’re saved as `data.json`, then encrypted into `data.enc`.
* Your hosted app decrypts this file at runtime using a password you define.
* The app serves your saved graphs and can open or compare any graph hash.

---

## ⚙️ Setup Guide

### 1️⃣ Fork the Repository

Click **Fork** → **Create fork**

```bash
# Clone the repo
git clone https://github.com/<your-username>/deshost.git
cd deshost
```

---

### 2️⃣ View Locally

Delete the `data.enc` file.

Install dependencies and start the local server:

```bash
npm install
npm run start
```

Now visit [http://localhost:3000](http://localhost:3000) to open your local DesHost instance.

---

### 3️⃣ Export Your Desmos Graphs

Run this Desmos console script to export all your graphs:
👉 [Download Data Script (Gist)](https://gist.github.com/MathEnthusiast314/7785658b7176a14f194d307b53ff29ad)

If you want to export only a specific set of desmos graphs, modify `t` in line 1 to be the list of those hashes.

It will automatically download a file called `data.json`.

Move `data.json` into your project’s `public/` folder:

```
/public/data.json
```

---

### 4️⃣ Generate the Encrypted File (`data.enc`)

Run the provided script to encrypt your graphs:

```bash
node create-encrypted.js
```

Here’s the encryption script:
Replace `{password_for_data.enc}` with your own password for generating `data.enc`

```js
// create-encrypted.js
const crypto = require('crypto');
const fs = require('fs');

const password = '{password_for_data.enc}';
const data = require('./public/data.json');

const iv = crypto.randomBytes(16);
const key = crypto.scryptSync(password, 'salt', 32);
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

const encrypted = Buffer.concat([
  iv,
  cipher.update(JSON.stringify(data)),
  cipher.final()
]);

fs.writeFileSync('public/data.enc', encrypted);
console.log('New data.enc created');
```

This generates `public/data.enc`.
You can now remove `data.json` or add it to `.gitignore`.

---

### 5️⃣ Commit and Push

```bash
git add public/data.enc
git commit -m "Added encrypted graph data"
git push
```

---

### 6️⃣ Deploy to Vercel

You can deploy directly from GitHub:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo.
3. Click **Deploy**.

---

### 7️⃣ Set Environment Variable on Vercel

After deployment, go to:

> **Vercel → Project → Settings → Environment Variables**

Add:

```
DATA_DECRYPTION_PASSWORD = {password_for_data.enc}
```

This password must match the one you used in `create-encrypted.js`.

---

### 8️⃣ Enable Git LFS Support on Vercel

If your project uses Git LFS:

1. Open your **Vercel Project Settings → Git**.
2. Enable **“Git LFS Support”**.
3. Redeploy.

Without this, Vercel will only have a 1 KB LFS pointer file instead of the full binary.

---

### ✅ That’s It!

Once deployed, you’ll get a link like:

```
https://your-vercel-app.vercel.app
```

Use it to:

* View your own graphs
  `https://your-vercel-app.vercel.app/#<your_hash>`
* Open anyone’s graph
  `https://your-vercel-app.vercel.app/?hash=<other_hash>`
* View the previous version of a loaded graph
* Compare a graph with its previous version
* Compare any two versions
  `https://your-vercel-app.vercel.app/diff.html?hash1=<h1>&hash2=<h2>`

---

## 🧩 Example

> **My hosted version:** [deshost.vercel.app](https://deshost.vercel.app)

Your graphs can be stored privately while still being browsable, backed up, and shareable.
If Desmos is ever down, your graphs are safe and viewable from your own DesHost instance.