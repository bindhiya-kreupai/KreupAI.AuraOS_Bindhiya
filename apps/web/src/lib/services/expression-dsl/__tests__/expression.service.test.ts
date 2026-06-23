import { describe, it, expect, vi } from 'vitest';
import {
  evaluateExpression,
  evaluateRule,
  evaluateFormula,
  ExpressionParseError,
  ExpressionRuntimeError,
} from '../expression.service';

describe('evaluateExpression — primitives + arithmetic', () => {
  it('evaluates a bare number', () => {
    expect(evaluateExpression('42')).toBe(42);
  });

  it('evaluates simple arithmetic with precedence', () => {
    expect(evaluateExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateExpression('(2 + 3) * 4')).toBe(20);
  });

  it('evaluates string literals (single + double quoted)', () => {
    expect(evaluateExpression('"hello"')).toBe('hello');
    expect(evaluateExpression("'hello'")).toBe('hello');
  });

  it('evaluates unary negation', () => {
    expect(evaluateExpression('-5 + 2')).toBe(-3);
  });

  it('rejects division by zero with a runtime error', () => {
    expect(() => evaluateExpression('1 / 0')).toThrow(ExpressionRuntimeError);
  });

  it('rejects modulo by zero with a runtime error', () => {
    expect(() => evaluateExpression('5 % 0')).toThrow(ExpressionRuntimeError);
  });
});

describe('evaluateExpression — path access', () => {
  it('resolves a one-level variable path', () => {
    expect(evaluateExpression('total', { total: 7 })).toBe(7);
  });

  it('resolves a nested path', () => {
    expect(evaluateExpression('payslip.net', { payslip: { net: 9_000 } })).toBe(9_000);
  });

  it('returns null when an intermediate object is missing', () => {
    expect(evaluateExpression('a.b.c', { a: {} })).toBe(null);
  });

  it('forbids prototype-chain escape (__proto__, constructor, prototype)', () => {
    expect(() => evaluateExpression('obj.__proto__.polluted', { obj: {} })).toThrow(
      ExpressionRuntimeError
    );
    expect(() => evaluateExpression('obj.constructor.name', { obj: {} })).toThrow(
      ExpressionRuntimeError
    );
  });
});

describe('evaluateExpression — comparisons', () => {
  it('compares numbers', () => {
    expect(evaluateExpression('5 > 3')).toBe(true);
    expect(evaluateExpression('5 < 3')).toBe(false);
    expect(evaluateExpression('5 == 5')).toBe(true);
    expect(evaluateExpression('5 != 5')).toBe(false);
  });

  it('compares strings', () => {
    expect(evaluateExpression('"a" == "a"')).toBe(true);
    expect(evaluateExpression('"a" == "b"')).toBe(false);
  });

  it('compares Date instances via epoch ms (EPIC-37 use case)', () => {
    const ctx = {
      payslip: {
        creditedAt: new Date('2026-06-20T00:00:00Z'),
        dueDate: new Date('2026-06-15T00:00:00Z'),
      },
    };
    // Salary credited after due date → red flag
    expect(evaluateExpression('payslip.creditedAt > payslip.dueDate', ctx)).toBe(true);
  });

  it('returns false when either side of a comparison is null', () => {
    expect(evaluateExpression('a > 1', { a: null })).toBe(false);
  });

  it('throws on mixed-type comparison', () => {
    expect(() => evaluateExpression('"a" > 1')).toThrow(ExpressionRuntimeError);
  });
});

describe('evaluateExpression — logical', () => {
  it('AND short-circuits on falsy left side', () => {
    // right side has division by zero — would throw if evaluated
    expect(evaluateExpression('false && (1 / 0)')).toBe(false);
  });

  it('OR short-circuits on truthy left side', () => {
    expect(evaluateExpression('true || (1 / 0)')).toBe(true);
  });

  it('NOT inverts truthiness', () => {
    expect(evaluateExpression('!true')).toBe(false);
    expect(evaluateExpression('!!"hello"')).toBe(true);
    expect(evaluateExpression('!null')).toBe(true);
  });
});

describe('evaluateExpression — parse errors', () => {
  it('rejects unterminated string', () => {
    expect(() => evaluateExpression('"oops')).toThrow(ExpressionParseError);
  });

  it('rejects unexpected character', () => {
    expect(() => evaluateExpression('1 @ 2')).toThrow(ExpressionParseError);
  });

  it('rejects mismatched parenthesis', () => {
    expect(() => evaluateExpression('(1 + 2')).toThrow(ExpressionParseError);
  });
});

describe('evaluateRule (EPIC-37 red-flag wrapper)', () => {
  it('returns the boolean truthiness of the expression', () => {
    expect(evaluateRule('a > 5', { a: 6 })).toBe(true);
    expect(evaluateRule('a > 5', { a: 4 })).toBe(false);
  });

  it('swallows errors and returns false (one bad rule must not block others)', () => {
    const onError = vi.fn();
    const res = evaluateRule('a > "not a number"', { a: 5 }, onError);
    expect(res).toBe(false);
    expect(onError).toHaveBeenCalledOnce();
  });

  it('handles the EPIC-37 sample: payslip.creditedAt > payslip.dueDate', () => {
    const ctx = {
      payslip: {
        creditedAt: new Date('2026-06-20T00:00:00Z'),
        dueDate: new Date('2026-06-15T00:00:00Z'),
      },
    };
    expect(evaluateRule('payslip.creditedAt > payslip.dueDate', ctx)).toBe(true);
  });
});

describe('evaluateFormula (EPIC-38 KPI wrapper)', () => {
  it('evaluates the EPIC-38 sample: payslips_corrected / total * 100', () => {
    const ctx = { payslips_corrected: 3, total: 200 };
    expect(evaluateFormula('payslips_corrected / total * 100', ctx)).toBeCloseTo(1.5, 5);
  });

  it('coerces booleans to 0/1', () => {
    expect(evaluateFormula('true + 1', {})).toBe(2);
  });

  it('throws when expression does not produce a number', () => {
    expect(() => evaluateFormula('"oops"', {})).toThrow(ExpressionRuntimeError);
  });
});
