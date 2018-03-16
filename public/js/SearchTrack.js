/*
    SearchTrack.js

    ~ uses Select2 to search the spotify library and return results

*/

var _id = id;
console.log(global_token);



$(".search_bar_select").select2({
    placeholder: "Please click to search for a track.",
    ajax: {
        url: "https://api.spotify.com/v1/search",
        dataType: 'json',
        delay: 250,
        headers: {
            "Authorization": "Bearer " + global_token,
            "Content-Type": "application/json",
        },
        data: function (params) {
            return {
                query: params.term,
                type: "track",
                market: "US",
                limit: 10
            };
        },
        processResults: function (data) {
            var items = [];
            data.tracks.items.forEach(function (d) {
                //if (selectedTrack.indexOf(d.id) == -1) {
                items.push(d);
                //}
            });

            return {
                results: items
            };
        },
        cache: true
    },
    escapeMarkup: function (markup) { return markup; },
    minimumInputLength: 1,
    templateResult: formatTrack,
    templateSelection: formatTrackSelection

});

function formatTrack(track) {
    if (track.loading) {
        return "<div>Searching for tracks..</div>";
    }

    var html = "<div class='select2-result-repository clearfix'>" +
        "<div class='select2-result-repository__avatar'><img src='" + ((track.album.images.length > 2) ? track.album.images[2].url : '../assets/unknown.png') + "' /></div>" +
        "<div class='select2-result-repository__meta'>" +
        "<div class='select2-result-repository__title'>" + track.name + " -<br/>" + track.album.artists[0].name + "</div></div></div>";

    return html;
}

function formatTrackForList(track) {
    if (track.loading) {
        return "<div>Searching for tracks..</div>";
    }

    var html = "<div class='select2-result-repository clearfix'>" +
        "<img src='" + ((track.album.images.length > 2) ? track.album.images[2].url : '../assets/unknown.png') + "' />" +
        " " + track.name + " - " + track.album.artists[0].name + "</div><br>";

    return html;
}

function formatTrackSelection(track) {
    if (track.id == "") {
        return "Click to search for a track.";
    } else {

        var track_id = track.id;

        $.ajax({
            type: "POST",
            url: "/playlist/" + id,
            data: { track_id: track.id, _id: id, track: JSON.stringify(track), functionality: "add" },
            success: function () {
                //alert('success');
                setTimeout(reloadpage(), 3000);
                socket.emit('refresh', id);

            }
        });


        console.log(global_username);
        console.log(global_playlistid);
        console.log(track.id);
        //wrong place to put this
        //addTrack(global_username, global_playlistid, track.id);

        
        
        return "Last selected: " + track.name + " - " + (track.album.artists[0].name);
    }

    //Set global track identifier to equal the last searched track

}

function reloadpage() {
    location.reload();
}

function deleteTrack(track) {
    //Prevent track click from activating widget
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    $.ajax({
        type: "POST",
        url: "/playlist/" + id,
        data: { track_id: track.id, _id: id, track: JSON.stringify(track), functionality: "delete" },
        success: function () {
            //alert('success');
            setTimeout(reloadpage(), 3000);
            socket.emit('refresh', id);
        }
    });

    location.reload();
    socket.emit('refresh', id);

}

function reorderTrackUp(track) {
    //Prevent track click from activating widget
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    $.ajax({
        type: "POST",
        url: "/playlist/" + id,
        data: { track_id: track.id, _id: id, track: JSON.stringify(track), functionality: "up" },
        success: function () {
            //alert('success');
            setTimeout(reloadpage(), 3000);
            socket.emit('refresh', id);
        }
    });

    location.reload();
    socket.emit('refresh', id);

}

function reorderTrackDown(track) {
    //Prevent track click from activating widget
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    $.ajax({
        type: "POST",
        url: "/playlist/" + id,
        data: { track_id: track.id, _id: id, track: JSON.stringify(track), functionality: "down" },
        success: function () {
            //alert('success');
            setTimeout(reloadpage(), 3000);
            socket.emit('refresh', id);
        }
    });

    location.reload();
    socket.emit('refresh', id);

}

function changeTrack(track) {

    console.log(track);
    var base = "https://open.spotify.com/embed?uri=spotify:track:" + track.id + "&theme=white&view=coverart";
    console.log(base);
    document.getElementById("widget").src = base;

    /*searches playlist for track
    if(myplaylist.indexOf(track.id) == -1){
        //adds track to playlist object
        myplaylist.push(track.id)
        console.log(myplaylist);
        //adds track to playlist
        var li = document.createElement("li");
        li.innerHTML = formatTrackForList(track);
        document.getElementById("scroll-container").appendChild(li);
        $( "li" ).addClass( "track" );
    }   */
}

function addTrack(username, playlistid, trackid) {
    //console.log(playlistid);
    var urlString = 'https://api.spotify.com/v1/users/' + username + '/playlists/' + playlistid + '/tracks';
    var temp = "spotify:track:" + trackid;

    $.ajax({
        type: 'POST',
        url: urlString,
        data: JSON.stringify({
            'uris': [temp]
        }),
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + global_token
        },
        contentType: 'application/json',
        success: function (result) {
            console.log('Success');
        },
        error: function () {
            console.log('Error');
        }
    })
}

//Fancy delete button jquery
$(document).on('click', '.delete', function () {
    $(this).parent('a').addClass('open');
});
$(document).on('mouseleave', '.confirm', function () {
    $(this).parent('a').removeClass('open');
});
$(document).on('click', '.confirm', function () {
    window.location.replace("/playlist/" + id + "/delete");
});



