/**
 * Safe expression DSL (closes audit 2026-06-17 Pattern 8).
 *
 * The audit found two services storing executable logic as plain text
 * but never evaluating it:
 *   - EPIC-37 red-flag rules: `"payslip.creditedAt > payslip.dueDate"`
 *   - EPIC-38 KPI formulas:   `"payslips_corrected / total * 100"`
 *
 * This module is the canonical evaluator. It is deliberately
 * sandboxed — no function calls, no member assignment, no dynamic
 * property access — so the only thing an attacker controlling the
 * expression text can affect is the boolean / numeric verdict.
 *
 * Grammar (informal):
 *
 *     expr   := orExpr
 *     orExpr := andExpr ('||' andExpr)*
 *     andExpr:= notExpr ('&&' notExpr)*
 *     notExpr:= '!'* cmpExpr
 *     cmpExpr:= addExpr (cmpOp addExpr)?
 *     cmpOp  := '==' | '!=' | '>=' | '<=' | '>' | '<'
 *     addExpr:= mulExpr (('+' | '-') mulExpr)*
 *     mulExpr:= unary (('*' | '/' | '%') unary)*
 *     unary  := '-' unary | primary
 *     primary:= number | string | bool | path | '(' expr ')'
 *     path   := IDENT ('.' IDENT)*
 *     number := digit+ ('.' digit+)?  (and exponent forms)
 *     string := '"' chars '"' | "'" chars "'"
 *     bool   := 'true' | 'false' | 'null'
 *
 * The evaluator coerces Date values to epoch ms when compared with `<`,
 * `<=`, `>`, `>=` so EPIC-37 rules written as
 * `"payslip.creditedAt > payslip.dueDate"` Just Work without bespoke
 * date-only logic per call site.
 */

export interface EvaluationContext {
  /**
   * Variable scope — any non-prototype property is reachable by name
   * via `path` access. Nested objects work with dot notation:
   *     ctx = { payslip: { creditedAt: new Date(...) } }
   *     expr = 'payslip.creditedAt > payslip.dueDate'
   */
  [key: string]: unknown;
}

export type EvaluatedValue = number | string | boolean | null | Date;

export class ExpressionParseError extends Error {
  constructor(
    message: string,
    public readonly position?: number
  ) {
    super(`expression parse error${position != null ? ` at ${position}` : ''}: ${message}`);
    this.name = 'ExpressionParseError';
  }
}

export class ExpressionRuntimeError extends Error {
  constructor(message: string) {
    super(`expression runtime error: ${message}`);
    this.name = 'ExpressionRuntimeError';
  }
}

// ----------------------------------------------------------------------------
// Tokenizer
// ----------------------------------------------------------------------------

type TokenType = 'NUMBER' | 'STRING' | 'IDENT' | 'OP' | 'LPAREN' | 'RPAREN' | 'DOT' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const OPERATORS = ['==', '!=', '>=', '<=', '&&', '||', '>', '<', '+', '-', '*', '/', '%', '!'];

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i += 1;
      continue;
    }
    if (c === '(') {
      tokens.push({ type: 'LPAREN', value: '(', pos: i });
      i += 1;
      continue;
    }
    if (c === ')') {
      tokens.push({ type: 'RPAREN', value: ')', pos: i });
      i += 1;
      continue;
    }
    if (c === '.') {
      tokens.push({ type: 'DOT', value: '.', pos: i });
      i += 1;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      let str = '';
      while (j < src.length && src[j] !== quote) {
        if (src[j] === '\\' && j + 1 < src.length) {
          str += src[j + 1];
          j += 2;
        } else {
          str += src[j];
          j += 1;
        }
      }
      if (j >= src.length) throw new ExpressionParseError('unterminated string literal', i);
      tokens.push({ type: 'STRING', value: str, pos: i });
      i = j + 1;
      continue;
    }
    if ((c >= '0' && c <= '9') || (c === '.' && src[i + 1] >= '0' && src[i + 1] <= '9')) {
      let j = i;
      while (j < src.length && /[0-9.eE+\-]/.test(src[j])) {
        // be careful: + and - are only part of the number if directly after e/E
        if (
          (src[j] === '+' || src[j] === '-') &&
          j !== i &&
          src[j - 1] !== 'e' &&
          src[j - 1] !== 'E'
        )
          break;
        j += 1;
      }
      const text = src.slice(i, j);
      if (Number.isNaN(Number(text)))
        throw new ExpressionParseError(`malformed number '${text}'`, i);
      tokens.push({ type: 'NUMBER', value: text, pos: i });
      i = j;
      continue;
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j += 1;
      const text = src.slice(i, j);
      tokens.push({ type: 'IDENT', value: text, pos: i });
      i = j;
      continue;
    }
    // operator
    let matched = false;
    for (const op of OPERATORS) {
      if (src.startsWith(op, i)) {
        tokens.push({ type: 'OP', value: op, pos: i });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (!matched) throw new ExpressionParseError(`unexpected character '${c}'`, i);
  }
  tokens.push({ type: 'EOF', value: '', pos: src.length });
  return tokens;
}

