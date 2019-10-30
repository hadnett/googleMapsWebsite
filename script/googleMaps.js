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

        let lat_lng = {lat: 38.403671, lng: 140.468680};

        map = new google.maps.Map(document.getElementById("mapDiv"), {
            zoom: 5.55,
            center: lat_lng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        infobox = [];
        let nearbyServicesMarkers = [];
        let location_content_string;
        for (i = 0; i < locations.length; i++)
        {
            let icon = {
                url: 'https://img.icons8.com/dusk/64/000000/' + locations[i][ICON],
                scaledSize: new google.maps.Size(35, 35)
            };

            location_content_string = '<div id="mainContent"><h1>' + locations[i][NAME] + '</h1><hr><div id="subContent"><img id="locationImage" src="' + locations[i][PHOTO] + ' "><p>' + locations[i][CONTENT] + '</p></div></div><h2>Gallery</h2><hr>';

            if (locations[i][TYPE] === "City")
            {
                document.getElementById("scrollMenu").innerHTML += '<div class="mainContentSlider" onclick="panToCity(' + i + ')"><div class="menuImages"><img src="' + locations[i][PHOTO] + '"></div><div class="menuText"><a>' + locations[i][NAME] + '</a></div></div>';
            }
            ;

            let location_marker;
            let mapWindow = new google.maps.InfoWindow();

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

            for (let i = 0; i < locations.length; i++)
            {

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
                        createMarker(results[i]);
                    }
                }
            }

            function createMarker(place)
            {
                let marker = new google.maps.Marker(
                        {
                            map: map,
                            icon: getIcon(),
                            position: place.geometry.location
                        });

                nearbyServicesMarkers.push(marker);

                google.maps.event.addListener(marker, 'click', function ()
                {
                    let phoneNumber = place.international_phone_number;
                    let address = place.formatted_address;

                    if (phoneNumber === undefined)
                    {
                        phoneNumber = "Not Listed";
                    }
                    if (address === undefined)
                    {
                        address = "Not Listed";
                    }

                    infoBoxClose();
                    mapWindow.setContent('<strong>' + place.name + '</strong><br><br><div>Address: ' + address + '</div><div>Phone Number: ' + phoneNumber + '</div>');
                    mapWindow.open(map, this);

                });
            }


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
    console.log();
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
    }

    return icon;
}