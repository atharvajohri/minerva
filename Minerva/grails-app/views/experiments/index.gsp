<!doctype HTML>
<html>
	<head>
		<title>Watcher</title>
		<g:javascript plugin="jquery" library="jquery"></g:javascript>
		<style>
			#face-container {width:800px; margin: auto; position:relative;overflow:auto;top:-200px;}
			#face {position: relative;background: url("/images/watcher/face.png");z-index:20;}
				.eye {position:absolute;width:57px;height:45px;z-index:10}
				#eye-left { top:429px; left:275px;}
				#eye-right { top:431px; left:488px;}
				
				#faceimg {display:none}
		</style>
		<script>
		function Point(x, y, element){
			this.x = x;
			this.y = y;
			this.element = element;
		}
		
		$(window).load(function(){
			var eLeft = new Point(265, 429, $("#eye-left"));
			var eRight = new Point(478, 432, $("#eye-right"));
			
			var center = new Point((eLeft.x+eRight.x)/2, (eLeft.y+eRight.y)/2);
			$("#face").css({"width": $("#faceimg").width() + "px", "height": $("#faceimg").height()});
			$(document).mousemove(function(e){
				var mx = e.pageX || e.screenX;
				var my = e.pageY || e.screenY;
				
				var kx = (0.5 * eLeft.element.width())/$(window).width();
				var ky = (0.5 * eLeft.element.height())/$(window).height();
				
				var cx = kx * (center.x - mx);
				var cy = ky * (center.y - my);
				
				eLeft.element.css({
					"left": ((eLeft.x - cx) + "px"), 
					"top": ((eLeft.y - cy) + "px")
				});
				eRight.element.css({
					"left": ((eRight.x - cx) + "px"), 
					"top": ((eRight.y - cy) + "px")
				});
			});
			
		});
		</script>
	</head>
	<body>
		<img src="images/face.png" id="faceimg"/>
		<div id="face-container">
			<div id="face">
				
			</div>
			<div id="eye-left" class="eye">
				<img src="/images/watcher/eye-left.png" />
			</div>
			<div id="eye-right" class="eye">
				<img src="/images/watcher/eye-right.png" />
			</div>
		</div>
	</body>
</html>