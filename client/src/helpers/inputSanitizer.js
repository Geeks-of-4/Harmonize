export const sanitizeInput = (input) => {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .trim() // Trim whitespace
    .slice(0, 50); // Limit to 50 characters
};