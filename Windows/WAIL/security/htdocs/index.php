<?php
	if (file_get_contents("lang.tmp") == "") {
		header("Location: splash.php");
		exit;
	}
?>

<html>
	<head>
		<meta name="author" content="Kai Oswald Seidler, Kay Vogelgesang, Carsten Wiedmann">
		<link rel="icon" href="img/xampp.ico">
		<?php include "lang/".file_get_contents("lang.tmp").".php"; ?>
		<title><?php echo $TEXT['global-xampp']; ?> | Security Section</title>
	</head>

	<frameset rows="68,*" border="0" framespacing="0">
		<frame name="head" src="head.php" frameborder="0" scrolling="no">
		<frameset cols="170,*" border="0" framespacing="0">
			<frame name="navi" src="navi.php" frameborder="0" scrolling="auto">
			<frame name="content" src="security.php" frameborder="0" marginwidth="20">
		</frameset>
	</frameset>
</html>
