/**
 * IntelliCredit AI — One-command launcher
 * Run: node start.js
 * Starts backend (port 5000) and frontend (port 5173) together.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const backend = path.join(root, 'backend');
const frontend = path.join(root, 'intellicredit');

const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';

function run(label, color, cmd, args, cwd) {
    const proc = spawn(cmd, args, { cwd, shell: true, stdio: 'pipe' });
    proc.stdout.on('data', d => process.stdout.write(`${color}[${label}]${RESET} ${d}`));
    proc.stderr.on('data', d => process.stdout.write(`${color}[${label}]${RESET} ${d}`));
    proc.on('exit', code => {
        if (code !== 0 && code !== null)
            console.log(`${color}[${label}]${RESET} exited with code ${code}`);
    });
    return proc;
}

console.log('\x1b[1m🚀 Starting IntelliCredit AI Platform...\x1b[0m');
console.log(`${CYAN}[BACKEND]${RESET}  http://localhost:5000`);
console.log(`${MAGENTA}[FRONTEND]${RESET} http://localhost:5173\n`);

const server = run('BACKEND', CYAN, 'node', ['server.js'], backend);
const client = run('FRONTEND', MAGENTA, 'npm', ['run', 'dev'], frontend);

// Kill both on Ctrl+C
process.on('SIGINT', () => { server.kill(); client.kill(); process.exit(0); });
process.on('SIGTERM', () => { server.kill(); client.kill(); process.exit(0); });
