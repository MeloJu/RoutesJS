

        const platform = new H.service.Platform({
            'apikey': 'KEY' 
        });

        // Obtain the default map types from the platform object:
        const defaultLayers = platform.createDefaultLayers();

        // Instantiate (and display) a map:
        const map = new H.Map(
            document.getElementById("mapContainer"),
            defaultLayers.vector.normal.map, {
                zoom: 7,
                center: { lat: 56.97, lng: 24.09 },
                // Add space around the map edges to ensure markers are not cut off:
                padding: { top: 50, right: 50, bottom: 50, left: 50 }
            });

        const origin = { lat: -22.48269014180797, lng: -41.905201430667006};
        const destination = { lat: -22.52543008498074, lng: -41.9230971292242};

        // Create the parameters for the routing request:
        const routingParameters = {
            'routingMode': 'fast',
            'transportMode': 'pedestrian',
            // The start point of the route:
            'origin': `${origin.lat},${origin.lng}`,
            // The end point of the route:
            'destination': `${destination.lat},${destination.lng}`,
            // Include the route shape in the response
            'return': 'polyline',
        };  


const onResult = function(result) {
    if (result.routes.length) {
        const routeData = {
            origin: origin,
            destination: destination,
            waypoints: []
        };

        const lineStrings = [];
        
        result.routes[0].sections.forEach((section) => {
            const lineString = H.geo.LineString.fromFlexiblePolyline(section.polyline);
            lineStrings.push(lineString);

            const coordinates = lineString.getLatLngAltArray();
            console.log('Coordenadas da rota:', coordinates);

            if (coordinates.length > 6) {
                const intermediates = coordinates.slice(3, coordinates.length - 3);
                console.log('Pontos intermediários:', intermediates);

                for (let i = 0; i < intermediates.length; i += 3) { 
                    const lat = intermediates[i];
                    const lng = intermediates[i + 1];
                    routeData.waypoints.push({ lat, lng });

                    const waypointMarker = new H.map.Marker({ lat, lng });
                    map.addObject(waypointMarker);
                }
            }
        });

        const multiLineString = new H.geo.MultiLineString(lineStrings);

        const routeLine = new H.map.Polyline(multiLineString, {
            style: { strokeColor: 'blue', lineWidth: 3 }
        });

      
        const startMarker = new H.map.Marker(origin);
        const endMarker = new H.map.Marker(destination);


        const group = new H.map.Group();
        group.addObjects([routeLine, startMarker, endMarker]);
        map.addObject(group);

      
        map.getViewModel().setLookAtData({
            bounds: group.getBoundingBox()
        });

     
        console.log('Objeto Polyline:', routeLine);

     
        saveRouteDataAsJSON(routeData);
    }
};


function saveRouteDataAsJSON(routeData) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routeData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "routeData.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

const router = platform.getRoutingService(null, 8);


router.calculateRoute(routingParameters, onResult, function(error) {
    alert(error.message);
});


const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));


window.addEventListener('resize', () => map.getViewPort().resize());

