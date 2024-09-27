const glob = require('glob');
const fs = require('fs');
const path = require('path');

// Get directory name from command line arguments, default to 'dist' if not provided
const directory = process.argv[2] || 'dist';

const replaceScssImports = (directory, fileExtension) => {
    const pattern = path.join(directory, `**/*.${fileExtension}`);

    glob(pattern, (err, files) => {
        if (err) {
            console.error('Failed to find files', err);
            return;
        }

        files.forEach((file) => {
            let content = fs.readFileSync(file, 'utf8');
            // Replace .scss imports with .css
            content = content.replace(/\.scss/g, '.css');
            fs.writeFileSync(file, content, 'utf8');
        });
    });
};

// Adjust the pattern to match your output JavaScript files within the provided directory
console.log('Replacing .scss imports with .css in JS files');
replaceScssImports(path.join(directory, 'cjs'), 'js');
replaceScssImports(path.join(directory, 'esm'), 'mjs');

console.log('Replacing .scss imports with .css in .d.ts files');
replaceScssImports(path.join(directory, 'cjs'), 'd.ts');
replaceScssImports(path.join(directory, 'esm'), 'd.ts');
