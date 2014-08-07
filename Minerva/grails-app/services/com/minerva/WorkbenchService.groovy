package com.minerva

import com.minerva.workbench.CommentData
import com.minerva.workbench.PageData
import com.minerva.workbench.PostData
import com.restfb.BinaryAttachment
import com.restfb.DefaultFacebookClient
import com.restfb.FacebookClient
import com.restfb.Parameter
import com.restfb.FacebookClient.AccessToken
import com.restfb.json.JsonArray
import com.restfb.json.JsonObject
import com.restfb.types.FacebookType

class WorkbenchService {

	//TODO: shift FB functionality to FacebookManagementService
	
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
	def fileService
	
	def updateWorkbenchVariables(c_accessToken, c_actionsAllowed){
		actionsAllowed = c_actionsAllowed
		accessToken = c_accessToken
		log.info "[WORKBENCH] Workbench Variables updated: \n** ${c_accessToken} \n** ${c_actionsAllowed}"
	}
	
	def checkControllerPostAction(){
		def checkedControllerPostAction = false
		try {
			if (accessToken){
				log.info " [CONTROLLER POST] Checking controller post"
				def controllerPostFacebookClient = new DefaultFacebookClient(accessToken)
				def controllerPostId = grailsApplication.config.facebook.controllerPostId
				JsonObject controllerPostResponse = controllerPostFacebookClient.fetchObject("${controllerPostId}", JsonObject.class)
				def controllerPostMessage = controllerPostResponse.getString("message")
				
				if (controllerPostMessage.equals("minerva start")){
					log.info " [CONTROLLER POST] Controller post has authorized access"
					actionsAllowed = true
				}else if (controllerPostMessage.equals("minerva stop")){
				log.info " [CONTROLLER POST] Controller post has killed access"
					actionsAllowed = false
				}
				
			}else{
				log.error "Access Token Missing: Application has not been authorized to begin."
			}
		}catch(Exception e){
			log.error "Error while checking controller post!"
			log.error e.toString()
			checkedControllerPostAction = false
		}finally{
			return checkedControllerPostAction
		}
	}
	
	/*Following method triggered with General Actions Job -- [WorkbenchJob.execute] */
	def triggerWorkbenchJobActions(){
		def logString = "[WORKBENCH] \n\n***********************************************\n**JOB**\n***********************************************\n: Triggered Workbench Job"
		checkControllerPostAction()
		if(actionsAllowed == true && workbenchStatus["currentlyParsing"] == false && accessToken){
			
			try {
				
				extendAccessToken()
				
				logString += "\nAccess Allowed! Beginning parse for facebook pages.."
				log.info logString
				//TODO: can add more actions to run below!
				//TODO: shift all possible actions to config
				workbenchStatus["currentlyParsing"] = true
				parseFacebookPages();
			}catch(Exception e){
				def exceptionString = e.toString()
				log.error exceptionString
				
			}finally{
				workbenchStatus["currentlyParsing"] = false
			}
		}else{
			logString += "\nCannot proceed:\nActions Allowed: ${actionsAllowed}\nCurrently Parsing: ${workbenchStatus['currentlyParsing']}"
			log.info logString
		}
	}
	
	def extendAccessToken(){
		//extend access token
		AccessToken accessTokenExtensionResponse = new DefaultFacebookClient().obtainExtendedAccessToken(
			grailsApplication.config.facebook.applicationId,
			grailsApplication.config.facebook.applicationSecret,
			accessToken
		);
	
		accessToken = accessTokenExtensionResponse.accessToken
	
		log.info "[WORKBENCH] Access Token extended!"
	}
	
    def parseFacebookPages() {
		def pagesToParse = grailsApplication.config.facebook.pageDataToParse
		pagesToParse.each { pageName, pageData -> //for each page
			pageData.dataPaths.each{ dataPath -> //for each data path for the page
				if (dataPath){
					
					log.info "[EXTRACTION] Beginning extraction from data path $dataPath in page $pageName"
					
					JsonArray parsedPosts = parsePage(pageName, pageData, 1, dataPath)
					if (parsedPosts.length() > 0){
						log.info "[EXTRACTION] Extracted ${parsedPosts.length()} post/s for $pageName\nCommencing commentary for them."
						for (int i=0; i<parsedPosts.length(); i++){
							def parsedPostJson = parsedPosts.getJsonObject(i)
							commentOnPost(parsedPostJson, pageName, pageData)
						}
					}else{
						log.error "[EXTRACTION] No posts parsed for ${pageName}"
					}
				}
			}
		}
		
    }
	
	def parsePage(pageName, pageData, postsCount, dataPath){
		def retrievedPosts = []
		
		if (accessToken && accessToken.size() > 0){
			log.info "[EXTRACTION] Extracting $postsCount post for $pageName"
			
//			actionsAllowed = false
			postsCount = postsCount ?: 1
			facebookClient = new DefaultFacebookClient(accessToken)
			//get last 3 posts
			JsonObject pageFeed = facebookClient.fetchObject("${dataPath}", JsonObject.class,
				Parameter.with("limit", postsCount)
			)
		
			int totalCount = 0
			
			retrievedPosts = pageFeed.map.data
			
		}else{
			log.error "[EXTRACTION] No access token found!"
		}
		
		
		return retrievedPosts
	}
	
