<h3 align="center">
 <a href="http://github.com/machawk1/wail"><img src="https://cdn.rawgit.com/machawk1/wail/osagnostic/images/wail-blue-transp-500.png" alt="WAIL logo" width="400" alt="Web Archiving Integration Layer (WAIL) logo" /></a></h3>
<p align="center" style="font-weight: normal;"><em>"One-Click User Instigated Preservation"</em></p>
<hr style="height: 1px; border: none;" />

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages.

Tools included and accessible through the GUI are <a href="https://github.com/internetarchive/heritrix3">Heritrix 3.2.0</a> and <a href="https://github.com/iipc/openwayback">OpenWayback 2.4.0</a>. Support packages include Apache Tomcat, <a href="https://github.com/pyinstaller/pyinstaller/">pyinstaller</a>, and <a href="https://github.com/oduwsdl/memgator">MemGator</a>.

WAIL is written in Python and compiled to a native executable using <a href="http://www.pyinstaller.org/">PyInstaller</a>.

<blockquote>
 <b>NOTE:</b> WAIL has <em>also</em> been reimagined in <a href="https://github.com/n0tan3rd/wail">WAIL-Electron</a>. The reimagined version enables high fidelity web archiving using modern capture and replay tools as well as collection-based archive organization. For natively using conventional institutional-grade Web archiving tools like OpenWayback and Heritrix, the repo where you reside is the place to be.
</blockquote>

<h2>Installing WAIL</h2>

WAIL is an application that runs either on your macOS (`.app`) or Windows (`.exe`) system.

To install WAIL:
1. <a href="http://machawk1.github.io/wail/#download">Download</a> the appropriate package for your file system (`.dmg` for macOS or `.zip` for Windows) or see [more releases](https://github.com/machawk1/wail/releases).
2. Open the package (`.dmg` or `.zip`).
3. Follow the instructions to drag-and-drop the WAIL application to the correct location on your file system.

Alternatively, WAIL can be installed with the [homebrew package manager](https://github.com/Homebrew) on macOS with:

```sh
brew install wail
```

<h2>Running WAIL</h2>

<img src="https://github.com/machawk1/wail/blob/issue-355/images/screenshot_mac_20210528.png" width="522" height="387">

This section is intended only to run WAIL from source. To download the compiled application, see the <a href="http://machawk1.github.io/wail/#download">downloads section</a>.

End-user execution is meant to be accessed through the binary file, either WAIL.app on macOS or WAIL.exe on Windows.
To run it using Python for testing, run the following from the root of the WAIL source directory:

```
python ./bundledApps/WAIL.py
```

Since Wayback and Heritrix configurations rely on absolute paths on the system, checks and interactions with services may not work in debugging mode unless a binary of WAIL (e.g., WAIL.app) currently exists in directory specific to your operating system (see below).

Python is not required to be installed for end-users, just double-click (see above) and go!

<h2>Development</h2>
To build WAIL from source to a native system executable (.app or .exe), open a terminal or console session and clone a fresh copy of the WAIL source:


```bash
git clone https://github.com/machawk1/wail
git submodule init
git submodule update
```

Move into the root of the WAIL source directory:

```
cd wail
```

then, follow the below based on your operating system:

<h3>macOS</h3>

```
sh bundledApps/MAKEFILE.sh
```

Answer the questions in the prompts and this will create /Applications/WAIL.app on macOS.

<h4>Generating App Icons</h4>

On macOS, application icons are stored in a `.icns` file. To generate this:

1. Create a directory to store images: `mkdir wail_blue.iconset`
1. Create a PNG of your high resolution (1024x1024) icon, currently based on `/build/icons/wail-blue-logo.psd`, name it `icon_1024x1024.png` and place it in the `wail_blue.iconset`
1. In a terminal, `cd wail_blue.iconset` then run the script to generate the other images needed for an `.icns` with `../build/resize.sh`. There will then be 11 PNGs in the directory.
1. Navigate to the parent directory with `cd ../` and run `iconutil -c icns wail_blue.iconset`. This will create `wail_blue.icns`.
1. Store `wail_blue.icns` in `WAIL/build/icons/` when running building WAIL using `MAKEFILE.sh` on macOS.</li>


<h3>Windows</h3>
From the Windows shell:

```
bundledApps\MAKEFILE.bat
```

then move the WAIL source directory to the root of your C drive (thus making C:\WAIL\).

<h3>Linux</h3>
Linux support is currently in-development using Docker (see <a href="https://github.com/machawk1/wail/issues/2">#2</a>). From the root of the WAIL source working directory, run:

```
docker build -t machawk1/wail .
```

then

```
docker container run -d -it --rm -p 5920:5920 --name wail machawk1/wail
```

To log into the container to view the WAIL interface point a VNC Client to localhost:5920. The container can also be accessed via the command-line with:

```
docker exec -it wail /bin/bash
```

Once in the container, run the WAIL executable with:

```
./WAIL
```

There still exists some issues to be resolved for <a href="https://github.com/machawk1/wail/issues/2">#2</a>, as will be evident in the reports on the console.


<h2>Problems? Questions?</h2>
<p>Please see the <a href="https://github.com/machawk1/wail/wiki/FAQ">Frequently Asked Questions</a> page.</p>

<h2>Contact</h2>
<p>WAIL is a project of the <a href="https://ws-dl.cs.odu.edu/">Web Science and Digital Libraries (WS-DL) Research Group</a> at <a href="https://odu.edu/">Old Dominion University (ODU)</a>, created by <a href="https://matkelly.com/">Mat Kelly</a> with additional extensive contributions by <a href="https://github.com/n0tan3rd">John Berlin</a>.</p>

<p>For support e-mail wail@matkelly.com or tweet to us at <a href="https://twitter.com/machawk1">@machawk1</a> and/or <a href="https://twitter.com/WebSciDL">@WebSciDL</a>.</p>
