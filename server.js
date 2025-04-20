/**
 * Simple Express server for Thorben Woelk CV website
 * Configured for GitHub Pages structure (index.html at root)
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Use security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disabled for development, enable for production
}));

// Use compression middleware to compress responses
app.use(compression());

// Serve static files from the current directory (root level)
app.use(express.static(path.join(__dirname)));

// Basic route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`
  🚀 Server running!
  🌐 Website available at: http://localhost:${PORT}
  🛑 Press Ctrl+C to stop the server
  `);
});