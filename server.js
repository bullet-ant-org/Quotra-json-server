const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Path to your db.json file
const middlewares = jsonServer.defaults();
const fs = require('fs'); // fs is used for backups, not directly for serving index.html here
const path = require('path');
const http = require('http');
const cron = require('node-cron');

const port = process.env.PORT || 3000;
const DB_FILE_PATH = 'db.json';
const BACKUP_DIR = path.join(__dirname, 'backups');

// --- Keep-Alive Pinger ---
function startKeepAlivePinger() {
  const pingInterval = 10 * 60 * 1000; // 10 minutes

  const pingSelf = () => {
    const options = {
      hostname: 'localhost', // Pinging internal host
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
  pingSelf(); // Initial ping
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
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
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
  // Schedule to run at 02:00 AM server time (UTC by default for cron)
  cron.schedule('0 2 * * *', () => {
    console.log(`[${new Date().toISOString()}] Running daily database backup...`);
    backupDatabase();
  }, {
    scheduled: true,
    timezone: "Etc/UTC" // Using UTC for consistency on servers
  });
  console.log('Daily database backup scheduled for 02:00 AM UTC.');

  // Optional: Perform an initial backup on server start
  // console.log('Performing initial backup on server start...');
  // backupDatabase();
}

// --- Server Setup ---
server.use(middlewares);

// Serve index.html for the root path
server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve style.css
server.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// Custom /ping route for health checks and keep-alive
server.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Mount the json-server router
server.use(router); // Ensure this is after any custom routes like /ping

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);

  // Start the keep-alive pinger
  startKeepAlivePinger();

  // Schedule daily backups
  scheduleDailyBackup();
});

// Handle graceful shutdown (optional but good practice)
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});