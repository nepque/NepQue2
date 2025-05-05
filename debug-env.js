// Simple script to debug environment variables
console.log("Debugging environment variables:");
console.log(`DATABASE_URL = "${process.env.DATABASE_URL || 'NOT DEFINED'}"`);
console.log("All environment variables:", Object.keys(process.env));

// Check if dotenv is available
try {
  require('dotenv');
  console.log("dotenv is installed");
} catch (err) {
  console.log("dotenv is NOT installed");
  console.log("Consider installing dotenv with: npm install dotenv");
}