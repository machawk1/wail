<html>
	<head>
		<meta name="author" content="Kai Oswald Seidler, Kay Vogelgesang, Carsten Wiedmann">
		<link href="xampp.css" rel="stylesheet" type="text/css">
		<title></title>
	</head>

	<body style="background: #ffffff; margin-top: 8px; margin-left: 8px;">

		<table cellpadding="0" cellspacing="0" border="0">
			<tr>
				<td><img src="img/blank.gif" alt="" width="111" height="1"></td>
				<?php if (file_get_contents("lang.tmp") == "de") { ?>
					<td><a target="content" href="http://www.apachefriends.org/xampp.html"><img border="0" src="img/logo-small.gif" alt=""></a></td>
				<?php } else { ?>
					<td><a target="content" href="http://www.apachefriends.org/xampp-en.html"><img border="0" src="img/logo-small.gif" alt=""></a></td>
				<?php } ?>
				<td><img src="img/blank.gif" alt="" width="10" height="1"></td>
				<td><img src="img/head-xampp.gif" alt=""></td>
				<td><img src="img/blank.gif" alt="" width="10" height="1"></td>
				<?php if (file_get_contents("lang.tmp") == "de") { ?>
					<td><img src="img/head-fuer.gif" alt=""></td>
				<?php } else { ?>
					<td><img src="img/head-for.gif" alt=""></td>
				<?php } ?>
				<td><img src="img/blank.gif" alt="" width="10" height="1"></td>
				<td><img src="img/head-windows.gif" alt=""></td>
			</tr>
		</table>

	</body>
</html>
