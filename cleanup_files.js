const fs = require('fs');
const path = require('path');

const filesToDelete = ['middleware.ts', 'tailwind.config.ts', 'package-lock.json'];
const rootDir = process.cwd();

filesToDelete.forEach(file => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${file}`);
        } catch (error) {
            console.error(`Failed to delete ${file}:`, error);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
