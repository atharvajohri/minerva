define(["modules/homePage/homeAnimations", "modules/homePage/testAnimations"], function(_homeAnimations, _testAnimations){
	
	function init(){
//		_homeAnimations.init();
		setupEventHandlers();
//		_testAnimations.init();
	}
	
	function setupEventHandlers(){
		$("#load-extractor-btn").off("click");
		$("#load-extractor-btn").on("click", function(){
			require(["modules/facebookParsers/utilities/feedExtractor"], function(_feedExtractor){
				_feedExtractor.init();
			});
		});
	}
	
	return {
		init: init
	}
});