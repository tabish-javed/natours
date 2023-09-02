// INTERNAL
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// CUSTOM
const app = require('./app');

// Server Startup
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API server started on port: ${port}`);
});