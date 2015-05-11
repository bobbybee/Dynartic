/*
 * DynImage.js
 * node.js module to perform the bulk of the calculations used in Dynartic
 * main.js is a light frontend to this data structure
 */

function DynImage(width, height, buffer) {
	this.width = width;
	this.height = height;
	this.buffer = buffer;

	// prefill with black as opposed to nonsense from memory
	this.fillColor(0, 0, 0, 0);
}

// blindly fills the entirety of the buffer with a given color
// used for initialization, etc.
DynImage.prototype.fillColor = function(r, g, b, a) {
	for(var i = 0; i < (this.width * this.height * 4); i += 4) {
		this.buffer[i + 0] = r;
		this.buffer[i + 1] = g;
		this.buffer[i + 2] = b;
		this.buffer[i + 3] = a;
	}
}

module.exports = DynImage;
