import { describe, it, expect } from 'vitest';

function multiply(a: number, b: number): number {
  return a * b;
}

describe('multiply function', () => {
  it('should multiply two positive numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  it('should multiply positive and negative numbers correctly', () => {
    expect(multiply(5, -2)).toBe(-10);
  });

  it('should multiply two negative numbers correctly', () => {
    expect(multiply(-4, -3)).toBe(12);
  });

  it('should multiply by zero correctly', () => {
    expect(multiply(10, 0)).toBe(0);
    expect(multiply(0, 10)).toBe(0);
  });

  it('should handle decimal numbers', () => {
    expect(multiply(2.5, 2)).toBe(5);
    expect(multiply(1.5, 1.5)).toBe(2.25);
  });
});
