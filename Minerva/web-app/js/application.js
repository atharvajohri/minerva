//GLOBALS
var stTimeDifference = 45*60*1000; //picked posts will be scheduled at a diff of every 20 mins
var pageId = "1444169292475774";
var testPageId = "247906198588126";
var allowSchedule = true;
var fillerText = "The Top Corner: Football Videos, Highlights and News! :)";
var earliestPostTimeDifference = 36 * 60 * 60 * 1000; //36 hours
var scheduleStartTime = new Date().getTime() + 2000000;

var WatcherModel = function(){
	var self = this;

	self.pageDataMap = new Object();
	self.parsedObjects = [];
	self.urls = ko.observableArray();
	self.addURL = function(){
		if (newURL.source() == "fb" && newURL.link()){
			var url = new URLModel();
			url.link(newURL.link());
			url.name(newURL.name());
			url.source(newURL.source());
			url.load(function(){
				wm.urls.push(url);
			});
			
			newURL.link("");
			newURL.name("");
			newURL.source("fb");
			newURL.data(null);
		}
		else
			alert("FB sources require link");
	}
	
	self.pickedPosts = [];
	self.scheduledPosts = ko.observableArray();
}

function initApplication(){
	$("input").removeAttr("disabled");
}

function existsIn(po, queue){
	var found = false;
	
	for (var i in queue){
		if (queue[i].id == po.id){
			found = true;
			break;
		}
	}
	
	return found;
}

function getSimilarityRank(ele1, ele2){
	var rank = 0;
	for (var prop in ele1){
		if (ele1[prop] == ele2[prop]){
			var rankValue = 1;
			if (prop == "pageIndex"){ //posts from same page are less unique
				rankValue = 0.5;
			}
			rank = rank + rankValue;
		}
	}
	return rank;
}

function pickPosts(){
	console.log("********************\npopulating schedule queue from:");
	console.log(wm.parsedObjects);
	wm.pickedPosts = [];
	var pickedQueue = [];
	var popularPostSet = [];
	
	for (var i in wm.parsedObjects){
		var pop_reduction = Number($("#pop-red").val()) || 0; 
		var pop_final = wm.urls()[wm.parsedObjects[i].pageIndex].averagePopularity() * (1 - pop_reduction/100);
		if (Number(wm.parsedObjects[i].popularity) > Number(pop_final)){
			popularPostSet.push(wm.parsedObjects[i]);
		}
	}
	
	pickedQueue.push(popularPostSet[0]);
	popularPostSet.splice(0, 1);
	//order popular posts by uniqueness
	
	while (popularPostSet.length > 0){
		
		var mostUniqueRank = 999;
		var mostUniqueIndex = 0;
		for (var k = 0; k < popularPostSet.length; k++){
			var currentRank = getSimilarityRank(popularPostSet[k], pickedQueue[pickedQueue.length - 1]);
			if (currentRank < mostUniqueRank){ //is current rank more unique?
				mostUniqueIndex = k;
				mostUniqueRank = currentRank;
			}
		}

		console.log ("adding " + popularPostSet[mostUniqueIndex].id + " to picked");
		pickedQueue.push(popularPostSet[mostUniqueIndex]);
		popularPostSet.splice(mostUniqueIndex, 1);
	}
	
	
	console.log("final picked queue:");
	console.log(pickedQueue);
	
	wm.pickedPosts = wm.pickedPosts.concat(pickedQueue);
	//schedulePickedPosts(); -- skipped this because we should not schedule skipped posts
	showFinalConfirmation();
}

function schedulePickedPosts(){
	var latestScheduledTime = wm.scheduledPosts.length ? (Number(wm.scheduledPosts[wm.scheduledPosts.length - 1].scheduledTime) + stTimeDifference) : new Date().getTime();
	//LST will be stTimeDifference (default: 1800000 ms or 30 mins) after the latest scheduled post OR now if there are no currently scheduled posts
	
	for (var i in wm.pickedPosts){
		var currentPick = wm.pickedPosts[i];
		
		wm.pickedPosts[i].scheduledTime = Number(latestScheduledTime) + stTimeDifference;
		latestScheduledTime = Number(latestScheduledTime) + stTimeDifference;
		var sd = new Date(wm.pickedPosts[i].scheduledTime);
		console.log(wm.pickedPosts[i].id + " is going to be scheduled on: " + prettyDate(wm.pickedPosts[i].scheduledTime) );
	}
	
	showFinalConfirmation();
}


