//Delete toast
function launch_toast() {
    var x = document.getElementById("toast")
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}

if(window.attachEvent) {
    window.attachEvent('onload', launch_toast);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function(evt) {
            curronload(evt);
            launch_toast(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = launch_toast;
    }
}