function getOverview (request, response) {
    // response.set("Content-Security-Policy", "default-src 'self'");
    response.status(200).render('overview', {
        title: 'All Tours'
    });
};


function getTour (request, response) {
    // response.set("Content-Security-Policy", "default-src 'self'");
    response.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    });
}


export default {
    getOverview,
    getTour
};