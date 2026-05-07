const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
    }
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

const pagesDir = path.join(__dirname, 'src/pages');
const pagesFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of pagesFiles) {
    const fullPath = path.join(pagesDir, file);
    replaceInFile(fullPath, [
        [/from\s+['"].*?shared\/context\/(.*?)['"]/g, "from '../contexts/$1'"],
        [/from\s+['"].*?shared\/services\/(.*?)['"]/g, "from '../services/$1'"],
        [/from\s+['"].*?shared\/components\/(.*?)['"]/g, "from '../components/$1'"],
        [/from\s+['"].*?shared\/assets\/(.*?)['"]/g, "from '../assets/$1'"],
        [/from\s+['"].*?app\/(.*?)['"]/g, "from '../styles/$1'"]
    ]);
}

replaceInFile(path.join(__dirname, 'src/App.jsx'), [
    [/from\s+['"].*?features\/.*?\/pages\/(.*?)['"]/g, "from './pages/$1'"],
    [/from\s+['"].*?shared\/context\/(.*?)['"]/g, "from './contexts/$1'"],
    [/from\s+['"].*?shared\/components\/(.*?)['"]/g, "from './components/$1'"],
    [/import\s+['"]\.\/App\.css['"]/g, "import './styles/App.css'"],
    [/import\s+['"]\.\/index\.css['"]/g, "import './styles/index.css'"]
]);

replaceInFile(path.join(__dirname, 'src/main.jsx'), [
    [/import\s+['"]\.\/index\.css['"]/g, "import './styles/index.css'"],
    [/import\s+['"]\.\/App\.css['"]/g, "import './styles/App.css'"]
]);

const compDir = path.join(__dirname, 'src/components');
const compFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.jsx'));
for (const file of compFiles) {
    const fullPath = path.join(compDir, file);
    replaceInFile(fullPath, [
        [/from\s+['"].*?context\/(.*?)['"]/g, "from '../contexts/$1'"],
        [/from\s+['"].*?components\/(.*?)['"]/g, "from './$1'"]
    ]);
}
