import { evaluateMathExpression } from '../mathExpression';

describe('evaluateMathExpression', () => {
  it('should evaluate simple addition', () => {
    expect(evaluateMathExpression('10 + 20')).toBe(30);
  });

  it('should evaluate subtraction', () => {
    expect(evaluateMathExpression('50 - 15')).toBe(35);
  });

  it('should evaluate multiplication', () => {
    expect(evaluateMathExpression('10 * 5')).toBe(50);
  });

  it('should evaluate division', () => {
    expect(evaluateMathExpression('100 / 4')).toBe(25);
  });

  it('should respect operator precedence (multiplication before addition)', () => {
    expect(evaluateMathExpression('10 + 5 * 2')).toBe(20);
  });

  it('should respect parentheses', () => {
    expect(evaluateMathExpression('(10 + 5) * 2')).toBe(30);
  });

  it('should handle decimal numbers with dot', () => {
    expect(evaluateMathExpression('10.5 + 4.5')).toBe(15);
  });

  it('should handle decimal numbers with comma', () => {
    expect(evaluateMathExpression('10,5 + 4,5', ',')).toBe(15);
  });

  it('should return null for invalid characters', () => {
    expect(evaluateMathExpression('10 + abc')).toBe(null);
  });

  it('should return null for division by zero', () => {
    expect(evaluateMathExpression('10 / 0')).toBe(null);
  });

  it('should handle complex expressions', () => {
    expect(evaluateMathExpression('((10 + 5.5) * 2) / 3.1')).toBe(10);
  });
});
