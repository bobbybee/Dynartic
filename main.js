/*
 * Dynartic main.js
 * Performs the bulk of the operation for Dynartic
 * Dynartic is a tool for automatically generating beautiful yet abstract art
 * Think of it as Lorem Ipsum for images
 */

var fs = require("fs");
var Png = require("png").Png;
var DynImage = require("./DynImage");

// fetch configuration values
// TODO: better way of doing this, maybe
var width = process.argv[2]*1;
var height = process.argv[3]*1;

// buffer size is: width * height * 4 (RGBA is 4 bytes)
var buffer = new Buffer(width * height * 4);

// bare calculations are offset to DynImage
var dynimage = new DynImage(width, height, buffer);

// fill the image with a random, opaque color to start with
dynimage.fillColor(
		Math.floor(Math.random() * 255),
		Math.floor(Math.random() * 255),
		Math.floor(Math.random() * 255),
		0	
		);

dynimage.pullPoint(width / 2, height / 2, width, 2);

var png = new Png(buffer, width, height, 'rgba');
png.encode(function(image) {
			fs.writeFile("output.png", image);
		});