function showFinalConfirmation(){
	$("#sc-content-size").html(wm.pickedPosts.length + " over " + ((wm.pickedPosts.length * stTimeDifference)/(1000*60*60)).toFixed(2) + "hours");
	$("#main-overlay").removeClass("hide");
	var confirmHTML = "";
	for (var i in wm.pickedPosts){
		var cp = wm.pickedPosts[i];
		confirmHTML += "<tr><td>"+cp.id+"</td><td>"+cp.message+"</td><td>"+cp.type+"</td><td><img class='content-picture' src='"+cp.picture+"'></td><td>"+prettyDate(cp.scheduledTime)+"</td>";
		confirmHTML += "<td id='sp-status-cell-"+cp.id+"'><input type='button' rel='"+cp.id+"' value='CONFIRMED' class='confirm-sp-btn'></tr>";
	}
	
	$("#confirm-schedule-table tbody").html(confirmHTML);
	$("#scheduled-content-container").removeClass("hide");
	
	
	$(".confirm-sp-btn").click(function(){
		if ($(this).val() == "CONFIRMED"){
			$(this).val("SKIPPED").addClass("contrast");
			confirmPost($(this).attr("rel"), false);
		}else{
			$(this).val("CONFIRMED").removeClass("contrast");
			confirmPost($(this).attr("rel"), true);
		}
	});
}

function scheduleConfirmedPosts(){
	allowSchedule = true;
	//get access token of the page
	FB.api(
		'/me/accounts', 
		{
			scope:"manage_pages, publish_stream"
		},
		function(response){
			for (var i in response.data){
				if (response.data[i].id == pageId){
					accessToken = response.data[i].access_token;			
					break;
				}
			}
			
			//access token is with us, now schedule posts by type
			schedulePost(0, accessToken, function(cp){
				$("#sp-status-cell-"+cp.id).html("Scheduled");
				lastScheduledTime = lastScheduledTime + Number(stTimeDifference);
			}, function(cp){
				$("#sp-status-cell-"+cp.id).html("Failed. Check console.");
			}, pageId);
		}
	)
	
}

function getActualFbPicture(pic){
	if (pic){
		return pic.replace("_s", "_n");
	}
}
	
var lastScheduledTime = scheduleStartTime;

function schedulePost(index, accessToken, onSuccess, onFail, page){
	if (allowSchedule){
		if (index < wm.pickedPosts.length){
			var cp = wm.pickedPosts[index];
			if (cp.confirmed == true){
				cp.scheduledTime = Number(lastScheduledTime);
				console.log ("|||||---------->> Going to schdedule " + cp.id + " at " + prettyDate(cp.scheduledTime) );
				if (cp.type == "video" || cp.type == "photo"){
					uploadMedia ( page, accessToken, (cp.source || cp.picture), cp.type, cp.message, false, cp.scheduledTime, function(){
						onSuccess(cp);
						
						cp.confirmed = false;
						index++;
						schedulePost(index, accessToken, onSuccess, onFail, page);
					}, function(){
						onFail(cp);
						
						cp.confirmed = false;
						index++;
						schedulePost(index, accessToken, onSuccess, onFail, page);
					});
					
				}else if(cp.type == "status"){
					postStatus(page, accessToken, cp, onSuccess, onFail, index);
				}
			}else{
				console.log(cp.id +" has been skipped");
				$("#sp-status-cell-"+cp.id).html("Skipped");
				
				index++;
				schedulePost(index, accessToken, onSuccess, onFail, page);
			}
		}else{
			console.log ("All picked posts are scheduled");
		}
	}else{
		console.log ("Scheduling is stopped.")
	}
}

