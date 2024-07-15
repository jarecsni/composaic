import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Serve static files (e.g., CSS, JS, images)
app.use(express.static('dist'));

// Define REST API routes before the wildcard route
app.get('/api/data', (req, res) => {
    // Example API endpoint
    res.json({ message: 'This is your data.' });
});

// Other API endpoints...
// app.get('/api/other', (req, res) => { ... });

// Use app.get('/') for the root if you have a specific root handler
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Then, use a wildcard route as a fallback for all other GET requests
// This is useful for SPA routing where the client-side app handles routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
