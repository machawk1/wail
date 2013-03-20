Web Archiving Integration Layer (WAIL)
====
<i>"One-Click User Instigated Preservation"</i>

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages.

Tools included and accessible through the GUI are Heritrix 3.1.0, Wayback 1.6, and warc-proxy. Support packages include Apache Tomcat, phantomjs and pyinstaller.

WAIL is written mostly in Python and a small amount of JavaScript.

For more information and to download a binary, see http://matkelly.com/wail .

<h2>Running WAIL</h2>
End-user execution is meant to be accessed through the binary find, either WAIL.app on MacOS X or WAIL.exe on Windows (7+). 
To run it using Python for testing, simple use:
<blockquote>python WAIL.py</blockquote>
...on Windows or:
<blockquote>arch -i386 python WAIL.py</blockquote>
on MacOS X.
