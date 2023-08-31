const fs = require('node:fs/promises');
const express = require('express');
const app = express();

/*
app.get('/', (request, response) => {
    response
        .status(200)
        .json({ message: 'Hello from the server side!', app: 'Natorurs' });
});

app.post('/', (request, response) => {
    response
        .status(200)
        .send('You can post to this endpoint...');
});
*/





app.get('/api/v1/tours', async (request, response) => {

    const rawData = await fs.readFile(`${__dirname}/dev-data/data/tours-simple.json`);
    const tours = await JSON.parse(rawData);

    response.status(200).json({
        status: 'success',
        data: {
            tours
        }
    });
});


const port = 3000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
});