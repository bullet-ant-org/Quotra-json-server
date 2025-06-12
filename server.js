const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const http = require('http');
const cron = require('node-cron');
const fs = require('fs');
const cors = require('cors');

const serviceAccount = require('./firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://quotra-backend-default-rtdb.firebaseio.com/" // Replace with your database URL
});

const db = admin.database();
const server = express();
server.use(express.json());
server.use(cors());

const port = process.env.PORT || 3000;
const BACKUP_DIR = path.join(__dirname, 'backups');

// --- Keep-Alive Pinger ---
function startKeepAlivePinger() {
  const pingInterval = 10 * 60 * 1000; // 10 minutes

  const pingSelf = () => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/ping',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      console.log(`[${new Date().toISOString()}] Keep-alive ping status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Keep-alive ping error:`, error.message);
    });

    req.end();
  };

  setInterval(pingSelf, pingInterval);
  console.log(`Keep-alive pinger started. Pinging http://localhost:${port}/ping every 10 minutes.`);
  pingSelf();
}

// --- Daily Database Backup ---
function ensureBackupDirExists() {
  if (!fs.existsSync(BACKUP_DIR)) {
    try {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`Backup directory created at ${BACKUP_DIR}`);
    } catch (err) {
      console.error(`Error creating backup directory ${BACKUP_DIR}:`, err);
    }
  }
}

function backupDatabase() {
  ensureBackupDirExists();
  const timestamp = new Date().toISOString().split('T')[0];
  const backupFileName = `db-${timestamp}.json`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  db.ref('/').once('value', (snapshot) => {
    fs.writeFile(backupFilePath, JSON.stringify(snapshot.val(), null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`[${new Date().toISOString()}] Error writing backup to ${backupFilePath}:`, writeErr);
        return;
      }
      console.log(`[${new Date().toISOString()}] Database backed up successfully to ${backupFilePath}`);
    });
  }, (err) => {
    console.error(`[${new Date().toISOString()}] Error reading database for backup:`, err);
  });
}

function scheduleDailyBackup() {
  cron.schedule('0 2 * * *', () => {
    console.log(`[${new Date().toISOString()}] Running daily database backup...`);
    backupDatabase();
  }, {
    scheduled: true,
    timezone: "Etc/UTC"
  });
  console.log('Daily database backup scheduled for 02:00 AM UTC.');
}

// --- Static Files ---
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
server.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// --- API Endpoints Example (users, assets, etc.) ---
const endpoints = [
  'users', 'assets', 'assetOrders', 'loanTypes', 'adminDashboardSummary', 'adminSettings',
  'transactions', 'depositRequests', 'withdrawalRequests', 'activities', 'bonuses', 'loanOrders'
];

// GET all items in a collection or object
endpoints.forEach(key => {
  server.get(`/${key}`, async (req, res) => {
    try {
      const snapshot = await db.ref(key).once('value');
      res.json(snapshot.val());
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST (add) to array collections only (skip for objects like adminDashboardSummary)
  if (key !== 'adminDashboardSummary') {
    server.post(`/${key}`, async (req, res) => {
      try {
        const ref = db.ref(key).push();
        await ref.set(req.body);
        res.status(201).json({ id: ref.key, ...req.body });
      } catch (err) {
        console.error(`Error posting to ${key}:`, err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  // PUT (replace) for objects or update for arrays
  server.put(`/${key}/:id`, async (req, res) => {
    try {
      await db.ref(`${key}/${req.params.id}`).set(req.body);
      res.json({ id: req.params.id, ...req.body });
    } catch (err) {
      console.error(`Error updating ${key}:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE by id for arrays
  server.delete(`/${key}/:id`, async (req, res) => {
    try {
      await db.ref(`${key}/${req.params.id}`).remove();
      res.status(204).end();
    } catch (err) {
      console.error(`Error deleting from ${key}:`, err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// --- List available routes ---
server.get('/api/routes', (req, res) => {
  res.json(endpoints);
});

// --- Health check ---
server.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- Start Server ---
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  startKeepAlivePinger();
  scheduleDailyBackup();
});

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});