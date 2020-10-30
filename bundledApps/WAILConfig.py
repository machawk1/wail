#!/usr/bin/env python
# coding: utf-8

import os
import sys
import re
import wx
if os.name == 'nt':
    from win32com.client import Dispatch

WAIL_VERSION = "-1"

wailPath = os.path.dirname(os.path.realpath(__file__))
wailPath = wailPath.replace("\\bundledApps", "")  # Fix for dev mode

infoPlistPath = ""
if "darwin" in sys.platform:
    infoPlistPath = "/Applications/WAIL.app/Contents/Info.plist"
else:
    infoPlistPath = wailPath + "\\build\\Info.plist"


try:
    if "darwin" in sys.platform:
        with open(infoPlistPath, "r", encoding='latin1') as myfile:
            data = myfile.read()
            vsXML = (r"<key>CFBundleShortVersionString</key>\n\t"
                     r"<string>(.*)</string>")
            m = re.search(vsXML, data)
            WAIL_VERSION = m.groups()[0].strip()
    elif sys.platform.startswith("win32"):
        version_parser = Dispatch('Scripting.FileSystemObject')
        WAIL_VERSION = version_parser.GetFileVersion('C:\wail\WAIL.exe')

except:
    print("User likely has the binary in the wrong location.")


###############################
# Platform independent Messages
###############################
msg_stoppingTomcat = "Stopping Tomcat..."
msg_startingTomcat = "Starting Tomcat..."
msg_waybackEnabled = "Currently Enabled"
msg_waybackDisabled = "Currently Disabled"
msg_waybackNotStarted_title = "Wayback does not appear to be running."
msg_waybackNotStarted_body = "Launch Wayback and re-check?"
msg_uriNotInArchives = "The URL is not yet in the archives."
msg_uriInArchives_title = "Archived Status"
msg_uriInArchives_body = ("Archival captures (mementos) for this URL "
                          "are locally available.")
msg_wrongLocation_body = (
    "WAIL must reside in your Applications directory. "
    "Move it there then relaunch. \n* Current Location: "
)
msg_wrongLocation_title = "Wrong Location"
msg_noJavaRuntime = b"No Java runtime present, requesting install."
msg_fetchingMementos = "Fetching memento count..."
msg_noMementosAvailable = "No mementos available."

msg_crawlStatus_writingConfig = "Writing Crawl Configuration..."
msg_crawlStatus_launchingCrawler = "Launching Crawler..."
msg_crawlStatus_launchingWayback = "Launching Wayback..."
msg_crawlStatus_initializingCrawlJob = "Initializing Crawl Job..."

msg_java6Required = (
    "Java SE 6 needs to be installed. "
    "WAIL should invoke the installer here."
)
msg_archiveFailed_java = "Archive Now failed due to Java JRE Requirements"
msg_java_resolving = "Resolving Java Dependency"
msg_java7_downloading = "Downloading Java 7 DMG"
msg_error_tomcat_noStop = "Tomcat could not be stopped"
msg_error_tomcat_failed = "Command Failed"
msg_py3 = "ERROR: WAIL requires Python 3."

tabLabel_basic = "Basic"
tabLabel_advanced = "Advanced"

tabLabel_advanced_services = "Services"
tabLabel_advanced_wayback = "Wayback"
tabLabel_advanced_heritrix = "Heritrix"
tabLabel_advanced_miscellaneous = "Miscellaneous"
tabLabel_advanced_services_serviceStatus = "SERVICE STATUS"

serviceEnabledLabel_YES = "OK"  # "✓"
serviceEnabledLabel_NO = "X"  # "✗"
serviceEnabledLabel_FIXING = "FIXING"
serviceEnabledLabel_KILLING = "KILLING"

# Basic Tab Buttons
buttonLabel_archiveNow = "Archive Now!"
buttonLabel_archiveNow_initializing = "INITIALIZING"
buttonLabel_checkStatus = "Check Archived Status"
buttonLabel_viewArchive = "View Archive"
buttonLabel_mementoCountInfo = "?"
buttonLabel_uri = "URL:"
buttonLabel_fix = "Fix"
buttonLabel_kill = "Kill"
buttonLabel_refresh = "Refresh"
buttonLabel_starCrawl = "Start Crawl"

