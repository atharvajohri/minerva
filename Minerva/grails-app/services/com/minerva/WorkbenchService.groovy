package com.minerva

import com.minerva.workbench.CommentData
import com.minerva.workbench.PageData
import com.minerva.workbench.PostData
import com.restfb.DefaultFacebookClient
import com.restfb.FacebookClient
import com.restfb.Parameter
import com.restfb.json.JsonArray
import com.restfb.json.JsonObject
import com.restfb.types.FacebookType

class WorkbenchService {

	/*Required Variables for Workbench Actions*/
	private Boolean actionsAllowed = false
	private String accessToken = ""
	private FacebookClient facebookClient
	private pageAccessToken
	private def workbenchStatus = [
		"currentlyParsing": false	
	]
	

	/*Injected services*/	
	def grailsApplication
	
	
	def updateWorkbenchVariables(c_accessToken, c_actionsAllowed){
		actionsAllowed = c_actionsAllowed
		accessToken = c_accessToken
		log.info "Workbench Variables updated: \n** ${c_accessToken} \n** ${c_actionsAllowed}"
	}
	
	/*Following method triggered with General Actions Job -- [WorkbenchJob.execute] */
	def triggerWorkbenchJobActions(){
		def logString = "**JOB**: Triggered Workbench Job"
		if(actionsAllowed == true){
			logString += "\nAccess Allowed! Beginning parse for facebook pages.."
			log.info logString
			//TODO: can add more actions to run below!
			//TODO: shift all possible actions to config 
			parseFacebookPages();
		}else{
			logString += "\nAccess disallowed"
			log.info logString
		}
	}
	
    def parseFacebookPages() {
		def pagesToParse = grailsApplication.config.facebook.pageDataToParse
		pagesToParse.each { pageName, pageData ->
			JsonArray parsedPosts = parsePage(pageName, pageData, 1)
			if (parsedPosts.length() > 0){
				log.info "Extracted ${parsedPosts.length()} post/s for $pageName\nCommencing commentary for them."
				for (int i=0; i<parsedPosts.length(); i++){
					JsonObject parsedPostJson = parsedPosts.getJsonObject(i) 
					commentOnPost(parsedPostJson, pageName, pageData)
				}
			}else{
				log.error "No posts parsed for ${pageName}"
			}	
		}
		
    }
	
	def parsePage(pageName, pageData, postsCount){
		def retrievedPosts = []
		
		if (accessToken && accessToken.size() > 0){
			log.info "Extracting $postsCount post for $pageName"
			
			actionsAllowed = false
			postsCount = postsCount ?: 1
			facebookClient = new DefaultFacebookClient(accessToken)
			//get last 3 posts
			JsonObject pageFeed = facebookClient.fetchObject("${pageData.dataPath}", JsonObject.class,
				Parameter.with("limit", postsCount)
			)
		
			int totalCount = 0
			
			retrievedPosts = pageFeed.map.data
			
		}else{
			log.error "No access token found!"
		}
		
		
		return retrievedPosts
	}
	
	def commentOnPost(JsonObject parsedPostJson, pageName, pageData){
		log.info "\n\n --- PROPERTIES OF POST --- \n"
		println "${parsedPostJson.getString("name")}\n${parsedPostJson.getString("created_time")}"
		
		
		if (isPostAlreadyCommentedOn(parsedPostJson, pageData)){
			log.error "Post is already commented on!"
		}else{
			log.info "Post is not commented on.. Trying to comment now."
			pageAccessToken = getPageAccessToken(grailsApplication.config.facebook.actingFacebookPageId)
			
			if (pageAccessToken){
				log.info "Retrieved acting page access token.. ${pageAccessToken}"
				def postFacebookId = parsedPostJson.getString("id");
				
				facebookClient = new DefaultFacebookClient(pageAccessToken)
				def commentData = getCommentData()
				FacebookType publishMessageResponse = facebookClient.publish("${postFacebookId}/comments", FacebookType.class,
				  Parameter.with("message", commentText)
				);
			
				log.info "Successfully posted comment $commentText!"
			
				PageData page = getObjectDataByFacebookId(pageName, "PageData", true)
				
				PostData post = new PostData()
				post.facebookId = postFacebookId.toString()
				if (post.save()){
					CommentData comment = new CommentData()
					comment.facebookId = publishMessageResponse.getId().toString()
					if (comment.save()){
						post.addToComments comment
					}else{
						showPersistenceErrors(post, "Could not save comment to db!")
					}
				}else{
					showPersistenceErrors(post, "Could not save post to db!")
				}
				
				
			}else{
				log.error "Cannot post comment.. Could not retrieve correct acting page access token."
			}
			
		}
	}
	
	def getCommentData(){
		
	}
	
	def getPageAccessToken(pageId){
		log.info "ACCESS TOKEN AHEAD \n $accessToken"
		facebookClient = new DefaultFacebookClient(accessToken)
		JsonObject accountsResponse = facebookClient.fetchObject("me/accounts", JsonObject.class,
			Parameter.with("scope", "manage_pages, publish_actions")
		)
		JsonArray accountsArray = accountsResponse.map.data
		
		def pageAccessToken = ''
		if (accountsArray.length() > 0){
			for (int i=0; i<accountsArray.length(); i++){
				JsonObject parsedAccountJson = accountsArray.getJsonObject(i)
				if (parsedAccountJson.getString("id").equals(pageId.toString())){
					pageAccessToken = parsedAccountJson.getString("access_token")
					break
				}
			}
		}
		
		return pageAccessToken
	}
	
	def isPostAlreadyCommentedOn(JsonObject parsedPostJson, pageData){
		def postFacebookId = parsedPostJson.getJsonObject("from").getString("id")
		PostData savedPostObject = PostData.findAllByFacebookId(postFacebookId)
		
		Boolean isAlreadyCommentedOn = false
		if (savedPostObject && savedPostObject.comments && savedPostObject.comments.size() > 0){
			isAlreadyCommentedOn = true
		}
		
		return isAlreadyCommentedOn
	}
	
	def getObjectDataByFacebookId(facebookId, dataType, createIfNotExists){
		Class<?> clazz = Class.forName("com.minerva.workbench.${dataType}", true, Thread.currentThread().contextClassLoader)
		def dataObject = clazz.findByFacebookId(facebookId)
		if (!dataObject){
			log.info "${dataType} ${facebookId} does not exist in database.. trying to create it now."
			dataObject = clazz.newInstance()
			dataObject.facebookId = facebookId
			if (dataObject.save()){
				log.info "Successfully created a new ${dataType} ${facebookId}"	
			}else{
				showPersistenceErrors(dataObject, "Could not create ${dataType} ${facebookId}:")
			}
		}
	}
	
	def showPersistenceErrors(object, errorMessage){
		log.error errorMessage ?: "Error while saving"
		object.errors.each{
			println it
		}
	}
			
}
