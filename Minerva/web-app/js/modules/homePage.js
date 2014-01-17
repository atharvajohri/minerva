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
		
		mainContainerCss["width"] = g_utils.ratio(self.width, 1.5);
		
		nameContainerCss["font-size"] = g_utils.ratio(self.height, self.massiveFontSizeRatio);
		
		faceContainerCss["width"] = g_utils.ratio(mainContainerCss["width"], 3);
		faceContainerCss["height"] = faceContainerCss["width"];
		faceContainerCss["border-radius"] = faceContainerCss["width"];
		faceContainerCss["margin-top"] = g_utils.ratio(self.height, 10);
		
		if (animate){
			$("#main-container").stop().animate(mainContainerCss, g_animationTimer);
			$("#name-container").stop().animate(nameContainerCss, g_animationTimer);
			$("#interactive-face-container").stop().animate(faceContainerCss, g_animationTimer);
		}else{
			$("#main-container").css(mainContainerCss);
			$("#name-container").css(nameContainerCss);
			$("#interactive-face-container").css(faceContainerCss);			
		}

		setTimeout(function(){
			self.createOptions(true);
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
			self.menuOptions.push(option);
		});
	}
}

var Point = function(x, y, id){
	var self = this;
	self.x = x;
	self.y = y;
	self.id = (id || Math.floor(Math.random()*99999));
	self.attachDiv = function(elementClass, menuObject){
		var returnPoint = null;
		if (self.x && self.y && self.id){
			g_logger.log("Attaching div to point " + self.id);
			var fs = g_utils.ratio(g_screen.height, 45.96);
			var mw = "auto";//g_utils.ratio(g_screen.width, 14.8);
			$("#interactive-info-container").prepend("<div class='"+(elementClass || 'visible-point')+" generated-point' style='font-size:"+fs+";max-width:"+mw+"' id='vp-"+self.id+"'></div>");
			returnPoint = $("#vp-"+self.id);
			returnPoint.html(menuObject.text || "");
			returnPoint.attr("rel", (menuObject.hash || ""));
			var attachCss = new Object();
			attachCss["top"] = (self.y - returnPoint.height()/2) + "px";
			attachCss["left"] = (self.x - returnPoint.width()/2) + "px";
//			attachCss["font-size"] = fs;
//			attachCss["max-width"] = g_utils.ratio(g_screen.width, 16.8);
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
		$("#interactive-info-container").fadeOut(g_animationTimer, function(){
			showTopMenu();
		});
	});
	$("#top-menu-container").on("click", ".top-menu-option", function(){
		location.hash = $(this).attr("rel");
	});
	$(window).bind('hashchange', function() {
		openContent(location.hash.replace("#",""));
	});
}

function openContent(topic){
	$(".content-container").fadeOut(g_animationTimer);
	setTimeout(function(){
		$("#main-content-container, #"+topic).fadeIn(g_animationTimer);	
	}, g_animationTimer);
	
}

function showTopMenu(hide, callback){
	$("#top-menu-container").fadeIn(g_animationTimer, function(){
		if (callback)
			callback();
	});
}


//not all those who wander are lost!