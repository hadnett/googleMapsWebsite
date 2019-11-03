window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden";

    displayMap();
}

let locations = [];

let LATITUDE;
let LONGITUDE;

let map;
let infobox;
let location_marker;
let mapWindow;

async function displayMap()
{

    ID = 0;
    NAME = 1;
    PHOTO = 2;
    CONTENT = 3;
    LATITUDE = 4;
    LONGITUDE = 5;
    ICON = 6;
    TYPE = 7;

    let url = "json/locationsJapan.json";
    let urlParameters = "";

    try
    {
        const response = await fetch(url,
                {
                    method: "POST",
                    headers: {'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    body: urlParameters
                });
        updateWebpage(await response.json());
    } catch (error)
    {
        console.log("Fetch failed: ", error);
    }

    function updateWebpage(jsonData)
    {

        for (let i = 0; i < jsonData.length; i++)
        {
            locations.push([i, jsonData[i].name, jsonData[i].photo, jsonData[i].content, parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longitude), jsonData[i].icon, jsonData[i].type]);

        }

        createMap();

        infobox = [];

        let location_content_string;
        for (i = 0; i < locations.length; i++)
        {
            let icon = {
                url: 'https://img.icons8.com/dusk/64/000000/' + locations[i][ICON],
                scaledSize: new google.maps.Size(35, 35)
            };

            location_content_string = '<div id="mainContent"><h1>' + locations[i][NAME] + '</h1><hr><div id="subContent"><img id="locationImage" src="' + locations[i][PHOTO] + ' "><p>' + locations[i][CONTENT] + '</p><button class="directionsButton" onclick="calculateRouteCurrent(' + locations[i][LATITUDE] + ',' + locations[i][LONGITUDE] + ')">Get Directions</button></div></div>';
            if (locations[i][TYPE] === "City")
            {
                document.getElementById("scrollMenu").innerHTML += '<div class="mainContentSlider" onclick="panToCity(' + i + ')"><div class="menuImages"><img src="' + locations[i][PHOTO] + '"></div><div class="menuText"><a>' + locations[i][NAME] + '</a></div><div class="menuContent"><p>' + locations[i][CONTENT] + '</p></div></div>';
            }
            ;

            location_marker;
            mapWindow = new google.maps.InfoWindow();

            location_marker = new google.maps.Marker(
                    {
                        title: locations[i][NAME],
                        map: map,
                        position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]),
                        icon: icon,
                        zIndex: locations[i][ID]
                    }
            );

            infobox[location_marker.zIndex] = new InfoBox
                    (
                            {
                                content: location_content_string,
                                disableAutoPan: false,
                                pixelOffset: new google.maps.Size(-200, -270),
                                closeBoxMargin: "10px 10px 0px 0px",
                                closeBoxURL: "images/closeButton.png",
                                infoBoxClearance: new google.maps.Size(1, 1)
                            }
                    );

            google.maps.event.addListener(location_marker, 'click', function ()
            {
                infoBoxClose();
                infobox[this.zIndex].open(map, this);
                map.panTo({lat: locations[this.zIndex][LATITUDE], lng: locations[this.zIndex][LONGITUDE]});
            });


            google.maps.event.addListener(location_marker, 'click', (function (location_marker, i)
            {

                return function ()
                {

                    let services_centre_location = location_marker.position;
                    mapWindow.close();
                    let service = new google.maps.places.PlacesService(map);
                    service.nearbySearch(
                            {
                                location: services_centre_location,
                                radius: 1000,
                                type: [getType()]
                            }, getNearbyServicesMarkers);
                }
            })(location_marker, i));

        }

        let nearbyServicesMarkers = [];
        function getNearbyServicesMarkers(results, status)
        {
            if (status === google.maps.places.PlacesServiceStatus.OK)
            {
                if (nearbyServicesMarkers.length > 0)
                {
                    for (let i = 0; i < nearbyServicesMarkers.length; i++)
                    {
                        nearbyServicesMarkers[i].setVisible(false);
                    }
                }

                nearbyServicesMarkers = [];
                for (let i = 0; i < results.length; i++)
                {
                    (function (i)
                    {
                        //Set time out function required to resolve over_query_limit
                        //brought about to overloading Google with requests. 
                        setTimeout(function () {

                            createMarker(results[i]);

                            let request =
                                    {
                                        placeId: results[i].place_id
                                    };
                            service = new google.maps.places.PlacesService(map);
                            service.getDetails(request, createServiceMarkers);

                        }, i < 9 ? 0 : 500 * i);
                    })(i);
                }
            }
        }

        function createServiceMarkers(place, status)
        {
            if (status === google.maps.places.PlacesServiceStatus.OK)
            {
                createMarker(place);
            } else
            {
                console.log("Status Not Okay " + status);
            }
        }

        function createMarker(place)
        {
            let marker = new google.maps.Marker(
                    {
                        map: map,
                        position: place.geometry.location,
                        icon: getIcon()
                    });

            nearbyServicesMarkers.push(marker);


            google.maps.event.addListener(marker, 'click', function ()
            {
                let address;
                address = place.formatted_address;
                address = address.replace(/,/g, '<br>');
                let phoneNumber = place.international_phone_number;
                let website = place.website;

                if (address === undefined)
                {
                    address = "Not Listed";
                }
                if (phoneNumber === undefined)
                {
                    phoneNumber = "Not Listed";
                }
                if (website === undefined)
                {
                    website = "Not Listed";
                }

                infoBoxClose();
                mapWindow.setContent('<div class="serviceName"><strong>' + place.name + '</strong></div><br><div><strong>Address: </strong><br>' + address + '</div><br><div><strong>Phone Number: </strong>' + phoneNumber + '</div><br><div><strong>Website: </strong><br><a href="' + website + '" target="_blank">' + website + ' </a></div><br><div><button class="directionsButton" onclick="calculateRouteCurrent(' + place.geometry.location.lat() + ',' + place.geometry.location.lng() + ')">Get Directions</button></div>');
                mapWindow.open(map, this);

            });
        }

    }
}

function panToCity(x)
{
    for (i = 0; i < locations.length; i++)
    {
        if (x === locations[i][ID])
        {
            map.panTo({lat: locations[i][LATITUDE], lng: locations[i][LONGITUDE]});
            map.setZoom(15);

        }
        infobox[i].close();
    }
}

function infoBoxClose()
{
    for (i = 0; i < infobox.length; i++)
    {
        infobox[i].close();
    }
}

function getType()
{
    let selection = document.getElementById("locationList");
    let value = selection.options[selection.selectedIndex].value;

    return value;
}

function getIcon()
{
    let icon;
    if (getType() === 'cafe')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/tea-cup.png',
            scaledSize: new google.maps.Size(35, 35)
        };


    } else if (getType() === 'restaurant')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/restaurant.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'bar')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/bar.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'night_club')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/dj.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'parking')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/parking.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'hospital')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/hospital.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'police')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/policeman-male.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    } else if (getType() === 'lodging')
    {
        icon = {
            url: 'https://img.icons8.com/dusk/64/000000/3-star-hotel.png',
            scaledSize: new google.maps.Size(35, 35)
        };
    }

    return icon;
}

