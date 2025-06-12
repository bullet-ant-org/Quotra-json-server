const express = require('express');
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const http = require('http');
const cron = require('node-cron');
const cors = require('cors');

const server = express();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;
const DB_FILE_PATH = 'db.json';
const BACKUP_DIR = path.join(__dirname, 'backups');

// --- Optional: Keep-Alive Pinger ---
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

// --- Optional: Daily Database Backup ---
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
  fs.readFile(DB_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Error reading ${DB_FILE_PATH} for backup:`, err);
      return;
    }
    fs.writeFile(backupFilePath, data, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`[${new Date().toISOString()}] Error writing backup to ${backupFilePath}:`, writeErr);
        return;
      }
      console.log(`[${new Date().toISOString()}] Database backed up successfully to ${backupFilePath}`);
    });
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

// --- Middleware ---
server.use(cors());
server.use(express.json());
server.use(middlewares);

// --- Static Files ---
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
server.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// --- API endpoint to get available routes from db.json ---
server.get('/api/routes', (req, res) => {
  const routes = Object.keys(router.db.getState());
  res.json(routes);
});

// --- Health check ---
server.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- Mount the json-server router ---
server.use(router);

// --- Start server ---
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  startKeepAlivePinger();
  scheduleDailyBackup();
});

// --- Graceful shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});