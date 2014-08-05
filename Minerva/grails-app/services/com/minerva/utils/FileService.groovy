package com.minerva.utils

import groovy.io.FileType

class FileService {

	def grailsApplication
	
    def getAllFileNamesInDirectory(pathToDirectory) {
		def dir = new File(pathToDirectory)
		def fileList = []
		dir.eachFileRecurse (FileType.FILES) { file ->
		  fileList << file.name
		}
		
		log.info fileList
		
		return fileList
    }
	
	def getAllPictureCommentImages(){
		return getAllFileNamesInDirectory(getPathToPictureComments())
	}
	
	def getPathToPictureComments(){
		return grailsApplication.mainContext.getResource(grailsApplication.config.facebook.pictureCommentsFolder).getFile().path
	}
}
