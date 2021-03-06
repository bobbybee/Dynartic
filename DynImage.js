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
DynImage.prototype.pointRing = function(sx, sy, height, layerIntensity, intensityMultiplier) {
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
			var intensity = Math.log(height - distance) * intensityMultiplier; // linear function.
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

DynImage.prototype.explosion = function(width, radius, thresh, dk, ck ) {
    for(var i = (width / 2) - (radius); i < (width / 2) + radius; ++i) {
        for(var j = (width / 2) - (radius); j < (width / 2) + radius; ++j) {
            if(Math.sqrt( ( ((width / 2) - i) * ((width / 2) - i) ) + ((width / 2) - j) * ((width / 2) - j) ) > radius) break;

            if(Math.random() < thresh) {
                // explode pixel
                
                var theta = Math.random() * Math.PI * 2;

                var newX = i + ( (dk * (width / 2)) * Math.cos(theta));
                var newY = j + ( (dk * (width / 2)) * Math.sin(theta));

                var color = this.getColor(i, j);
                this.setColor(newX, newY, color[0] + ( (Math.random() - 0.5) * ck), color[1] + ( (Math.random() - 0.5) * ck), color[2] + ( (Math.random() - 0.5) * ck));
                this.setColor(i, j, color[0] + ( (Math.random() - 0.5) * ck), color[1] + ( (Math.random() - 0.5) * ck), color[2] + ( (Math.random() - 0.5) * ck));
            } else {
                var color = this.getColor(i, j);

                this.setColor(i, j, (color[0] < 128) ? color[0] - 50 : color[0] + 50, (color[1] < 128) ? color[1] - 50 : color[1] + 50, (color[2] < 128) ? color[2] - 50 : color[2] + 50);
            }
        }
    }
}

DynImage.prototype.prettyNoise = function(width, height, mul) {
    for(var i = 0; i < width; ++i) {
        for(var j = 0; j < height; ++j) {
            var color = this.getColor(i, j);

            this.setColor(i, j,
                    color[0] + ( (Math.random() - 0.5) * mul),
                    color[1] + ( (Math.random() - 0.5) * mul),
                    color[2] + ( (Math.random() - 0.5) * mul)
            );
        }
    }
}

DynImage.prototype.character2 = function(width, height) {
	for(var x = 0; x < width; ++x) {
		for(var y = 0; y < height; ++y) {
			var color = this.getColor(x, y);
			var mod = 110 + Math.floor(Math.random() * 40);
			var mult = Math.ceil(Math.random() * 120);

			this.setColor(x, y, 
					Math.floor((color[0] * 0.5) + 128*Math.log(((x / width) * mod) + ((y / height) * mod))) & 255,
					Math.floor((color[1] * 0.5) + 128*Math.log(((x / width) * mod) + ((y / height) * mod))) & 255,
					Math.floor((color[2] * 0.5) + 128*Math.log(((x / width) * mod) + ((y / height) * mod))) & 255
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
			if( Math.sqrt( ((sx - x) * (sx - x)) + ((sy - y) * (sy - y))) < (sw/2))
			this.punchPoint(x, y, intensity * force);
		}
	}	
}

DynImage.prototype.punchWave = function(sx, sy, sw, sh, force, spread, period) {
	for(var i = -(sw / 2); i < (sw/2); ++i) {
		for(var j = (-(sh/2)); j < (sh/2); ++j) {
			var x = sx + i,
			    y = sy + j;
	
			var intensity = Math.sqrt( (i*i) + (j*j) );
			intensity = Math.pow(2, -intensity / spread);	
			
			this.punchPoint(x, y, intensity * force * Math.sin(intensity / period));
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

// contrast changer
// any pixel below a threshold becomes darker,
// and any pixel above the threshold becomes lighter

DynImage.prototype.recontrast = function(threshold, amount) {
	for(var i = 0; i < this.width; ++i) {
		for(var j = 0; j < this.height; ++j) {
			var pix = this.getColor(i, j);
			
			// TODO: use HSL for proper value testing

			var avg = (pix[0] + pix[1] + pix[2]) / 3;
			if(avg > threshold) {
				this.setColor(i, j, pix[0] + amount, pix[1] + amount, pix[2] + amount);
			} else {
				this.setColor(i, j, pix[0] - amount, pix[1] - amount, pix[2] - amount);
			}
		}
	}
}

DynImage.prototype.borderPoint = function(x, y, bred, bgreen, bblue, percent) {
	var color = this.getColor(x, y);

	// weighted average

	this.setColor( ((bred * percent) + (color[0] * (100 - percent))) / 200,
			((bgreen * percent) + (color[1] * (100 - percent))) / 200,
			((bblue * percent) + (color[2] * (100 - percent))) / 200);
}

DynImage.prototype.border = function(width, height, bred, bgreen, bblue, mul) {
	var borderIterations = mul;

	for(var i = 0; i < borderIterations; ++i) {
		for(var x = i; x < (width - i); ++x) {
			// top
			
			var y = i;
			this.borderPoint(x, y, bred, bgreen, bblue, 100 - (i * mul));			

			y = height - i - 1;
			this.borderPoint(x, y, bred, bgreen, bblue, 100 - (i * mul));			
		}
	}	
}

DynImage.prototype.antialias = function(width, height) {
    var buf = new Buffer(width * height * 4);
    
    for(var i = 0; i < width; ++i) {
        for(var j = 0; j < height; ++j) {
            var successPixels = 0;
            var rSum = 0, gSum = 0, bSum = 0, aSum = 0;
            var that = this;

            function run(x, y) {
                var color = that.getColor(x, y);
                rSum += color[0];
                gSum += color[1];
                bSum += color[2];
                aSum += color[3];
                successPixels++;
            }

            run(i, j);

            if( (i - 1) >= 0) {
               run(i - 1, j);

               if( (j - 1) >= 0) {
                  run(i - 1, j -1);
               }

               if( (j + 1) < width) {
                   run(i -1, j + 1);
               }
            }

            if( (i + 1) < width) {
                run(i + 1, j);

                if( (j - 1) >= 0) {
                    run(i + 1, j - 1);
                }

                if( (j + 1) < width) {
                    run(i + 1, j + 1);
                }
            }

            if( (j - 1) >= 0) {
                run(i, j - 1);
            }

            if( (j + 1) < width) {
                run(i, j + 1);
            }
            
            this.setColor(i, j, rSum / successPixels, gSum / successPixels, bSum / successPixels, aSum / successPixels);
        }
    }        
}


module.exports = DynImage;
