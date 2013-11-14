var commentMessages = [
                       "Like Us to get Goals, News and Highlights right on your news feed! :)",
                       "Join us and enjoy news from the world of football right on your news feed!",
                       "The Top Corner is the best page to enjoy football news and highlights on facebook!",
                       "News Highlights and Videos... Join Us!",
                       "The best place for consolidated football news... Like Us!",
                       "Like us and get the Best news & highlights from the world of football :D",
                       "The Top Corner brings you football news from all around the world.. Like us today!",
                       "Best Highlights and news ... see it first on The Top Corner. Like now! :)",
                       "Like us if you love football :D",
];

function PopularizeModel(){
	var self = this;
	
	self.targetPages = ko.observableArray();
	self.addPage = function(pageId){
		pageId = pageId || newPage.pageId();
		if (pageId){
			//get data of page
			FB.api (pageId, function(response){
				if (!response || response.error || !response.id){
					alert("invalid page")
				}else{
					var page = new TargetPage();
					page.pageId(response.id);
					page.pageName(response.name);
					page.pageData = response;
					self.targetPages.push(page);
					
					newPage.pageId("");
				}
			});
		}
		else
			alert("page id is required");
	}
}

function subscribeDefaultPages(){
	//EPL
	pm.addPage("20669912712"); //arsenal
	pm.addPage("7724542745"); //man utd
	pm.addPage("86037497258"); //chelsea
	pm.addPage("208411345454"); //man city
	pm.addPage("128428400660075"); //liverpool
	pm.addPage("351687753504"); //tottenham
	
	//Seria A
	pm.addPage("139132459470235"); //inter
	pm.addPage("ACMilan"); // ac milan
	pm.addPage("Juventus"); //juventus
	pm.addPage("SSCNapoli"); //napoli
	
	//Bundesliga
	pm.addPage("FCBayern"); //bayern
	pm.addPage("BVBorussiaDortmund09"); //dortmund
	
	//La Liga
	pm.addPage("197394889304"); //FCB
	pm.addPage("19034719952"); //RM
	pm.addPage("310044472388"); //Atletico Madrid
	
	//Players
	pm.addPage("LeoMessi"); //LeoMessi
	pm.addPage("Cristiano"); //Cristiano
	pm.addPage("RobinvanPersie"); //RobinvanPersie
	pm.addPage("ThierryHenry"); //ThierryHenry
	pm.addPage("mesutoezil"); //mesutoezil
	pm.addPage("Beckham"); //Beckham
	pm.addPage("Kaka"); //Kaka
	pm.addPage("neymarjr"); //neymar
	pm.addPage("AndresIniesta"); //Andres Iniesta
	pm.addPage("DavidVillaJugador"); //david villa
	pm.addPage("RonaldinhoOficial"); //ronaldinho
	pm.addPage("3GerardPique"); //gerard pique
	pm.addPage("DiegoForlanOficial"); //diego forlan
	pm.addPage("AlessandroDelPiero"); //del piero
	pm.addPage("RioFerdinandOfficial"); //rio ferdinand
	pm.addPage("cescfabregas"); //cesc 
	pm.addPage("suarez16luis"); //suarez
	
	//general
	pm.addPage("adidasfootball"); //adidas football
	pm.addPage("BarclaysFootball"); //Barclays Football
	
}

function TargetPage(){
	var self = this;
	
	self.pageData;
	self.pageId = ko.observable();
	self.pageName = ko.observable();
}

function registerPop(pages){
	var pageIds = []
	for (var i in pages){
		pageIds.push(pages[i].pageId());
	}
	
	$.ajax({
		url:"/media/registerPopularization",
		type:"POST",
		data: {
			targetPages: ko.toJSON(pageIds)
		},
		success: function(response){
			console.log("success response");
			console.log(response);
		},
		error: function(response){
			console.log("error response");
			console.log(response);
		}
	});
}

var newPage = new TargetPage();
var pm = new PopularizeModel();

function popularize(){
	//get access token for page
	FB.api(
		'/me/accounts', 
		{
			scope:"manage_pages, publish_stream"
		},
		function(response){
			var pageAccessToken;
			for (var i in response.data){
				if (response.data[i].id == pageId){
					pageAccessToken = response.data[i].access_token;			
					break;
				}
			}
			
			popularizeOnPage(16, pageAccessToken);
		}
	)
}


function popularizeOnPage(pageIndex, pageAccessToken){
	if (pageIndex < pm.targetPages().length){
		console.log ("--------------------------------------------------++++--------------------------------------------------");
		console.log("Popularizing on page: " + pm.targetPages()[pageIndex].pageName());
		var curPage = pm.targetPages()[pageIndex].pageId();
		//get last 3 posts of each page
		console.log ("**********************\nGetting feed for " + curPage)
		FB.api (curPage+"/posts?limit=5", function(response){
			if (!responseErroneous(response, function(){
				
				console.log("*** Could not get feed for this page.. continuing to next page.")
				pageIndex++;
				popularizeOnPage(pageIndex, pageAccessToken);
			})){
				
				var posts = response.data;
				
				addCommentOnPost(posts, 0, pageAccessToken, pageIndex);
			}
		});
	}else{
		console.log("=================\n================\n Popularization performed on all the pages!");
	}
}

var commentIndex = 0;

function addCommentOnPost(posts, currentIndex, pageAccessToken, pageIndex){
	if (currentIndex < posts.length){
		var post = posts[currentIndex];
		
		commentIndex++;
		if (commentIndex >= commentMessages.length){
			commentIndex = 0;
		}
		var message = commentMessages[commentIndex];
		
		console.log ("Trying to add comment \n" + message + "\n to " + post.id);
		FB.api(post.id+"/comments", 'post', {
			access_token: pageAccessToken,
			message: message
		}, function(response){
			if (!responseErroneous(response, function(){
				console.log("*** Could not get post info, continuing to next!")
				currentIndex++;
				
				addCommentOnPost(posts, currentIndex, pageAccessToken, pageIndex);
				
			})){
				console.log("-----> Successfully posted comment " + currentIndex + " on " + pm.targetPages()[pageIndex].pageName());
				console.log(response);
				
				currentIndex++;
				addCommentOnPost(posts, currentIndex, pageAccessToken, pageIndex);
			}
		});
	}else{
		console.log ("All posts have been commented upon. Now for the next page!");
		pageIndex++;
		popularizeOnPage(pageIndex, pageAccessToken);
	}
}

function responseErroneous(response, callback){
	if (!response || response.error){
		console.log("response was erroneous");
		console.log(response)
		
		if (callback)
			callback();
		
		return true;
	}
	return false;
}

function initPopularizer(){
	console.log ("Initializing Popularizer")
	$("#popularize-container").load("/html/popularize.html", function(){
		ko.applyBindings(newPage, $("#add-target-page-binder")[0]);
		ko.applyBindings(pm, $("#target-pages-binder")[0]);		
		
		$("#add-tp-btn").click(function(){
			pm.addPage();
		});
		
		$("#close-popularizer").click(function(){
			$("#popularize-container").addClass("hide");
			$("#main-overlay").addClass("hide");
		});
		
		$("#register-popularization").click(function(){
			registerPop(pm.targetPages());
		});
		
		$("#commence-popularization").click(function(){
			popularize();
		});
		subscribeDefaultPages();
		
	});
}