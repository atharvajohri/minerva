package com.minerva


class WorkbenchController {

	def workbenchService
	
    def allowServerAccess() { 
		workbenchService.updateWorkbenchVariables(params.access_token, true)
		render "thanks"
	}
	
	def blockServerAccess(){
		workbenchService.updateWorkbenchVariables("", false)
		render "wtf dude"
	}
	
	def updateAccessFromControllerPost(){
		workbenchService.checkControllerPostAction()
		render "checked"
	}
	
}
