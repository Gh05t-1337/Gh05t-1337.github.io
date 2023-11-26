// CANVAS
// canvas setup -------------------------------------------------------

var canvas = document.getElementById("myCanvas");
var c = canvas.getContext("2d");

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

var simMinWidth = 20.0;
var cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
var simWidth = canvas.width / cScale;
var simHeight = canvas.height / cScale;

function cX(pos) {
    return pos.x * cScale;
}

function cY(pos) {
    return canvas.height - pos.y * cScale;
}

function sX(pos) {
    return pos.x/cScale;
}

function sY(pos) {
    return (pos.y - canvas.height) / -cScale;
}

	