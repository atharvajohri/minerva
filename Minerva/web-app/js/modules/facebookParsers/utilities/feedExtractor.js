define(["commonUtils", "modules/facebookParsers/utilities/feedExtractorModels", "knockout"/*, "facebook"*/], function(Utils, _feedModels, ko){
	
	var g_feedSourcesModel;
	var g_accessToken;
	
	function init(existingFeedSourcesModel){
		
		Utils.repositionGlobalPopup(null, 10, $("#global-loader"));
		Utils.showLoader();
		
		Utils.loadHTMLToGlobalPopup("/html/modules/facebookParsers" +
				"/feedExtractor.html", function(){
			Utils.hideLoader();
			setupExtractionSources(existingFeedSourcesModel);
			setupEventHandlers();
		});
	}
	
	function setupEventHandlers(){
		$("#login-facebook-btn").off("click");
		$("#login-facebook-btn").on("click", function(){
			Utils.FbUtils.loginToFacebook(function(response){
				g_accessToken = response.authResponse.accessToken;
				g_feedSourcesModel.homeStatus().facebookConnected(true);
			});
		});
		
		$("#give-server-access-btn").off("click");
		$("#give-server-access-btn").on("click", function(){
			if (g_accessToken){
				$.ajax({
					url: "/Workbench/allowServerAccess?access_token="+g_accessToken,
					complete: function(response){
						console.log(response);
					}
				});				
			}
		});
		
		$("#kill-server-access-btn").off("click");
		$("#kill-server-access-btn").on("click", function(){
			if (g_accessToken){
				$.ajax({
					url: "/Workbench/killServerAccess",
					complete: function(response){
						console.log(response);
					}
				});				
			}
		});
	}
	
	function setupExtractionSources(existingFeedSourcesModel){
		if (existingFeedSourcesModel){
			g_feedSourcesModel = existingFeedSourcesModel;
		}else{
			g_feedSourcesModel = new _feedModels.FeedExtractorModel();			
		}
		ko.applyBindings(g_feedSourcesModel, $("#feed-extraction-container")[0]);
		
		Utils.openGlobalPopup();
		Utils.repositionGlobalPopup(null, 120);
	}
	
	return {
		init: init
	}
	
});