//hey hackers! y u no work with me instead?
//johri.atharva@gmail.com

var Logger = function(){
	var self = this;
	self.logActivated = false;
	self.activateLog = function(){
		self.logActivated = true;
		self.log("Logger is activated.");
	}
	self.log = function(message, type){
		if (self.logActivated){
			if (!type)
				type = "INFO";
			var prepend = "";
			switch (type){
				case "ERROR":
					prepend = "!!------>> ERROR: "
				case "INFO":
					prepend = "--> INFO: "
					break;
			}
			
			console.log(prepend + message);
		}
	}
}

var Utils = function(){
	var self = this;
	self.ratio = function(numerator, denominator, asNumber){
		 var c_ratio = (Number(numerator.toString().replace("px", ""))/Number(denominator.toString().replace("px", "")));
		 if (!asNumber)
			 c_ratio = c_ratio.toFixed(2) + "px";
		 return c_ratio;
	}
}

var Screen = function(){
	var self = this;
	//screen dimensions
	self.width;
	self.height;
	//screen size ratios
	self.massiveFontSizeRatio = 21; 
	//sets up dynamic styles based upon user's screen size 
	self.setupDimensions = function(animate){
		self.width = $(window).width();
		self.height = $(window).height();
		
		g_logger.log("Setting up dimensions for you screen; w: " + self.width + ", h: " + self.height);
		var mainContainerCss = new Object();
		var nameContainerCss = new Object();
		var faceContainerCss = new Object();
		var interactiveInfoContainerCss = new Object();
		
		mainContainerCss["width"] = g_utils.ratio(self.width, 1.5);
		
		nameContainerCss["font-size"] = g_utils.ratio(self.height, self.massiveFontSizeRatio);
		
		faceContainerCss["width"] = g_utils.ratio(mainContainerCss["width"], 3);
		faceContainerCss["height"] = faceContainerCss["width"];
		faceContainerCss["border-radius"] = faceContainerCss["width"];
		faceContainerCss["background-size"] = g_utils.ratio(self.height, (921/360)); //360 - perfect size for ascreen of height 921 px 
		faceContainerCss["margin-top"] = g_utils.ratio(self.height, 10);
		
		interactiveInfoContainerCss["margin-top"] = g_utils.ratio(self.height, (788/130));
		
//		if (animate){
//			$("#main-container").stop().animate(mainContainerCss, g_animationTimer);
//			$("#name-container").stop().animate(nameContainerCss, g_animationTimer);
//			$("#interactive-face-container").stop().animate(faceContainerCss, g_animationTimer);
//			$("#interactive-info-container").stop().animate(interactiveInfoContainerCss, g_animationTimer);
//		}else{
			$("#main-container").css(mainContainerCss);
			$("#name-container").css(nameContainerCss);
			$("#interactive-face-container").css(faceContainerCss);
			$("#interactive-info-container").stop().animate(interactiveInfoContainerCss, g_animationTimer);
//		}

		setTimeout(function(){
			self.createOptions(true);
//			setupWatcher();
		}, g_animationTimer);
		
		$("#main-container").fadeIn(g_animationTimer);
	}
	
	self.createOptions = function(clear){
		g_logger.log("Setting up " + n + " options.");
		if (clear){
			$(".generated-point").remove();
			$("#top-menu-container").empty();
		}
		var n = self.menuOptions.length;
		var if_x = $("#interactive-info-container").width()/2;
		var if_y = $("#interactive-info-container").height()/2;
		var polygonCenter = new Point(if_x, if_y);
		var if_radius =  $("#interactive-face-container").width()/2 + g_utils.ratio(self.width, 30, true);
		
		for (var i =0; i < n; i++){
			var px = if_x + if_radius * Math.sin(2 * Math.PI * i / n);
			var py = if_y + if_radius * Math.cos(2 * Math.PI * i / n);
			var vertice = new Point(px, py);
			var verticeElement = vertice.attachDiv('interactive-option', self.menuOptions[i]);
			var topMenuOptionHTML = "<div class='top-menu-option' rel='"+self.menuOptions[i].hash+"'>"+self.menuOptions[i].text+"</div>";
			$("#top-menu-container").append(topMenuOptionHTML);
		}
		
		$(".top-menu-option").css("width", g_utils.ratio($("#main-container").width(), n+2));
	}
	
	self.menuOptions = [];
	self.populateMenuOptions = function(){
		$("#main-content-container .content-container").each(function(){
			var container = $(this);
			var option = new Object();
			option["hash"] = container.attr("id");
			option["text"] = container.attr("title");
			option["font-family"] = container.attr("font-family");
			option["font-size-ratio"] = container.attr("font-size-ratio");
			self.menuOptions.push(option);
		});
	}
}

