package com.minerva


class WorkbenchController {

	def workbenchService
	
    def allowServerAccess() { 
		workbenchService.updateWorkbenchVariables(params.access_token, true)
		return "thanks"
	}
	
	def blockServerAccess(){
		workbenchService.updateWorkbenchVariables("", false)
		return "wtf dude"
	}
	
}
