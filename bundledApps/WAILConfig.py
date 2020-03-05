#!/usr/bin/env python
# coding: utf-8

import os
import sys
import re
import wx
import re

from xml.dom import minidom

WAIL_VERSION = "-1"

wailPath = os.path.dirname(os.path.realpath(__file__))
wailPath = wailPath.replace("\\bundledApps", "")  # Fix for dev mode

infoPlistPath = ""
if "darwin" in sys.platform:
    infoPlistPath = "/Applications/WAIL.app/Contents/Info.plist"
else:
    infoPlistPath = wailPath + "\\build\\Info.plist"


try:
    with open(infoPlistPath, "r") as myfile:
        data = myfile.read()
        vsXML = r"<key>CFBundleShortVersionString</key>\n\t<string>(.*)</string>"
        m = re.search(vsXML, data)
        WAIL_VERSION = m.groups()[0].strip()
except:
    print("User likely has the binary in the wrong location.")

osx_java7DMG_URI = "https://matkelly.com/wail_old/support/jdk-7u79-macosx-x64.dmg"
osx_java7DMG_hash = b"\xb5+\xca\xc5d@\xe7\xfd\x0b]\xb9\xe31\xd3\x1d+\xd4X\xf5\x88\xb8\xb0\x1eR\xea\xf0\xad*\xff\xaf\x9d\xa2"

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
msg_uriInArchives_title = "This page has been archived!"
msg_uriInArchives_body = (
    "This URL is currently in your archive!" ' Hit the "View Archive" Button'
)
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

