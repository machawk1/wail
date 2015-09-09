#!/usr/bin/env python
#-*- coding:utf-8 -*-

# Web Archiving Integration Layer (WAIL)
#  This tool ties together web archiving applications including Wayback,
#   Heritrix, and Tomcat.
#  Mat Kelly <wail@matkelly.com> 2013

import wx
import subprocess
import shlex
import webbrowser
import os
import time
import sys
import datetime
import urllib
import urllib2
import base64
import glob
import re
import ssl
import shutil
import errno
from urlparse import urlparse

# from wx import *
import waybackConfigWriter
from subprocess import Popen, PIPE

# For a more asynchronous UI, esp with accessible()s
from multiprocessing import Pool as Thread
import logging
import requests
import threading  # Necessary for polling/indexing
import thread  # For a more responsive UI
from requests.auth import HTTPDigestAuth

import wxversion

import tarfile  # For updater

ssl._create_default_https_context = ssl._create_unverified_context

#  from pync import Notifier # OS X notifications

WAIL_VERSION = "1.0"

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
msg_uriInArchives_body = ("This URL is currently in the archives!"
                          " Hit the \"View Archive\" Button")
msg_wrongLocation_body = "WAIL must reside in your Applications directory. Move it there then relaunch.\n\nCurrent Location: "
msg_wrongLocation_title = "Wrong Location"
msg_noJavaRuntime = "No Java runtime present, requesting install."

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
buttonLabel_uri = "URL:"
buttonLabel_fix = "Fix"
buttonLabel_kill = "Kill"

textLabel_defaultURI = "http://matkelly.com/wail"
textLabel_defaultURI_title = "WAIL homepage"

aboutWindow_appName = "Web Archiving Integration Layer (WAIL)"
aboutWindow_author = "By Mat Kelly <wail@matkelly.com>"
aboutWindow_iconPath = "/build/icons/whale.ico"
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

groupLabel_window = "Web Archiving Integration Layer"

menuTitle_about = "&About WAIL"
menuTitle_help = "&Help"
menu_destroyJob = "Destroy Job (Does not delete archive)"
menu_forceCrawlFinish = "Force crawl to finish"

heritrixCredentials_username = "lorem"
heritrixCredentials_password = "ipsum"


uri_tomcat = "http://localhost:8080/"
uri_wayback = "http://localhost:8080/wayback/"
uri_wayback_allMementos = uri_wayback + "*/"
uri_heritrix = "https://" + heritrixCredentials_username + ":" + heritrixCredentials_password + "@localhost:8443"
uri_heritrix_accessiblityURI = "https://" + heritrixCredentials_username + ":" + heritrixCredentials_password + "@localhost:8443"
uri_heritrixJob = uri_heritrix + "/engine/job/"

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
wailPath = os.path.dirname(os.path.realpath(__file__))
fontSize = 8
wailWindowSize = (400,250)

if 'darwin' in sys.platform:  # OS X Specific Code here
    # This should be dynamic but doesn't work with WAIL binary
    wailPath = "/Applications/WAIL.app"
    heritrixPath = wailPath + "/bundledApps/heritrix-3.2.0/"
    heritrixBinPath = "sh " + heritrixPath+"bin/heritrix"
    heritrixJobPath = heritrixPath+"jobs/"
    fontSize = 10
    tomcatPath = wailPath + "/bundledApps/tomcat"
    warcsFolder = tomcatPath + "/webapps/ROOT/files1"
    tomcatPathStart = tomcatPath + "/bin/startup.sh"
    tomcatPathStop = tomcatPath + "/bin/shutdown.sh"

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath

    # Fix tomcat control scripts' permissions
    os.chmod(tomcatPathStart, 0744)
    os.chmod(tomcatPathStop, 0744)
    os.chmod(tomcatPath + "/bin/catalina.sh", 0744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wailPath):
        os.chmod(r, 0777)
elif sys.platform.startswith('linux'):
    '''Linux Specific Code here'''
elif sys.platform.startswith('win32'):
    # Win Specific Code here, this applies to both 32 and 64 bit
    # Consider using http://code.google.com/p/platinfo/ in the future for finer refinement

    aboutWindow_iconPath = wailPath + aboutWindow_iconPath

    heritrixPath = "C:/WAIL/bundledApps/heritrix-3.2.0/"
    heritrixBinPath = heritrixPath+"bin/heritrix.cmd"
    heritrixJobPath = "C:\\WAIL\\jobs\\"
    tomcatPath = "C:/WAIL/bundledApps/tomcat"
    warcsFolder = tomcatPath + "/webapps/ROOT/files1"
    tomcatPathStart = "C:/WAIL/support/catalina_start.bat"
    tomcatPathStop = "C:/WAIL/support/catalina_stop.bat"
###############################
# Tab Controller (Notebook)
###############################


class TabController(wx.Frame):
    def __init__(self):
        wx.Frame.__init__(self, None, title=groupLabel_window, size=wailWindowSize)
        panel = wx.Panel(self)
        vbox = wx.BoxSizer(wx.VERTICAL)

        self.Notebook = wx.Notebook(panel)
        vbox.Add(self.Notebook, 2, flag=wx.EXPAND)

        panel.SetSizer(vbox)

        # Add basic config page/tab
        self.basicConfig = WAILGUIFrame_Basic(self.Notebook)
        self.Notebook.AddPage(self.basicConfig, tabLabel_basic)

        # Add advanced config page/tab
        self.advConfig = WAILGUIFrame_Advanced(self.Notebook)
        self.Notebook.AddPage(self.advConfig, tabLabel_advanced)
        self.createMenu()

    def createMenu(self):
        self.menu_bar = wx.MenuBar()
        self.help_menu = wx.Menu()

        self.help_menu.Append(wx.ID_ABOUT,   menuTitle_about)
        self.help_menu.Append(wx.ID_EXIT,   "&QUIT")
        self.menu_bar.Append(self.help_menu, menuTitle_help)

        self.Bind(wx.EVT_MENU, self.displayAboutMenu, id=wx.ID_ABOUT)
        self.Bind(wx.EVT_MENU, self.quit, id=wx.ID_EXIT)
        self.SetMenuBar(self.menu_bar)

    def displayAboutMenu(self, button):
        info = wx.AboutDialogInfo()
        info.Name = aboutWindow_appName
        info.Version = "v. " + WAIL_VERSION
        info.Copyright = aboutWindow_author
        # info.Description = "foo"
        info.WebSite = (textLabel_defaultURI, textLabel_defaultURI_title)
        # info.Developers = ["Mat Kelly"]
        # info.License = "lic info"
        info.SetIcon(wx.Icon(aboutWindow_iconPath, wx.BITMAP_TYPE_ICO, aboutWindow_iconWidth, aboutWindow_iconHeight))
        wx.AboutBox(info)

    def ensureCorrectInstallation(self):
        # TODO: properly implement this
        # Check that the file is being executed from the correct location
        if 'darwin' in sys.platform and os.path.dirname(os.path.abspath(__file__)) != "/Applications":
            # Alert the user to move the file. Exit the program
            wx.MessageBox(msg_wrongLocation_body + os.path.dirname(os.path.abspath(__file__)), msg_wrongLocation_title,)
            print msg_wrongLocation_body + os.path.dirname(os.path.abspath(__file__))
            #sys.exit()

    def quit(self, button):
        sys.exit()


