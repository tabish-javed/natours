const fs = require('node:fs/promises');
const express = require('express');
const app = express();


// function to read file from disk
async function readJSONFile () {
    return await JSON.parse(await fs.readFile(`${__dirname}/dev-data/data/tours-simple.json`));
}

// function to write file to disk
async function writeJSONFile (data) {
    await fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(data, null, 4));
}


// HANDLERS ----------------------

// get all tours ----
async function getAllTours (request, response) {
    const tours = await readJSONFile();
    response.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    });
}

// get one tour ----
async function getTour (request, response) {
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
}

// create tour ----
async function createTour (request, response) {
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
}

// update tour ----
async function updateTour (request, response) {
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
}

// delete tour ----
async function deleteTour (request, response) {
    const tours = await readJSONFile();
    if (+request.params.id > tours.length) {
        return response.status(404).json({
            status: 'failure',
            message: `Unable to find the tour with ID: ${request.params.id}`
        });
    }

    response.status(204).json({
        status: 'success',
        data: {
            tour: null
        }
    });
}


// ALL BELOW SEPARATE ROUTES FOR GET, POST, PATCH AND DELETE ARE TURNED INTO APP.ROUTE
/*
// this is the primary request handler for get specific route
app.get('/api/v1/tours', getAllTours);

// this route handles request/url parameters such as; /api/v1/tours/7
app.get('/api/v1/tours/:id', getTour);

// this handler works for post requests
app.post('/api/v1/tours', createTour);

// this handler will update data - TODO - implement actual update instead of just a response
app.patch('/api/v1/tours/:id', updateTour);

// delete handler
app.delete('/api/v1/tours/:id', deleteTour);
 */
// ALL ABOVE SEPARATE ROUTES FOR GET, POST, PATCH AND DELETE ARE TURNED INTO APP.ROUTE


// middleware to include request's body to be used by other routes
app.use(express.json());


app
    .route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

// app startup
const port = 3000;
app.listen(port, () => {
    console.log(`App started on port ${port}`);
});