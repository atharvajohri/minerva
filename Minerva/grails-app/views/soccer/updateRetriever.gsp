<!doctype HTML>
<html>
	<head>
		<title>Get updates</title>
		<g:javascript library="jquery" plugin="jquery"></g:javascript>
		<r:layoutResources/>
	</head>
	<body>
		Updates come here:
		<div id="updates-container">
		</div>
		<script type="text/javascript" src="/js/frameworks/jquery.atmosphere.js"></script>
		<script>
		setupRelayer();
		function setupRelayer(){
			console.log ("initing relayer...");
			var socket = $.atmosphere;
			var request = {
				url :"/relay/discover",
				contentType : "application/json",
				logLevel : 'debug',
				transport : 'websocket',
				fallbackTransport : 'long-polling'
			};
			
			request.onOpen = function(response) {
				console.log("opened:")
				console.log(response)
				connectionState = 1
			};
			
			request.onMessage = function(response) {
				console.log("recieved:")
				console.log(response);
				var message = $.parseJSON(response.responseBody);
				parseRelayMessage(message);
			};
			
			request.onError = function(response) {
				console.log("error:")
				console.log(response)
				connectionState = -1
			};
			
			subSocket = socket.subscribe(request);
		}
		</script>
		<r:layoutResources/>
	</body>
</html>