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

async function readJSONFile () {
    return await JSON.parse(await fs.readFile(`${__dirname}/dev-data/data/tours-simple.json`));
}

async function writeJSONFile (data) {
    await fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(data, null, 4));
}



app.use(express.json());

app.get('/api/v1/tours', async (request, response) => {
    const tours = await readJSONFile();
    response.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
});


app.post('/api/v1/tours', async (request, response) => {
    const tours = await readJSONFile();
    const newID = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newID }, request.body);
    tours.push(newTour);
    // JSON.stringify with these options return JSON text in human readable format.
    await writeJSONFile(tours);
    response.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
});


const port = 3000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
});