const express = require('express');
const path = require('path');
const crypto = require('crypto'); // Using Node's crypto instead of OpenSSL
const fs = require('fs');
const { diffLines } = require('diff');
const app = express();
const PORT=3000;
require('dotenv').config()

// Simplified decryption using Node's crypto
function decryptData() {
  try {
    const password = process.env.DATA_DECRYPTION_PASSWORD;
    if (!password) throw new Error('Missing decryption password');
    
    const encrypted = fs.readFileSync(path.join(__dirname, 'public/data.enc'));
    const iv = encrypted.slice(0, 16); // IV is first 16 bytes
    const data = encrypted.slice(16);
    
    const key = crypto.scryptSync(password, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    
    return JSON.parse(decrypted.toString());
  } catch (err) {
    console.error('DECRYPTION FAILED:', err);
    return null;
  }
}
app.use(express.json());
// Enable JSX rendering
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// Serve static files (HTML, JS, CSS, JSON, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// New route for JSX-powered graph list
// app.get('/graphs-list', (req, res) => {
//   const graphData = require('./public/data.json'); // Load your JSON data
//   console.log("ho");
//   res.render('GraphsList', { graphs: graphData }); // Render JSX with data
// });

// Middleware to load decrypted data
let graphData;
app.use((req, res, next) => {
  if (!graphData) {
    graphData = decryptData();
    if (!graphData) {
      return res.status(500).send('Failed to load graph data');
    }
  }
  next();
});

// API endpoint for graph data
app.get('/api/graphs', (req, res) => {
  const start = parseInt(req.query.start) || 0; // Default to 0 if not specified
  const pageSize = 50; // Number of items per page
  
  // Validate start parameter
  if (isNaN(start) || start < 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start parameter'
    });
  }

  // Get paginated slice of data
  const paginatedData = graphData.slice(start, start + pageSize);

  res.json({
    success: true,
    data: paginatedData,
    pagination: {
      currentStart: start,
      nextStart: start + pageSize < graphData.length ? start + pageSize : null,
      totalGraphs: graphData.length
    }
  });
});
// Endpoint to fetch graph by hash
app.get('/api/graph/:hash', (req, res) => {
  const graph = graphData.find(g => g.hash === req.params.hash);
  
  if (graph) {
    res.json({
      success: true,
      data: graph
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Graph not found'
    });
  }
});
async function getGraphStateByHash(hash) {
  // 1. Try local cache
  const local = graphData.find(g => g.hash === hash);
  console.log("found it0")
  if (local && local.state) return local.state;

  // 2. Fallback: fetch from Desmos
  try {
    const res = await fetch(`https://www.desmos.com/calculator/${hash}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error('Desmos fetch failed');

    const json = await res.json();
    console.log("found it")
    return json.state;
  } catch (err) {
    console.error(`Failed to fetch Desmos graph ${hash}:`, err.message);
    return null;
  }
}

function sortedStringify(obj) {
  return JSON.stringify(sortKeysDeep(obj));
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  } else if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeysDeep(v)])
    );
  }
  return value;
}

app.post('/api/diff',  (req, res) => {
  const { state1, state2 } = req.body;

  if (!state1 || !state2) {
    return res.status(400).json({ success: false, message: 'Both state1 and state2 are required' });
  }
  const list1=state1.expressions?.list || []
  const list2=state2.expressions?.list || []
  const expr1 = list1.map(x=>sortedStringify(x)).join('\n');
  const expr2 = list2.map(x=>sortedStringify(x)).join('\n');

  const diff = diffLines(expr1, expr2);

  res.json({
    success: true,
    diff,
    removeCount: diff.filter(part => part.removed).length,
    addCount: diff.filter(part => part.added).length,
    list1,list2
  });
});
// HTML route
app.get('/graphs-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/graphs-list.html'));
});
app.get('/diff', (req, res) => {
  const { hash1, hash2 } = req.query;
  res.redirect(`/diff.html?hash1=${hash1}&hash2=${hash2}`);
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports=app