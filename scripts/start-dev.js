const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'mongodb-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// MongoDB Command
// Use generic mongod if path issues, assuming it's in env, or keep the absolute path if known good.
// The user has "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" in their running processes, so that's valid.
const mongoCmd = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const mongoArgs = ['--dbpath', dataDir];

console.log('🚀 Starting MongoDB...');
const mongo = spawn(mongoCmd, mongoArgs);

let nextStarted = false;
let nextApp = null;

function startNext() {
    if (nextStarted) return;
    nextStarted = true;
    console.log('🚀 Starting Next.js...');
    nextApp = spawn('npm', ['run', 'dev-next'], { shell: true, stdio: 'inherit' });
}

// Fallback: Start Next.js after 5 seconds if Mongo output isn't detected
const fallbackTimeout = setTimeout(() => {
    if (!nextStarted) {
        console.log('⚠️ MongoDB ready signal not detected, starting Next.js anyway...');
        startNext();
    }
}, 5000);

mongo.stdout.on('data', (data) => {
    const output = data.toString();
    // process.stdout.write(`[Mongo]: ${output}`); // Optional: Pipe mongo output to user

    if (output.includes('Waiting for connections')) {
        console.log('✅ MongoDB is ready!');
        startNext();
    }
});

mongo.stderr.on('data', (data) => {
    console.error(`[Mongo Error]: ${data}`);
});

// Cleanup
const cleanup = () => {
    if (nextApp) {
        // Windows kill might need deeper tree kill, but basically try to kill
        process.kill(nextApp.pid);
    }
    if (mongo) mongo.kill();
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
