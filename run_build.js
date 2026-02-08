const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream('node_build.log');

console.log('Starting build...');
const build = spawn('npm', ['run', 'build'], {
    shell: true,
    cwd: process.cwd()
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
    logStream.end();
});