function postStatus(page, accessToken, cp, onSuccess, onFail, index){
	FB.api(
		page+'/feed', 
		'post', 
		{ 
			access_token: accessToken,
			message: cp.message,
			published: false,
			scheduled_publish_time: Math.round(cp.scheduledTime/1000)
		}, 
		function(response) {
			if (!response || response.error) {
				console.log("Got error response");
				console.log(response);
				if (onFail)
					onFail(cp);
			} else {
				console.log("Got success response");
				console.log("response");
				if (onSuccess)
					onSuccess(cp);
			}
			
			cp.confirmed = false;
			index++;
			schedulePost(index, accessToken, onSuccess, onFail, page);
		}
	);
}

function uploadMedia( pageId, accessToken, source, type, title, published, scheduled_publish_time, successCallback, errorCallback){
	$.ajax({
		url:"/media/uploadMediaToFacebook",
		type:"POST",
		data: {
			access_token: accessToken,
			pageId: pageId,
			source: source,
			type: type,
			published: published,
			scheduled_publish_time: Math.round(scheduled_publish_time/1000),
			title: title
		},
		success: function(data){
			console.log("Got success response:");
			console.log(data)
			if (successCallback)
				successCallback();
		},
		error: function(data){
			console.log("Got error response:");
			console.log(data);
			if (errorCallback)
				errorCallback();
		}
	});
}




function confirmPost(id, check){
	for (var i in wm.pickedPosts){
		if (wm.pickedPosts[i].id == id){
			wm.pickedPosts[i].confirmed = check;
			break;
		}
	}
}


function prettyDate(timestamp){
	var date = new Date(Number(timestamp));
	
	var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	               
	var hours = date.getHours();
	var suffix = (hours >= 12)? 'pm' : 'am';
	var hours = (hours > 12)? hours -12 : hours;
	hours = (hours == '00')? 12 : hours;
	
	var minutes = date.getMinutes();
	minutes = minutes < 10 ? "0" + minutes : minutes;
	
	return (date.getDate() + " " + monthNames[date.getMonth()] + ", " + date.getFullYear() + " at " + hours + ":" + minutes + " " + suffix);
}


function ParsedObject(){
	var self = this;
	
	self.id;
	self.popularity;
	self.picture;
	self.type;
	self.message;
	self.source;
	self.pageIndex;
	self.scheduledTime = 0;
	self.confirmed = true;
}

var ScheduledPost = function(){
	var self = this;
	
	self.parsedObject;
	self.time;
	self.posted = false;
}

var URLModel = function(){
	var self = this;

	self.link = ko.observable();
	self.name = ko.observable();
	self.source = ko.observable("fb");
	self.data = ko.observable();
	self.averagePopularity = ko.observable();
	
	self.load = function(callback){
		FB.api( self.link(), function( data ) {
			self.data(data);
			if (callback)
				callback();
		});
	}
}

var wm, newURL = new URLModel();;

function whenFacebookIsReady(callback){
	if (!fbReady){
		setTimeout(function(){
			whenFacebookIsReady(callback);
		}, 1000);
	}else{
		callback();
	}
}

$(document).ready(function(){
	
	$("#main-container input").attr("disabled", "disabled");
	
	whenFacebookIsReady(function(){
		wm = new WatcherModel();
		//setup default urls
		
		//TODO: name can come from api, make one function to add url
		//soccer highlights today
		newURL.link("266828596693072"); 
		newURL.name("Soccer Highlights Today");
		newURL.source("fb");
		wm.addURL();
		
		//live football news
		/*newURL.link("live.football.news"); 
		newURL.name("Live Football News");
		newURL.source("fb");
		wm.addURL();
		
		//soccer highlights today
		newURL.link("345971365443086"); 
		newURL.name("Troll Football");
		newURL.source("fb");
		wm.addURL();
		
		//soccer highlights today
		newURL.link("269501959740519"); 
		newURL.name("Football is Everything HD");
		newURL.source("fb");
		wm.addURL();
		
		//soccer highlights today
		newURL.link("179678092221501"); 
		newURL.name("Football Wars");
		newURL.source("fb");
		wm.addURL();*/
		
		setupBindings();
	});
});

