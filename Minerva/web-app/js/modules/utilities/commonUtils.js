define(["jquery"], function($){
	
	var popupContainer_element = $("#popup-container");
	var globalOverlay_element = $("#global-overlay");
	var FUZZ_COMPLEXITY = 12;
	
	var Utils = {};
	
	Utils.FbUtils = {};
	
	Utils.FbUtils.checkFacebookLoginStatus = function(response, connectedCallback, customScope){
		console.log("FB RESPONSE -- ");
		console.log(response);
		if (response.status === 'connected') {// User logged into app and Facebook.
			if (connectedCallback){
				connectedCallback(response);
			}
	    } else {
	    	FB.login(function(response) {
	    		   // handle the response
	    		Utils.FbUtils.checkFacebookLoginStatus(response, connectedCallback);
	    	}, {scope: (customScope || 'manage_pages, publish_actions, user_status, read_stream') } );
	    }
	};
	
	Utils.FbUtils.loginToFacebook = function(connectedCallback, customScope){
		FB.login(function(response) {
	 		   // handle the response
	 		Utils.FbUtils.checkFacebookLoginStatus(response, connectedCallback);
	 	}, {scope: (customScope || 'manage_pages, publish_actions, user_status, read_stream') } );
	};
	
	Utils.FbUtils.getFeedFromPageSources = function(sourceList, currentIndex){
		if (!currentIndex){
			currentIndex = 0;
		}
		Utils.showLoader();
		FB.api("/"+sourceList[currentIndex]+"/feed", function(response){
			console.log("Feed for: " + sourceList[currentIndex]);
			console.log(response);
			
			Utils.hideLoader();
			currentIndex++;
			
			if (currentIndex < sourceList.length){
				getFeedFromPageSources(sourceList, currentIndex);
			}
		});
	};
	
	Utils.showLoader = function(){
		$("#global-loader").removeClass("importantHide");
	};
	
	Utils.hideLoader = function(){
		$("#global-loader").addClass("importantHide");
	};
	
	Utils.isFunction = function(value) {
		if (value === undefined || value === null) {
			return false;
		}
		return typeof value === 'function';
	};
	
	Utils.getGlobalOverlay_element = function(){
		return globalOverlay_element;
	};
	
	Utils.getPopupContainer_element = function(){
		return popupContainer_element;
	};
	
	Utils.openGlobalPopup = function(){
		Utils.getGlobalOverlay_element().removeClass("importantHide");
		Utils.getPopupContainer_element().removeClass("importantHide");
		
		Utils.getPopupContainer_element().find("#global-popup-close-btn").off("click");
		Utils.getPopupContainer_element().find("#global-popup-close-btn").on("click", function(){
			Utils.closeGlobalPopup();
		});
	};
	
	Utils.closeGlobalPopup = function(){
		Utils.getGlobalOverlay_element().addClass("importantHide");
		Utils.getPopupContainer_element().addClass("importantHide");
	};
	
	Utils.repositionGlobalPopup = function(customX, customY, customElement){
		var globalPopup = customElement || Utils.getPopupContainer_element();
		
		var w_width = $(window).width();
		var w_height = $(window).height();
		
		var d_left = customX || (w_width - globalPopup.width())/2;
		var d_top = customY || (w_height - globalPopup.height())/2;
		
		globalPopup.css({"top": d_top, "left": d_left});
	};
	
	Utils.getValue = function(initValue){
		if (Utils.isFunction(initValue)){
			initValue = Utils.getValue(initValue());
		}else{
			initValue = initValue.toString();
		}
		
		return initValue;
	}
	
	Utils.fuzzentityGenerator = function(object){
		if (!object){
			object = {};
		}else if (Utils.isFunction(object)){
			object = object();
		}
		
		object["dt"] = $.now();
		
		var fuzzentity = "";
		for (var property in object){
			if (object.hasOwnProperty(property)){
				var c_fuzz = "";
				for (var i=0;i<FUZZ_COMPLEXITY;i++){
					c_fuzz += Math.floor(Math.random() * Utils.getValue(property + object[property]).length);	
				}
			}
			fuzzentity += c_fuzz;
		}
		
		if (fuzzentity.length > FUZZ_COMPLEXITY){
			fuzzentity = fuzzentity.substr(Math.floor(Math.random() * (fuzzentity.length - FUZZ_COMPLEXITY)), FUZZ_COMPLEXITY);	
		}
		
		return fuzzentity;
	}
	
	Utils.loadHTMLToGlobalPopup = function(htmlLocation, loadedCallback){
		popupContainer_element.find("#popup-content").load(htmlLocation, function(){
			if (loadedCallback){
				loadedCallback();
			}
		});
	}
	
	return Utils;
	
});