window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden";

    displayMap();
}


async function displayMap()
{

    let locations = [];
    let what = [];
    // These constants must start at 0
    // These constants must match the data layout in the 'locations' array below
    let ID = 0;  // the marker's zIndex is being used to hold a unique index for each marker
    let NAME = 1;
    let PHOTO = 2;
    let CONTENT = 3;
    let LATITUDE = 4;
    let LONGITUDE = 5;
    let ICON = 6;


    let url = "json/cities.json"; /* JSON file */
    let urlParameters = ""; /* Leave empty, as no parameter is passed to the JSON file */

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
            locations.push([i, jsonData[i].name, jsonData[i].photo, jsonData[i].content, parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longitude), jsonData[i].icon]);
            
        }

        let lat_lng = {lat: 38.403671, lng: 140.468680};

        let dkit_map = new google.maps.Map(document.getElementById("mapDiv"), {
            zoom: 5.55,
            center: lat_lng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        let infobox = [];

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

            google.maps.event.addListener(marker, 'click', function ()
            {
                // if another inforbox is open, then close it
                for (i = 0; i < infobox.length; i++)
                {
                    infobox[i].close();
                }

                infobox[this.zIndex].open(dkit_map, this);
                dkit_map.panTo(lat_lng);
            });

            new google.maps.Size(20, 20);



        }
    }
}
