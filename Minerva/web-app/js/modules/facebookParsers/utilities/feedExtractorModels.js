define(["knockout", "commonUtils"], function(ko, Utils){
	
	function FeedExtractorModel(){
		var self = this;
		
		self.newSourceName = ko.observable();
		self.sources = ko.observableArray();
		
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
	
	function FeedSource(){
		var self = this;
		
		self.name = ko.observable();
		self.url = ko.observable();
		self.fuzzentity = ko.computed(function(){
			return Utils.fuzzentityGenerator(self);
		});
	}
	
	return {
		FeedExtractorModel: FeedExtractorModel,
		FeedSource: FeedSource
	}
});