<h2 align="center">
 <a href="http://github.com/machawk1/wail"><img src="https://cdn.rawgit.com/machawk1/wail/osagnostic/build/icons/whale_256.png" alt="WAIL logo" /></a><br />&nbsp;Web Archiving Integration Layer (WAIL)</h2>
<p align="center" style="font-weight: normal;"><em>"One-Click User Instigated Preservation"</em></p>

Web Archiving Integration Layer (WAIL)

_"One-Click User Instigated Preservation"_

Web Archiving Integration Layer (WAIL) is a graphical user interface (GUI) atop multiple web archiving tools intended to be used as an easy way for anyone to preserve and replay web pages. Tools included and accessible through the GUI are [Heritrix 3.2.0](https://github.com/internetarchive/heritrix3) and [OpenWayback 2.3.0](https://github.com/iipc/openwayback). Support packages include Apache Tomcat, [pyinstaller](https://github.com/pyinstaller/pyinstaller/), and [MemGator](https://github.com/oduwsdl/memgator).

## Electron Wail

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### Scripts

1. copy-resources: Copies resources required to function and the script to do that is tools/copy.js. In this file are two variables dirsRequired and resourcesToCopy. The dirsRequired is an array of paths to folders needed to be present before the copy. Likewise with resourcesToCopy but has objects with from and two as keys. Add to thes if you need to have more items copied.
2. start-dev: Runs both the dev and start-electron-dev commands
3. dev: Runs the webpack dev server with hot module replacement enabled
4. start-electron-dev: Start electron

### Packaging

Package for current platfom: `npm run-script package` To package for all platforms: `npm run-script package-all`

## Major Tasks

### Status monitoring
- [ ] heritrix crawl progress updating(queued,downloaded,...) per job
- [ ] reachability of wayback and heritrix

### Heritrix
- [x] start/stop
- [x] configure and launch single seed crawl
- [x] launch web ui in default browser
- [ ] job crawl
  - [x] configure one off crawl
  - [x] launch one off crawl
  - [x] view with in app editor
  - [ ] edit and save with in app editor
  - [ ] multi uri crawl
- [ ] job status
    - [x] on app start previous crawl status displayed
    - [ ] background monitoring
- [ ] post initial launch control

### Wayback
- [x] start/stop
- [x] replay of local archives(java7 runtimes only)
- [x] index CDX generation
- [ ] wayback config
  - [x] view in app editor
  - [ ] edit and save with in app editor
- [ ] fix dependancy for java7
  - [ ] pywb?
  - [ ] roll your own jvm?

### Memgator
- [ ] I can haz memento
    - [x] local memgator(linux only)
    - [ ] compile version for windows and osx

### OS support
  - [x] Linux!!!!
  - [x] OSX
  - [ ] Windows
    - [ ] add os detection for operations
    - [x] in theory it works

### Misc
  - [ ] ui (move from dev ui to finalized ui)
  - [ ] make monitoring and file sytem actions electron background processes


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
