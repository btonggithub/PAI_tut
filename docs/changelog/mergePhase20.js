/**
 * Node.js script to merge Phase 20 File Upload content into markdown files.
 * Usage: node mergePhase20.js /path/to/repo /path/to/phase20_file.txt
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
    console.error('Usage: node mergePhase20.js /path/to/repo /path/to/phase20_file.txt');
    process.exit(1);
}

const repoDir = process.argv[2];
const phase20File = process.argv[3];

// Load Phase 20 content
const phase20Content = fs.readFileSync(phase20File, 'utf-8');

// Mapping repo files to section headers in Phase 20 document
const mergeMap = {
    'architecture.md': '## architecture.md',
    'coding-rules.md': '## coding-rules.md',
    'conventions.md': '## conventions.md',
    'review-checklist.md': '## review-checklist.md',
    'decisions.md': '## decisions.md',
    'progress.md': '## progress.md',
    'prompts/current-task.md': '## prompts/current-task.md',
    'archive/road-map.md': '## archive/road-map.md'
};

for (const [fileName, sectionHeader] of Object.entries(mergeMap)) {
    const filePath = path.join(repoDir, fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found in repo: ${filePath}`);
        continue;
    }

    // Extract the section content from phase20 document
    const splitBySection = phase20Content.split(sectionHeader);
    if (splitBySection.length < 2) {
        console.warn(`Section header not found in phase20 file: ${sectionHeader}`);
        continue;
    }

    const sectionContent = splitBySection[1].split('---')[0].trim();

    // Append to the repo markdown file
    fs.appendFileSync(filePath, `\n\n${sectionContent}\n`);
    console.log(`Merged Phase 20 content into ${filePath}`);
}

console.log('Phase 20 merge completed.');
