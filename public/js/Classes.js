/*

		Classes.js

*/

function newElement() {
	console.log("newElement");
  var li = document.createElement("li");
  //var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode("hello");
  
  li.appendChild(t);
  //if (inputValue === '') {
  //  alert("You must write something!");
  //} else {
    document.getElementById("scroll-container").appendChild(li);
  //}
  //document.getElementById("myInput").value = "";
  $( "li" ).addClass( "track" );
/*
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }*/
}