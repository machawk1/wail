<h2 align="center">
 <a href="http://github.com/machawk1/wail"><img src="https://cdn.rawgit.com/machawk1/wail/osagnostic/build/icons/whale_256.png" alt="WAIL logo" /></a><br />&nbsp;Web Archiving Integration Layer (WAIL)</h2>
<p align="center" style="font-weight: normal;"><em>"One-Click User Instigated Preservation"</em></p>

Web Archiving Integration Layer (WAIL)

_"One-Click User Instigated Preservation"_

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages. Tools included and accessible through the GUI are [Heritrix 3.2.0](https://github.com/internetarchive/heritrix3) and [OpenWayback 2.3.0](https://github.com/iipc/openwayback). Support packages include Apache Tomcat, [pyinstaller](https://github.com/pyinstaller/pyinstaller/), and [MemGator](https://github.com/oduwsdl/memgator).

## Electron Wail

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

Requires node 6.x/5.x and npm 3.x see Electron 1.0 [documentation](http://electron.atom.io)

Use node 6.x for best performance

### NPM Scripts
Use `$ npm run-script <name>` to execute any of the script listed below

1. External Dependancies
    * download-externals: Download the required openjdk and memgator version for current operating systems
    * download-externals-all: Same as above script but for all operating systems supported by this tool

2. Development
    * start-dev: Runs both the dev and dev-electron commands
    * dev: Runs the webpack dev server with hot module replacement enabled.
    * dev-electron: Start the electron shell for wail-electron

3. Production
    * package: Build wail-electron for the current operating systems
    * package-all: Builds wail-electron for all supported operating systems
    * package-[windows,linux,osx]: Builds wail-electron for a specific operating systems


### Shell scripts

1. bootstrap.sh:

 Executes npm install and npm run-script download-externals.

 If you supply the argument build will also execute npm run-script package


2. doElectron.sh:

    Executes any of the listed npm scripts whose name is given as an argument

    Additional arguments
    * install-start: runs npm install and npm run-script start-dev
    * bootstrap: executes the script `bootstrap.sh`
    * bootstrap-build: executes the script `bootstrap.sh` with the argument build







### Running in development mode
If you have not done so all ready `npm install`, `npm run-script download-externals` and copy the downloaded openjdk
and memgator to the bundled apps directory and finally run `npm run-script start-dev`.

We use webpack-dev server with `--inline --hot` and requires port 9000 to be free.



## Major Tasks

### Status monitoring
- [X] heritrix crawl progress updating(queued,downloaded,...) per job
- [X] reachability of wayback and heritrix

### Heritrix
- [x] start/stop
- [x] configure and launch single seed crawl
- [x] launch web ui in default browser
- [X] job crawl
  - [x] configure one off crawl
  - [x] launch one off crawl
  - [x] view with in app editor
  - [X] edit and save with in app editor
  - [x] multi uri crawl
- [X] job status
    - [x] on app start previous crawl status displayed
    - [X] background monitoring
- [X] post initial launch control

### Wayback
- [x] start/stop
- [x] replay of local archives(java7 runtimes only)
- [x] index CDX generation
- [X] wayback config
  - [x] view in app editor
  - [X] edit and save with in app editor

### Memgator
- [X] I can haz memento
    - [x] local memgator(linux only)
    - [X] compile version for windows and osx

### OS support
  - [x] Linux!!!!
  - [x] OSX
  - [X] Windows
    - [X] add os detection for operations
    - [x] works

### Misc
  - [ ] ui (move from dev ui to finalized ui)
  - [X] make monitoring and file sytem actions electron background processes
  - [ ] hook into Google APIs
  - [ ] save to local or public archive
 

### Screen shots

![Wail Electron Advanced](/images/wailFront.png?raw=true "Basic")
![Wail Electron Advanced](/images/wail-advanced.png?raw=true "Advanced")

### Slides from Archives Unleased 2.0
[Are Wails Electric?](http://www.slideshare.net/JohnBerlin3/are-wails-electric)

Powered by Electron and React.

# Wailpy

WAIL is written in Python and compiled to a native executable using `pyInstaller`.

## Installing WAIL

See the [download section on the WAIL homepage](http://machawk1.github.io/wail/#download) to download the application, install it, and for basic usage.

## Running WAIL

This section is intended only to run WAIL from source. To download the compiled application, see the [downloads section](http://machawk1.github.io/wail/#download).

End-user execution is meant to be accessed through the binary file, either WAIL.app on MacOS X or WAIL.exe on Windows (7+). To run it using Python for testing, run the following from the root of the WAIL source directory:

> python ./bundledApps/WAIL.py

Since Wayback and Heritrix configurations rely on absolute paths on the system, checks and interactions with services may not work in debugging mode unless a binary of WAIL (e.g. WAIL.app)currently exists in directory specific to your operating system (see below).

You may need to install other dependencies on your system to compile from source like [wxWidgets](http://www.wxwidgets.org/) depending on your local python configuration.

Python is not required to be installed for end-users, just double-click (see above) and go!

## Compiling

To compile WAIL to a system-dependent executable, `cd` into the root of the WAIL source directory then:

### MacOS X

> sh ./bundledApps/MAKEFILE.sh

This will create /Applications/WAIL.app on MacOS X.

### Windows

From the Windows shell:

> "./bundledApps/MAKEFILE.bat"

then move the WAIL source directory to the root of your C drive (thus making C:\WAIL).

## Problems? Questions?

Please see the [Frequently Asked Questions](https://github.com/machawk1/wail/wiki/FAQ) page.

## Contact

WAIL is a project of the Web Science and Digital Libraries (WS-DL) research group at Old Dominion University (ODU), created by Mat Kelly.

For support e-mail wail@matkelly.com or tweet to us at [@machawk1](https://twitter.com/machawk1) and/or [@WebSciDL](https://twitter.com/WebSciDL).
