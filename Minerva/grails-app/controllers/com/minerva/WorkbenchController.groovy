package com.minerva

import com.restfb.Connection
import com.restfb.DefaultFacebookClient
import com.restfb.FacebookClient
import com.restfb.Parameter
import com.restfb.types.Post

class WorkbenchController {

    def setAccessToken() { 
		println "Got access token -> ${params.access_token}"
		
		FacebookClient facebookClient = new DefaultFacebookClient(params.access_token)
		
		def targetPages = ["SoccerHighlightsToday"]//TargetPage.list()
		targetPages.each { tp ->
			
			log.info "Running popularization for ${tp}"
			
			def pageId = tp
			//get last 3 posts
			Connection<Post> pageFeed = facebookClient.fetchConnection(pageId+"/feed", Post.class,
				Parameter.with("limit", 2)
			);
		
			log.info "Total feed: ${pageFeed.getData().size()}"
			log.info "Data ${pageFeed.getData()}"
		
			log.info "\n*************************\nResults"
			int totalCount = 0;
			for (List<Post> myFeedConnectionPage : pageFeed){
				log.info "************************************************************************************\n"+ myFeedConnectionPage.size() + "\n"
				
				for (int i=0;i<myFeedConnectionPage.size();i++){
					Post post = myFeedConnectionPage.get(i);
					log.info "************************************************************************************\n ${ i }"+post.message + "\n"
				}
				
				totalCount++;
				if (totalCount > 3){
					break;
				}
			}
		
			
		}
		
	}
	
}