msg_java6Required = "{0}{1}".format(
    "Java SE 6 needs to be installed. ", "WAIL should invoke the installer here."
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

textLabel_defaultURI = "http://matkelly.com/wail"
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
wailWindowSize = (400, 250)
wailWindowStyle = wx.DEFAULT_FRAME_STYLE & ~(wx.RESIZE_BORDER | wx.MAXIMIZE_BOX)
wail_style_yesNo = wx.YES_NO | wx.YES_DEFAULT | wx.ICON_QUESTION

if "darwin" in sys.platform:  # macOS-specific code
    # This should be dynamic but doesn't work with WAIL binary
    wailPath = "/Applications/WAIL.app"
    heritrixPath = wailPath + "/bundledApps/heritrix-3.2.0/"
    heritrixBinPath = "sh " + heritrixPath + "bin/heritrix"
    heritrixJobPath = heritrixPath + "jobs/"
    fontSize = 10
    tomcatPath = wailPath + "/bundledApps/tomcat"
    warcsFolder = wailPath + "/archives"
    tomcatPathStart = tomcatPath + "/bin/startup.sh"
    tomcatPathStop = tomcatPath + "/bin/shutdown.sh"

    jdkPath = (
        wailPath
        + "/bundledApps/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home/"
    )
    jreHome = jdkPath
    javaHome = jdkPath

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath

    memGatorPath = wailPath + "/bundledApps/memgator-darwin-amd64"
    archivesJSON = wailPath + "/config/archives.json"

    # Fix tomcat control scripts' permissions
    os.chmod(tomcatPathStart, 0o744)
    os.chmod(tomcatPathStop, 0o744)
    os.chmod(tomcatPath + "/bin/catalina.sh", 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wailPath):
        os.chmod(r, 0o777)
elif sys.platform.startswith("linux"):
    # Should be more dynamics but suitable for Docker-Linux testing
    wailPath = "/wail"
    heritrixPath = wailPath + "/bundledApps/heritrix-3.2.0/"
    heritrixBinPath = "sh " + heritrixPath + "bin/heritrix"
    heritrixJobPath = heritrixPath + "jobs/"
    fontSize = 10
    tomcatPath = wailPath + "/bundledApps/tomcat"
    warcsFolder = wailPath + "/archives"
    tomcatPathStart = tomcatPath + "/bin/startup.sh"
    tomcatPathStop = tomcatPath + "/bin/shutdown.sh"

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath

    memGatorPath = wailPath + "/bundledApps/memgator-linux-amd64"
    archivesJSON = wailPath + "/config/archives.json"

    # Fix tomcat control scripts' permissions
    os.chmod(tomcatPathStart, 0o744)
    os.chmod(tomcatPathStop, 0o744)
    os.chmod(tomcatPath + "/bin/catalina.sh", 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wailPath):
        os.chmod(r, 0o777)

elif sys.platform.startswith("win32"):
    # Win Specific Code here, this applies to both 32 and 64 bit
    # Consider using http://code.google.com/p/platinfo/ in the future
    # ...for finer refinement
    wailPath = "C:\\wail"

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath
    jdkPath = wailPath + "\\bundledApps\\Java\\Windows\\jdk1.7.0_80\\"
    jreHome = jdkPath
    javaHome = jdkPath

    heritrixPath = wailPath + "\\bundledApps\\heritrix-3.2.0\\"
    heritrixBinPath = heritrixPath + "bin\\heritrix.cmd"
    heritrixJobPath = heritrixPath + "\\jobs\\"
    tomcatPath = wailPath + "\\bundledApps\\tomcat"
    warcsFolder = wailPath + "\\archives"
    memGatorPath = wailPath + "\\bundledApps\\memgator-windows-amd64.exe"
    archivesJSON = wailPath + "\\config\\archives.json"
    tomcatPathStart = wailPath + "\\support\\catalina_start.bat"
    tomcatPathStop = wailPath + "\\support\\catalina_stop.bat"

    host_crawler = "localhost"
    host_replay = "localhost"

uri_tomcat = "http://{0}:{1}".format(host_replay, port_replay)
uri_wayback = "http://{0}:{1}/wayback/".format(host_replay, port_replay)
uri_wayback_allMementos = uri_wayback + "*/"
uri_heritrix = "https://{0}:{1}@{2}:{3}".format(
    heritrixCredentials_username,
    heritrixCredentials_password,
    host_crawler,
    port_crawler,
)
uri_heritrix_accessiblityURI = "https://{0}:{1}@{2}:{3}".format(
    heritrixCredentials_username,
    heritrixCredentials_password,
    host_crawler,
    port_crawler,
)
uri_heritrixJob = uri_heritrix + "/engine/job/"


class PrefTab_Replay(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        sz = wx.BoxSizer()

        sz.Add(
            wx.StaticText(self, wx.ID_ANY, "Replay"), flag=wx.CENTER
        )



        self.archiveLocations = wx.StaticText(self, wx.ID_ANY, label="Archive Locations")
        self.listbox = wx.ListBox(self, style = wx.LB_HSCROLL)

        #archiveLocationsList = parent.readArchiveLocations()
        #self.listbox.Set(archiveLocationsList)

        sz.AddMany(
            [
                (self.archiveLocations, 0),
                (self.listbox, 0, wx.EXPAND),
                (wx.StaticText(self, 7, "test"), 1, wx.EXPAND)
               # (self.setupNewCrawlButton, 0, wx.EXPAND),
               #(self.launchWebUIButton, 0, wx.EXPAND),
            ]
        )
        #self.listbox.SetMaxSize((300, 100))


class PrefTab_Aggregator(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        sz = wx.BoxSizer()

        sz.Add(
            wx.StaticText(self, wx.ID_ANY, "Aggregator"), flag=wx.CENTER
        )


class PrefTab_Crawler(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        sz = wx.BoxSizer()

        self.r1c1 = wx.StaticText(self, wx.ID_ANY, "R1C1")
        self.r1c2 = wx.StaticText(self, wx.ID_ANY, "R1C2")
        self.r2c2 = wx.StaticText(self, wx.ID_ANY, "R2C2")

    def draw(self):
        self.sizer = wx.BoxSizer()

        gs = wx.FlexGridSizer(2, 2, 0, 0)
        gs.AddMany([
            self.r1c1,
            self.r1c2,

            self.r2c2,self.r2c2
        ])
        gs.AddGrowableCol(0, 1)
        gs.AddGrowableCol(1, 1)
        # gs.AddGrowableCol(2, 1)

        self.sizer.Add(gs, proportion=1)
        self.SetSizer(self.sizer)
        self.Layout()

class PreferencesWindow(wx.Frame):
    """UI elements for graphically setting WAIL preferences"""
    def __init__(self):
        wx.Frame.__init__(self, None, title="WAIL Preferences")
        panel = wx.Panel(self)
        box = wx.BoxSizer(wx.HORIZONTAL)
        wx.Frame.Center(self)
        self.Notebook = wx.Notebook(panel)
        box.Add(self.Notebook, 2, flag=wx.EXPAND)
        panel.SetSizer(box)

        self.preftab_crawler = PrefTab_Crawler(self.Notebook)
        self.preftab_replay = PrefTab_Replay(self.Notebook)
        self.preftab_aggregator = PrefTab_Aggregator(self.Notebook)

        self.Notebook.AddPage(self.preftab_crawler, "Crawler")
        self.Notebook.AddPage(self.preftab_replay, "Replay")
        self.Notebook.AddPage(self.preftab_aggregator, "Aggregator")
        #'''return


        #self.SetSizer(box)
        #self.Center()#'''



    def readArchiveLocations(self):
        #with open("/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml", "r") as f:
        #    config = f.read()
        #print(config)
        xmldoc = minidom.parse('/Applications/WAIL.app/bundledApps/tomcat/webapps/ROOT/WEB-INF/wayback.xml')
        itemlist = xmldoc.getElementsByTagName('bean')

        #print(itemlist[0].attributes['name'].value)
        targetEl = None
        for s in itemlist:
            if s.attributes['class'].value == "org.springframework.beans.factory.config.PropertyPlaceholderConfigurer":
                targetEl = s
                break

        # A very hacky way to parse out the archive directory paths from
        # wayback.xml. See #343

        txtValue = ''
        for x in targetEl.childNodes[1].childNodes[1].childNodes:
            txtValue += x.data + '\n'  # Combine comments and text into str

        baseDirNeedle = 'wayback.basedir.default='
        archiveDirNeedle = 'wayback.archivedir'

        baseDirNeedleVar = '${wayback.basedir}'

        srcs = []
        baseDir = ''
        for line in txtValue.split('\n'):
            if baseDirNeedle in line:
                baseDir = line.split('=')[1]
            if archiveDirNeedle in line:
                srcs.append(line.split('=')[1])
        for i, src in enumerate(srcs):
            srcs[i] = srcs[i].replace(baseDirNeedleVar, baseDir)

        return srcs
