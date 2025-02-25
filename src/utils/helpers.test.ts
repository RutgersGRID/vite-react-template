import { test, expect } from "bun:test";

// A simple utility function to test
export function formatGreeting(name: string): string {
  return `Hello, ${name}!`;
}

// Test for the formatGreeting function
test("formatGreeting should return the correct greeting", () => {
  const result = formatGreeting("Bun");
  expect(result).toBe("Hello, Bun!");
});

test("formatGreeting handles empty strings", () => {
  const result = formatGreeting("");
  expect(result).toBe("Hello, !");
});
