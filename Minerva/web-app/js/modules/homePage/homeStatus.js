define([], function(){
	
	var Status = function(){
		self.facebookConnected = false;
	}
	
	function getStatus(){
		return Status;
	}
	
	return {
		getStatus: getStatus
	}
	
});