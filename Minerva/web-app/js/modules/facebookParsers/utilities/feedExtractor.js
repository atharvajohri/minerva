define(["commonUtils", "modules/facebookParsers/utilities/feedExtractorModels", "knockout", "facebook"], function(Utils, _feedModels, ko){
	
	var g_feedSourcesModel;
	
	function init(){
		Utils.loadHTMLToGlobalPopup("/html/modules/facebookParsers/feedExtractor.html", function(){
			setupExtractionSources();
			setupEventHandlers();
		});
	}
	
	function setupEventHandlers(){
		$("#login-facebook-btn").off("click");
		$("#login-facebook-btn").on("click", function(){
			FB.getLoginStatus(function(response) {
				console.log(response);
			});			
		});
	}
	
	function setupExtractionSources(){
		
		g_feedSourcesModel = new _feedModels.FeedExtractorModel();
		ko.applyBindings(g_feedSourcesModel, $("#feed-extraction-container")[0]);
		
		Utils.openGlobalPopup();
		Utils.repositionGlobalPopup(null, 120);
	}
	
	return {
		init: init
	}
	
});