function extractContent(urlIndex){
	//get public feed of added pages one by one
	if (urlIndex < wm.urls().length){
		console.log ("Extracting feed from page: " + wm.urls()[urlIndex].name());
		FB.api( wm.urls()[urlIndex].link()+"/posts?limit=25", function( data ) {
			console.log("data from " + wm.urls()[urlIndex].name());
			console.log(data);
			wm.pageDataMap[wm.urls()[urlIndex].link()] = data;//.push(pageMapObject);

			urlIndex++;
			extractContent(urlIndex);
		});
	}else{
		//all are extracted
		console.log("Everything is extracted!");
		$("#extract-btn").removeAttr("disabled");
		
		showExtractedContent();
	}
}


//TODO: shift to a test module
function testFunction(testNumber){
	testNumber = testNumber || 1;
	
	//get token to publish to test page
	FB.api(
		'/me/accounts', 
		{scope:"manage_pages, publish_stream"},
		function(response){
			console.log(response);
			for (var i in response.data){
				if (response.data[i].id == testPageId){
					testaccessToken = response.data[i].access_token;			
					break;
				}
			}
			
			//post to test page
			if (testaccessToken){
				
				if (testNumber == 1){
					console.log ("*************************..*******************\nBeginning test 1...");
					console.log ("This test will try posting a test video to PAT, scheduled to be published 2 hours from now. ");
					var twohoursfromnow = (new Date().getTime() + (2*60*60*1000));
					var testaccessToken;

					//make call to service for dl & ul the video
					var videoSource = "https://fbcdn-video-a.akamaihd.net/hvideo-ak-prn2/v/1248678_626788264030435_597534027_n.mp4?oh=9ddf4fbfe6ca2c4a81f5c37f4414c06e&oe=52834D41&__gda__=1384331848_16077dbb9e5af83533c0b7b0cfa214e4"; 
					$.ajax({
						url:"/media/uploadVideoToFacebook",
						type:"POST",
						data: {
							access_token: testaccessToken,
							pageId: testPageId,
							source: videoSource,
							published: false,
							scheduled_publish_time: Math.round(twohoursfromnow/1000),
							title: "Test Video"
						},
						success: function(data){
							console.log("Got success response:");
							console.log(data)
						},
						error: function(data){
							console.log("Got error response:");
							console.log(data);
						}
					});
				}else if (testNumber == 2){
					console.log ("performing test 2")
					uploadMedia ( testPageId, testaccessToken, "https://fbcdn-photos-d-a.akamaihd.net/hphotos-ak-prn2/1451954_627833757259219_1714710707_n.jpg", "photo", "TEST PIC", false, (new Date().getTime() + 3600000));
				}
			}else{
				console.log ("Could not get access token for test page.")
			}
		}
	); 
}


