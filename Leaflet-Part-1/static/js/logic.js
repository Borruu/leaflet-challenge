let url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

let newUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

d3.json(url).then(function (data) {
  console.log(data.bbox);
  console.log(data.features);
  // mapFeatures(data.features);
});

// function getGeometry(data) {}
// get coordinates - lat, long, depth - from data. geometry[coordinates][0],[1],[2]
// get magnitude from properties.mag

// Create function to determine marker colour by earthquake depth
function setColour(input) {
  if (input < 100) {
    return "#ffffb2";
  } else if (input < 200) {
    return "#eec60a";
  } else if (input < 300) {
    return "#fda403";
  } else if (input < 400) {
    return "#e8751a";
  } else if (input < 500) {
    return "#AD5389";
  } else {
    return "#3C1053";
  }
}

function setBorder(input) {
  if (input < 300) {
    return "black";
  } else {
    return "white";
  }
}
// Create function to determine marker size by earthquake magnitude
function setRadius(input) {
  return input * 50000;
}

// Create empty array to store earthquake markers
let eqMarkers = [];
let depths = [];
// Loop through data, create earthquake markers and add them to eqMarkers array

// ______________________________________________________________________________________
d3.json(url).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define function for each feature in the features array.
  // Create popup that describes the place and time of the earthquake.
  // Create earthquake circle markers and add them to eqMarkers array
  function onEachFeature(feature, layer) {
    depths.push(feature.geometry.coordinates[2]);
    eqMarkers.push(
      L.circle(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
        {
          stroke: true,
          weight: 0.5,
          fillOpacity: 0.7,
          color: setBorder(feature.geometry.coordinates[2]),
          fillColor: setColour(feature.geometry.coordinates[2]),
          // size by earthquake magnitude
          radius: setRadius(feature.properties.mag),
        }
      ).bindPopup(
        `<h3>${feature.properties.place}</h3><hr><p>${new Date(
          feature.properties.time
        )}</p>`
      )
    );
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
  });

  // Send earthquakes layer to the createMap function
  createMap(earthquakes);

  // check magnitude values
  console.log(depths);
  console.log(Math.max.apply(Math, depths));
  console.log(Math.min.apply(Math, depths));
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

  // Create a baseMaps object to contain the streetmap and the topographical map.
  let baseMaps = {
    Street: street,
    Topography: topo,
  };
  // Create layer group for earthquake markers.
  let eqLayer = L.layerGroup(eqMarkers);
  let overlayMaps = {
    Earthquakes: eqLayer,
  };

  // Create initial blank map
  let myMap = L.map("map", {
    center: [0, 0],
    zoom: 2,
    layers: [street, eqLayer],
  });

  // Create a layer control that contains our baseMaps and overlayMaps, and add them to the map.
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let limits = [
      "<100m",
      "100-200m",
      "200-300m",
      "300-400m",
      "400-500m",
      "500m+",
    ];
    let colours = [
      "#ffffb2",
      "#eec60a",
      "#fda403",
      "#e8751a",
      "#AD5389",
      "#3C1053",
    ];
    let labels = [];

    let legendInfo = "<h4>Depth (Metres)</h4>";
    // +
    // '<div class="labels">' +
    // '<div class="min">' +
    // limits[0] +
    // "</div>" +
    // '<div class="max">' +
    // limits[limits.length - 1] +
    // "</div>" +
    // "</div>";

    div.innerHTML = legendInfo;

    for (let i = 0; i < limits.length; i++) {
      // labels.push(
      //   `<li><span style="background-color: ${colours[i]}"></span><span>${limits[i]}</span></li>`
      // );

      // div.innerHTML +=
      //   '<div style="background-color: ' + colours[i] + '"></div> ' + labels[i];

      div.innerHTML += `<div><i style="background:${colours[i]}"></i> 
            ${limits[i]}</div>`;
    }

    // "<ul style='list-style-type:none;'>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap);
}
