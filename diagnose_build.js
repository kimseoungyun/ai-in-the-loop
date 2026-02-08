const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream('build_error.log');

console.log('Starting build diagnosis...');
// Try to find next binary
const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd');
const cmd = fs.existsSync(nextBin) ? nextBin : 'npx';
const args = fs.existsSync(nextBin) ? ['build'] : ['next', 'build'];

console.log(`Running: ${cmd} ${args.join(' ')}`);

const build = spawn(cmd, args, {
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, CI: 'true' } // Force CI mode to avoid interactive prompts
});

build.stdout.on('data', (data) => {
    process.stdout.write(data);
    logStream.write(data);
});

build.stderr.on('data', (data) => {
    process.stderr.write(data);
    logStream.write(data);
});

build.on('close', (code) => {
    console.log(`Build exited with code ${code}`);
    logStream.write(`\nEXIT CODE: ${code}\n`);
    logStream.end();
});
