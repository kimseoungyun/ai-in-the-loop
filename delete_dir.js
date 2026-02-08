const fs = require('fs');
const path = require('path');
const target = path.join(process.cwd(), 'web_app');
try {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log('Deleted ' + target);
    } else {
        console.log('Target not found ' + target);
    }
} catch (e) {
    console.error('Error deleting:', e);
}
