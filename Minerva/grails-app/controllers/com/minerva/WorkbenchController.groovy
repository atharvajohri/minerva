package com.minerva


class WorkbenchController {

	def workbenchService
	
    def allowServerAccess() { 
		workbenchService.updateWorkbenchVariables(params.access_token, true)
	}
	
	def blockServerAccess(){
		workbenchService.updateWorkbenchVariables("", false)
	}
	
}
