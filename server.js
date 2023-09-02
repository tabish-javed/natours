/* eslint-disable no-console */
// INTERNAL
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// CUSTOM
const app = require('./app');

// Server Startup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
