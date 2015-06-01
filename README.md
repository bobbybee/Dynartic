Dynartic
=============

Dynartic creates semirandom images from scratch, using a variety of geometric transforms, photographic-type adjustments, and "shape" generation using random numbers. `DynImage.js` contains a library of these such manipulations that, when combined in some order, produce the interesting images. `main.js` provides a command-line utility which has morphed greatly during the development of Dynartic to access these manipulations.

To generate an image, simply type `node main 128 128`, where 128/128 are replaced with the width and height of the image. To change the scheme used to generate the images, modify the commands used in `main.js` to your liking, and perhaps send us a pull request!
