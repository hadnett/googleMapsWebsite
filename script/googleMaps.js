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
    // These constants must start at 0
    // These constants must match the data layout in the 'locations' array below
    let ID = 0;  // the marker's zIndex is being used to hold a unique index for each marker
    let TITLE = 1;
    let CONTENT = 2;
    let LATITUDE = 3;
    let LONGITUDE = 4;


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
             locations.push([i, jsonData[i].name, '<div id="mainContent"><h1>' + jsonData[i].name + '</h1><hr><div id="subContent"><img src="' + jsonData[i].photo + '"><p>' + jsonData[i].content + '</p></div></div>', parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longitude)]);
        }

        let lat_lng = {lat: 37.607269, lng: 140.021412};

        let dkit_map = new google.maps.Map(document.getElementById("mapDiv"), {
            zoom: 5,
            center: lat_lng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        let infobox = [];

        for (i = 0; i < locations.length; i++)
        {
            let marker = new google.maps.Marker
                    (
                            {
                                title: locations[i][TITLE],
                                map: dkit_map,
                                position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]),
                                zIndex: locations[i][ID]   // the zIndex is being used to hold a unique index for each marker
                            }
                    );

            infobox[marker.zIndex] = new InfoBox
                    (
                            {
                                content: locations[i][CONTENT],
                                disableAutoPan: false,
                                pixelOffset: new google.maps.Size(-200, -280),
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
        }
    }
}