textLabel_defaultURI = "https://matkelly.com/wail"
textLabel_defaultURI_title = "WAIL homepage"
textLabel_uriEntry = "Enter one URI per line to crawl"
textLabel_depth = "Depth"
textLabel_depth_default = "1"
textLabel_launchCrawl = "Launch Crawl"
textLabel_urisToCrawl = "URIs to Crawl:"
textLabel_crawlJobs = "Crawl Jobs"
textLabel_statusInit = 'Type a URL and click "Archive Now!" ' "to begin archiving."
textLabel_noJobsAvailable = "(No jobs available)"

aboutWindow_appName = "Web Archiving Integration Layer (WAIL)"
aboutWindow_author = "By Mat Kelly <wail@matkelly.com>"
aboutWindow_iconPath = "/build/icons/wail_blue.ico"
aboutWindow_iconWidth = 128
aboutWindow_iconHeight = 128

# Advanced Tab Buttons
buttonLabel_wayback = "View Wayback in Browser"
buttonLabel_wayback_launching = "Launching Wayback..."
buttonLabel_editWaybackConfig = "Edit Wayback Configuration"
buttonLabel_resetWaybackConfig = "Reset Wayback Configuration"
buttonLabel_startHeritrix = "Start Heritrix Process"
buttonLabel_viewHeritrix = "View Heritrix in Browser"
buttonLabel_setupCrawl = "Setup One-Off Crawl"
buttonLabel_viewArchiveFiles = "View Archive Files"
buttonLabel_checkForUpdates = "Check for Updates"
buttonLabel_heritrix_launchWebUI = "Launch WebUI"
buttonLabel_heritrix_launchWebUI_launching = "Launching..."
buttonLabel_heritrix_newCrawl = "New Crawl"

groupLabel_window = "Web Archiving Integration Layer"

ui_justButtons_Position_1 = (0, 2)
ui_justButtons_Position_2 = (0, 27)

menuTitle_about = "&About WAIL"
menuTitle_file = "&File"
menuTitle_edit = "&Edit"
menuTitle_view = "&View"
menuTitle_window = "&Window"
menuTitle_help = "&Help"
menuTitle_file_newCrawl = "&New Crawl"

menuTitle_file_allCrawls = "All Crawls"
menuTitle_file_allCrawls_finish = "Finish"
menuTitle_file_allCrawls_pause = "Pause"
menuTitle_file_allCrawls_restart = "Restart"
menuTitle_file_allCrawls_destroy = "Destroy (does not delete archive)"

menuTitle_edit_undo = "Undo"
menuTitle_edit_redo = "Redo"
menuTitle_edit_cut = "Cut"
menuTitle_edit_copy = "Copy"
menuTitle_edit_paste = "Paste"
menuTitle_edit_selectAll = "Select All"

menuTitle_view_viewBasic = "Basic Interface"
menuTitle_view_viewAdvanced = "Advanced Interface"
menuTitle_view_viewAdvanced_services = "Services"
menuTitle_view_viewAdvanced_wayback = "Wayback"
menuTitle_view_viewAdvanced_heritrix = "Heritrix"
menuTitle_view_viewAdvanced_miscellaneous = "Miscellaneous"

menuTitle_window_wail = "Web Archiving Integration Layer"

menu_destroyJob = "Destroy Job (Does not delete archive)"
menu_forceCrawlFinish = "Force crawl to finish"
menu_viewJobInWebBrowser = "View job in web browser"
menu_rebuildJob = "Rebuild job"
menu_rebuildAndLaunchJob = "Rebuild and launch job"

heritrixCredentials_username = "lorem"
heritrixCredentials_password = "ipsum"

host_crawler = "0.0.0.0"
host_replay = "0.0.0.0"

port_crawler = "8443"
port_replay = "8080"

index_timer_seconds = 10.0

jdkPath = ""
jreHome = ""
javaHome = ""

###############################
# Platform-specific paths
###############################

heritrixPath = ""
heritrixBinPath = ""
heritrixJobPath = ""
warcsFolder = ""
tomcatPath = ""
tomcatPathStart = ""
tomcatPathStop = ""
memGatorPath = ""
archivesJSON = ""
fontSize = 8
wailWindowSize = (410, 275)
wailWindowStyle = wx.DEFAULT_FRAME_STYLE & ~(wx.RESIZE_BORDER | wx.MAXIMIZE_BOX)
wail_style_yesNo = wx.YES_NO | wx.YES_DEFAULT | wx.ICON_QUESTION

