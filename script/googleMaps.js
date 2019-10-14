window.onload = onAllAssetsLoaded;
document.write("<div id='loadingMessage'>Loading...</div>");
function onAllAssetsLoaded()
{
    // hide the webpage loading message
    document.getElementById('loadingMessage').style.visibility = "hidden";

    displayMap();
}


function displayMap()
{
    let dkit_map = new google.maps.Map(document.getElementById('mapDiv'),
            {zoom: 6,
                center: new google.maps.LatLng(36.204823, 138.252930),
                mapTypeId: google.maps.MapTypeId.ROADMAP});

}