function showData(allData, dataindex, urlindex, totalPopularity){
	var urlModel = wm.urls()[urlindex];
	if (dataindex < allData.length){
		var curData = allData[dataindex];
		if (curData.id && (new Date(curData.created_time).getTime() > (new Date().getTime() - earliestPostTimeDifference))){
			FB.api( curData.id+"/likes?limit=10000000", function( data ) {
				
				//preprocess
				var rating = (parseInt(data.data.length)+2*parseInt(curData.shares ? curData.shares.count : 0));
				var popularity = ((rating/parseInt(urlModel.data().likes)) * 10000).toFixed(2);
				if (curData.message){
					curData.message = curData.message.replace("Join Us :) SoccerHighlightsToday :) <=Goals Videos Highlights", "");
					curData.message = curData.message.replace("ZaPpY", "");
					curData.message = curData.message.replace("Nero", "");
					curData.message = curData.message.replace("naruto", "");
					curData.message = curData.message.replace(">SAMIR<", "");
					curData.message = curData.message.replace("SAMIR", "");
					curData.message = curData.message.replace("#MJ#", "");
					curData.message = curData.message.replace("-WJ", "");
					curData.message = curData.message.replace("- 360", "");
					curData.message = curData.message.replace("-SK", "");
					curData.message = curData.message.replace(" Hassi", "");
					curData.message = curData.message.replace("<Malay>", "");
					curData.message = curData.message.replace("<The Shade>", "");
					curData.message = curData.message.replace("<T-Rex>", "");
					curData.message = curData.message.replace("<J.D>", "");
					curData.message = curData.message.replace("<Fire>", "");
					curData.message = curData.message.replace("messi'nheart10", "");
					curData.message = curData.message.replace("FreddieMercury", "");
					curData.message = curData.message.replace("VBV", "");
				}
				curData.message = curData.message ? curData.message + "\n\n" + fillerText : fillerText;
				
				var extractHTML = "<tr><td>"+curData.id+"</td><td>"+curData.type+"</td>";
				if (curData.picture)
					extractHTML += "<td><img class='content-picture' src="+curData.picture+" /></td>";
				else
					extractHTML += "<td></td>";
				extractHTML += "<td class='popularity-count'> "+popularity+"/<span class='pop-for-"+urlindex+"'></span> </td>";
				extractHTML += "<td><div class='content-message-container'>"+(curData.message || "") +"</div></td><td>"+urlModel.name()+"</<td></tr>";
				
				var parsedObject = new ParsedObject();
				parsedObject.id = curData.id;
				parsedObject.popularity = popularity;
				parsedObject.picture = getActualFbPicture(curData.picture);
				parsedObject.type = curData.type;
				parsedObject.message = curData.message || "";
				parsedObject.pageIndex = urlindex;
				parsedObject.source = curData.source || "";
				wm.parsedObjects.push(parsedObject);
				
				$("#extracted-content-table-body").append(extractHTML);
				
				totalPopularity = Number(totalPopularity) + Number(popularity);
				
				dataindex++;
				showData(allData, dataindex, urlindex, totalPopularity);
			});
		}else{
			dataindex++;
			showData(allData, dataindex, urlindex, totalPopularity);
		}
	}else{
		//set avg popularity
		urlModel.averagePopularity(totalPopularity/dataindex);
		$(".pop-for-"+urlindex).html(urlModel.averagePopularity());	
		console.log ("Avg popularity for " + urlModel.name() + " is " + urlModel.averagePopularity());
		//next url
		urlindex++;
		extractData(urlindex);
	}
}


function extractData(index){
	if (index < wm.urls().length){
		var curData = wm.pageDataMap[wm.urls()[index].link()].data;
		showData(curData, 0, index, 0);
	}else{
		//all urls parsed
		$("#schedule-btn").removeClass("hide");
	}
}

function showExtractedContent(){
	extractData(0);
	$("#schedule-btn").addClass("hide");
}

function setupBindings(){
	$("#add-url").click(function(){
		wm.addURL();
	});

	$("#extract-btn").click(function(){
		$("#extracted-content-table-body").html("");
		extractContent(0);
		$(this).attr("disabled", "disabled");
	});
	
	$("#schedule-btn").click(function(){
		pickPosts();
	});

	$("#test-btn").click(function(){
		testFunction(2);
	});
	
	$("#close-sc-box").click(function(){
		$("#scheduled-content-container").addClass("hide");
		$("#main-overlay").addClass("hide");
	});
	
	$("#confirm-sc-box").click(function(){
		scheduleConfirmedPosts();
	});
	
	$("#stop-sc-box").click(function(){
		if ($(this).val()=="Stop Schedule"){
			allowSchedule = false;
			$(this).val("Resume Scheduling");
		}else{
			allowSchedule = true;
			$(this).val("Stop Schedule");
		}
	});
	
	$("#open-popularizer").click(function(){
		$("#popularize-container").removeClass("hide");
		$("#main-overlay").removeClass("hide");
	});
	
	ko.applyBindings(newURL, $("#new-url-binder")[0]);
	ko.applyBindings(wm, $("#wm-binder")[0]);
	
	initPopularizer();
}