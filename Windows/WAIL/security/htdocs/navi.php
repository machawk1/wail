<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
	"http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta name="author" content="Kai Oswald Seidler, Kay Vogelgesang, Carsten Wiedmann">
		<link href="xampp.css" rel="stylesheet" type="text/css">
		<script language="JavaScript" type="text/javascript" src="xampp.js"></script>
		<title></title>
	</head>

	<body class="n">
		<?php 
    include "lang/".file_get_contents("lang.tmp").".php"; 
    date_default_timezone_set('UTC');
    ?>

		<table border="0" cellpadding="0" cellspacing="0">
			<tr valign="top">
				<td align="right" class="navi">
					<img src="img/blank.gif" alt="" width="145" height="15"><br>
					<span class="nh">&nbsp;<?php echo $TEXT['navi-xampp']; ?><br>[PHP: <?php echo phpversion(); ?>]</span><br>
				</td>
			</tr>
			<tr>
				<td height="1" bgcolor="#fb7922" colspan="1" style="background-image:url(img/strichel.gif)" class="white"></td>
			</tr>
			<tr valign="top">
				<td align="right" class="navi">
					<a name="start" id="start" class="n" target="content" onclick="h(this);" href="security.php"><?php echo $TEXT['navi-security']; ?></a><br>&nbsp;<br>
				</td>
			</tr>
			<tr>
				<td bgcolor="#fb7922" colspan="1" class="white"></td>
			</tr>
			<tr valign="top">
				<td align="right" class="navi">
					<br><span class="nh"><?php echo $TEXT['navi-languages']; ?></span><br>
				</td>
			</tr>
			<tr>
				<td height="1" bgcolor="#fb7922" colspan="1" style="background-image:url(img/strichel.gif)" class="white"></td>
			</tr>
			<tr valign="top">
				<td align="right" class="navi">
					<a target=_parent class=n href="lang.php?de"><?php print $TEXT['navi-german']; ?></a><br>
					<a target=_parent class=n href="lang.php?en"><?php print $TEXT['navi-english']; ?></a><br>
					<a target=_parent class=n href="lang.php?es"><?php print $TEXT['navi-spanish']; ?></a><br>
					<a target=_parent class=n href="lang.php?fr"><?php print $TEXT['navi-french']; ?></a><br>
					<a target=_parent class=n href="lang.php?it"><?php print $TEXT['navi-italian']; ?></a><br>
					<a target=_parent class=n href="lang.php?nl"><?php print $TEXT['navi-dutch']; ?></a><br>
					<a target=_parent class=n href="lang.php?no"><?php print $TEXT['navi-norwegian']; ?></a><br>
					<a target=_parent class=n href="lang.php?pl"><?php print $TEXT['navi-polish']; ?></a><br>
					<a target=_parent class=n href="lang.php?pt"><?php print $TEXT['navi-portuguese']; ?></a><br>
					<a target=_parent class=n href="lang.php?sl"><?php print $TEXT['navi-slovenian']; ?></a><br>
					<a target=_parent class=n href="lang.php?zh"><?php print $TEXT['navi-chinese']; ?></a><p>

					<p class="navi">&copy;2002-<?php echo date("Y"); ?><br>
					<?php if (file_get_contents("lang.tmp") == "de") { ?>
						<a target="_new" href="http://www.apachefriends.org/index.html"><img border="0" src="img/apachefriends.gif" alt=""></a><p>
					<?php } else { ?>
						<a target="_new" href="http://www.apachefriends.org/index-en.html"><img border="0" src="img/apachefriends.gif" alt=""></a><p>
					<?php }	?>
				</td>
			</tr>
		</table>
	</body>
</html>
