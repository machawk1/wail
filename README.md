<h2 align="center">
 <a href="http://github.com/machawk1/wail"><img src="https://cdn.rawgit.com/machawk1/wail/osagnostic/build/icons/whale_256.png" alt="WAIL logo" /></a><br />&nbsp;Web Archiving Integration Layer (WAIL)</h2>
<p align="center" style="font-weight: normal;"><em>"One-Click User Instigated Preservation"</em></p>

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages.

Tools included and accessible through the GUI are <a href="https://github.com/internetarchive/heritrix3">Heritrix 3.2.0</a> and <a href="https://github.com/iipc/openwayback">OpenWayback 2.3.0</a>. Support packages include Apache Tomcat, <a href="https://github.com/pyinstaller/pyinstaller/">pyinstaller</a>, and <a href="https://github.com/oduwsdl/memgator">MemGator</a>.

WAIL is written in Python and compiled to a native executable using `pyInstaller`.

# Electron Wail
To run/build the electron portion of wail without going into directory electron.
The scrip **doElectron.sh** can be run with the following commands

    1. install: installs the required packages from npm

    2. start-dev: start the webpack dev server and starts up electron with the dev flag
       (runs both the dev and start-electron-dev commands)

    3. install-start: executes both install and start-dev

    4. package: build wail electron for the current os

    5. package-all: builds wail electron for all supported os

<h2>Installing WAIL</h2>

See the <a href="http://machawk1.github.io/wail/#download">download section on the WAIL homepage</a> to download the application, install it, and for basic usage.

<h2>Running WAIL</h2>

This section is intended only to run WAIL from source. To download the compiled application, see the <a href="http://machawk1.github.io/wail/#download">downloads section</a>.

End-user execution is meant to be accessed through the binary file, either WAIL.app on MacOS X or WAIL.exe on Windows (7+).
To run it using Python for testing, run the following from the root of the WAIL source directory:
<blockquote>python ./bundledApps/WAIL.py</blockquote>

Since Wayback and Heritrix configurations rely on absolute paths on the system, checks and interactions with services may not work in debugging mode unless a binary of WAIL (e.g. WAIL.app)currently exists in directory specific to your operating system (see below).

You may need to install other dependencies on your system to compile from source like <a href="http://www.wxwidgets.org/">wxWidgets</a> depending on your local python configuration.

Python is not required to be installed for end-users, just double-click (see above) and go!

<h2>Compiling</h2>
To compile WAIL to a system-dependent executable, `cd` into the root of the WAIL source directory then:
<h3>MacOS X</h3>
<blockquote>sh ./bundledApps/MAKEFILE.sh</blockquote>
This will create /Applications/WAIL.app on MacOS X.

<h3>Windows</h3>
From the Windows shell:
<blockquote>"./bundledApps/MAKEFILE.bat"</blockquote>
then move the WAIL source directory to the root of your C drive (thus making C:\WAIL\).

<h2>Problems? Questions?</h2>
<p>Please see the <a href="https://github.com/machawk1/wail/wiki/FAQ">Frequently Asked Questions</a> page.</p>

<h2>Contact</h2>
WAIL is a project of the Web Science and Digital Libraries (WS-DL) research group at Old Dominion University (ODU), created by Mat Kelly.

For support e-mail wail@matkelly.com or tweet to us at <a href="https://twitter.com/machawk1">@machawk1</a> and/or <a href="https://twitter.com/WebSciDL">@WebSciDL</a>.
