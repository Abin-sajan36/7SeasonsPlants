const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'initialData.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// The replacement replaced the end of the objects too greedily and took out the tags/careInstructions etc
// Instead of replacing the whole array again, let's just make a new fresh file based on initialData.ts
