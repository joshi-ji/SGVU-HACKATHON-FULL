import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const LOGS_DIR = path.join(__dirname, 'logs');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure logs directory exists
async function ensureLogsDir() {
  try {
    await fs.access(LOGS_DIR);
  } catch {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  }
}

// Get log file path for today
function getTodayLogFile() {
  const today = new Date().toISOString().split('T')[0];
  return path.join(LOGS_DIR, `selective-disclosure-${today}.log`);
}

// POST /api/logs - Add new log entry
app.post('/api/logs', async (req, res) => {
  try {
    const logEntry = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = getTodayLogFile();
    
    await fs.appendFile(logFile, logLine);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error writing log:', error);
    res.status(500).json({ error: 'Failed to write log' });
  }
});

// GET /api/logs - Get all logs
app.get('/api/logs', async (req, res) => {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();
    
    let allLogs = [];
    
    for (const file of logFiles) {
      const content = await fs.readFile(path.join(LOGS_DIR, file), 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      
      for (const line of lines) {
        try {
          allLogs.push(JSON.parse(line));
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
    
    res.json(allLogs);
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// GET /api/logs/files - Get list of log files
app.get('/api/logs/files', async (req, res) => {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const logFiles = files.filter(f => f.endsWith('.log')).sort().reverse();
    
    const fileInfo = [];
    for (const file of logFiles) {
      const stats = await fs.stat(path.join(LOGS_DIR, file));
      fileInfo.push({
        name: file,
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    }
    
    res.json(fileInfo);
  } catch (error) {
    console.error('Error reading log files:', error);
    res.status(500).json({ error: 'Failed to read log files' });
  }
});

// DELETE /api/logs - Clear all logs
app.delete('/api/logs', async (req, res) => {
  try {
    const files = await fs.readdir(LOGS_DIR);
    const logFiles = files.filter(f => f.endsWith('.log'));
    
    for (const file of logFiles) {
      await fs.unlink(path.join(LOGS_DIR, file));
    }
    
    res.json({ success: true, deleted: logFiles.length });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Start server
async function start() {
  await ensureLogsDir();
  app.listen(PORT, () => {
    console.log(`Logging service running on http://localhost:${PORT}`);
    console.log(`Logs stored in: ${LOGS_DIR}`);
  });
}

start();