if "darwin" in sys.platform:  # macOS-specific code
    # This should be dynamic but doesn't work with WAIL binary
    wailPath = '/Applications/WAIL.app'
    heritrixPath = f'{wailPath}/bundledApps/heritrix-3.2.0/'
    heritrixBinPath = f'sh {heritrixPath}bin/heritrix'
    heritrixJobPath = f'{heritrixPath}jobs/'
    fontSize = 10
    tomcatPath = f'{wailPath}/bundledApps/tomcat'
    warcsFolder = f'{wailPath}/archives'
    tomcatPathStart = f'{tomcatPath}/bin/startup.sh'
    tomcatPathStop = f'{tomcatPath}/bin/shutdown.sh'

    jdkPath = (f"{wailPath}/bundledApps/Java"
               "/JavaVirtualMachines/jdk1.7.0_79.jdk"
               "/Contents/Home/"
               )
    jreHome = jdkPath
    javaHome = jdkPath

    aboutWindow_iconPath = f'{wailPath}{aboutWindow_iconPath}'

    memGatorPath = f'{wailPath}/bundledApps/memgator-darwin-amd64'
    archivesJSON = f'{wailPath}/config/archives.json'

    # Fix tomcat control scripts' permissions
    os.chmod(tomcatPathStart, 0o744)
    os.chmod(tomcatPathStop, 0o744)
    os.chmod(f'{tomcatPath}/bin/catalina.sh', 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wailPath):
        os.chmod(r, 0o777)
elif sys.platform.startswith("linux"):
    # Should be more dynamics but suitable for Docker-Linux testing
    wailPath = '/wail'
    heritrixPath = f'{wailPath}/bundledApps/heritrix-3.2.0/'
    heritrixBinPath = f'sh {heritrixPath}bin/heritrix'
    heritrixJobPath = f'{heritrixPath}jobs/'
    fontSize = 10
    tomcatPath = f'{wailPath}/bundledApps/tomcat'
    warcsFolder = f'{wailPath}/archives'
    tomcatPathStart = f'{tomcatPath}/bin/startup.sh'
    tomcatPathStop = f'{tomcatPath}/bin/shutdown.sh'

    aboutWindow_iconPath = f'{wailPath}{aboutWindow_iconPath}'

    memGatorPath = f'{wailPath}/bundledApps/memgator-linux-amd64'
    archivesJSON = f'{wailPath}/config/archives.json'

    # Fix tomcat control scripts' permissions
    os.chmod(tomcatPathStart, 0o744)
    os.chmod(tomcatPathStop, 0o744)
    os.chmod(f'{tomcatPath}/bin/catalina.sh', 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wailPath):
        os.chmod(r, 0o777)

elif sys.platform.startswith("win32"):
    # Win Specific Code here, this applies to both 32 and 64 bit
    # Consider using http://code.google.com/p/platinfo/ in the future
    # ...for finer refinement
    wailPath = 'C:\\wail'

    aboutWindow_iconPath = f'{wailPath}{aboutWindow_iconPath}'
    jdkPath = f'{wailPath}\\bundledApps\\Java\\Windows\\jdk1.7.0_80\\'
    jreHome = jdkPath
    javaHome = jdkPath

    heritrixPath = wailPath + "\\bundledApps\\heritrix-3.2.0\\"
    heritrixBinPath = f'{heritrixPath}bin\\heritrix.cmd'
    heritrixJobPath = f'{heritrixPath}\\jobs\\'
    tomcatPath = f'{wailPath}\\bundledApps\\tomcat'
    warcsFolder = f'{wailPath}\\archives'
    memGatorPath = f'{wailPath}\\bundledApps\\memgator-windows-amd64.exe'
    archivesJSON = f'{wailPath}\\config\\archives.json'
    tomcatPathStart = f'{wailPath}\\support\\catalina_start.bat'
    tomcatPathStop = f'{wailPath}\\support\\catalina_stop.bat'

    host_crawler = "localhost"
    host_replay = "localhost"

uri_tomcat = f"http://{host_replay}:{port_replay}"
uri_wayback = f"http://{host_replay}:{port_replay}/wayback/"
uri_wayback_allMementos = uri_wayback + "*/"
uri_heritrix = (
    f"https://"
    f"{heritrixCredentials_username}:{heritrixCredentials_password}@"
    f"{host_crawler}:{port_crawler}"
)
uri_heritrix_accessiblityURI = (
    f"https://"
    f"{heritrixCredentials_username}:{heritrixCredentials_password}@"
    f"{host_crawler}:{port_crawler}"
)
uri_heritrixJob = f'{uri_heritrix}/engine/job/'