function setupWatcher(){
	g_logger.log("Setting up watcher..");
	
	var actualW = $("#faceimg").width();
	var actualH = $("#faceimg").height();
	var actualEyeW = $("#eyeimg").width();
	var actualEyeW = $("#eyeimg").width();
	g_logger.log("Watcher FACE dimensions: " + actualW + ", " + actualH);
	
	var reqW = $("#interactive-face-container").width();
	var reqH = $("#interactive-face-container").height();
	g_logger.log("Watcher CONTAINER dimensions: " + reqW + ", " + reqH);
	//206, 183
	var eLeft = new Point(reqW*0.356, reqH*0.537, null, $("#eye-left"));
	var eRight = new Point(reqW*0.614, reqH*0.537, null, $("#eye-right"));
	
	var center = new Point((eLeft.x+eRight.x)/2, (eLeft.y+eRight.y)/2);
	
	var eyeCss = new Object();
	eyeCss.width = ($(".eye").width()/actualW)*reqW;
	eyeCss.height = ($(".eye").height()/actualH)*reqH; 
	$(".eye").css(eyeCss);
	
	var faceCss = new Object();
	faceCss.width = reqW;
	faceCss.height = reqH;
	$("#face").css(faceCss);
	
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
}

var Point = function(x, y, id, element){
	var self = this;
	self.x = x;
	self.y = y;
	self.id = (id || Math.floor(Math.random()*99999));
	self.element = element;
	self.attachDiv = function(elementClass, menuObject){
		var returnPoint = null;
		if (self.x && self.y && self.id){
			g_logger.log("Attaching div to point " + self.id);
			var fs = g_utils.ratio(g_screen.height, (menuObject["font-size-ratio"] || 42.96));
			var mw = "auto";//g_utils.ratio(g_screen.width, 14.8);
			$("#interactive-info-container").prepend("<div class='"+(elementClass || 'visible-point')+" generated-point' style='font-size:"+fs+";max-width:"+mw+"' id='vp-"+self.id+"'></div>");
			returnPoint = $("#vp-"+self.id);
			returnPoint.html(menuObject.text || "");
			returnPoint.attr("rel", (menuObject.hash || ""));
			var attachCss = new Object();
			attachCss["top"] = (self.y - returnPoint.height()/2) + "px";
			attachCss["left"] = (self.x - returnPoint.width()/2) + "px";
			attachCss["font-family"] = menuObject["font-family"];
//			attachCss["font-size"] = menuObject["font-size"];
			returnPoint.css(attachCss);
		}else{
			g_logger.log("Tried to surround invalid point with a div.", "ERROR");
		}
		
		return returnPoint;
	}
}

//globals
var g_maxViewport = 800;
var g_logger = new Logger();
var g_screen = new Screen();
var g_utils = new Utils();
var g_animationTimer = 300;

$(window).load(function(){
	initializePage();
	setupUIEvents();
});

function initializePage(){
	//uncomment below to read logs!
	g_logger.activateLog(); 
	g_logger.log("Welcome to AtharvaJohri.com!")
	g_screen.populateMenuOptions();
	g_screen.setupDimensions();
}

function setupUIEvents(){
	$(window).resize(function(){
		g_screen.setupDimensions(true);
	});
	$("#interactive-info-container").on("click", ".interactive-option", function(){
		location.hash = $(this).attr("rel");
	});
	$("#top-menu-container").on("click", ".top-menu-option", function(){
		location.hash = $(this).attr("rel");
	});
	$(window).bind('hashchange', function() {
		openContent(location.hash.replace("#",""));
	});
	$("#name-container").click(function(){
		location.hash = "";
	});
	$(window).trigger("hashchange");
}

function openContent(topic){
	if (topic){
		$("#interactive-info-container").fadeOut(g_animationTimer, function(){
			showTopMenu(function(){
				$(".content-container").fadeOut(g_animationTimer);
				$(".top-menu-option").removeClass("top-menu-option-selected");
				$(".top-menu-option[rel='"+topic+"']").addClass("top-menu-option-selected");
				setTimeout(function(){
					$("#main-content-container, #"+topic).fadeIn(g_animationTimer);	
				}, g_animationTimer);			
			});
		});
	}else{
		showTopMenu(null, true);
	}
}

function showTopMenu(callback, hide){
	if (!hide){
		$("#top-menu-container").fadeIn(g_animationTimer, function(){
			if (callback)
				callback();
		});
	}else{
		$("#top-menu-container, #main-content-container").fadeOut(g_animationTimer, function(){
			$("#interactive-info-container").fadeIn(g_animationTimer, function(){
				g_screen.setupDimensions();
			});
		});
	}
}


//not all those who wander are lost!