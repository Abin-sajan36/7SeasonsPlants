const ts = require('typescript');
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
let violationCount = 0;

for (const filePath of files) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

  function checkFunction(node, functionName) {
    if (!node.body || !ts.isBlock(node.body)) return;

    let sawReturn = false;
    let returnNode = null;

    function checkStatementList(statements) {
      for (const stmt of statements) {
        // If statement contains a return (not inside a function declaration/arrow function)
        if (ts.isReturnStatement(stmt)) {
          sawReturn = true;
          returnNode = stmt;
        } else if (ts.isIfStatement(stmt)) {
          // If the if branch or else branch has an unconditional return
          let thenReturns = false;
          if (ts.isReturnStatement(stmt.thenStatement)) {
            thenReturns = true;
          } else if (ts.isBlock(stmt.thenStatement)) {
            const hasRet = stmt.thenStatement.statements.some(s => ts.isReturnStatement(s));
            if (hasRet) thenReturns = true;
          }

          if (thenReturns) {
            sawReturn = true;
            returnNode = stmt;
          }

          // Check if hook is inside if condition or body
          checkNodeForHooks(stmt.thenStatement, 'inside IF statement');
          if (stmt.elseStatement) {
            checkNodeForHooks(stmt.elseStatement, 'inside ELSE statement');
          }
        } else {
          // Check for hooks called after return
          checkNodeForHooks(stmt, sawReturn ? 'AFTER return statement' : null);
        }
      }
    }

    function checkNodeForHooks(n, violationType) {
      if (!n) return;

      // Don't descend into child function expressions / arrow functions
      if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n)) {
        return;
      }

      if (ts.isCallExpression(n)) {
        let name = '';
        if (ts.isIdentifier(n.expression)) {
          name = n.expression.text;
        } else if (ts.isPropertyAccessExpression(n.expression)) {
          name = n.expression.name.text;
        }

        if (/^use[A-Z]/.test(name)) {
          if (violationType) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(n.getStart());
            console.log(`[HOOK VIOLATION] ${filePath}:${line + 1}:${character + 1} - Hook '${name}' called ${violationType} in ${functionName}`);
            violationCount++;
          }
        }
      }

      ts.forEachChild(n, child => checkNodeForHooks(child, violationType));
    }

    checkStatementList(node.body.statements);
  }

  function walk(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text;
      if (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) {
        checkFunction(node, name);
      }
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (decl.name && ts.isIdentifier(decl.name) && (/^[A-Z]/.test(decl.name.text) || /^use[A-Z]/.test(decl.name.text))) {
          if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
            checkFunction(decl.initializer, decl.name.text);
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}

console.log(`Done! Total hook violations found: ${violationCount}`);
