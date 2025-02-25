/**
 * Format a greeting with the given name
 * @param name The name to greet
 * @returns A formatted greeting string
 */
export function formatGreeting(name: string): string {
  return `Hello, ${name}!`;
}

/**
 * Capitalizes the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Delays execution for a specified number of milliseconds
 * @param ms Milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
