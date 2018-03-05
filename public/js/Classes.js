/*

		Classes.js

*/

var myplaylist = [];


function newElement() {
	//displays the playlist when button is clicked
	var x = document.getElementById("scroll-container");
    if (x.style.display === "") {
        x.style.display = "block";
    }
    //creates a playlist on spotty account
    var username = "jonathanlortiz";
    var playlistname = "boof3";
    createPlaylist(username,playlistname,true);
    
}