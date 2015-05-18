/*
 * DynImage.js
 * node.js module to perform the bulk of the calculations used in Dynartic
 * main.js is a light frontend to this data structure
 */

function DynImage(width, height, buffer) {
	this.width = width;
	this.height = height;
	
	this.lesserDimension = this.width > this.height ?
				this.height :
				this.width;
	
	this.buffer = buffer;

	// prefill with black as opposed to nonsense from memory
	this.fillColor(0, 0, 0, 0);
}

// gets or sets the color; RGBA<->XY

DynImage.prototype.coordIndex = function(x, y) {
	return 4 * ((y * this.width) + x);
}

DynImage.prototype.getColor = function(x, y) {
	x = Math.floor(x);
	y = Math.floor(y);

	if(
		(x < 0) ||
		(y < 0) ||
		(x >= this.width) ||
		(y >= this.height)
	  ) {
		return [0,0,0,0]; // out of bounds
	}	

	var index = this.coordIndex(x, y);

	return [
		this.buffer[index],
		this.buffer[index+1],
		this.buffer[index+2],
		this.buffer[index+3]
	];
}

DynImage.prototype.setColor = function(x, y, r, g, b, a) {
	if(typeof a === 'undefined') a = 0; // A is optional; opaque if unspecified
	
	x = Math.floor(x);
	y = Math.floor(y);

	if(
		(x < 0) ||
		(y < 0) ||
		(x >= this.width) ||
		(y >= this.height)
	  ) {
		return; // out of bounds
	}	

	var index = this.coordIndex(x, y);


	this.buffer[index+0] = Math.floor(r);
	this.buffer[index+1] = Math.floor(g);
	this.buffer[index+2] = Math.floor(b);
	this.buffer[index+3] = Math.floor(a);
}

// blindly fills the entirety of the buffer with a given color
// used for initialization, etc.
DynImage.prototype.fillColor = function(r, g, b, a) {
	/*for(var i = 0; i < (this.width * this.height * 4); i += 4) {
		this.buffer[i + 0] = r;
		this.buffer[i + 1] = g;
		this.buffer[i + 2] = b;
		this.buffer[i + 3] = a;
	}*/
	for(var x = 0; x < this.width; ++x) {
		for(var y = 0; y < this.height; ++y) {
			this.setColor(x, y, r, g, b, a);
		}
	}
}

// "pulls" the image up
// starting with a point, that point is raised a certain, specified amount (this is of course an analogy)
// this causes the alpha value at that point to be raised to this value,
// and ripples the effect the nearby pixels as well
DynImage.prototype.pointRing = function(sx, sy, height, layerIntensity) {
	var rippleAmount = (255 / this.lesserDimension) * height;

	var usedPoints = {};

	for(var r = 0; r < height; r += 0.1) {
		c: for(var theta = 0; theta < (2 * Math.PI); theta += 0.01) {
			// tracing points around many concentric circles

			var x = (r * Math.cos(theta)) + sx,
			    y = (r * Math.sin(theta)) + sy;

			if(usedPoints[x+";"+y]) continue c;

			usedPoints[x+";"+y] = 1;
	
			var distance = Math.sqrt( ( (sx - x) * (sx - x) ) + ( (sy - y) * (sy - y) ) );
			var intensity = (height - distance) / height; // linear function.
			// this outputs a value 0-1, where 1 is the full effect of pulling and 0 is no effect
			// in the future, we may want a smoother curve
			// TODO: find alternative that works better
			
			//var intensity = 0.5;

			var currentColor = this.getColor(x, y);
			this.setColor(x, y, 
				currentColor[0] - (intensity * layerIntensity),
				currentColor[1] - (intensity * layerIntensity),
				currentColor[2] - (intensity * layerIntensity)
				     );
		}
	}		
}

DynImage.prototype.punchImage = function(sx, sy, sw, sh, force, spread) {
	for(var i = -(sw / 2); i < (sw/2); ++i) {
		for(var j = (-(sh/2)); j < (sh/2); ++j) {
			var x = sx + i,
    			    y = sy + j;
	
			var intensity = Math.sqrt( (i*i) + (j*j) );
			intensity = Math.pow(2, -intensity / spread);	
			this.punchPoint(x, y, intensity * force);
		}
	}	
}

// opposite of point pulling; works on a single point only

DynImage.prototype.punchPoint = function(x, y, force) {
	var color = this.getColor(x, y);
	color[0] -= force;
	color[1] -= force;
	color[2] -= force;

	color[0] = color[0] > 0 ? color[0] < 256 ? color[0] : 255 : 0;
	color[1] = color[1] > 0 ? color[0] < 256 ? color[1] : 255 : 0;
	color[2] = color[2] > 0 ? color[0] < 256 ? color[2] : 255 : 0;
	
	this.setColor(x, y, color[0], color[1], color[2], color[3]);
}

module.exports = DynImage;
