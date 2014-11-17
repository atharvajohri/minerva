<!doctype html>
<html>
	<head>
		<title>Minerva: Watcher</title>
<%--		<r:layoutResources/>--%>
		<link href="/css/watcher.css" rel="stylesheet" type="text/css"/>
		<link href="/css/popularize.css" rel="stylesheet" type="text/css"/>
	</head>
	<body>
		<div id="fb-root"></div>
		<script>
			var fbReady = false;
		  // Additional JS functions here
		  window.fbAsyncInit = function() {
		    FB.init({
		      appId      : '1407389409497312', // App ID
		      status     : true, // check login status
		      cookie     : true, // enable cookies to allow the server to access the session
		      xfbml      : true  // parse XFBML
		    });

		    // Additional init code here
		    FB.login(function(response) {
				   // handle the response
				   fbReady = true;
				initApplication();
			 }, {scope: 'manage_pages, publish_stream'});

		  };

		  // Load the SDK asynchronously
		  (function(d){
		     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		     if (d.getElementById(id)) {return;}
		     js = d.createElement('script'); js.id = id; js.async = true;
		     js.src = "//connect.facebook.net/en_US/all.js";
		     ref.parentNode.insertBefore(js, ref);
		   }(document));
		</script>
		<div id="main-overlay" class="hide"></div>
		<div id="main-container" class="limit-width">
			<div id="popularize-container" class="hide">
				 
			</div>
			<div id="scheduled-content-container" class="hide">
				<b>Scheduled Content</b>
				<div id="scheduled-content">
					<table id="confirm-schedule-table">
						<thead>
							<tr>
								<th>Id</th><th>Title</th><th>Type</th><th>Picture</th><th style='width:180px;'>Time</th><th>Confirm</th>
							</tr>
						</thead>
						<tbody>
							
						</tbody>
					</table>
				</div>
				<input type="button" value="Confirm All" id="confirm-sc-box" /> <input type="button" value="Close" id="close-sc-box" />
				<br>
				<span id='sc-status-message'></span>
			</div>
			<b>Watcher extracts feed from multiple sources.</b>
			<br><br>
			<div class="content-box" id="input-container">
				<div id="wm-binder" class="bottom-bordered">
					<b>Current URLs:</b>
					<table>
						<thead>
							<tr>
								<th>Link</th><th>Name</th><th>Source</th>
							</tr>
						</thead>
					    <tbody data-bind="foreach: urls">
					        <tr>
					            <td data-bind="text: link"></td>
					            <td data-bind="text: name"></td>
					        </tr>
					    </tbody>
					</table>
				</div>
				<div id="new-url-binder" class="bottom-bordered">
					<table>
						<tr>
							<td>Link</td><td><input type="text" data-bind="value: link"></td>
						</tr>
						<tr>
							<td>Name</td><td><input type="text" data-bind="value: name"></td>
						</tr>
						<tr>
							<td>Source</td><td><input type="text" value="fb" data-bind="value: source"></td>
						</tr>
						<tr>
							<td>
								<input type = "button" value="Add" id="add-url"/>
							</td>
							<td>
								<input type="button" value="Extract" id="extract-btn">								
							</td>
						</tr>
						<tr>
							<td colspan="5">
								<input type = "button" value="Test Video Upload" id="test-btn"/>
							</td>
							<td>
								<input type = "button" value="Open Popularizer" id="open-popularizer"/>
							</td>
						</tr>
					</table>
				</div>
			</div>
			<div class="content-box">
				<b>Extracted content:</b>
				Reduce Popularity % <input type="text" id="pop-red" />
				<div class="extract-menu-button" id="schedule-btn">
					Schedule
				</div>
				<div id="extracted-content-container">
					<table style="width:100%">
						<thead>
							<tr>
								<th>Object</th><th>Type</th><th>Picture</th><th>Popularity</th><th>Message</th><th>Page</th>
							</tr>
						</thead>
						<tbody id="extracted-content-table-body">
						
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<input type='file' id='file-input-handler' class="hide" name="source">
		
		<script type="text/javascript" src="/js/frameworks/jquery.min.js"></script>
		<script type="text/javascript" src="/js/frameworks/knockout.js"></script>
		<script type="text/javascript" src="/js/application.js"></script>
		<script type="text/javascript" src="/js/popularize.js"></script>
<%--		<r:layoutResources/>--%>
	</body>
</html>