class WAILGUIFrame_Basic(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        self.uriLabel = wx.StaticText(self, -1, buttonLabel_uri, pos=(0, 5))
        self.uri = wx.TextCtrl(self, -1, pos=(30, 0), value=textLabel_defaultURI, size=(350, 25))
        self.archiveNowButton = wx.Button(self, -1, buttonLabel_archiveNow, pos=(0, 30))
        self.checkArchiveStatus = wx.Button(self,  -1, buttonLabel_checkStatus, pos=(105, 30))
        self.viewArchive = wx.Button(self, -1, buttonLabel_viewArchive, pos=(270, 30))

        self.archiveNowButton.SetDefault()

        # Basic interface button actions
        self.archiveNowButton.Bind(wx.EVT_BUTTON, self.archiveNow)
        self.checkArchiveStatus.Bind(wx.EVT_BUTTON, self.checkIfURLIsInArchive)
        self.viewArchive.Bind(wx.EVT_BUTTON, self.viewArchiveInBrowser)
        # hJob = HeritrixJob([self.uri.GetValue()])

    def testCallback(self):
        print "callback executed!"

    def archiveNow(self, button):
        self.archiveNowButton.SetLabel(buttonLabel_archiveNow_initializing)
        self.archiveNowButton.Disable()
        thread.start_new_thread(self.archiveNow2Async,())

    def archiveNow2Async(self):
        self.writeHeritrixLogWithURI()
        # First check to be sure Java SE is installed.
        if self.javaInstalled():
          if not Heritrix().accessible():
            self.launchHeritrix()
          mainAppWindow.advConfig.startTomcat(None)
          time.sleep(4)
          self.startHeritrixJob()
          mainAppWindow.advConfig.heritrixPanel.populateListboxWithJobs()
          
          #if sys.platform.startswith('darwin'): #show a notification of success in OS X
          #  Notifier.notify('Archival process successfully initiated.',title="WAIL")
        else:
          print "Java SE 6 needs to be installed. WAIL should invoke the installer here."
          
        wx.CallAfter(self.onLongRunDone)

    def onLongRunDone(self):
        print "DONE!"
        self.archiveNowButton.SetLabel(buttonLabel_archiveNow)
        self.archiveNowButton.Enable()

    def writeHeritrixLogWithURI(self):
        self.hJob = HeritrixJob([self.uri.GetValue()])
        self.hJob.write()

    def javaInstalled(self):
        # First check to be sure Java SE is installed. Move this logic elsewhere in production
        noJava = msg_noJavaRuntime
        p = Popen(["java","--version"], stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()
        return (noJava not in stdout) and (noJava not in stderr)

    def launchHeritrix(self):
        cmd = heritrixBinPath+" -a "+heritrixCredentials_username+":"+heritrixCredentials_password
        #TODO: shell=True was added for OS X, verify that functionality persists on Win64
        ret = subprocess.Popen(cmd, shell=True)
        time.sleep(3)
        mainAppWindow.advConfig.generalPanel.updateServiceStatuses()

    def startHeritrixJob(self):
        self.buildHeritrixJob()
        self.launchHeritrixJob()

    def launchHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print "Launching heririx job"
        data = {"action":"launch"}
        headers = {"Accept":"application/xml","Content-type":"application/x-www-form-urlencoded"}
        r =requests.post('https://localhost:8443/engine/job/' + self.hJob.jobNumber,
            auth=HTTPDigestAuth(heritrixCredentials_username,heritrixCredentials_password),
            data=data,headers=headers,verify=False,stream=True)

        print r
        print r.headers
        print r.text

    def buildHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print "Building heririx job"
        data = {"action":"build"}
        headers = {"Accept":"application/xml","Content-type":"application/x-www-form-urlencoded"}
        r =requests.post('https://localhost:8443/engine/job/'+self.hJob.jobNumber,auth=HTTPDigestAuth(heritrixCredentials_username,heritrixCredentials_password),data=data,headers=headers,verify=False,stream=True)

        print r
        print r.headers
        print r.text

        #curl -v -d "action=launch" -k -u lorem:ipsum --anyauth --location -H "Accept: application/xml" https://127.0.0.1:8443/engine/job/1425431848
        return

    def checkIfURLIsInArchive(self, button):
        url = "http://localhost:8080/wayback/*/" + self.uri.GetValue()
        req = urllib2.Request(url)
        statusCode = None
        try:
            resp = urllib2.urlopen(req)
            statusCode = resp.getcode()
        except urllib2.HTTPError, e:
            statusCode = e.code
        except: # When the server is unavailable, keep the default. This is necessary, as unavailability will still cause an exception
            ''''''
        #print statusCode
        print statusCode
        if statusCode is None:
            launchWaybackDialog = wx.MessageDialog(None, msg_waybackNotStarted_body, msg_waybackNotStarted_title, wx.YES_NO|wx.YES_DEFAULT)
            launchWayback = launchWaybackDialog.ShowModal()
            if launchWayback == wx.ID_YES:
                Wayback().fix(None)
                self.checkIfURLIsInArchive(button)
        elif 200 != statusCode:
            wx.MessageBox(msg_uriNotInArchives,"Checking for " + self.uri.GetValue())
        else:
            wx.MessageBox(msg_uriInArchives_body,msg_uriInArchives_title)

    def viewArchiveInBrowser(self, button):
        if Wayback().accessible():
            webbrowser.open_new_tab(uri_wayback_allMementos + self.uri.GetValue())
        else:
            d = wx.MessageDialog(self, "Launch now?",
              "Wayback is not running", wx.YES_NO|wx.YES_DEFAULT|wx.ICON_QUESTION)
            result = d.ShowModal()
            d.Destroy()
            if result == wx.ID_YES: # Launch Wayback
                Wayback().fix(None)
                # TODO: artificial delay here while we wait for Wayback to launch
                # TODO: change button to fixing
                self.archiveNowButton.SetLabel("Initializing Wayback...")
                #self.viewArchiveInBrowser(None)


class WAILGUIFrame_Advanced(wx.Panel):
    class GeneralPanel(wx.Panel, threading.Thread):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            colWidth = 60
            rowHeight = 20#18
            cellSize = (150, rowHeight)

            col0 = colWidth*0+10
            wx.StaticText(self, 100, tabLabel_advanced_general_serviceStatus, (col0-10,    rowHeight*0),      cellSize)
            wx.StaticText(self, 100, tabLabel_advanced_wayback,       (col0, rowHeight*1),      cellSize)
            wx.StaticText(self, 100, tabLabel_advanced_heritrix,        (col0, rowHeight*2),      cellSize)

            col1 = 65+colWidth*1

            thread.start_new_thread(self.updateServiceStatuses,())

            col2 = col1+colWidth
            cellSize_versionFix = (50,rowHeight)
            wx.StaticText(self, 100, "VERSION",                 (col2,     rowHeight*0),     cellSize_versionFix)
            wx.StaticText(self, 100, self.getWaybackVersion(),                     (col2,     rowHeight*1),     cellSize_versionFix)
            wx.StaticText(self, 100, self.getHeritrixVersion(True), (col2,     rowHeight*2),     cellSize_versionFix)

            col3 = col2+colWidth
            buttonSize = (50, rowHeight-6)
            buttonSize = (50, rowHeight) #redefining for Windows, needs regression testing on OS X
            smallFont = wx.Font(10, wx.SWISS, wx.NORMAL, wx.NORMAL)
            self.fix_wayback = wx.Button(self, 1, buttonLabel_fix,                (col3,     rowHeight*1),     buttonSize,wx.BU_EXACTFIT)
            self.fix_wayback.SetFont(smallFont)
            self.fix_heritrix = wx.Button(self, 1, buttonLabel_fix,                (col3,     rowHeight*2),     buttonSize,wx.BU_EXACTFIT)
            self.fix_heritrix.SetFont(smallFont)

            #self.stopAllServices = wx.Button(self, 1, "Stop All Services",                (col2,     rowHeight*4+10),     (150,rowHeight))

            self.fix_wayback.Bind(wx.EVT_BUTTON, Wayback().fix)
            self.fix_heritrix.Bind(wx.EVT_BUTTON, Heritrix().fix)

            col4 = col3+colWidth

            self.kill_wayback = wx.Button(self, 1, buttonLabel_kill,                (col4,     rowHeight*1),     buttonSize, wx.BU_EXACTFIT)
            self.kill_wayback.SetFont(smallFont)
            self.kill_heritrix = wx.Button(self, 1, buttonLabel_kill,                (col4,     rowHeight*2),     buttonSize, wx.BU_EXACTFIT)
            self.kill_heritrix.SetFont(smallFont)

            self.kill_wayback.Bind(wx.EVT_BUTTON, Wayback().kill)
            self.kill_heritrix.Bind(wx.EVT_BUTTON, Heritrix().kill)


            #wx.CallLater(2000, self.updateServiceStatuses)
            #pool.apply_async(self.updateServiceStatuses)
            thread.start_new_thread(self.updateServiceStatuses,())

        def getHeritrixVersion(self, abbr=True):
            for file in os.listdir(heritrixPath + "lib/"):
              if file.startswith("heritrix-commons"):
                regex = re.compile("commons-(.*)\.")
                return regex.findall(file)[0]

        def getWaybackVersion(self):
            for file in os.listdir(tomcatPath + "/webapps/lib/"):
              if file.startswith("openwayback-core"):
                regex = re.compile("core-(.*)\.")
                return regex.findall(file)[0]

        def getTomcatVersion(self):
        #Apache Tomcat Version 7.0.30
            if not os.path.exists(tomcatPath+"/RELEASE-NOTES"): return "?"
            f = open(tomcatPath+"/RELEASE-NOTES",'r')
            version = ""
            for line in f.readlines():
                if "Apache Tomcat Version " in line:
                    version = re.sub("[^0-9^\.]", "", line)
                    break
            f.close()
            return version

        def updateServiceStatuses(self, serviceId=None, transitionalStatus=None):
            ##################################
            # Check if each service is enabled and set the GUI elements accordingly
            ##################################

            colWidth = 60
            rowHeight = 20
            col1 = 65+colWidth*1
            cellSize = (40, rowHeight)
            serviceEnabled = {True: serviceEnabledLabel_YES, False: serviceEnabledLabel_NO}

            heritrixAccessible = serviceEnabled[Heritrix().accessible()]
            waybackAccessible = serviceEnabled[Wayback().accessible()]

            if waybackAccessible is serviceEnabledLabel_YES:
                tomcatAccessible = waybackAccessible
            else:
                tomcatAccessible = serviceEnabled[Tomcat().accessible()]

            # Update a transitional status and short circuit
            if serviceId and transitionalStatus:
              if serviceId is "wayback":
                self.status_wayback.SetLabel(transitionalStatus)
                return
              elif serviceId is "heritrix":
                self.status_heritrix.SetLabel(transitionalStatus)
                return
              else:
                print "Invalid transitional service id specified. Updating status per usual."
            


            if hasattr(self,'status_heritrix'):
                #print "foooo"
                self.status_heritrix.SetLabel(heritrixAccessible)
                self.status_wayback.SetLabel(tomcatAccessible)
            else:
                wx.StaticText(self, 100, "STATE",          (col1,    rowHeight*0),      cellSize)
                self.status_wayback = wx.StaticText(self, 100, tomcatAccessible,       (col1,    rowHeight*1),      cellSize)
                self.status_heritrix = wx.StaticText(self, 100, heritrixAccessible,                   (col1,    rowHeight*2),      cellSize)
                

                #For eventual icons instead of text
                #bmp = wx.Bitmap("./build/icons/famYes.png", wx.BITMAP_TYPE_ANY)
                #bmapBtn = wx.BitmapButton(self, id=wx.ID_ANY, bitmap=bmp,pos=(col1,    rowHeight*3),size=(bmp.GetWidth()+14, bmp.GetHeight()+14),style=wx.BU_EXACTFIT)
                #bmapBtn.SetMargins(0,0)
                #bmapBtn.SetBackgroundColour('RED')

            if not hasattr(self,'fix_heritrix'):
                print "First call, UI has not been setup"
                return #initial setup call will return here, ui elements haven't been created

             #enable/disable FIX buttons based on service status
            if heritrixAccessible is serviceEnabledLabel_YES:
                self.fix_heritrix.Disable()
                self.kill_heritrix.Enable()
            else:
                self.fix_heritrix.Enable()
                self.kill_heritrix.Disable()

            if tomcatAccessible is serviceEnabledLabel_YES:
                self.fix_wayback.Disable()
                self.kill_wayback.Enable()
            else:
                self.fix_wayback.Enable()
                self.kill_wayback.Disable()


             ##################################
    class WaybackPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            bsize = self.width, self.height = (340, 25*.75)
            #wx.Button(self, 1, "Show All Archived URIs",   (0,0),bsize)
            #wx.Button(self, 1, "Setup Options (e.g. port), modify wayback.xml, reboot tomcat",   (0,25),bsize)
            #wx.Button(self, 1, "Control Tomcat",   (0,50),bsize)
            self.viewWaybackInBrowserButton = wx.Button(self, 1, buttonLabel_wayback,   (0, 0), bsize)
            self.editWaybackConfiguration = wx.Button(self, 1, buttonLabel_editWaybackConfig,   (0, 25), bsize)
            #self.resetWaybackConfiguration = wx.Button(self, 1, buttonLabel_resetWaybackConfig,   (0, 50), bsize)

            self.viewWaybackInBrowserButton.Bind(wx.EVT_BUTTON, self.openWaybackInBrowser)
            self.editWaybackConfiguration.Bind(wx.EVT_BUTTON, self.openWaybackConfiguration)
            #self.resetWaybackConfiguration.Bind(wx.EVT_BUTTON, waybackConfigWriter.writeConfig)

        def openWaybackInBrowser(self, button):
            if Wayback().accessible():
                webbrowser.open_new_tab(uri_wayback)
                self.viewWaybackInBrowserButton.SetLabel(buttonLabel_wayback)
                self.viewWaybackInBrowserButton.Enable()
            else:
                d = wx.MessageDialog(self, "Launch now?",
                                      "Wayback is not running", wx.YES_NO|wx.YES_DEFAULT|wx.ICON_QUESTION)
                result = d.ShowModal()
                d.Destroy()
                if result == wx.ID_YES: # Launch Wayback
                    Wayback().fix(None, lambda: self.openWaybackInBrowser(None))
                    self.viewWaybackInBrowserButton.SetLabel(buttonLabel_wayback_launching)
                    self.viewWaybackInBrowserButton.Disable()
                    #time.sleep(3)
                    #self.openWaybackInBrowser(None)
        def openWaybackConfiguration(self,button):
            filepath = tomcatPath+"/webapps/ROOT/WEB-INF/wayback.xml"
            if sys.platform.startswith('darwin'):
             subprocess.call(('open', filepath))
            elif os.name == 'nt':
             os.startfile(filepath)
            elif os.name == 'posix':
             subprocess.call(('xdg-open', filepath))
    class HeritrixPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.listbox = wx.ListBox(self, 100)
            self.populateListboxWithJobs()

            self.statusMsg = wx.StaticText(self, -1, "", pos=(150, 0))

            self.listbox.Bind(wx.EVT_LISTBOX, self.clickedListboxItem)
            self.listbox.Bind(wx.EVT_RIGHT_UP, self.manageJobs)

            #Button layout
            bsize = self.width, self.height = (125, 25*.75)
            self.setupNewCrawlButton = wx.Button(self, 1, buttonLabel_heritrix_newCrawl,   (0, 70), bsize)
            self.launchWebUIButton = wx.Button(self, 1, buttonLabel_heritrix_launchWebUI,   (0, 92), bsize)

            #Button functionality
            self.setupNewCrawlButton.Bind(wx.EVT_BUTTON, self.setupNewCrawl)
            self.launchWebUIButton.Bind(wx.EVT_BUTTON, self.launchWebUI)

        def populateListboxWithJobs(self):
            list = Heritrix().getListOfJobs()
            list.reverse() # set to reverse chronological so newest jobs are at the top
            self.listbox.Set(list)

        def clickedListboxItem(self, event):
            self.hideNewCrawlUIElements()
            self.statusMsg.Show()

            active = self.listbox.GetString(self.listbox.GetSelection())
            print tail(heritrixJobPath + active + "/job.log")
            jobLaunches = Heritrix().getJobLaunches(active)
            self.statusMsg.SetLabel(
                str(tail(heritrixJobPath+active+"/job.log"))
                 + "\n" + str(len(jobLaunches)) + " job launches\n"
                 +  Heritrix().getCurrentStats(active)
                 )

        def launchWebUI(self, button):
            self.launchWebUIButton.SetLabel(buttonLabel_heritrix_launchWebUI_launching)
            self.launchWebUIButton.Disable()
            thread.start_new_thread(self.launchWebUIAsync,())

        def launchWebUIAsync(self):
            if not Heritrix().accessible():
                mainAppWindow.basicConfig.launchHeritrix()
            webbrowser.open_new_tab(uri_heritrix)
            self.launchWebUIButton.SetLabel(buttonLabel_heritrix_launchWebUI)
            self.launchWebUIButton.Enable()

        def launchHeritrixProcess(self, button):
            Heritrix().kill(None)
            time.sleep(3)
            mainAppWindow.basicConfig.launchHeritrix()

        def manageJobs(self, evt):
            if self.listbox.GetCount() == 0: # Do not show context menu without context
                return
        
            menu = wx.Menu()
            #menu.Append( 1, "Restart Job" ) #TODO
            #menu.Bind(wx.EVT_MENU, self.restartJob, id=1)
            menu.Append( 1, menu_forceCrawlFinish ) 
            menu.Bind(wx.EVT_MENU, self.forceCrawlFinish, id=1)
            menu.Append( 2, menu_destroyJob )
            menu.Bind(wx.EVT_MENU, self.deleteHeritrixJob, id=2)
            #menu.Append( 3, "Open crawl configuration" )
            #menu.Bind(wx.EVT_MENU, self.openConfigInTextEditor, id=3)
            mainAppWindow.PopupMenu( menu, mainAppWindow.ScreenToClient(wx.GetMousePosition()) )
            menu.Destroy()

        def forceCrawlFinish(self, evt):
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.sendActionToHeritrix("terminate", jobId)
            self.sendActionToHeritrix("teardown", jobId)

        def sendActionToHeritrix(self, action, jobId):
            data = {"action": action}
            headers = {"Accept":"application/xml","Content-type":"application/x-www-form-urlencoded"}
            r =requests.post('https://localhost:8443/engine/job/' + jobId, auth = HTTPDigestAuth(heritrixCredentials_username, heritrixCredentials_password), data=data, headers=headers, verify=False, stream=True)

        def deleteHeritrixJob(self, evt):
            jobPath = heritrixJobPath + str(self.listbox.GetString(self.listbox.GetSelection()))
            print "Deleting Job at "+jobPath
            shutil.rmtree(jobPath)
            self.populateListboxWithJobs()

        def openConfigInTextEditor(self, evt):
            #TODO, most systems don't know how to open a cxml file. Is there a way to create a system mapping from python?        
            # Issue #22 prevents the context of the right-click item from being obtained and used here.
            file = heritrixJobPath + str(self.listbox.GetString(self.listbox.GetSelection())) + "/crawler-beans.cxml"
            if sys.platform.startswith('darwin'):
                subprocess.call(('open', file))
            elif os.name == 'nt':
                os.startfile(file)
            elif os.name == 'posix':
                subprocess.call(('xdg-open', file))

        def restartJob(self, evt):
            print "Restarting job"

        def setupNewCrawl(self, evt):
            # TODO: check if the UI elements already exist before adding them
            if hasattr(self, 'newCrawlTextCtrlLabel'):
                print "The UI has already been setup."
                return
            
            self.statusMsg.Hide()

            self.newCrawlTextCtrlLabel = wx.StaticText(self, -1, "Enter one URI per line to crawl", pos=(135, 0))
            multiLineAndNoWrapStyle = wx.TE_MULTILINE + wx.TE_DONTWRAP
            self.newCrawlTextCtrl = wx.TextCtrl(self, -1, pos=(135, 20), size=(225, 90), style=multiLineAndNoWrapStyle)
            #self.crawlOptionsButton = wx.Button(self, -1, "More options",  pos=(150,125))
            self.startCrawlButton = wx.Button(self, -1, "Start Crawl",  pos=(265, 110))
            self.startCrawlButton.SetDefault()
            self.startCrawlButton.Bind(wx.EVT_BUTTON, self.crawlURIsListed)

            self.showNewCrawlUIElements()

        def hideNewCrawlUIElements(self):
            if not hasattr(self,'newCrawlTextCtrlLabel'): return
            self.newCrawlTextCtrlLabel.Hide()
            self.newCrawlTextCtrl.Hide()
            #self.crawlOptionsButton.Hide()
            self.startCrawlButton.Hide()

        def showNewCrawlUIElements(self):
            self.newCrawlTextCtrlLabel.Show()
            self.newCrawlTextCtrl.Show()
            #self.crawlOptionsButton.Show()
            self.startCrawlButton.Show()

        def crawlURIsListed(self, evt):
            uris = self.newCrawlTextCtrl.GetValue().split("\n")
            self.hJob = HeritrixJob(uris)
            self.hJob.write()
            self.populateListboxWithJobs()

            if not Heritrix().accessible():
                mainAppWindow.basicConfig.launchHeritrix()

            self.hJob.buildHeritrixJob()
            self.hJob.launchHeritrixJob()


    class MiscellaneousPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            bsize = self.width, self.height = (340, 25*.75)
            viewArchivesFolderButtonButton = wx.Button(self, 1, buttonLabel_viewArchiveFiles,   (0, 0), bsize)
            #wx.Button(self, 1, "Control Other Tools",   (0,50), bsize)

            viewArchivesFolderButtonButton.Bind(wx.EVT_BUTTON, self.openArchivesFolder)
            self.testUpdate = wx.Button(self, 1, "Check for Updates",   (0, 25), bsize)
            self.testUpdate.Bind(wx.EVT_BUTTON, self.checkForUpdates)
            self.testUpdate.Disable()

        def openArchivesFolder(self, button):
            if not os.path.exists(warcsFolder): os.makedirs(warcsFolder)

            if sys.platform.startswith('win32'):
                 os.startfile(warcsFolder)
            else:
              subprocess.call(["open", warcsFolder])
              #subprocess.check_call(['open', '--', tomcatPath+"/webapps/root/"])
              #subprocess.Popen(["open", tomcatPath+"/webapps/root/"])

        def checkForUpdates(self, button):
            # check if an updates version is available

            # if an updated version is available and the user wants it, copy the /Application/WAIL.app/Contents folder

            d = wx.MessageDialog(self, "Do you want to update WAIL? All of your WARCs will remain in-place.",
                                      "There is an update available for the main WAIL application", wx.YES_NO|wx.YES_DEFAULT|wx.ICON_QUESTION)
            result = d.ShowModal()
            d.Destroy()
            if result == wx.ID_YES: # Launch Wayback
                print "The user wants to update!"

                #TODO: show progress bar or separate window for updater
                wailcorefile = urllib2.urlopen("http://matkelly.com/wail/release/WAILCore1_1.tar.gz")
                output = open('/Applications/WAIL.app/support/WAILCore1_1.tar.gz','wb')
                output.write(wailcorefile.read())
                output.close()

                print "Done fetching WAIL core"

                #TODO untar to temp dir

                #TODO move new temp directory to Contents/

                # TODO: check if this directory already exists
                copyanything("/Applications/WAIL.app/Contents/","/Applications/WAIL.app/Contents_bkp/")
                shutil.rmtree("/Applications/WAIL.app/Contents/")

                tar = tarfile.open("/Applications/WAIL.app/support/WAILCore1_1.tar.gz")
                tar.extractall('/Applications/WAIL.app/')
                tar.close()

                print "done extracting the tar file of wailcore"

    def __init__(self, parent):
        wx.Panel.__init__(self, parent)

        self.Notebook = wx.Notebook(self)
        vbox = wx.BoxSizer(wx.VERTICAL)
        vbox.Add(self.Notebook, 10, flag=wx.EXPAND)

        self.SetSizer(vbox)

        self.generalPanel = WAILGUIFrame_Advanced.GeneralPanel(self.Notebook)
        self.waybackPanel = WAILGUIFrame_Advanced.WaybackPanel(self.Notebook)
        self.heritrixPanel = WAILGUIFrame_Advanced.HeritrixPanel(self.Notebook)
        self.miscellaneousPanel = WAILGUIFrame_Advanced.MiscellaneousPanel(self.Notebook)
        # Add advanced config page/tab
    	#self.advConfig = WAILGUIFrame_Advanced(self.Notebook) #PDA2013 advanced tab

        self.Notebook.AddPage(self.generalPanel, tabLabel_advanced_general)
        self.Notebook.AddPage(self.waybackPanel, tabLabel_advanced_wayback)
        self.Notebook.AddPage(self.heritrixPanel, tabLabel_advanced_heritrix)
        self.Notebook.AddPage(self.miscellaneousPanel, tabLabel_advanced_miscellaneous)

        self.x, self.y = (15, 5)
        bsize = self.width, self.height = (150, 25*.80)

        smallFont = wx.Font(fontSize, wx.SWISS, wx.NORMAL, wx.NORMAL)

##################################
# "View Archive" Group
##################################
    def tomcatMessageOff(self):
        #self.tomcatStatus.SetLabel(msg_waybackDisabled)
        self.tomcatStatus.SetForegroundColour((255, 0, 0))
        self.startTomcatButton.SetLabel(self.startTomcatLabel)

    def tomcatMessageOn(self):
        #self.tomcatStatus.SetLabel(msg_waybackEnabled)
        self.tomcatStatus.SetForegroundColour((0, 200, 0))
        self.startTomcatButton.SetLabel(self.stopTomcatLabel)

    def startTomcat(self, button):
        #self.tomcatStatus.SetLabel(msg_startingTomcat)
        cmd = tomcatPathStart
        ret = subprocess.Popen(cmd)
        waitingForTomcat = True
        while waitingForTomcat:
            if Wayback().accessible(): waitingForTomcat = False
            time.sleep(2)

        self.waybackPanel.viewWaybackInBrowserButton.Enable() #TODO: error here
        #self.tomcatMessageOn()
    # toggleTomcat needs to be broken up into start and stop Tomcat function, already done above

    def toggleTomcat(self, button, suppressAlert=False): #Optimize me, Seymour
        cmd = ""

        if self.startTomcatButton.GetLabel() == self.startTomcatLabel :
            self.tomcatStatus.SetLabel(msg_startingTomcat)
            cmd = tomcatPathStart
            ret = subprocess.Popen(cmd)
            waitingForTomcat = True
            while waitingForTomcat:
                if Wayback.accessible(): waitingForTomcat = False
                time.sleep(2)
            self.viewWaybackInBrowserButton.Enable()
            #self.tomcatMessageOn()
        else:
            self.tomcatStatus.SetLabel(msg_stoppingTomcat)
            cmd = tomcatPathStop
            ret = subprocess.Popen(cmd)
            waitingForTomcat = True

            tomcatChecks = 0
            tomcatStopped = False
            while waitingForTomcat and tomcatChecks < 6:
                if Wayback.accessible():
                    tomcatChecks += 1
                else:
                    waitingForTomcat = False
                    tomcatStopped = True
                time.sleep(2)
            if tomcatStopped:
                self.viewWaybackInBrowserButton.Disable()
                self.tomcatMessageOff()
            else:
                if not suppressAlert: message = wx.MessageBox("Tomcat could not be stopped", "Command Failed")
                #self.tomcatMessageOn()

    def launchHeritrix(self, button):
        #self.heritrixStatus.SetLabel("Launching Heritrix")
        cmd = heritrixBinPath+" -a "+heritrixCredentials_username+":"+heritrixCredentials_password
        #TODO: shell=True was added for OS X, verify that functionality persists on Win64
        ret = subprocess.Popen(cmd, shell=True)
        time.sleep(6)             #urlib won't respond to https, hard-coded sleep until I can ping like Tomcat
        self.viewHeritrixButton.Enable()

    def viewWayback(self, button):
        webbrowser.open_new_tab(uri_wayback)

    def viewHeritrix(self, button):
        webbrowser.open_new_tab(uri_heritrix)

    def createListBox(self):

        self.uriListBoxTitle = wx.StaticText(self, 7, 'URIs to Crawl:',  (self.x, 5+self.height*7+30))
        self.uriListBox = wx.ListBox(self, 99, (self.x, 5+self.height*8+25), (400-50, 100), [""])
        #self.uriListBox.Bind(wx.EVT_LISTBOX_DCLICK,self.addURI)
        self.uriListBox.Bind(wx.EVT_LISTBOX, self.addURI)
        self.SetSize((self.GetSize().x, self.GetSize().y+300))
        #self.archiveViewGroup.SetSize((self.archiveViewGroup.GetSize().x,100))
        self.archiveViewGroup.SetSize((self.archiveViewGroup.GetSize().x, 235))
        mainAppWindow.SetSize((mainAppWindow.GetSize().x, 400))

    def setupOneOffCrawl(self, button):
        if(self.uriListBox <> None): return #this function has already been done
        self.createListBox()

        #This should say, "Commence Crawl" but it currently only writes the config file
        self.writeConfig = wx.Button(self, 33, "Write Heritrix Config",   (self.GetSize().x-175, 280), (self.width, self.height))
        self.writeConfig.SetFont(wx.Font(fontSize, wx.SWISS, wx.NORMAL, wx.NORMAL))
        self.writeConfig.Bind(wx.EVT_BUTTON, self.crawlURIs)
        self.writeConfig.Disable()
        self.launchCrawlButton = wx.Button(self, 33, "Launch Crawl",   (self.GetSize().x-175, 305), (self.width, self.height))
        self.launchCrawlButton.SetFont(wx.Font(fontSize, wx.SWISS, wx.NORMAL, wx.NORMAL))
        self.launchCrawlButton.Bind(wx.EVT_BUTTON, self.launchCrawl)
        self.launchCrawlButton.Disable()

    def crawlURIs(self, button):
        uris = self.uriListBox.GetStrings()
        self.hJob = HeritrixJob(uris)
        self.hJob.write()
        self.writeConfig.Disable()
        self.uriListBox.Set([""])
        self.launchCrawlButton.Enable()

    def launchCrawl(self, button):
        mainAppWindow.basicConfig.hJob = self.hJob
        mainAppWindow.basicConfig.launchHeritrix()
        mainAppWindow.basicConfig.startHeritrixJob()

    def addURI(self, listbox):
        defaultMessage = ""
        try:
            defaultMessage = self.uriListBox.GetString(self.uriListBox.GetSelection())
        except:
            defaultMessage = ""
        message = wx.GetTextFromUser("Enter a URI to be crawled", default_value=defaultMessage)
        if message == "" and message == defaultMessage: return
        url = urlparse(message)
        self.uriListBox.InsertItems([url.geturl()], 0)
        self.writeConfig.Enable()


class Service():
    def accessible(self):
        try:
            print "Trying to access " + self.__class__.__name__ + " service at " + self.uri
            handle = urllib2.urlopen(self.uri, None, 3)
            print self.__class__.__name__ + " is a go! "
            return True
        except IOError, e:
            if hasattr(e, 'code'): # HTTPError
                print "Pseudo-Success in accessing " + self.uri
                return True
           # if hasattr(e, 

            print "Failed to access " + self.__class__.__name__+" service at " + self.uri
            return False


class Wayback(Service):
    uri = uri_wayback

    def fix(self, button, *cb):
        thread.start_new_thread(self.fixAsync, cb)

    def fixAsync(self, cb=None):
        mainAppWindow.advConfig.generalPanel.updateServiceStatuses("wayback","FIXING")
        cmd = tomcatPathStart;
        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.generalPanel.updateServiceStatuses)
        if cb:
          wx.CallAfter(cb)
# mainAppWindow.advConfig.generalPanel.updateServiceStatuses()

    def kill(self,button):
        thread.start_new_thread(self.killAsync,())

    def killAsync(self):
        mainAppWindow.advConfig.generalPanel.updateServiceStatuses("wayback","KILLING")
        cmd = tomcatPathStop
        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.generalPanel.updateServiceStatuses)
        #mainAppWindow.advConfig.generalPanel.updateServiceStatuses()

    def index(self):
        paths = [fn+"\t"+os.path.join(warcsFolder,fn) for fn in next(os.walk(warcsFolder))[2]] #could probably put some .warc restrcitions here

        f = open(warcsFolder+"/../path-index.txt", 'w+')
        f.write("\n".join(paths))

        #TODO: check if the file was updated. If so, invoke cdx-indexer
        threading.Timer(5.0, Wayback().index).start()


