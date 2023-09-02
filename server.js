// CUSTOM
const app = require('./app');

// Server Startup
const port = 3000;
app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});