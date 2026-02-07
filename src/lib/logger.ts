// Logging utility for Selective Disclosure System

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'verifier' | 'wallet' | 'system';
  action: string;
  data?: any;
  requestId?: string;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep fewer in memory since we're storing in files
  private logEndpoint = 'http://localhost:3001/api/logs';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private async sendToServer(entry: LogEntry) {
    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silent fail if server is not available
    }
  }

  private addLog(entry: LogEntry) {
    const logEntry = {
      ...entry,
      timestamp: this.formatTimestamp()
    };

    // Add to memory (limited cache)
    this.logs.unshift(logEntry);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Send to file storage server
    this.sendToServer(logEntry);
  }

  info(category: LogEntry['category'], action: string, data?: any, requestId?: string) {
    this.addLog({ level: 'info', category, action, data, requestId });
  }

  warn(category: LogEntry['category'], action: string, data?: any, requestId?: string) {
    this.addLog({ level: 'warn', category, action, data, requestId });
  }

  error(category: LogEntry['category'], action: string, data?: any, requestId?: string) {
    this.addLog({ level: 'error', category, action, data, requestId });
  }

  debug(category: LogEntry['category'], action: string, data?: any, requestId?: string) {
    this.addLog({ level: 'debug', category, action, data, requestId });
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const response = await fetch(this.logEndpoint);
      if (response.ok) {
        const serverLogs = await response.json();
        return serverLogs;
      }
    } catch (error) {
      // Fallback to memory cache if server unavailable
    }
    return this.logs;
  }

  async getLogsByCategory(category: LogEntry['category']): Promise<LogEntry[]> {
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.category === category);
  }

  async getLogsByRequestId(requestId: string): Promise<LogEntry[]> {
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.requestId === requestId);
  }

  async clearLogs() {
    try {
      await fetch(this.logEndpoint, { method: 'DELETE' });
    } catch (error) {
      // Silent fail
    }
    this.logs = [];
  }

  async exportLogs(): Promise<string> {
    const allLogs = await this.getLogs();
    return JSON.stringify(allLogs, null, 2);
  }

  async getLogFiles(): Promise<any[]> {
    try {
      const response = await fetch(`${this.logEndpoint}/files`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Silent fail
    }
    return [];
  }
}

// Global logger instance
export const logger = new Logger();

// Helper function to generate request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}