window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden";

    displayMap();
}

let locations = [];

let ID;
let NAME;
let PHOTO;
let CONTENT;
let LATITUDE;
let LONGITUDE;
let ICON;
let TYPE;

let dkit_map;
let infobox;

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
        
        console.log(locations);

        let lat_lng = {lat: 38.403671, lng: 140.468680};

        dkit_map = new google.maps.Map(document.getElementById("mapDiv"), {
            zoom: 5.55,
            center: lat_lng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        infobox = [];

        let location_content_string;
        for (i = 0; i < locations.length; i++)
        {
            let icon = {
                url: 'https://img.icons8.com/dusk/64/000000/' + locations[i][ICON],
                scaledSize: new google.maps.Size(35, 35)
            };

            location_content_string = '<div id="mainContent"><h1>' + locations[i][NAME] + '</h1><hr><div id="subContent"><img id="locationImage" src="' + locations[i][PHOTO] + ' "><p>' + locations[i][CONTENT] + '</p></div></div><h2>Gallery</h2><hr>';

            let marker = new google.maps.Marker
                    (
                            {
                                title: locations[i][NAME],
                                map: dkit_map,
                                position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]),
                                icon: icon,
                                zIndex: locations[i][ID] // the zIndex is being used to hold a unique index for each marker
                            }
                    );

            infobox[marker.zIndex] = new InfoBox
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

            if (locations[i][TYPE] === "City")
            {
                document.getElementById("scrollMenu").innerHTML += '<div class="mainContentSlider"><div class="menuImages"><img onclick="panToCity(' + i + ')" src="' + locations[i][PHOTO] + '"></div><div class="menuText">' + locations[i][NAME] + '</div></div>';
            };

            google.maps.event.addListener(marker, 'click', function ()
            {
                // if another inforbox is open, then close it
                for (i = 0; i < infobox.length; i++)
                {
                    infobox[i].close();
                }

                infobox[this.zIndex].open(dkit_map, this);
                dkit_map.panTo({lat: locations[this.zIndex][LATITUDE], lng: locations[this.zIndex][LONGITUDE]});
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
            dkit_map.panTo({lat: locations[i][LATITUDE], lng: locations[i][LONGITUDE]});
            dkit_map.setZoom(15.5);
            
        }
        infobox[i].close();
    }
}