// ----------------------------------------------------------------------------
// Parser → AST
// ----------------------------------------------------------------------------

type Node =
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'null' }
  | { kind: 'path'; segments: string[] }
  | { kind: 'neg'; arg: Node }
  | { kind: 'not'; arg: Node }
  | { kind: 'bin'; op: string; left: Node; right: Node };

class Parser {
  private i = 0;
  constructor(private readonly tokens: Token[]) {}

  private peek(): Token {
    return this.tokens[this.i];
  }
  private eat(): Token {
    return this.tokens[this.i++];
  }
  private expect(type: TokenType, value?: string): Token {
    const t = this.eat();
    if (t.type !== type || (value && t.value !== value)) {
      throw new ExpressionParseError(
        `expected ${value ?? type}, got '${t.value}' (${t.type})`,
        t.pos
      );
    }
    return t;
  }

  parse(): Node {
    const node = this.parseOr();
    this.expect('EOF');
    return node;
  }

  private parseOr(): Node {
    let left = this.parseAnd();
    while (this.peek().type === 'OP' && this.peek().value === '||') {
      this.eat();
      left = { kind: 'bin', op: '||', left, right: this.parseAnd() };
    }
    return left;
  }
  private parseAnd(): Node {
    let left = this.parseNot();
    while (this.peek().type === 'OP' && this.peek().value === '&&') {
      this.eat();
      left = { kind: 'bin', op: '&&', left, right: this.parseNot() };
    }
    return left;
  }
  private parseNot(): Node {
    if (this.peek().type === 'OP' && this.peek().value === '!') {
      this.eat();
      return { kind: 'not', arg: this.parseNot() };
    }
    return this.parseCmp();
  }
  private parseCmp(): Node {
    const left = this.parseAdd();
    const t = this.peek();
    if (t.type === 'OP' && ['==', '!=', '>=', '<=', '>', '<'].includes(t.value)) {
      this.eat();
      return { kind: 'bin', op: t.value, left, right: this.parseAdd() };
    }
    return left;
  }
  private parseAdd(): Node {
    let left = this.parseMul();
    while (this.peek().type === 'OP' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.eat().value;
      left = { kind: 'bin', op, left, right: this.parseMul() };
    }
    return left;
  }
  private parseMul(): Node {
    let left = this.parseUnary();
    while (
      this.peek().type === 'OP' &&
      (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%')
    ) {
      const op = this.eat().value;
      left = { kind: 'bin', op, left, right: this.parseUnary() };
    }
    return left;
  }
  private parseUnary(): Node {
    if (this.peek().type === 'OP' && this.peek().value === '-') {
      this.eat();
      return { kind: 'neg', arg: this.parseUnary() };
    }
    return this.parsePrimary();
  }
  private parsePrimary(): Node {
    const t = this.peek();
    if (t.type === 'NUMBER') {
      this.eat();
      return { kind: 'num', value: Number(t.value) };
    }
    if (t.type === 'STRING') {
      this.eat();
      return { kind: 'str', value: t.value };
    }
    if (t.type === 'LPAREN') {
      this.eat();
      const inner = this.parseOr();
      this.expect('RPAREN');
      return inner;
    }
    if (t.type === 'IDENT') {
      this.eat();
      if (t.value === 'true') return { kind: 'bool', value: true };
      if (t.value === 'false') return { kind: 'bool', value: false };
      if (t.value === 'null') return { kind: 'null' };
      const segments = [t.value];
      while (this.peek().type === 'DOT') {
        this.eat();
        const next = this.expect('IDENT');
        segments.push(next.value);
      }
      return { kind: 'path', segments };
    }
    throw new ExpressionParseError(`unexpected token '${t.value}'`, t.pos);
  }
}

// ----------------------------------------------------------------------------
// Evaluator
// ----------------------------------------------------------------------------

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function resolvePath(ctx: EvaluationContext, segments: string[]): unknown {
  let cur: unknown = ctx;
  for (const seg of segments) {
    if (cur == null) return null;
    if (FORBIDDEN_KEYS.has(seg)) {
      throw new ExpressionRuntimeError(`forbidden property '${seg}'`);
    }
    if (typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur ?? null;
}

function toComparable(v: unknown): number | string | boolean | null {
  if (v == null) return null;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return v;
  throw new ExpressionRuntimeError(`cannot compare value of type ${typeof v}`);
}

function evalNode(node: Node, ctx: EvaluationContext): EvaluatedValue {
  switch (node.kind) {
    case 'num':
      return node.value;
    case 'str':
      return node.value;
    case 'bool':
      return node.value;
    case 'null':
      return null;
    case 'path': {
      const v = resolvePath(ctx, node.segments);
      if (v === null) return null;
      if (
        typeof v === 'number' ||
        typeof v === 'string' ||
        typeof v === 'boolean' ||
        v instanceof Date
      ) {
        return v;
      }
      return null;
    }
    case 'neg': {
      const v = evalNode(node.arg, ctx);
      if (typeof v !== 'number') throw new ExpressionRuntimeError('unary - requires a number');
      return -v;
    }
    case 'not':
      return !truthy(evalNode(node.arg, ctx));
    case 'bin': {
      const op = node.op;
      if (op === '&&' || op === '||') {
        const l = evalNode(node.left, ctx);
        if (op === '&&') return truthy(l) ? evalNode(node.right, ctx) : l;
        return truthy(l) ? l : evalNode(node.right, ctx);
      }
      const l = evalNode(node.left, ctx);
      const r = evalNode(node.right, ctx);
      if (op === '==') return toComparable(l) === toComparable(r);
      if (op === '!=') return toComparable(l) !== toComparable(r);
      if (op === '>' || op === '<' || op === '>=' || op === '<=') {
        const lc = toComparable(l);
        const rc = toComparable(r);
        if (lc == null || rc == null) return false; // null on either side → comparison false
        if (typeof lc !== typeof rc)
          throw new ExpressionRuntimeError('comparison requires same type');
        if (op === '>') return lc > (rc as any);
        if (op === '<') return lc < (rc as any);
        if (op === '>=') return lc >= (rc as any);
        if (op === '<=') return lc <= (rc as any);
      }
      // arithmetic
      const ln = numeric(l);
      const rn = numeric(r);
      if (op === '+') return ln + rn;
      if (op === '-') return ln - rn;
      if (op === '*') return ln * rn;
      if (op === '/') {
        if (rn === 0) throw new ExpressionRuntimeError('division by zero');
        return ln / rn;
      }
      if (op === '%') {
        if (rn === 0) throw new ExpressionRuntimeError('modulo by zero');
        return ln % rn;
      }
      throw new ExpressionRuntimeError(`unsupported operator '${op}'`);
    }
  }
}

function truthy(v: EvaluatedValue): boolean {
  if (v == null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.length > 0;
  if (v instanceof Date) return !Number.isNaN(v.getTime());
  return true;
}

function numeric(v: EvaluatedValue): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof Date) return v.getTime();
  if (v == null) return 0;
  const n = Number(v);
  if (Number.isNaN(n))
    throw new ExpressionRuntimeError(`cannot use non-numeric value in arithmetic`);
  return n;
}

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/**
 * Parse + evaluate `expression` against `ctx`. Returns the result
 * (number / string / boolean / null / Date). Throws
 * `ExpressionParseError` on malformed input and `ExpressionRuntimeError`
 * on evaluation issues (division by zero, type mismatch, …).
 */
export function evaluateExpression(
  expression: string,
  ctx: EvaluationContext = {}
): EvaluatedValue {
  const tokens = tokenize(expression);
  const ast = new Parser(tokens).parse();
  return evalNode(ast, ctx);
}

/**
 * Convenience wrapper that returns the boolean truthiness of the
 * expression. Intended for EPIC-37 red-flag rules.
 *
 * On parse/runtime error returns `false` and surfaces the error via the
 * optional `onError` callback so a misbehaving rule never blocks the
 * red-flag engine from evaluating its other rules.
 */
export function evaluateRule(
  expression: string,
  ctx: EvaluationContext,
  onError?: (err: Error) => void
): boolean {
  try {
    return truthy(evaluateExpression(expression, ctx));
  } catch (err) {
    onError?.(err as Error);
    return false;
  }
}

/**
 * Convenience wrapper for EPIC-38 KPI formulas — evaluates to a
 * number; non-numeric results throw.
 */
export function evaluateFormula(expression: string, ctx: EvaluationContext): number {
  const v = evaluateExpression(expression, ctx);
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  throw new ExpressionRuntimeError('KPI formula did not produce a number');
}
