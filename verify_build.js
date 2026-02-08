const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = 'verification.log';
const logStream = fs.createWriteStream(logFile);

function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    process.stdout.write(line);
    logStream.write(line);
}

function run(cmd, args, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        log(`Running: ${cmd} ${args.join(' ')}`);
        const child = spawn(cmd, args, {
            shell: true,
            cwd: cwd,
            env: { ...process.env, CI: 'true' }
        });

        child.stdout.on('data', d => {
            // Reduced verbosity for cleanliness, uncomment to see full build logs in verification log
            logStream.write(d);
        });
        child.stderr.on('data', d => {
            process.stderr.write(d); // Passthrough error output to see it in tool output
            logStream.write(d);
        });

        child.on('close', code => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });
    });
}

async function verify() {
    try {
        log('Step 1: Cleaning caches...');
        // Simple rmdir recursive
        const dirs = ['node_modules', '.next', '.turbo', 'dist', 'build'];
        for (const d of dirs) {
            const p = path.join(process.cwd(), d);
            if (fs.existsSync(p)) {
                // Node 14+ has rmSync
                fs.rmSync(p, { recursive: true, force: true });
            }
        }
        log('Cleaned.');

        log('Step 2: Installing dependencies...');
        await run('pnpm', ['install', '--frozen-lockfile']);

        log('Step 3: Build 1/2...');
        await run('pnpm', ['build']);
        log('Build 1 Success.');

        log('Step 4: Build 2/2 (Stability Check)...');
        await run('pnpm', ['build']);
        log('Build 2 Success.');

        log('VERIFICATION PASSED');
    } catch (e) {
        log(`VERIFICATION FAILED: ${e.message}`);
        process.exit(1);
    }
}

verify();
