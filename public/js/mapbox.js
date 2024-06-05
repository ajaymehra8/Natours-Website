
export const displayMap=(locations)=>{
var map = new maplibregl.Map({
  container: 'map', // container id
  style: 'https://api.maptiler.com/maps/bright-v2/style.json?key=RRICEqeuyMelVlPwmriL', // style URL
  // center:[34.111745,-11.113491],
  zoom: 2, // starting zoom
  scrollZoom:false
  // interactive:false
});
const bounds = new maplibregl.LngLatBounds();
locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add Marker
  new maplibregl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add pop up
  new maplibregl.Popup({offset: 30})
  .setLngLat(loc.coordinates)
  .setHTML(`<p>Day: ${loc.day} ${loc.description}</p>`)
  .setMaxWidth("300px")
  .addTo(map);

  // Extend mapp bound to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 200, left: 100, right: 100 },
});
}