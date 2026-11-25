import type { TokenDeclaration, TokenFileSpec } from './types.js';

const VERSION_RE = /^\/\/ VERSION:\s*(\S+)\s*$/m;
const PACKAGE_RE = /^package\s+([\w.]+)\s*$/m;
const OBJECT_RE = /^\s*(?:internal\s+|public\s+|private\s+)?object\s+(\w+)/m;
const CLASS_RE = /^\s*(?:internal\s+|public\s+|private\s+)?class\s+(\w+)/m;
const PROPERTY_RE =
  /^\s*(?:(inline)\s+)?(?:(const)\s+)?val\s+([A-Za-z_]\w*)\s*(?::\s*([^=]+?))?\s*(?:=\s*(.*))?\s*$/;
const GETTER_RE = /^\s*(?:inline\s+)?get\(\)\s*=\s*(.*)$/;

/** Count unmatched brackets in a Kotlin expression. */
export function bracketBalance(expression: string): number {
  let depth = 0;
  for (const char of expression) {
    if (char === '(' || char === '[' || char === '{') {
      depth += 1;
    } else if (char === ')' || char === ']' || char === '}') {
      depth -= 1;
    }
  }
  return depth;
}

export function normalizeExpression(expression: string): string {
  return expression.replace(/\s+/g, ' ').trim();
}

/**
 * Parse one generated Compose `*Tokens.kt` file.
 *
 * These files are machine-generated and use a small, regular subset of Kotlin:
 * `object`/`class` declarations with `val`, `inline val`, and `const val`
 * properties whose values are literals or simple constructor calls. Expressions
 * may span lines when a constructor call is formatted over several lines.
 */
export function parseTokenSource(source: string, relativePath: string): TokenFileSpec {
  const fileName = relativePath.split('/').pop() ?? relativePath;
  const packageName = PACKAGE_RE.exec(source)?.[1];
  if (!packageName) {
    throw new Error(`${relativePath}: no package declaration`);
  }

  const objectMatch = OBJECT_RE.exec(source);
  const classMatch = CLASS_RE.exec(source);
  const declarationMatch = objectMatch ?? classMatch;
  if (!declarationMatch) {
    throw new Error(`${relativePath}: no object or class declaration`);
  }

  const declarationName = declarationMatch[1];
  if (!declarationName) {
    throw new Error(`${relativePath}: empty declaration name`);
  }

  const lines = source.split(/\r?\n/);
  const tokens: TokenDeclaration[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) {
      continue;
    }
    const match = PROPERTY_RE.exec(line);
    if (!match) {
      continue;
    }

    const [, inlineMarker, constMarker, name, declaredType, inlineRhs] = match;
    if (!name) {
      continue;
    }

    let expression = (inlineRhs ?? '').trim();
    let cursor = index;

    if (inlineRhs === undefined) {
      // `val Name: Type` followed by `get() = expression`.
      let getterIndex = index + 1;
      while (getterIndex < lines.length && (lines[getterIndex]?.trim() ?? '') === '') {
        getterIndex += 1;
      }
      const getterLine = lines[getterIndex];
      const getterMatch = getterLine === undefined ? null : GETTER_RE.exec(getterLine);
      if (!getterMatch) {
        // Abstract/uninitialized property that is not a design token.
        continue;
      }
      expression = (getterMatch[1] ?? '').trim();
      cursor = getterIndex;
    }

    // Consume continuation lines until brackets balance and the expression is
    // non-empty. A declaration ending in `=` legitimately has an empty value on
    // its own line (`val X =` then `RoundedCornerShape(` on the next).
    while (cursor + 1 < lines.length && (expression === '' || bracketBalance(expression) > 0)) {
      cursor += 1;
      const continuation = lines[cursor]?.trim() ?? '';
      expression = expression === '' ? continuation : `${expression} ${continuation}`;
    }

    expression = normalizeExpression(expression);
    if (expression === '') {
      continue;
    }

    tokens.push({
      name,
      declaredType: declaredType?.trim() ?? null,
      expression,
      line: index + 1,
      isConst: constMarker !== undefined,
      isInline: inlineMarker !== undefined,
    });
    index = cursor;
  }

  return {
    fileName,
    relativePath,
    packageName,
    declarationName,
    declarationKind: objectMatch ? 'object' : 'class',
    version: VERSION_RE.exec(source)?.[1] ?? null,
    tokens,
  };
}
