window.onload = init;
function init() {
    function formatYearMonth(yearMonth) {
        const yearMonthString = yearMonth.toString();
        const year = yearMonthString.substring(0, 4);
        const month = yearMonthString.substring(4);
        return `${year}/${month.padStart(2, '0')}`; // Ensures month is two digits
    }
    const map = new ol.Map({
        view: new ol.View({
            center: [0, 0],
            zoom: 3,
            projection: 'EPSG:4326'
        }),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
                visible: false,
                title: 'OSMLayer'
            })
        ],
        target: "map",
        KeyboardEventTarget: document
    });

    const bingMapLayer = new ol.layer.Tile({
        source: new ol.source.BingMaps({
            key: 'AhRis_VJden3yxuTtueY5Qega7LLNSl1K_vsD59dxfJLVs3tBoeRYDF6047Tq7Ub',
            imagerySet: 'AerialWithLabelsOnDemand'
        }),
        visible: true,
        title: 'BingMapLayer'
    });
    map.addLayer(bingMapLayer);

    const popupElement = document.getElementById("popup");
    const overlay = new ol.Overlay({
        element: popupElement,
        // positioning: 'top-left'
        
    });
    map.addOverlay(overlay);

    map.on('click', function(e) {
        const clickedCoordinates = e.coordinate;
        const roundedCoordinates = clickedCoordinates.map(coord => coord.toFixed(2));
        overlay.setPosition(undefined);
        overlay.setPosition(clickedCoordinates);

        // Convert coordinates to longitude and latitude for the backend
        const lat = roundedCoordinates[1];
        const lon = roundedCoordinates[0];
        console.log(`Requesting data for: http://localhost:5500/searchByCoordinates?lat=${lat}&lon=${lon}`); // Checkpoint 1

    fetch(`http://localhost:5500/searchByCoordinates?lat=${lat}&lon=${lon}`)
         .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    return response.json();
})
.then(data => {
    // Check if data is an array before iterating
    if (Array.isArray(data)) {
        if (data.length === 0) {
            popupElement.innerHTML = 'No events found for the provided coordinates.';
        } else {
            // let content = '<table>';
            let content = '<table><tr><th>RANGE</th><th>YEAR/MONTH</th><th>LOCATION</th></tr>';
            data.forEach(item => {
                // Use the formatYearMonth function to format the YEARMONTH
                const formattedYearMonth = formatYearMonth(item.YEARMONTH);
                content += `<tr><td>${item.RANGE}</td><td>${formattedYearMonth}</td><td>${item.LOCATION}</td> </tr>`;
            });
            // data.forEach(item => {
            //     content += `<tr><td>${item.EVENT_ID}</td><td>${item.RANGE}</td><td>${item.YEARMONTH}</td></tr>`;
            // });
            content += '</table>';
            popupElement.innerHTML = content; // Display the results in the popup
        }
    } else {
        // Handle non-array data (e.g., an object with a message property)
        popupElement.innerHTML = data.message || 'Unexpected response format from server.';
    }
})
.catch(error => {
    console.log('Error:', error);
    popupElement.innerHTML = error.message; // Display the error message in the popup
});
});
}
