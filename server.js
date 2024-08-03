const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/big-yek-monthly-cup-frontend/browser')));

// Serve the index.html for all GET requests that don't match an existing file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/big-yek-monthly-cup-frontend/browser/index.html'));
});

// Start the Express server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
