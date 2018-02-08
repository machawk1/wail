#!/usr/bin/env python
#-*- coding:utf-8 -*-

import os
import sys
import re
import wx

WAIL_VERSION = "-1"

wailPath = os.path.dirname(os.path.realpath(__file__))
wailPath = wailPath.replace('\\bundledApps', '') # Fix for dev mode

infoPlistPath = ""
if 'darwin' in sys.platform:
    infoPlistPath = "/Applications/WAIL.app/Contents/Info.plist"
else:
    infoPlistPath = wailPath + "\\build\\Info.plist"


try:
    with open(infoPlistPath, "r") as myfile:
        data = myfile.read()
        vsXML = r"<key>CFBundleShortVersionString</key>\n\t<string>(.*)</string>"
        m = re.search(vsXML, data)
        WAIL_VERSION =  m.groups()[0].strip()
except:
    print('User likely has the binary in the wrong location.')

osx_java7DMG = "http://matkelly.com/wail/support/jdk-7u79-macosx-x64.dmg"

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
msg_uriInArchives_body = ("This URL is currently in your archive!"
                          " Hit the \"View Archive\" Button")
msg_wrongLocation_body = (
    "WAIL must reside in your Applications directory. "
    "Move it there then relaunch. \n* Current Location: ")
msg_wrongLocation_title = "Wrong Location"
msg_noJavaRuntime = "No Java runtime present, requesting install."
msg_fetchingMementos = "Fetching memento count..."

msg_crawlStatus_writingConfig = 'Writing Crawl Configuration...'
msg_crawlStatus_launchingCrawler = 'Launching Crawler...'
msg_crawlStatus_launchingWayback = 'Launching Wayback...'
msg_crawlStatus_initializingCrawlJob = 'Initializing Crawl Job...'

msg_installJava = 'Java needs to be installed for Heritrix and Wayback'
msg_java6Required = '{0}{1}'.format('Java SE 6 needs to be installed. ',
                                    'WAIL should invoke the installer here.')
msg_archiveFailed_java = 'Archive Now failed due to Java JRE Requirements'

tabLabel_basic = "Basic"
tabLabel_advanced = "Advanced"

tabLabel_advanced_general = "General"
tabLabel_advanced_wayback = "Wayback"
tabLabel_advanced_heritrix = "Heritrix"
tabLabel_advanced_miscellaneous = "Miscellaneous"
tabLabel_advanced_general_serviceStatus = "SERVICE STATUS"

serviceEnabledLabel_YES = "OK"  # "✓"
serviceEnabledLabel_NO = "X"  # "✗"

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

textLabel_defaultURI = "http://matkelly.com/wail"
textLabel_defaultURI_title = "WAIL homepage"

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
buttonLabel_heritrix_launchWebUI = "Launch WebUI"
buttonLabel_heritrix_launchWebUI_launching = "Launching..."
buttonLabel_heritrix_newCrawl = "New Crawl"

groupLabel_window = 'Web Archiving Integration Layer'

ui_justButtons_Position_1 = (0, 2)
ui_justButtons_Position_2 = (0, 27)

menuTitle_about = '&About WAIL'
menuTitle_help = '&Help'
menu_destroyJob = 'Destroy Job (Does not delete archive)'
menu_forceCrawlFinish = 'Force crawl to finish'
menu_viewJobInWebBrowser = 'View job in web browser'

heritrixCredentials_username = 'lorem'
heritrixCredentials_password = 'ipsum'

host_crawler = '0.0.0.0'
host_replay = '0.0.0.0'

port_crawler = '8443'
port_replay = '8080'

uri_tomcat = 'http://{0}:{1}'.format(host_replay, port_replay)
uri_wayback = 'http://{0}:{1}/wayback/'.format(host_replay, port_replay)
uri_wayback_allMementos = uri_wayback + '*/'
uri_heritrix = 'https://{0}:{1}@{2}:{3}'.format(
    heritrixCredentials_username, heritrixCredentials_password,
    host_crawler, port_crawler)
uri_heritrix_accessiblityURI = 'https://{0}:{1}@{2}:{3}'.format(
    heritrixCredentials_username, heritrixCredentials_password,
    host_crawler, port_crawler)
uri_heritrixJob = uri_heritrix + '/engine/job/'

jdkPath = "/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk"
jreHome = "/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home"
javaHome = "/Library/Java/JavaVirtualMachines/jdk1.7.0_79.jdk/Contents/Home"

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
wail_style_yesNo = wx.YES_NO|wx.YES_DEFAULT|wx.ICON_QUESTION

if 'darwin' in sys.platform:  # OS X Specific Code here
    # This should be dynamic but doesn't work with WAIL binary
    wailPath = "/Applications/WAIL.app"
    heritrixPath = wailPath + "/bundledApps/heritrix-3.2.0/"
    heritrixBinPath = "sh " + heritrixPath+"bin/heritrix"
    heritrixJobPath = heritrixPath + "jobs/"
    fontSize = 10
    tomcatPath = wailPath + "/bundledApps/tomcat"
    warcsFolder = wailPath + "/archives"
    tomcatPathStart = tomcatPath + "/bin/startup.sh"
    tomcatPathStop = tomcatPath + "/bin/shutdown.sh"

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
elif sys.platform.startswith('linux'):
    '''Linux Specific Code here'''
elif sys.platform.startswith('win32'):
    # Win Specific Code here, this applies to both 32 and 64 bit
    # Consider using http://code.google.com/p/platinfo/ in the future for finer refinement

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath

    heritrixPath = wailPath + "\\bundledApps\\heritrix-3.2.0\\"
    heritrixBinPath = heritrixPath + "\\bin\\heritrix.cmd"
    heritrixJobPath = heritrixPath + "\\jobs\\"
    tomcatPath = wailPath + "\\bundledApps\\tomcat"
    warcsFolder = wailPath + "\\archives"
    memGatorPath = wailPath + "\\bundledApps\\memgator-windows-amd64.exe"
    archivesJSON = wailPath + "\\config\\archives.json"
    tomcatPathStart = wailPath + "\\support\\catalina_start.bat"
    tomcatPathStop = wailPath + "\\support\\catalina_stop.bat"