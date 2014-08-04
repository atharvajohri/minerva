define(["knockout", "commonUtils"], function(ko, Utils){
	
	function FeedExtractorModel(){
		var self = this;
		
		self.newSourceName = ko.observable();
		self.sources = ko.observableArray();
		self.homeStatus = ko.observable(new HomeStatus());
		
		self.removeSource = function(feedSource){
			self.sources.remove(feedSource);
		}
		self.viewSource = function(feedSource){
			self.sources.remove(feedSource);
		}
		self.addSource = function(){
			if (self.newSourceName()){
				var feedSource = new FeedSource();
				feedSource.name(self.newSourceName());
				self.sources.push(feedSource);				
			}
			self.newSourceName("");
		}
	}
	
	function HomeStatus(){
		var self = this;
		self.facebookConnected = ko.observable(false);
	}
	
	function FeedSource(){
		var self = this;
		
		self.name = ko.observable();
		self.url = ko.observable();
		self.fuzzentity = ko.computed(function(){
			return Utils.fuzzentityGenerator(self);
		});
		self.getFeed = function(){
			Utils.FbUtils.getFeedFromPageSources([self.name()]);
		}
	}
	
	return {
		FeedExtractorModel: FeedExtractorModel,
		FeedSource: FeedSource
	}
});