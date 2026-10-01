const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, exts, fileList);
    } else if (exts.some(ext => fullPath.endsWith(ext))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = getAllFiles('src', ['.tsx', '.ts']);
console.log(`Checking ${files.length} files...`);

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  let insideComponent = false;
  let componentName = '';
  let braceDepth = 0;
  let componentBraceDepth = 0;
  let hasReturned = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check component start
    const compMatch = line.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/);
    if (compMatch && (line.includes('=>') || line.includes('function') || line.includes('React.FC'))) {
      insideComponent = true;
      componentName = compMatch[1];
      componentBraceDepth = braceDepth;
      hasReturned = false;
    }

    // Check early return in component scope
    if (insideComponent && (trimmed.startsWith('return ') || trimmed === 'return;') && !trimmed.startsWith('return (') && !trimmed.includes('() =>')) {
      // Check if it's an early return (e.g. if (...) return ... or early return before main return)
      // We will flag any hook found after this line until component ends
      hasReturned = true;
    }

    // Check for hook call: use* (
    const hookMatch = line.match(/\b(use[A-Z][a-zA-Z0-9_]*)\s*\(/);
    if (hookMatch) {
      const hookName = hookMatch[1];
      if (hasReturned) {
        console.log(`[EARLY RETURN VIOLATION] ${file}:${i + 1} - Hook '${hookName}' called after return in ${componentName}`);
      }
      // Check if hook is inside if / for / while block
      // A simple heuristic: does line or prev line have if ( ... ) without brace closed?
    }

    // Count braces
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (insideComponent && braceDepth <= componentBraceDepth) {
          insideComponent = false;
          hasReturned = false;
        }
      }
    }
  }
}
