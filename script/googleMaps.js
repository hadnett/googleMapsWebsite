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
             locations.push([i, jsonData[i].name , jsonData[i].photo ,  jsonData[i].content , parseFloat(jsonData[i].latitude), parseFloat(jsonData[i].longitude), jsonData[i].icon]);
        }
   
        console.log(locations);

        let lat_lng = {lat: 37.607269, lng: 140.021412};

        let dkit_map = new google.maps.Map(document.getElementById("mapDiv"), {
            zoom: 5,
            center: lat_lng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        let infobox = [];
        
        var iconBase = 'https://img.icons8.com/dusk/64/000000/';


        for (i = 0; i < locations.length; i++)
        {
            let marker = new google.maps.Marker
                    (
                            {
                                title: locations[i][NAME],
                                map: dkit_map,
                                position: new google.maps.LatLng(locations[i][LATITUDE], locations[i][LONGITUDE]),
                                icon: iconBase + locations[i][ICON],
                                zIndex: locations[i][ID]   // the zIndex is being used to hold a unique index for each marker
                            }
                    );

            infobox[marker.zIndex] = new InfoBox
                    (
                            {
                                content: locations[i][CONTENT],
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
            
                    
            
        }
    }
}
