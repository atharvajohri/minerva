<!doctype html>
<html>
	<table>
	<g:each in="${todaysMatches }" var="match">
		<tr>
			<td>${match.homeTeam.name }</td>
			<td>vs</td>
			<td>${match.awayTeam.name }</td>
			<td>at</td>
			<td>${match.dateOfMatch }</td>
		</tr>
	</g:each>
	</table>
</html>