	def commentOnPost(parsedPostJson, pageName, pageData){
		log.info "[COMMENTING] \n\n --- PROPERTIES OF POST --- \n"
		println "${parsedPostJson.getString('created_time')}\n${parsedPostJson.getString('id')}"
		
		
		if (isPostAlreadyCommentedOn(parsedPostJson, pageData)){
			log.error "[COMMENTING] Post is already commented on!"
		}else{
			log.info "[COMMENTING] Post is not commented on.. Trying to comment now."
			pageAccessToken = getPageAccessToken(grailsApplication.config.facebook.actingFacebookPageId)
			
			if (pageAccessToken){
				log.info "[COMMENTING] Retrieved acting page access token.. ${pageAccessToken}"
				def postFacebookId = parsedPostJson.getString("id");
				
				facebookClient = new DefaultFacebookClient(pageAccessToken)
				def commentData = getCommentData(parsedPostJson, pageName, pageData)
				
				if (commentData.imageFileName || commentData.attachment_url){
					FacebookType publishMessageResponse
					if (pageData.commentType == "text"){
						publishMessageResponse = facebookClient.publish("${postFacebookId}/comments", FacebookType.class,
							Parameter.with('message', commentData.attachment_url)
						)
					}else{
						InputStream is = new FileInputStream(fileService.getPathToPictureComments() + File.separator + commentData.imageFileName)
						
						publishMessageResponse = facebookClient.publish("${postFacebookId}/comments", FacebookType.class,
							BinaryAttachment.with('source', is)
						)
					
						is.close()
					}
					
				
					log.info "[COMMENTING] <<<<<<<<<<<<<<< Successfully posted comment!"

					PageData page = getObjectDataByFacebookId(pageName, "PageData", true)
					
					PostData post = new PostData()
					post.facebookId = postFacebookId.toString()
					if (post.save(flush: true)){
						CommentData comment = new CommentData()
						comment.facebookId = publishMessageResponse.getId().toString()
						comment.commentPicture = commentData.commentPicture
						if (comment.save(flush: true)){
							post.addToComments comment
						}else{
							showPersistenceErrors(post, "[PERSISTENCE] Could not save comment to db!")
						}
					}else{
						showPersistenceErrors(post, "[PERSISTENCE] Could not save post to db!")
					}
				}else{
					log.error "[PERSISTENCE] Cannot post comment.. All images have been used."
				}
				
			}else{
				log.error "[PERSISTENCE] Cannot post comment.. Could not retrieve correct acting page access token."
			}
			
		}
	}
	
	def getCommentData(parsedPostJson, pageName, pageData){
		
		def commentData = [:]
		
		def pictureFileName = getPictureFileName()
		commentData.commentPicture = pictureFileName
		if( pictureFileName ){
			if (pageData.commentType == "text"){
				commentData.attachment_url = getFacebookPictureURLFromFileName(pictureFileName)
			}else{
				commentData.imageFileName = pictureFileName
			}
		}
		
		return commentData
	}
	
	def getFacebookPictureURLFromFileName(String pictureFileName){
		//pic file name is something like 1017562_4637469111447_6783571092768124838_n.jpg and 4637469111447 is the fb id
		
		
		def facebookPictureId = pictureFileName.substring(pictureFileName.indexOf("_")+1, pictureFileName.size())
		facebookPictureId = facebookPictureId.substring(0, facebookPictureId.indexOf("_"))
		
		def pictureURL = "https://www.facebook.com/photo.php?fbid="+facebookPictureId
		
//		pictureURL = URLEncoder.encode(pictureURL, "UTF-8")
		
		log.info "[FILE] extracted fb pic url $pictureURL"
		return pictureURL
	}
	
	def getPictureFileName(){ 
		//iterate through all comments and see which pictures have been used
		//get all possible picture images
		def allImages = fileService.getAllPictureCommentImages()
		def usedImages = CommentData.list(max: 100).commentPicture
		def possibleImages = (allImages - usedImages)
		return possibleImages.size() > 0 ? possibleImages[0] : null
	}
	
	def getPageAccessToken(pageId){
		log.info "PAGE ACCESS TOKEN AHEAD \n $accessToken"
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
	
	def isPostAlreadyCommentedOn(parsedPostJson, pageData){
		def postFacebookId = parsedPostJson.getString("id")
		PostData savedPostObject = PostData.findByFacebookId(postFacebookId)
		
		def isAlreadyCommentedOn = false
		if (savedPostObject){
			isAlreadyCommentedOn = true
		}
		
		return isAlreadyCommentedOn
	}
	
	def getObjectDataByFacebookId(facebookId, dataType, createIfNotExists){
		Class<?> clazz = Class.forName("com.minerva.workbench.${dataType}", true, Thread.currentThread().contextClassLoader)
		def dataObject = clazz.findByFacebookId(facebookId)
		if (!dataObject){
			log.info "[PERSISTENCE] ${dataType} ${facebookId} does not exist in database.. trying to create it now."
			dataObject = clazz.newInstance()
			dataObject.facebookId = facebookId
			if (dataObject.save(flush: true)){
				log.info "[PERSISTENCE] Successfully created a new ${dataType} ${facebookId}"	
			}else{
				showPersistenceErrors(dataObject, "[PERSISTENCE] Could not create ${dataType} ${facebookId}:")
			}
		}
	}
	
	def showPersistenceErrors(object, errorMessage){
		log.error errorMessage ?: "[PERSISTENCE] Error while saving"
		object.errors.each{
			println it
		}
	}
			
}
