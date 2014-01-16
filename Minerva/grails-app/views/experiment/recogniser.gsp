<!doctype HTML>
<html>
	<head>
		<title>Recognition</title>
		<g:javascript plugin="jquery" library="jquery"></g:javascript>
		<style>
			canvas{box-shadow:0px 0px 2px 0px #222; margin:10px;}
		</style>
	</head>
	<body>
		<canvas id="base-canvas"></canvas>
		<canvas id="final-canvas"></canvas>
		<br>
		<input type="button" id="begin-recog" value="Recog">
	</body>
	<script>
		var base_image, context_b, context_f;
		var imageDetails = new Object();
		$(document).ready(function(){
			setup();

			$("#begin-recog").click(function(){
				recognise();
			});
		});

		function PixelPoint(r, g, b, a){
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
		}

		function initCanvas(){
			var canvas_b = document.getElementById('base-canvas');
			context_b = canvas_b.getContext('2d');
			var canvas_f = document.getElementById('final-canvas');
			context_f = canvas_f.getContext('2d');
			imageDetails.w = 180;
			imageDetails.h = (imageDetails.w * base_image.height / base_image.width);
			$("canvas").attr("height", imageDetails.h).attr("width",imageDetails.w);
			context_b.drawImage(base_image, 0, 0, imageDetails.w, imageDetails.h);
		}

		function recognise(){
			// Get the CanvasPixelArray from the given coordinates and dimensions.
			var imgd = context_b.getImageData(0, 0, imageDetails.w, imageDetails.h);
			var pix = imgd.data;

			var oldRgba = new PixelPoint();;
			var curRgba = new PixelPoint();
			var newimgd = context_b.createImageData(imageDetails.w, imageDetails.h);;
			// Loop over each pixel and invert the color.
			for (var i = 0, n = pix.length; i < n; i += 4) {
				curRgba.r = pix[i  ];
				curRgba.g = pix[i+1];
				curRgba.b = pix[i+2];
				curRgba.a = pix[i+3];

				if (oldRgba){
					if (rgbaAreContrasted(oldRgba, curRgba)){
						addMark(newimgd, 0, i);
					}else{
						addMark(newimgd, 255, i);		
					}
				}else{
					addMark(newimgd, 255, i);
				}

				copyRgba(curRgba, oldRgba);
			}

			// Draw the ImageData at the given (x,y) coordinates.
			context_f.putImageData(newimgd, 0, 0);
		}

		function copyRgba(from, to){
			to.r = from.r;
			to.g = from.g;
			to.b = from.b;
			to.a = from.a;
		}

		function rgbaAreContrasted(oldRgba, newRgba){
			var rc = false, gc= false, bc= false, ac=false;
			var cLimit = 5;
			if ((newRgba.r > oldRgba.r + cLimit) || (newRgba.r < oldRgba.r - cLimit)){
				rc = true;
			}
			if ((newRgba.g > oldRgba.g + cLimit) || (newRgba.g < oldRgba.g - cLimit)){
				gc = true;
			}
			if ((newRgba.b > oldRgba.b + cLimit) || (newRgba.b > oldRgba.b - cLimit)){
				bc = true;
			}

			if (rc || gc || bc){
				return true;
			}else{
				return false;
			}
		}
		
		function addMark(imgd, col, index){
			imgd.data[index] = col;
			imgd.data[index+1] = col;
			imgd.data[index+2] = col;
			imgd.data[index+3] = 255;
		}
		
		function setup(){
		  	base_image = new Image();
		  	base_image.src = '/images/test2.jpg';
		  	base_image.onload = function(){
		    	initCanvas();
		  	}
		}
		
	</script>
</html>