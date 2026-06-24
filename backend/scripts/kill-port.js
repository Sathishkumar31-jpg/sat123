// scripts/kill-port.js
// Kills any process listening on the given port before the server starts.
// Usage: node scripts/kill-port.js <port>

const { execSync } = require('child_process');
const port = process.argv[2] || 5000;

try {
    if (process.platform === 'win32') {
        // Windows: find the PID using netstat, then kill it
        const result = execSync(
            `netstat -ano | findstr :${port} | findstr LISTENING`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
        );

        const lines = result.trim().split('\n');
        const killed = new Set();

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && !killed.has(pid)) {
                try {
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
                    console.log(`✅ Killed process on port ${port} (PID: ${pid})`);
                    killed.add(pid);
                } catch (e) {
                    // PID may have already exited
                }
            }
        }
    } else {
        // macOS/Linux
        execSync(`lsof -ti tcp:${port} | xargs kill -9 2>/dev/null || true`);
        console.log(`✅ Cleared port ${port}`);
    }
} catch (e) {
    // Port was already free — all good
    console.log(`✅ Port ${port} is free`);
}
