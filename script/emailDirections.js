function emailDirections()
{
    let start = null,
            end = null;

    start = document.getElementById('start').value;
    end = document.getElementById('end').value;

    if (start === "" || end === "")
    {
        window.alert("You must enter a Start and an End point!");
    } else
    {
        window.open('mailto:test@example.com?subject=Directions: ' + start + ' to ' + end + '&body=https://www.google.com/maps/dir/' + start + '/' + end + '');
    }
}

