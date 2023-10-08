/* eslint-disable no-console */
console.log('hello form the client side! :)');

// dataset variable is defined in template on the element of ID = #map
// so the element will include all data in it's dataset.location property
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);