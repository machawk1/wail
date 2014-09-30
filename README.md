Web Archiving Integration Layer (WAIL)
====
<i>"One-Click User Instigated Preservation"</i>

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages.

Tools included and accessible through the GUI are Heritrix 3.2.0, Wayback 1.7.1, and warc-proxy. Support packages include Apache Tomcat, phantomjs and pyinstaller.

WAIL is written mostly in Python and a small amount of JavaScript.

For more information and to download a binary, see http://matkelly.com/wail .

<h2>Running WAIL</h2>
End-user execution is meant to be accessed through the binary file, either WAIL.app on MacOS X or WAIL.exe on Windows (7+). 
To run it using Python for testing, simply use:
<blockquote>python WAIL.py</blockquote>

You may need to install other dependencies on your system to compile from source like <a href="http://www.wxwidgets.org/">wxWidgets</a> depending on your local python configuration. 

Python is not required to be installed for end-users, just double-click (above) and go!

<h2>Compiling</h2>
To compile WAIL to a system-dependent executable file to rid the local Python requirement, from the root of the WAIL source directory use:
<blockquote>sh ./bundledApps/MAKEFILE.sh</blockquote>

This will create /Applications/WAIL.app on MacOS X. The build script only currently has preliminary support for Windows, since WAIL now includes all assets in a single file (not supported in Windows, as far as I know).