class Tomcat(Service):
    uri = uri_wayback


class Heritrix(Service):
    #uri = uri_heritrix_accessiblityURI
    uri = "https://127.0.0.1:8443" #TODO: remove magic hard-coded Heritrix address/port

    def getListOfJobs(self):
        def justFile(fullPath):
            return os.path.basename(fullPath)
        #str = '\n'.join(map(justFile,glob.glob(os.path.join(heritrixJobPath, '*'))))
        return map(justFile, glob.glob(os.path.join(heritrixJobPath, '*')))
    ''' # getListOfJobs - rewrite to use the Heritrix API, will need to parse XML
        -H "Accept: application/xml"
        # replicate curl -v -d "action=rescan" -k -u lorem:ipsum --anyauth --location -H "Accept: application/xml" https://localhost:8443/engine
    '''

    def getJobLaunches(self, jobId):
        jobPath = heritrixJobPath+jobId
        return [f for f in os.listdir(heritrixJobPath+jobId) if re.search(r'^[0-9]+$', f)]

    def getCurrentStats(self, jobId):
        launches = self.getJobLaunches(jobId)
        ret = ""
        for launch in launches:
            #print heritrixJobPath+jobId+"/"+launch+"/logs/progress-statistics.log"
            print heritrixJobPath+jobId+"/"+launch+"/logs/progress-statistics.log"
            lastLine = tail(heritrixJobPath+jobId+"/"+launch+"/logs/progress-statistics.log")

            ll = lastLine[0].replace(" ","|")
            logData = re.sub(r'[|]+', '|', ll).split("|")
            timeStamp, discovered, queued, downloaded = logData[0:4]
            ret = ret + "JobID: "+jobId+"\n   Discovered: "+discovered+"\n   Queued: "+queued+"\n   Downloaded: "+downloaded+"\n"

        return ret

    def fix(self, button, *cb):
        thread.start_new_thread(self.fixAsync, cb)

    def fixAsync(self, cb):
        mainAppWindow.advConfig.generalPanel.updateServiceStatuses("heritrix","FIXING")
        mainAppWindow.basicConfig.launchHeritrix()
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.generalPanel.updateServiceStatuses)
        if cb:
          wx.CallAfter(cb)
        
    def kill(self,button):
        thread.start_new_thread(self.killAsync,())

    def killAsync(self):
        mainAppWindow.advConfig.generalPanel.updateServiceStatuses("heritrix", "KILLING")
        #Ideally, the Heritrix API would have support for this. This will have to do. Won't work in Wintel
        cmd = """ps ax | grep 'heritrix' | grep -v grep | awk '{print "kill -9 " $1}' | sh"""
        print "Trying to kill Heritrix..."
        ret = subprocess.Popen(cmd,stderr=subprocess.STDOUT,shell=True)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.generalPanel.updateServiceStatuses)


