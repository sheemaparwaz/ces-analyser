/**
 * Utility to suppress specific React warnings during development
 * This is a temporary measure while third-party libraries update their code
 */

export function suppressDeprecationWarnings() {
  if (import.meta.env.DEV) {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args) => {
      // Suppress defaultProps warnings from third-party libraries
      if (
        typeof args[0] === "string" &&
        (args[0].includes("defaultProps will be removed") ||
          args[0].includes("Support for defaultProps will be removed"))
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      // Suppress defaultProps warnings
      if (
        typeof args[0] === "string" &&
        (args[0].includes("defaultProps will be removed") ||
          args[0].includes("Support for defaultProps will be removed"))
      ) {
        return;
      }
      originalConsoleWarn(...args);
    };

    // Return cleanup function
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }

  return () => {}; // No-op for production
}
