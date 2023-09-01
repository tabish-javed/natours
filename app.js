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

// function to read file from disk
async function readJSONFile () {
    return await JSON.parse(await fs.readFile(`${__dirname}/dev-data/data/tours-simple.json`));
}

// function to write file to disk
async function writeJSONFile (data) {
    await fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(data, null, 4));
}


// middleware to include request's body to be used by other routes
app.use(express.json());

// this is the primary request handler for get specific route
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


// this route handles request/url parameters such as; /api/v1/tours/7
app.get('/api/v1/tours/:id', async (request, response) => {
    const tours = await readJSONFile();
    const tour = tours.find(element => +element.id === +request.params.id); // request.params will bring URL params

    if (!tour) {
        return response.status(404).json({
            status: 'failure',
            message: `Unable to find the tour with ID: ${request.params.id}`
        });
    }

    response.status(200).json({
        status: 'success',
        results: tour.length,
        data: {
            tour: tour
        }
    });
});


// this handler works for post requests
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


// this handler will update data - TODO - implement actual update instead of just a response
app.patch('/api/v1/tours/:id', async (request, response) => {
    const tours = await readJSONFile();
    if (+request.params.id > tours.length) {
        return response.status(404).json({
            status: 'failure',
            message: `Unable to find the tour with ID: ${request.params.id}`
        });
    }

    response.status(200).json({
        status: 'success',
        data: {
            tour: `Tour ID: ${request.params.id} updated!`
        }
    });
});


// app startup
const port = 3000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
});