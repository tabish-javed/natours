// dataset variable is defined in template on the element of ID = #map
// so the element will include all data in it's dataset.location property
const locations = JSON.parse(document.getElementById('map').dataset.locations);


let map = L.map('map', { zoomControl: false, dragging: false });  //to disable + - zoom
// var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: ""
}).addTo(map);

// const points = [];
// locations.forEach((loc) => {
//     points.push([loc.coordinates[1], loc.coordinates[0]]);
//     L.marker([loc.coordinates[1], loc.coordinates[0]])
//         .addTo(map)
//         .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, { autoClose: false })
//         .openPopup();
// });

const points = locations.map((loc) => {
    L.marker([loc.coordinates[1], loc.coordinates[0]])
        .addTo(map)
        .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, { autoClose: true, closeButton: false })
        .openPopup();

    return [loc.coordinates[1], loc.coordinates[0]];
});

const bounds = L.latLngBounds(points).pad(0.5);
map.fitBounds(bounds);
map.flyToBounds(points, {
    duration: 3
});

map.scrollWheelZoom.disable();  //to disable zoom by mouse wheel