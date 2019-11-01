let directionsService;
let directionsDisplay; 
function init()
{

    displayMap();
    var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(31.188483, 127.958649),
            new google.maps.LatLng(44.490781, 151.054930));

    var options = {
        bounds: defaultBounds
    };

    let start = document.getElementById('start');
    autocomplete = new google.maps.places.Autocomplete(start, options);
    let end = document.getElementById('end');
    autocomplete = new google.maps.places.Autocomplete(end, options);
    
    directionsService = new google.maps.DirectionsService();

    directionsDisplay = new google.maps.DirectionsRenderer();
    
    directionsDisplay.setPanel(document.getElementById('directions'));
}

let travelMode = "DRIVING";

function calculateRoute()
{
    let start = null,
            end = null;

    start = document.getElementById('start').value;
    end = document.getElementById('end').value;
    
    let request = {origin: start,
        destination: end,
        travelMode: google.maps.TravelMode[travelMode]};
    
    directionsDisplay.setMap(map);

    directionsService.route(request, function (response, status)
    {
        if (status === google.maps.DirectionsStatus.OK)
        {
            directionsDisplay.setDirections(response);
        }
    });
}

function resetRoute()
{   
    displayMap();
    
    document.getElementById('directions').innerHTML = "";
}