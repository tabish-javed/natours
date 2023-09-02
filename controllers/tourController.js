// INTERNAL
const fs = require('node:fs/promises');

// File IO Operations
async function readJSONFile () {
    return await JSON.parse(await fs.readFile(`${__dirname}/../dev-data/data/tours-simple.json`));
}

async function writeJSONFile (data) {
    await fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`, JSON.stringify(data, null, 4));
}


// MIDDLEWARE BELOW -----------------------------
async function checkID (request, response, next, value) {
    console.log(`Tour id is: ${value}`);
    const tours = await readJSONFile();
    if (+request.params.id > tours.length) {
        return response.status(404).json({
            status: 'failure',
            message: `Unable to find the tour with ID: ${request.params.id}`
        });
    }
    next();
}

function checkBody (request, response, next) {
    if (!request.body.name || !request.body.price) {
        return response.status(400).json({
            status: 'failure',
            message: 'Missing name or price.'
        });
    }
    next();
}
// MIDDLEWARE ABOVE -----------------------------

// TOURS CONTROLLERS ----------------------
// get all tours ----
async function getAllTours (request, response) {
    const tours = await readJSONFile();
    response.status(200).json({
        status: 'success',
        requestedAt: request.requestTime,
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
    response.status(200).json({
        status: 'success',
        data: {
            tour: `Tour ID: ${request.params.id} updated!`
        }
    });
}

// delete tour ----
async function deleteTour (request, response) {
    response.status(204).json({
        status: 'success',
        data: {
            tour: null
        }
    });
}


module.exports = {
    checkID: checkID,
    checkBody: checkBody,
    getAllTours: getAllTours,
    getTour: getTour,
    createTour: createTour,
    updateTour: updateTour,
    deleteTour: deleteTour
};