class HeritrixJob:
    def write(self):
        self.jobNumber = str(int(time.time()))
        path = heritrixJobPath+self.jobNumber
        if not os.path.exists(path): os.makedirs(path)
        beansFilePath = path
        if sys.platform.startswith('win32'):
            beansFilePath += "\\"
        else:
            beansFilePath += "/"
        with open(beansFilePath+"crawler-beans.cxml","w") as f:
            f.write(self.sampleXML)
            #print beansFilePath+"crawler-beans.cxml"

    def launchHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print "Launching heririx job"
        data = {"action":"launch"}
        headers = {"Accept":"application/xml","Content-type":"application/x-www-form-urlencoded"}
        r =requests.post('https://localhost:8443/engine/job/'+self.jobNumber,auth=HTTPDigestAuth(heritrixCredentials_username, heritrixCredentials_password),data=data,headers=headers,verify=False,stream=True)

    def buildHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print "Building heririx job"
        data = {"action":"build"}
        headers = {"Accept":"application/xml","Content-type":"application/x-www-form-urlencoded"}
        r =requests.post('https://localhost:8443/engine/job/'+self.jobNumber,auth=HTTPDigestAuth(heritrixCredentials_username, heritrixCredentials_password),data=data,headers=headers,verify=False,stream=True)

    def __init__(self, uris):
        self.sampleXML = '''<?xml version="1.0" encoding="UTF-8"?>
<!--
  HERITRIX 3 CRAWL JOB CONFIGURATION FILE

   This is a relatively minimal configuration suitable for many crawls.

   Commented-out beans and properties are provided as an example; values
   shown in comments reflect the actual defaults which are in effect
   if not otherwise specified specification. (To change from the default
   behavior, uncomment AND alter the shown values.)
 -->
<beans xmlns="http://www.springframework.org/schema/beans"
	     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns:context="http://www.springframework.org/schema/context"
	     xmlns:aop="http://www.springframework.org/schema/aop"
	     xmlns:tx="http://www.springframework.org/schema/tx"
	     xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-3.0.xsd
           http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop-3.0.xsd
           http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx-3.0.xsd
           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-3.0.xsd">

 <context:annotation-config/>

<!--
  OVERRIDES
   Values elsewhere in the configuration may be replaced ('overridden')
   by a Properties map declared in a PropertiesOverrideConfigurer,
   using a dotted-bean-path to address individual bean properties.
   This allows us to collect a few of the most-often changed values
   in an easy-to-edit format here at the beginning of the model
   configuration.
 -->
 <!-- overrides from a text property list -->
 <bean id="simpleOverrides" class="org.springframework.beans.factory.config.PropertyOverrideConfigurer">
  <property name="properties">
   <value>
# This Properties map is specified in the Java 'property list' text format
# http://java.sun.com/javase/6/docs/api/java/util/Properties.html#load%28java.io.Reader%29

metadata.operatorContactUrl=http://yourdomain.com
metadata.jobName=basic
metadata.description=Basic crawl starting with useful defaults

##..more?..##
   </value>
  </property>
 </bean>

 <!-- overrides from declared <prop> elements, more easily allowing
      multiline values or even declared beans -->
 <bean id="longerOverrides" class="org.springframework.beans.factory.config.PropertyOverrideConfigurer">
  <property name="properties">
   <props>
    <prop key="seeds.textSource.value">

# URLS HERE
''' +  "\r\n".join(uris) + '''
    </prop>
   </props>
  </property>
 </bean>

 <!-- CRAWL METADATA: including identification of crawler/operator -->
 <bean id="metadata" class="org.archive.modules.CrawlMetadata" autowire="byName">
       <property name="operatorContactUrl" value="YOURCONTACTINFOHERE"/>
       <property name="jobName" value="MyWAILBasedHeritrixCrawl"/>
       <property name="description" value="SampleCrawl"/>
  <property name="robotsPolicyName" value="ignore"/>
  <!-- <property name="operator" value=""/> -->
  <!-- <property name="operatorFrom" value=""/> -->
  <!-- <property name="organization" value=""/> -->
  <!-- <property name="audience" value=""/> -->
   <property name="userAgentTemplate"
         value="Mozilla/5.0 (compatible; heritrix/@VERSION@ +@OPERATOR_CONTACT_URL@)"/>

 </bean>

 <!-- SEEDS: crawl starting points
      ConfigString allows simple, inline specification of a moderate
      number of seeds; see below comment for example of using an
      arbitrarily-large external file. -->
 <bean id="seeds" class="org.archive.modules.seeds.TextSeedModule">
     <property name="textSource">
      <bean class="org.archive.spring.ConfigString">
       <property name="value">
        <value>
# [see override above]
        </value>
       </property>
      </bean>
     </property>
<!-- <property name='sourceTagSeeds' value='false'/> -->
<!-- <property name='blockAwaitingSeedLines' value='-1'/> -->
 </bean>

 <!-- SEEDS ALTERNATE APPROACH: specifying external seeds.txt file in
      the job directory, similar to the H1 approach.
      Use either the above, or this, but not both. -->
 <!--
 <bean id="seeds" class="org.archive.modules.seeds.TextSeedModule">
  <property name="textSource">
   <bean class="org.archive.spring.ConfigFile">
    <property name="path" value="seeds.txt" />
   </bean>
  </property>
  <property name='sourceTagSeeds' value='false'/>
  <property name='blockAwaitingSeedLines' value='-1'/>
 </bean>
  -->

 <!-- SCOPE: rules for which discovered URIs to crawl; order is very
      important because last decision returned other than 'NONE' wins. -->
 <bean id="scope" class="org.archive.modules.deciderules.DecideRuleSequence">
  <!-- <property name="logToFile" value="false" /> -->
  <property name="rules">
   <list>
    <!-- Begin by REJECTing all... -->
    <bean class="org.archive.modules.deciderules.RejectDecideRule">
    </bean>
    <!-- ...then ACCEPT those within configured/seed-implied SURT prefixes... -->
    <bean class="org.archive.modules.deciderules.surt.SurtPrefixedDecideRule">
     <!-- <property name="seedsAsSurtPrefixes" value="true" /> -->
     <!-- <property name="alsoCheckVia" value="false" /> -->
     <!-- <property name="surtsSourceFile" value="" /> -->
     <!-- <property name="surtsDumpFile" value="${launchId}/surts.dump" /> -->
     <!-- <property name="surtsSource">
           <bean class="org.archive.spring.ConfigString">
            <property name="value">
             <value>
              # example.com
              # http://www.example.edu/path1/
              # +http://(org,example,
             </value>
            </property>
           </bean>
          </property> -->
    </bean>
    <!-- ...but REJECT those more than a configured link-hop-count from start... -->
    <bean class="org.archive.modules.deciderules.TooManyHopsDecideRule">
       <property name="maxHops" value="1" />
    </bean>
    <!-- ...but ACCEPT those more than a configured link-hop-count from start... -->
    <bean class="org.archive.modules.deciderules.TransclusionDecideRule">
     <!-- <property name="maxTransHops" value="2" /> -->
     <!-- <property name="maxSpeculativeHops" value="1" /> -->
    </bean>
    <!-- ...but REJECT those from a configurable (initially empty) set of REJECT SURTs... -->
    <bean class="org.archive.modules.deciderules.surt.SurtPrefixedDecideRule">
          <property name="decision" value="REJECT"/>
          <property name="seedsAsSurtPrefixes" value="false"/>
          <property name="surtsDumpFile" value="${launchId}/negative-surts.dump" />
     <!-- <property name="surtsSource">
           <bean class="org.archive.spring.ConfigFile">
            <property name="path" value="negative-surts.txt" />
           </bean>
          </property> -->
    </bean>
    <!-- ...and REJECT those from a configurable (initially empty) set of URI regexes... -->
    <bean class="org.archive.modules.deciderules.MatchesListRegexDecideRule">
          <property name="decision" value="REJECT"/>
     <!-- <property name="listLogicalOr" value="true" /> -->
     <!-- <property name="regexList">
           <list>
           </list>
          </property> -->
    </bean>
    <!-- ...and REJECT those with suspicious repeating path-segments... -->
    <bean class="org.archive.modules.deciderules.PathologicalPathDecideRule">
     <!-- <property name="maxRepetitions" value="2" /> -->
    </bean>
    <!-- ...and REJECT those with more than threshold number of path-segments... -->
    <bean class="org.archive.modules.deciderules.TooManyPathSegmentsDecideRule">
     <!-- <property name="maxPathDepth" value="20" /> -->
    </bean>
    <!-- ...but always ACCEPT those marked as prerequisitee for another URI... -->
    <bean class="org.archive.modules.deciderules.PrerequisiteAcceptDecideRule">
    </bean>
    <!-- ...but always REJECT those with unsupported URI schemes -->
    <bean class="org.archive.modules.deciderules.SchemeNotInSetDecideRule">
    </bean>
   </list>
  </property>
 </bean>

 <!--
   PROCESSING CHAINS
    Much of the crawler's work is specified by the sequential
    application of swappable Processor modules. These Processors
    are collected into three 'chains'. The CandidateChain is applied
    to URIs being considered for inclusion, before a URI is enqueued
    for collection. The FetchChain is applied to URIs when their
    turn for collection comes up. The DispositionChain is applied
    after a URI is fetched and analyzed/link-extracted.
  -->

 <!-- CANDIDATE CHAIN -->
 <!-- first, processors are declared as top-level named beans -->
 <bean id="candidateScoper" class="org.archive.crawler.prefetch.CandidateScoper">
 </bean>
 <bean id="preparer" class="org.archive.crawler.prefetch.FrontierPreparer">
  <!-- <property name="preferenceDepthHops" value="-1" /> -->
  <!-- <property name="preferenceEmbedHops" value="1" /> -->
  <!-- <property name="canonicalizationPolicy">
        <ref bean="canonicalizationPolicy" />
       </property> -->
  <!-- <property name="queueAssignmentPolicy">
        <ref bean="queueAssignmentPolicy" />
       </property> -->
  <!-- <property name="uriPrecedencePolicy">
        <ref bean="uriPrecedencePolicy" />
       </property> -->
  <!-- <property name="costAssignmentPolicy">
        <ref bean="costAssignmentPolicy" />
       </property> -->
 </bean>
 <!-- now, processors are assembled into ordered CandidateChain bean -->
 <bean id="candidateProcessors" class="org.archive.modules.CandidateChain">
  <property name="processors">
   <list>
    <!-- apply scoping rules to each individual candidate URI... -->
    <ref bean="candidateScoper"/>
    <!-- ...then prepare those ACCEPTed to be enqueued to frontier. -->
    <ref bean="preparer"/>
   </list>
  </property>
 </bean>

 <!-- FETCH CHAIN -->
 <!-- first, processors are declared as top-level named beans -->
 <bean id="preselector" class="org.archive.crawler.prefetch.Preselector">
  <!-- <property name="recheckScope" value="false" /> -->
  <!-- <property name="blockAll" value="false" /> -->
  <!-- <property name="blockByRegex" value="" /> -->
  <!-- <property name="allowByRegex" value="" /> -->
 </bean>
 <bean id="preconditions" class="org.archive.crawler.prefetch.PreconditionEnforcer">
  <!-- <property name="ipValidityDurationSeconds" value="21600" /> -->
  <!-- <property name="robotsValidityDurationSeconds" value="86400" /> -->
  <!-- <property name="calculateRobotsOnly" value="false" /> -->
 </bean>
 <bean id="fetchDns" class="org.archive.modules.fetcher.FetchDNS">
  <!-- <property name="acceptNonDnsResolves" value="false" /> -->
  <!-- <property name="digestContent" value="true" /> -->
  <!-- <property name="digestAlgorithm" value="sha1" /> -->
 </bean>
 <!-- <bean id="fetchWhois" class="org.archive.modules.fetcher.FetchWhois">
       <property name="specialQueryTemplates">
        <map>
         <entry key="whois.verisign-grs.com" value="domain %s" />
         <entry key="whois.arin.net" value="z + %s" />
         <entry key="whois.denic.de" value="-T dn %s" />
        </map>
       </property>
      </bean> -->
 <bean id="fetchHttp" class="org.archive.modules.fetcher.FetchHTTP">
  <!-- <property name="useHTTP11" value="false" /> -->
  <!-- <property name="maxLengthBytes" value="0" /> -->
  <!-- <property name="timeoutSeconds" value="1200" /> -->
  <!-- <property name="maxFetchKBSec" value="0" /> -->
  <!-- <property name="defaultEncoding" value="ISO-8859-1" /> -->
  <!-- <property name="shouldFetchBodyRule">
        <bean class="org.archive.modules.deciderules.AcceptDecideRule"/>
       </property> -->
  <!-- <property name="soTimeoutMs" value="20000" /> -->
  <!-- <property name="sendIfModifiedSince" value="true" /> -->
  <!-- <property name="sendIfNoneMatch" value="true" /> -->
  <!-- <property name="sendConnectionClose" value="true" /> -->
  <!-- <property name="sendReferer" value="true" /> -->
  <!-- <property name="sendRange" value="false" /> -->
  <!-- <property name="ignoreCookies" value="false" /> -->
  <!-- <property name="sslTrustLevel" value="OPEN" /> -->
  <!-- <property name="acceptHeaders">
        <list>
         <value>Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8</value>
        </list>
       </property>
  -->
  <!-- <property name="httpBindAddress" value="" /> -->
  <!-- <property name="httpProxyHost" value="" /> -->
  <!-- <property name="httpProxyPort" value="0" /> -->
  <!-- <property name="httpProxyUser" value="" /> -->
  <!-- <property name="httpProxyPassword" value="" /> -->
  <!-- <property name="digestContent" value="true" /> -->
  <!-- <property name="digestAlgorithm" value="sha1" /> -->
 </bean>
 <bean id="extractorHttp" class="org.archive.modules.extractor.ExtractorHTTP">
 </bean>
 <bean id="extractorHtml" class="org.archive.modules.extractor.ExtractorHTML">
  <!-- <property name="extractJavascript" value="true" /> -->
  <!-- <property name="extractValueAttributes" value="true" /> -->
  <!-- <property name="ignoreFormActionUrls" value="false" /> -->
  <!-- <property name="extractOnlyFormGets" value="true" /> -->
  <!-- <property name="treatFramesAsEmbedLinks" value="true" /> -->
  <!-- <property name="ignoreUnexpectedHtml" value="true" /> -->
  <!-- <property name="maxElementLength" value="1024" /> -->
  <!-- <property name="maxAttributeNameLength" value="1024" /> -->
  <!-- <property name="maxAttributeValueLength" value="16384" /> -->
 </bean>
 <bean id="extractorCss" class="org.archive.modules.extractor.ExtractorCSS">
 </bean>
 <bean id="extractorJs" class="org.archive.modules.extractor.ExtractorJS">
 </bean>
 <bean id="extractorSwf" class="org.archive.modules.extractor.ExtractorSWF">
 </bean>
 <!-- now, processors are assembled into ordered FetchChain bean -->
 <bean id="fetchProcessors" class="org.archive.modules.FetchChain">
  <property name="processors">
   <list>
    <!-- re-check scope, if so enabled... -->
    <ref bean="preselector"/>
    <!-- ...then verify or trigger prerequisite URIs fetched, allow crawling... -->
    <ref bean="preconditions"/>
    <!-- ...fetch if DNS URI... -->
    <ref bean="fetchDns"/>
    <!-- <ref bean="fetchWhois"/> -->
    <!-- ...fetch if HTTP URI... -->
    <ref bean="fetchHttp"/>
    <!-- ...extract outlinks from HTTP headers... -->
    <ref bean="extractorHttp"/>
    <!-- ...extract outlinks from HTML content... -->
    <ref bean="extractorHtml"/>
    <!-- ...extract outlinks from CSS content... -->
    <ref bean="extractorCss"/>
    <!-- ...extract outlinks from Javascript content... -->
    <ref bean="extractorJs"/>
    <!-- ...extract outlinks from Flash content... -->
    <ref bean="extractorSwf"/>
   </list>
  </property>
 </bean>

 <!-- DISPOSITION CHAIN -->
 <!-- first, processors are declared as top-level named beans  -->
 <bean id="warcWriter" class="org.archive.modules.writer.WARCWriterProcessor">
  <property name="compress" value="false" />
  <property name="prefix" value="MAT" />
  <!-- <property name="suffix" value="${HOSTNAME}" /> -->
  <!-- <property name="maxFileSizeBytes" value="1000000000" /> -->
  <!-- <property name="poolMaxActive" value="1" /> -->
  <!-- <property name="MaxWaitForIdleMs" value="500" /> -->
  <!-- <property name="skipIdenticalDigests" value="false" /> -->
  <!-- <property name="maxTotalBytesToWrite" value="0" /> -->
  <!-- <property name="directory" value="C:\\WAIL\\tomcat\\webapps\\ROOT\\" /> -->
   <property name="storePaths">
        <list>
         <value>''' + warcsFolder + '''</value>
        </list>
       </property>
  <!-- <property name="writeRequests" value="true" /> -->
  <!-- <property name="writeMetadata" value="true" /> -->
  <!-- <property name="writeRevisitForIdenticalDigests" value="true" /> -->
  <!-- <property name="writeRevisitForNotModified" value="true" /> -->
 </bean>
 <bean id="candidates" class="org.archive.crawler.postprocessor.CandidatesProcessor">
  <!-- <property name="seedsRedirectNewSeeds" value="true" /> -->
 </bean>
 <bean id="disposition" class="org.archive.crawler.postprocessor.DispositionProcessor">
  <!-- <property name="delayFactor" value="5.0" /> -->
  <!-- <property name="minDelayMs" value="3000" /> -->
  <!-- <property name="respectCrawlDelayUpToSeconds" value="300" /> -->
  <!-- <property name="maxDelayMs" value="30000" /> -->
  <!-- <property name="maxPerHostBandwidthUsageKbSec" value="0" /> -->
 </bean>
 <!-- <bean id="rescheduler" class="org.archive.crawler.postprocessor.ReschedulingProcessor">
       <property name="rescheduleDelaySeconds" value="-1" />
      </bean> -->
 <!-- now, processors are assembled into ordered DispositionChain bean -->
 <bean id="dispositionProcessors" class="org.archive.modules.DispositionChain">
  <property name="processors">
   <list>
    <!-- write to aggregate archival files... -->
    <ref bean="warcWriter"/>
    <!-- ...send each outlink candidate URI to CandidateChain,
         and enqueue those ACCEPTed to the frontier... -->
    <ref bean="candidates"/>
    <!-- ...then update stats, shared-structures, frontier decisions -->
    <ref bean="disposition"/>
    <!-- <ref bean="rescheduler" /> -->
   </list>
  </property>
 </bean>

 <!-- CRAWLCONTROLLER: Control interface, unifying context -->
 <bean id="crawlController"
   class="org.archive.crawler.framework.CrawlController">
  <!-- <property name="maxToeThreads" value="25" /> -->
  <property name="pauseAtStart" value="false" />
  <!-- <property name="runWhileEmpty" value="false" /> -->
  <!-- <property name="recorderInBufferBytes" value="524288" /> -->
  <!-- <property name="recorderOutBufferBytes" value="16384" /> -->
  <!-- <property name="scratchDir" value="scratch" /> -->
 </bean>

 <!-- FRONTIER: Record of all URIs discovered and queued-for-collection -->
 <bean id="frontier"
   class="org.archive.crawler.frontier.BdbFrontier">
  <!-- <property name="queueTotalBudget" value="-1" /> -->
  <!-- <property name="balanceReplenishAmount" value="3000" /> -->
  <!-- <property name="errorPenaltyAmount" value="100" /> -->
  <!-- <property name="precedenceFloor" value="255" /> -->
  <!-- <property name="queuePrecedencePolicy">
        <bean class="org.archive.crawler.frontier.precedence.BaseQueuePrecedencePolicy" />
       </property> -->
  <!-- <property name="snoozeLongMs" value="300000" /> -->
  <!-- <property name="retryDelaySeconds" value="900" /> -->
  <!-- <property name="maxRetries" value="30" /> -->
  <!-- <property name="recoveryLogEnabled" value="true" /> -->
  <!-- <property name="maxOutlinks" value="6000" /> -->
  <!-- <property name="extractIndependently" value="false" /> -->
  <!-- <property name="outbound">
        <bean class="java.util.concurrent.ArrayBlockingQueue">
         <constructor-arg value="200"/>
         <constructor-arg value="true"/>
        </bean>
       </property> -->
  <!-- <property name="inbound">
        <bean class="java.util.concurrent.ArrayBlockingQueue">
         <constructor-arg value="40000"/>
         <constructor-arg value="true"/>
        </bean>
       </property> -->
  <!-- <property name="dumpPendingAtClose" value="false" /> -->
 </bean>

 <!-- URI UNIQ FILTER: Used by frontier to remember already-included URIs -->
 <bean id="uriUniqFilter"
   class="org.archive.crawler.util.BdbUriUniqFilter">
 </bean>

 <!--
   EXAMPLE SETTINGS OVERLAY SHEETS
   Sheets allow some settings to vary by context - usually by URI context,
   so that different sites or sections of sites can be treated differently.
   Here are some example Sheets for common purposes. The SheetOverlaysManager
   (below) automatically collects all Sheet instances declared among the
   original beans, but others can be added during the crawl via the scripting
   interface.
  -->

<!-- forceRetire: any URI to which this sheet's settings are applied
     will force its containing queue to 'retired' status. -->
<bean id='forceRetire' class='org.archive.spring.Sheet'>
 <property name='map'>
  <map>
   <entry key='disposition.forceRetire' value='true'/>
  </map>
 </property>
</bean>

<!-- smallBudget: any URI to which this sheet's settings are applied
     will give its containing queue small values for balanceReplenishAmount
     (causing it to have shorter 'active' periods while other queues are
     waiting) and queueTotalBudget (causing the queue to enter 'retired'
     status once that expenditure is reached by URI attempts and errors) -->
<bean id='smallBudget' class='org.archive.spring.Sheet'>
 <property name='map'>
  <map>
   <entry key='frontier.balanceReplenishAmount' value='20'/>
   <entry key='frontier.queueTotalBudget' value='100'/>
  </map>
 </property>
</bean>

<!-- veryPolite: any URI to which this sheet's settings are applied
     will cause its queue to take extra-long politeness snoozes -->
<bean id='veryPolite' class='org.archive.spring.Sheet'>
 <property name='map'>
  <map>
   <entry key='disposition.delayFactor' value='10'/>
   <entry key='disposition.minDelayMs' value='10000'/>
   <entry key='disposition.maxDelayMs' value='1000000'/>
   <entry key='disposition.respectCrawlDelayUpToSeconds' value='3600'/>
  </map>
 </property>
</bean>

<!-- highPrecedence: any URI to which this sheet's settings are applied
     will give its containing queue a slightly-higher than default
     queue precedence value. That queue will then be preferred over
     other queues for active crawling, never waiting behind lower-
     precedence queues. -->
<bean id='highPrecedence' class='org.archive.spring.Sheet'>
 <property name='map'>
  <map>
   <entry key='frontier.balanceReplenishAmount' value='20'/>
   <entry key='frontier.queueTotalBudget' value='100'/>
  </map>
 </property>
</bean>

<!--
   EXAMPLE SETTINGS OVERLAY SHEET-ASSOCIATION
   A SheetAssociation says certain URIs should have certain overlay Sheets
   applied. This example applies two sheets to URIs matching two SURT-prefixes.
   New associations may also be added mid-crawl using the scripting facility.
  -->

<!--
<bean class='org.archive.crawler.spring.SurtPrefixesSheetAssociation'>
 <property name='surtPrefixes'>
  <list>
   <value>http://(org,example,</value>
   <value>http://(com,example,www,)/</value>
  </list>
 </property>
 <property name='targetSheetNames'>
  <list>
   <value>veryPolite</value>
   <value>smallBudget</value>
  </list>
 </property>
</bean>
-->

 <!--
   OPTIONAL BUT RECOMMENDED BEANS
  -->

 <!-- ACTIONDIRECTORY: disk directory for mid-crawl operations
      Running job will watch directory for new files with URIs,
      scripts, and other data to be processed during a crawl. -->
 <bean id="actionDirectory" class="org.archive.crawler.framework.ActionDirectory">
  <!-- <property name="actionDir" value="action" /> -->
  <!-- <property name="doneDir" value="${launchId}/actions-done" /> -->
  <!-- <property name="initialDelaySeconds" value="10" /> -->
  <!-- <property name="delaySeconds" value="30" /> -->
 </bean>

 <!--  CRAWLLIMITENFORCER: stops crawl when it reaches configured limits -->
 <bean id="crawlLimiter" class="org.archive.crawler.framework.CrawlLimitEnforcer">
  <!-- <property name="maxBytesDownload" value="0" /> -->
  <!-- <property name="maxDocumentsDownload" value="0" /> -->
  <!-- <property name="maxTimeSeconds" value="0" /> -->
 </bean>

 <!-- CHECKPOINTSERVICE: checkpointing assistance -->
 <bean id="checkpointService"
   class="org.archive.crawler.framework.CheckpointService">
  <!-- <property name="checkpointIntervalMinutes" value="-1"/> -->
  <!-- <property name="checkpointsDir" value="checkpoints"/> -->
 </bean>

 <!--
   OPTIONAL BEANS
    Uncomment and expand as needed, or if non-default alternate
    implementations are preferred.
  -->

 <!-- CANONICALIZATION POLICY -->
 <!--
 <bean id="canonicalizationPolicy"
   class="org.archive.modules.canonicalize.RulesCanonicalizationPolicy">
   <property name="rules">
    <list>
     <bean class="org.archive.modules.canonicalize.LowercaseRule" />
     <bean class="org.archive.modules.canonicalize.StripUserinfoRule" />
     <bean class="org.archive.modules.canonicalize.StripWWWNRule" />
     <bean class="org.archive.modules.canonicalize.StripSessionIDs" />
     <bean class="org.archive.modules.canonicalize.StripSessionCFIDs" />
     <bean class="org.archive.modules.canonicalize.FixupQueryString" />
    </list>
  </property>
 </bean>
 -->


 <!-- QUEUE ASSIGNMENT POLICY -->
 <!--
 <bean id="queueAssignmentPolicy"
   class="org.archive.crawler.frontier.SurtAuthorityQueueAssignmentPolicy">
  <property name="forceQueueAssignment" value="" />
  <property name="deferToPrevious" value="true" />
  <property name="parallelQueues" value="1" />
 </bean>
 -->

 <!-- URI PRECEDENCE POLICY -->
 <!--
 <bean id="uriPrecedencePolicy"
   class="org.archive.crawler.frontier.precedence.CostUriPrecedencePolicy">
 </bean>
 -->

 <!-- COST ASSIGNMENT POLICY -->
 <!--
 <bean id="costAssignmentPolicy"
   class="org.archive.crawler.frontier.UnitCostAssignmentPolicy">
 </bean>
 -->

 <!-- CREDENTIAL STORE: HTTP authentication or FORM POST credentials -->
 <!--
 <bean id="credentialStore"
   class="org.archive.modules.credential.CredentialStore">
 </bean>
 -->

 <!-- DISK SPACE MONITOR:
      Pauses the crawl if disk space at monitored paths falls below minimum threshold -->
 <!--
 <bean id="diskSpaceMonitor" class="org.archive.crawler.monitor.DiskSpaceMonitor">
   <property name="pauseThresholdMiB" value="500" />
   <property name="monitorConfigPaths" value="true" />
   <property name="monitorPaths">
     <list>
       <value>PATH</value>
     </list>
   </property>
 </bean>
 -->

 <!--
   REQUIRED STANDARD BEANS
    It will be very rare to replace or reconfigure the following beans.
  -->

 <!-- STATISTICSTRACKER: standard stats/reporting collector -->
 <bean id="statisticsTracker"
   class="org.archive.crawler.reporting.StatisticsTracker" autowire="byName">
  <!-- <property name="reports">
        <list>
         <bean id="crawlSummaryReport" class="org.archive.crawler.reporting.CrawlSummaryReport" />
         <bean id="seedsReport" class="org.archive.crawler.reporting.SeedsReport" />
         <bean id="hostsReport" class="org.archive.crawler.reporting.HostsReport" />
         <bean id="sourceTagsReport" class="org.archive.crawler.reporting.SourceTagsReport" />
         <bean id="mimetypesReport" class="org.archive.crawler.reporting.MimetypesReport" />
         <bean id="responseCodeReport" class="org.archive.crawler.reporting.ResponseCodeReport" />
         <bean id="processorsReport" class="org.archive.crawler.reporting.ProcessorsReport" />
         <bean id="frontierSummaryReport" class="org.archive.crawler.reporting.FrontierSummaryReport" />
         <bean id="frontierNonemptyReport" class="org.archive.crawler.reporting.FrontierNonemptyReport" />
         <bean id="toeThreadsReport" class="org.archive.crawler.reporting.ToeThreadsReport" />
        </list>
       </property> -->
  <!-- <property name="reportsDir" value="${launchId}/reports" /> -->
  <!-- <property name="liveHostReportSize" value="20" /> -->
  <!-- <property name="intervalSeconds" value="20" /> -->
  <!-- <property name="keepSnapshotsCount" value="5" /> -->
  <!-- <property name="liveHostReportSize" value="20" /> -->
 </bean>

 <!-- CRAWLERLOGGERMODULE: shared logging facility -->
 <bean id="loggerModule"
   class="org.archive.crawler.reporting.CrawlerLoggerModule">
  <!-- <property name="path" value="${launchId}/logs" /> -->
  <!-- <property name="crawlLogPath" value="crawl.log" /> -->
  <!-- <property name="alertsLogPath" value="alerts.log" /> -->
  <!-- <property name="progressLogPath" value="progress-statistics.log" /> -->
  <!-- <property name="uriErrorsLogPath" value="uri-errors.log" /> -->
  <!-- <property name="runtimeErrorsLogPath" value="runtime-errors.log" /> -->
  <!-- <property name="nonfatalErrorsLogPath" value="nonfatal-errors.log" /> -->
  <!-- <property name="logExtraInfo" value="false" /> -->
 </bean>

 <!-- SHEETOVERLAYMANAGER: manager of sheets of contextual overlays
      Autowired to include any SheetForSurtPrefix or
      SheetForDecideRuled beans -->
 <bean id="sheetOverlaysManager" autowire="byType"
   class="org.archive.crawler.spring.SheetOverlaysManager">
 </bean>

 <!-- BDBMODULE: shared BDB-JE disk persistence manager -->
 <bean id="bdb"
  class="org.archive.bdb.BdbModule">
  <!-- <property name="dir" value="state" /> -->
  <!-- <property name="cachePercent" value="60" /> -->
  <!-- <property name="useSharedCache" value="true" /> -->
  <!-- <property name="expectedConcurrency" value="25" /> -->
 </bean>

 <!-- BDBCOOKIESTORAGE: disk-based cookie storage for FetchHTTP -->
 <bean id="cookieStorage"
   class="org.archive.modules.fetcher.BdbCookieStorage">
  <!-- <property name="cookiesLoadFile"><null/></property> -->
  <!-- <property name="cookiesSaveFile"><null/></property> -->
  <!-- <property name="bdb">
        <ref bean="bdb"/>
       </property> -->
 </bean>

 <!-- SERVERCACHE: shared cache of server/host info -->
 <bean id="serverCache"
   class="org.archive.modules.net.BdbServerCache">
  <!-- <property name="bdb">
        <ref bean="bdb"/>
       </property> -->
 </bean>

 <!-- CONFIG PATH CONFIGURER: required helper making crawl paths relative
      to crawler-beans.cxml file, and tracking crawl files for web UI -->
 <bean id="configPathConfigurer"
   class="org.archive.spring.ConfigPathConfigurer">
 </bean>

</beans>
'''


#from http://stackoverflow.com/questions/136168/get-last-n-lines-of-a-file-with-python-similar-to-tail
def tail(filename, lines=1, _buffer=4098):
    try:
        f = open(filename,"r")
    except:
        return "No job info yet\nYou must run a job before stats can be shown here"
    lines_found = []
    block_counter = -1
    while len(lines_found) < lines:
        try:
            f.seek(block_counter * _buffer, os.SEEK_END)
        except IOError:  # either file is too small, or too many lines requested
            f.seek(0)
            lines_found = f.readlines()
            break

        lines_found = f.readlines()
        if len(lines_found) > lines:
            break
        block_counter -= 1
    return lines_found[-lines:]

def copyanything(src, dst):
    try:
        shutil.copytree(src, dst)
    except OSError as exc: # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else: raise

mainAppWindow = None

if __name__ == "__main__":
    app = wx.App(redirect=False)
    mainAppWindow = TabController()
    mainAppWindow.ensureCorrectInstallation()
    mainAppWindow.Show()

    # Start indexer
    #Wayback().index()

    app.MainLoop()
