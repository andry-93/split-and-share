/**
 * Simple and safe math expression evaluator.
 * Supports: +, -, *, /, (, )
 * Handles: localized decimal separators (dot or comma)
 */

const OPERATORS: Record<string, { prec: number; assoc: 'L' | 'R' }> = {
  '+': { prec: 2, assoc: 'L' },
  '-': { prec: 2, assoc: 'L' },
  '*': { prec: 3, assoc: 'L' },
  '/': { prec: 3, assoc: 'L' },
};

function applyOperator(operators: string[], values: number[]) {
  const op = operators.pop();
  const right = values.pop();
  const left = values.pop();

  if (left === undefined || right === undefined) {
    throw new Error('Invalid expression');
  }

  switch (op) {
    case '+':
      values.push(left + right);
      break;
    case '-':
      values.push(left - right);
      break;
    case '*':
      values.push(left * right);
      break;
    case '/':
      if (right === 0) {
        throw new Error('Division by zero');
      }
      values.push(left / right);
      break;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}

/**
 * Evaluates a mathematical expression string.
 * @param input The expression string (e.g., "10 + 5 * 2")
 * @param decimalSeparator The decimal separator to expect (default: ".")
 * @returns The numeric result or null if the expression is invalid.
 */
export function evaluateMathExpression(input: string, decimalSeparator: '.' | ',' = '.'): number | null {
  const normalized = input.replace(/\s+/g, '');
  if (!normalized) {
    return null;
  }

  // Basic check for invalid characters
  if (/[^0-9+\-*/(). ,]/.test(normalized)) {
    return null;
  }

  const values: number[] = [];
  const operators: string[] = [];

  // Tokenization regex: numbers (including decimals), operators, or parentheses
  const numberPart = decimalSeparator === ',' ? '\\d+(?:,\\d+)?' : '\\d+(?:\\.\\d+)?';
  const tokens = normalized.match(new RegExp(`${numberPart}|[+\\-*/()]`, 'g'));

  if (!tokens) {
    return null;
  }

  try {
    for (let i = 0; i < tokens.length; i++) {
       const token = tokens[i];

       if (/[0-9]/.test(token)) {
         // It's a number
         const numStr = decimalSeparator === ',' ? token.replace(',', '.') : token;
         values.push(parseFloat(numStr));
       } else if (token === '(') {
         operators.push(token);
       } else if (token === ')') {
         while (operators.length > 0 && operators[operators.length - 1] !== '(') {
           applyOperator(operators, values);
         }
         operators.pop(); // Pop '('
       } else if (OPERATORS[token]) {
         // It's an operator
         const currentOp = OPERATORS[token];
         while (
           operators.length > 0 &&
           operators[operators.length - 1] !== '(' &&
           OPERATORS[operators[operators.length - 1]].prec >= currentOp.prec
         ) {
           applyOperator(operators, values);
         }
         operators.push(token);
       }
    }

    while (operators.length > 0) {
      applyOperator(operators, values);
    }

    if (values.length !== 1) {
      return null;
    }

    const result = values[0];
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
