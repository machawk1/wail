<html>
	<head>
		<meta name="author" content="Kai Oswald Seidler, Kay Vogelgesang, Carsten Wiedmann">
		<link href="xampp.css" rel="stylesheet" type="text/css">
		<script language="JavaScript" type="text/javascript" src="xampp.js"></script>
		<title></title>
	</head>

	<body>
		<?php include "lang/".file_get_contents("lang.tmp").".php"; ?>
		&nbsp;<br>

		<h1><?php echo $TEXT['security-head']; ?></h1>
		<i>(Requests allowed from localhost only)</i><br/><br/>
		<?php echo $TEXT['security-text1']; ?><p>

 
		<?php
			$i = 0;

			function line($head, $textok, $info, $running, $notonload, $command) {
				$host = "127.0.0.1";
				$timeout = "1";
				global $i, $TEXT;
				$curdir = getcwd();
				list($partwampp, $directorwampp) = preg_split('/\\\\security/', $curdir);
				$htaccess = ".htaccess";
				$configinc = "config.inc.php";

				$notrun = 0;
				$status = 0;
				$notload = 0;
				$newstatus = "nok";

				global $htxampp;
				global $phpmyadminconf;

				$htxampp = $partwampp."\htdocs\\xampp\\".$htaccess;
				$phpmyadminconf = $partwampp."\phpmyadmin\\".$configinc;
				if ($command == "phpmyadmin") {
					if (file_exists($phpmyadminconf)) {
						$datei = fopen($phpmyadminconf, 'r');
						$status = 1;

						while (!feof($datei)) {
							$zeile = fgets($datei, 255);
							@list($left, $right) = preg_split("/=/", $zeile);
							if (preg_match("/'auth_type'/i", $left)) {
								if (preg_match("/'http'/i", $right)) {
									$newstatus = "ok";
								} elseif (preg_match("/'cookie'/i", $right)) {
									$newstatus = "ok";
								}
								if ($newstatus == "ok") {
									$status = 0;
								} else {
									$status = 1;
								}
							}
						}
						fclose($datei);
					} else {
						$notrun = 1;
					}
				}

				if ($command == "mysqlroot") {
					if (($handle = @fsockopen($host, 3306, $errno, $errstr, $timeout)) == true) {
						@fclose($handle);
						if (@mysql_connect($host, "root", "")) {
							$status = 1;
						} else {
							$status = 0;
						}
					} else {
						$notrun = 1;
					}
				}

				if ($command == "xampp") {
					if (file_exists($htxampp)) {
						$status = 0;
					} else {
						$status = 1;
					}
				}

				if ($command == "php") {
					if (ini_get('safe_mode')) {
						$status = 0;
					} else {
						$status = 1;
					}
				}

				if ($command == "ftp") {
					if (($handle = @fsockopen($host, 21, $errno, $errstr, $timeout)) == true) {
						@fclose($handle);

						$conn_id = ftp_connect("127.0.0.1");
						$login_result = @ftp_login($conn_id, "newuser", "wampp");
						if (!$conn_id || !$login_result) {
							$status = 0;
						} else {
							$status = 1;
							ftp_quit($conn_id);
						}
					} else {
						$notrun = 1;
					}
				}

				if (extension_loaded("imap")) {
					if ($command == "pop") {
						if (($handle = @fsockopen($host, 110, $errno, $errstr, $timeout)) == true) {
							@fclose($handle);
							if ($mbox = @imap_open("{localhost/pop3:110}INBOX", "newuser", "wampp")) {
								$status = 1;
								imap_close($mbox);
							} else {
								$status = 0;
							}
						} else {
							$notrun = 1;
						}
					}
				} else {
					$notload = 1;
				}

				if ($i > 0) {
					echo "<tr valign='bottom'>";
					echo "<td bgcolor='#ffffff' height='1' style='background-image:url(img/strichel.gif)' colspan='4'></td>";
					echo "</tr>";
				}

				echo "<tr bgcolor='#ffffff' valign='middle'><td><img src='img/blank.gif' alt='' width='1' height='20'></td><td class='tabval'>";
				if ($notload == 1) {
					echo $notonload;
				}
				if (($status == 0) && (($notrun == "") || ($notrun < 1))) {
					echo $textok;
				} elseif ($notrun == 1) {
					echo $running;
				} else {
					echo $head;
				}

				echo "</td>";
				if (($status == 0) && ($notrun != 1)) {
					echo "<td>&nbsp;&nbsp;<span class='green'>&nbsp;".$TEXT['security-ok']."&nbsp;</span></td>";
				} elseif ($status == 1) {
					echo "<td>&nbsp;&nbsp;<span class='red'>&nbsp;".$TEXT['security-nok']."&nbsp;</span></td>";
				} elseif ($notrun == 1) {
					echo "<td>&nbsp;&nbsp;<span class='yellow'>&nbsp;".$TEXT['security-noidea']."&nbsp;</span></td>";
				} else {
					echo "<td>&nbsp;&nbsp;<span class='yellow'>&nbsp;".$TEXT['security-noidea']."&nbsp;</span></td>";
				}
				echo "<td>&nbsp;</td></tr>";

				if ($notrun == 1) {
					echo "<tr bgcolor='#ffffff'><td></td><td colspan='1' class='small'>$running<br><img src='img/blank.gif' alt='' width='10' height='10' border='0'></td><td></td><td></td></tr>";
				} elseif ($status) {
					echo "<tr bgcolor='#ffffff'><td></td><td colspan='1' class='small'>$info<br><img src='img/blank.gif' alt='' width='10' height='10' border='0'></td><td></td><td></td></tr>";
				}

				$i++;
			}

			echo "<table border='0' cellpadding='0' cellspacing='0'>";
			echo "<tr valign='top'>";
			echo "<td bgcolor='#fb7922' valign='top'><img src='img/blank.gif' alt='' width='10' height='0'></td>";
			echo "<td bgcolor='#fb7922' class='tabhead'><img src='img/blank.gif' alt='' width='250' height='6'><br>".$TEXT['security-tab1']."</td>";
			echo "<td bgcolor='#fb7922' class='tabhead'><img src='img/blank.gif' alt='' width='100' height='6'><br>".$TEXT['security-tab2']."</td>";
			echo "<td bgcolor='#fb7922' valign='top'><br><img src='img/blank.gif' alt='' width='1' height='10'></td>";
			echo "</tr>";

			line($TEXT['security-checkapache-nok'], $TEXT['security-checkapache-ok'], $TEXT['security-checkapache-text'], "", "", "xampp");

			line($TEXT['security-checkmysql-nok'], $TEXT['security-checkmysql-ok'], $TEXT['security-checkmysql-text'], $TEXT['security-checkmysql-out'], "", "mysqlroot");

			line($TEXT['security-phpmyadmin-nok'], $TEXT['security-phpmyadmin-ok'], $TEXT['security-phpmyadmin-text'], $TEXT['security-phpmyadmin-out'], "", "phpmyadmin");

      // line($TEXT['security-checkphp-nok'], $TEXT['security-checkphp-ok'], $TEXT['security-checkphp-text'], $TEXT['security-checkphp-out'], "", "php");
      
	      $xopen = fopen("..\..\htdocs\\\\\\\\xampp\.modell", 'r');
        $xmodell = fread($xopen, filesize("..\..\htdocs\\\\\\\\xampp\.modell"));
        fclose($xopen);
        //echo "Modell : $xmodell";
        if ($xmodell == "XAMPP") { 
			
      line($TEXT['security-checkftppassword-nok'], $TEXT['security-checkftppassword-ok'], $TEXT['security-checkftppassword-text'], $TEXT['security-checkftppassword-out'], "", "ftp");

			if (extension_loaded("imap")) {
				line($TEXT['security-pop-nok'], $TEXT['security-pop-ok'], $TEXT['security-pop-text'], $TEXT['security-pop-out'], $TEXT['security-pop-notload'], "pop");
			}
			}

			echo "<tr valign='bottom'>";
			echo "<td bgcolor='#fb7922'></td>";
			echo "<td bgcolor='#fb7922' colspan='3'><img src='img/blank.gif' alt='' width='1' height='8'></td>";
			echo "<td bgcolor='#fb7922'></td>";
			echo "</tr>";

			echo "</table>";
			echo "<p>";
		?>
		
		<?php if ($xmodell == "XAMPP") { ?>
		<?php echo $TEXT['security-text2']; ?><p>
		<?php echo $TEXT['security-text3']; ?><br>&nbsp;<p>
		<?php echo $TEXT['security-text4']; ?>
    <?php } else { ?>
    <p> [XAMPP USB LITE]: Make XAMPP more safety then use this => <a href="/security/xamppsecurity.php"><b>http://localhost/security/xamppsecurity.php</b><br /><br /></a>
    <?php } ?>
		<p>
		<table border="0">
			<tr>
				<td>ftp</td>
				<td>&nbsp;</td>
				<td><b>21</b>/tcp</td>
				<td>&nbsp;</td>
				<td># File Transfer [Control] (XAMPP: FTP Default Port)</td>
			</tr>
			<tr>
				<td>smtp</td>
				<td>&nbsp;</td>
				<td><b>25</b>/tcp</td>
				<td>&nbsp;</td>
				<td>mail # Simple Mail Transfer (XAMPP: SMTP Default Port)</td>
			</tr>
			<tr>
				<td>http</td>
				<td>&nbsp;</td>
				<td><b>80</b>/tcp</td>
				<td>&nbsp;</td>
				<td># World Wide Web HTTP (XAMPP: Apache Default Port)</td>
			</tr>
			<tr>
				<td>pop3</td>
				<td>&nbsp;</td>
				<td><b>110</b>/tcp</td>
				<td>&nbsp;</td>
				<td># Post Office Protocol - Version 3 (XAMPP: POP3 Default Port)</td>
			</tr>
			<tr>
				<td>imap</td>
				<td>&nbsp;</td>
				<td><b>143</b>/tcp</td>
				<td>&nbsp;</td>
				<td># Internet Message Access Protocol (XAMPP: IMAP Default Port)</td>
			</tr>

			<tr>
				<td>https</td>
				<td>&nbsp;</td>
				<td><b>443</b>/tcp</td>
				<td>&nbsp;</td>
				<td># http protocol over TLS/SSL (XAMPP: Apache SSL Port)</td>
			</tr>
			<tr>
				<td>mysql</td>
				<td>&nbsp;</td>
				<td><b>3306</b>/tcp</td>
				<td>&nbsp;</td>
				<td># MySQL (XAMPP: MySQL Default Port)</td>
			</tr>
			<tr>
				<td>AJP/1.3</td>
				<td>&nbsp;</td>
				<td><b>8009</b></td>
				<td>&nbsp;</td>
				<td># AJP/1.3 (XAMPP: Tomcat AJP/1.3 Port)</td>
			</tr>
			<tr>
				<td>http-alt</td>
				<td>&nbsp;</td>
				<td><b>8080</b>/tcp</td>
				<td>&nbsp;</td>
				<td># HTTP Alternate (see port 80) (XAMPP: Tomcat Default Port)</td>
			</tr>
		</table>
		<!--
		smtp          25/tcp   # Simple Mail Transfer (XAMPP: SMTP Default Port)
		http          80/tcp   # World Wide Web HTTP (XAMPP: Apache Default Port)
		pop3         110/tcp   # Post Office Protocol - Version 3 (XAMPP: POP3 Default Port)
		imap         143/tcp   # Internet Message Access Protocol (XAMPP: IMAP Default Port)
		https        443/tcp   # http protocol over TLS/SSL (XAMPP: Apache SSL Port)
		mysql		3306/tcp   # MySQL (XAMPP: MySQL Default Port)
		AJP/1.3		8009/tcp   # AJP/1.3 (XAMPP: Tomcat AJP/1.3 Port)
		http-alt	8080/tcp   # HTTP Alternate (see port 80) (XAMPP: Tomcat Default Port)
		-->
		<p>&nbsp;<p>
	</body>
</html>
