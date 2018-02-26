/*
    SearchTrack.js

    ~ uses Select2 to search the spotify library and return results

*/

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
            data.tracks.items.forEach(function(d) {
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
    "<div class='select2-result-repository__avatar'><img src='" +  ((track.album.images.length > 2) ? track.album.images[2].url : '../assets/unknown.png') + "' /></div>" +
    "<div class='select2-result-repository__meta'>" +
      "<div class='select2-result-repository__title'>" + track.name + " -<br/>" + track.album.artists[0].name + "</div></div></div>";
    
    return html;
}

function formatTrackForList(track) {
    if (track.loading) {
        return "<div>Searching for tracks..</div>";
    }
    
    var html = "<div class='select2-result-repository clearfix'>"+
    "<img src='" +  ((track.album.images.length > 2) ? track.album.images[2].url : '../assets/unknown.png') + "' />" +
    " " + track.name + " - "+ track.album.artists[0].name + "</div><br>"; 
    
    return html;
}

function formatTrackSelection(track) {
    if (track.id == "") {
        return "Click to search for a track.";
    } else {
        //Call changetrack to 
        changeTrack(track);
        return "Last selected: " + track.name + " - " + (track.album.artists[0].name);
    }

    console.log(track.id);
    //Set global track identifier to equal the last searched track
    
}

function changeTrack(track) {

    var spotifyWidgetSource = document.getElementById('spotifyWidget-template').innerHTML,
            spotifyWidgetTemplate = Handlebars.compile(spotifyWidgetSource),
            spotifyWidgetPlaceholder = document.getElementById('spotifyWidget');

    spotifyWidgetPlaceholder.innerHTML = spotifyWidgetTemplate({
        track_id: track.id
      });

    //searches playlist for track
    if(myplaylist.indexOf(track.id) == -1){
        //adds track to playlist object
        myplaylist.push(track.id)
        console.log(myplaylist);
        //adds track to playlist
        var li = document.createElement("li");
        li.innerHTML = formatTrackForList(track);
        document.getElementById("scroll-container").appendChild(li);
        $( "li" ).addClass( "track" );
    }   
}