<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml">
	<head>
		<title>Atharva Johri: Musings, thoughts, creations and understandings</title>
		<meta name="description" content="This place is a thought shrub of Atharva Johri and is entirely maintained & developed by him." />
		<link href='http://fonts.googleapis.com/css?family=Dosis|Grand+Hotel|Open+Sans:300italic,400,300,600' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="${resource(dir: 'css', file: 'homePage.css')}" type="text/css">
		<fbg:resources locale="${Locale.getDefault()}" />
	</head>
	<body>
		<div id="global-loader" class="importantHide">
			<img src="/images/spinner.gif" />
		</div>
		<div id="main-container">
			<div id="mc-title-container">
				<div id="mctc-name-container" class="text-center">
					<span class="bold400">Atharva</span>&nbsp;<span class="bold600">Johri</span>
				</div>
<%--				<div id="mctc-attribute-container" class="bold300 text-center">--%>
<%--					engineer &nbsp;&nbsp; artist &nbsp;&nbsp; musician--%>
<%--				</div>--%>
			</div>
			<div id="mc-menu-container">
				<span class="menu-option" id="load-extractor-btn">Open Extractor</span>
			</div>
			<div id="mc-content-container">
<%--				<div id="mcc-quote-container" class="bold300">--%>
<%--					Take anything... anything at all. <br>A stone, a DNA strand, a red dwarf or a yellow submarine.<br><br>--%>
<%--					If you look deep enough, there's an infinite amount of knowledge within everything.<br>--%>
<%--					We are give 80 odd years to learn much as we can, --%>
<%--					to build what we can and inspire those around us <br>--%>
<%--					to open their minds to Nature & Life.<br><br>--%>
<%--					This is me and my objective. And this is the place I share my shrub of thoughts with you. --%>
<%--				</div>--%>
				<div id="mcc-attributes-container">
					<div class="mcc-ac-attribute">
						<div class="mcc-aca-name">
						</div>
					</div>
				</div>
				<div id="mcc-menu-container">
				</div>
			</div>
		</div>
		
		<div id="global-overlay" class="importantHide"></div>
		<div id="popup-container" class="importantHide">
			<div id="popup-content"></div>
			<div id="popup-actions">
				<div class="simple-button" id="global-popup-close-btn">Close</div>
			</div>
		</div>
		
		<script data-main="${resource(dir: 'js', file: 'homeMain.js')}" src="${resource(dir: 'js/frameworks', file: 'require.min.js')}"></script>
	</body>
</html>