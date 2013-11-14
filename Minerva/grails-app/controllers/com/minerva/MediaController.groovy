package com.minerva

import grails.converters.JSON
import groovy.json.JsonSlurper

import com.minerva.media.TargetPage
import com.restfb.BinaryAttachment
import com.restfb.Connection
import com.restfb.DefaultFacebookClient
import com.restfb.FacebookClient
import com.restfb.Parameter
import com.restfb.types.FacebookType
import com.restfb.types.Photo
import com.restfb.types.Post
import com.restfb.types.Video


class MediaController {

    def index() { 
			
	}
	
	
	def getTargetPagesForPopularization(){
		
	}
	
	def registerPopularization(){
		log.info "*************************\nGot request to popularize on target pages\n${params}";	
		def slurper = new JsonSlurper()
		def targetPages = slurper.parseText(params.targetPages)
		targetPages.each {targetPage ->
			//add each target page if not exists to DB.
			def pageObject = TargetPage.findByPageId(targetPage.toString())
			if (!pageObject){
				pageObject = new TargetPage()
				pageObject.pageId = targetPage.toString()
				
				if (pageObject.save()){
					log.info "Target page ${targetPage} saved"
				}else{
					log.info "Target page ${targetPage} save error"
					pageObject.errors.each {
						println it
					}
				}
			}else{
				log.info "Target page ${targetPage} exists"
			}
		}
	}
	
	
	def runPopularization(){

		if (params.access_token){
			FacebookClient facebookClient = new DefaultFacebookClient(params.access_token);
			
			def targetPages = ["247906198588126"]//TargetPage.list()
			targetPages.each { tp ->
				
				log.info "Running popularization for ${tp}"
				
				def pageId = tp
				//get last 3 posts
				Connection<Post> pageFeed = facebookClient.fetchConnection(pageId+"/feed", Post.class,
					Parameter.with("limit", "3")
				);
			
				log.info "\n*************************\nResults"
				for (List<Post> myFeedConnectionPage : pageFeed){
					for (Post post : myFeedConnectionPage){
						println "************************************************************************************\n"+post.message + "\n"
					}
				}
			
				
			}
		}else{
			log.info "no access token"
		}
	}
	
	
	def uploadMediaToFacebook(){
		
		log.info "*************************\nGot request to upload media\n${params}"
		def responseJSON = [:]
		
		if (params.access_token && params.source){
			//get inputstream from the video url
			InputStream is = new URL(params.source).openStream();
			
			//create restfb client
			FacebookClient facebookClient = new DefaultFacebookClient(params.access_token);
			def classType, location
			if (params.type == "video"){
				classType = Video.class
				location = "${params.pageId}/videos"
			}else if (params.type == "photo"){
				classType = Photo.class
				location = "${params.pageId}/photos"
			}
			
			FacebookType publishMessageResponse = facebookClient.publish(location, classType,
					BinaryAttachment.with(params.type == "video" ? 'test.mp4' : 'test.jpg', is),
					Parameter.with(params.type == "video" ? 'description' : 'message', params.title),
					Parameter.with('published', false),
					Parameter.with('scheduled_publish_time', params.scheduled_publish_time)
				);
			if (publishMessageResponse.id){
				responseJSON.success = true
				responseJSON.message = publishMessageResponse.id			
			}else{
				responseJSON.success = false
				responseJSON.message = "Video could not be uploaded"
			}
		}else{
			def errmsg
			if (!params.access_token)
				errmsg = "No access token."
			else if (!params.source)
				errmsg = "No source."
			log.info errmsg
			responseJSON.success = false
			responseJSON.message = errmsg
		}
		
		render responseJSON as JSON
	}
	
}
