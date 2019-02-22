#!/usr/bin/env python
#-*- coding:utf-8 -*-

# Web Archiving Integration Layer (WAIL)
#  This tool ties together web archiving applications including Wayback,
#   Heritrix, and Tomcat.
#  Mat Kelly <wail@matkelly.com> 2013

from __future__ import print_function

import wx
import subprocess
import shlex
import webbrowser
import os
import schedule
import time
import sys
import locale
import datetime
import functools
import six
# from ntfy.backends.default import notify

from string import Template # Py3.6+

from six.moves.urllib.request import urlopen
from six.moves.urllib.parse import urlparse
from six.moves.urllib import request
from six.moves.urllib.error import HTTPError

try:  # Py3
    import _thread as thread  # For a more responsive UI
except ImportError:  # Py2
    import thread  # For a more responsive UI

import base64
import glob
import re
import ssl
import shutil

import json
from HeritrixJob import HeritrixJob
import WAILConfig as config
import wailUtil as util


# from wx import *
import wx.adv
import waybackConfigWriter
from subprocess import Popen, PIPE

# For a more asynchronous UI, esp with accessible()s
from multiprocessing import Pool as Thread
import logging
import requests
import threading  # Necessary for polling/indexing

from requests.auth import HTTPDigestAuth

from os import listdir
from os.path import isfile, join
import tarfile  # For updater

ssl._create_default_https_context = ssl._create_unverified_context

#  from pync import Notifier # OS X notifications

INDEX_TIMER_SECONDS = 10.0


###############################
# Tab Controller (Notebook)
###############################


class TabController(wx.Frame):
    def __init__(self):
        wx.Frame.__init__(self, None, title=config.groupLabel_window,
                          size=config.wailWindowSize,
                          style=config.wailWindowStyle)
        panel = wx.Panel(self)
        vbox = wx.BoxSizer(wx.VERTICAL)

        self.Notebook = wx.Notebook(panel)
        vbox.Add(self.Notebook, 2, flag=wx.EXPAND)

        panel.SetSizer(vbox)

        # Add basic config page/tab
        self.basicConfig = WAILGUIFrame_Basic(self.Notebook)
        self.Notebook.AddPage(self.basicConfig, config.tabLabel_basic)

        # Add advanced config page/tab
        self.advConfig = WAILGUIFrame_Advanced(self.Notebook)
        self.Notebook.AddPage(self.advConfig, config.tabLabel_advanced)
        self.createMenu()

        self.indexingTimer = threading.Timer(
            INDEX_TIMER_SECONDS, Wayback().index)
        self.indexingTimer.daemon = True
        self.indexingTimer.start()

    def createMenu(self):
        self.menu_bar = wx.MenuBar()

        self.file_menu = wx.Menu()
        self.edit_menu = wx.Menu()
        self.view_menu = wx.Menu()
        self.window_menu = wx.Menu()
        self.help_menu = wx.Menu()

        self.fileNewCrawl = self.file_menu.Append(1, config.menuTitle_file_newCrawl + '\tCTRL+N')
        self.Bind(wx.EVT_MENU, self.setupNewCrawlFromMenu, self.fileNewCrawl)

        self.file_allCrawls = wx.Menu()
        self.file_allCrawls_finish = self.file_allCrawls.Append(wx.ID_ANY, config.menuTitle_file_allCrawls_finish)
        self.file_allCrawls_pauseUnpause = self.file_allCrawls.Append(wx.ID_ANY, config.menuTitle_file_allCrawls_pause)
        self.file_allCrawls_restart = self.file_allCrawls.Append(wx.ID_ANY, config.menuTitle_file_allCrawls_restart)
        self.file_allCrawls.AppendSeparator()
        self.file_allCrawls_destroy = self.file_allCrawls.Append(wx.ID_ANY, config.menuTitle_file_allCrawls_destroy)

        self.file_menu.AppendSeparator()
        self.file_menu.AppendSubMenu(self.file_allCrawls, config.menuTitle_file_allCrawls)

        self.Bind(wx.EVT_MENU, self.advConfig.heritrixPanel.finishAllCrawls, self.file_allCrawls_finish)

        self.viewBasic = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewBasic + '\tCTRL+0')
        self.view_menu.AppendSeparator()
        adv = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewAdvanced)
        adv.Enable(0)

        self.viewServices = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewAdvanced_services + '\tCTRL+1')
        self.viewWayback = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewAdvanced_wayback + '\tCTRL+2')
        self.viewHeritrix = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewAdvanced_heritrix + '\tCTRL+3')
        self.viewMiscellaneous = self.view_menu.Append(wx.ID_ANY, config.menuTitle_view_viewAdvanced_miscellaneous + '\tCTRL+4')

        self.windowWail = self.window_menu.AppendCheckItem(wx.ID_ANY, config.menuTitle_window_wail)
        self.windowWail.Check()  # Initially check menu item
        self.Bind(wx.EVT_MENU, lambda evt: self.windowWail.Check(True), self.windowWail)  # Prevent from being unchecked

        self.help_menu.Append(wx.ID_ABOUT, config.menuTitle_about)
        self.help_menu.Append(wx.ID_PREFERENCES, "Preferences...\tCTRL+,")
        self.help_menu.Append(wx.ID_EXIT, "&QUIT")

        self.menu_bar.Append(self.file_menu, config.menuTitle_file)
        self.menu_bar.Append(self.edit_menu, config.menuTitle_edit)
        self.menu_bar.Append(self.view_menu, config.menuTitle_view)
        self.menu_bar.Append(self.window_menu, config.menuTitle_window)
        self.menu_bar.Append(self.help_menu, config.menuTitle_help)

        self.Bind(wx.EVT_MENU, self.displayAboutMenu, id=wx.ID_ABOUT)
        self.Bind(wx.EVT_MENU, self.quit, id=wx.ID_EXIT)

        # Menu events
        self.Bind(wx.EVT_MENU,
                  lambda evt, basicTab=True: self.displayTab(basicTab=basicTab), self.viewBasic)

        self.Bind(wx.EVT_MENU,
                  lambda evt, tabTitle=config.menuTitle_view_viewAdvanced_services: self.displayTab(tabTitle), self.viewServices)
        self.Bind(wx.EVT_MENU,
                  lambda evt, tabTitle=config.menuTitle_view_viewAdvanced_wayback: self.displayTab(tabTitle), self.viewWayback)
        self.Bind(wx.EVT_MENU,
                  lambda evt, tabTitle=config.menuTitle_view_viewAdvanced_heritrix: self.displayTab(tabTitle), self.viewHeritrix)
        self.Bind(wx.EVT_MENU,
                  lambda evt, tabTitle=config.menuTitle_view_viewAdvanced_miscellaneous: self.displayTab(tabTitle), self.viewMiscellaneous)

        # Fix Quit menuitem capitalization
        wailMenu = self.menu_bar.OSXGetAppleMenu()
        if wailMenu is not None:
            for m in wailMenu.GetMenuItems():
                if m.GetId() == wx.ID_EXIT:
                    m.SetItemLabel("Quit WAIL\tCTRL+Q")

        self.SetMenuBar(self.menu_bar)

    def displayTab(self, tableTitle='Basic', basicTab=False):
        if basicTab:
            self.Notebook.SetSelection(0)
            return

        self.Notebook.SetSelection(1)

        pages = {config.menuTitle_view_viewAdvanced_services: 0,
                 config.menuTitle_view_viewAdvanced_wayback: 1,
                 config.menuTitle_view_viewAdvanced_heritrix: 2,
                 config.menuTitle_view_viewAdvanced_miscellaneous: 3}
        self.advConfig.Notebook.SetSelection(pages[tableTitle])

    def setupNewCrawlFromMenu(self, menu):
        self.displayTab(config.menuTitle_view_viewAdvanced_heritrix)
        self.advConfig.heritrixPanel.setupNewCrawl(None)

    def displayAboutMenu(self, button):
        info = wx.adv.AboutDialogInfo()
        info.SetName(config.aboutWindow_appName)
        info.SetVersion("v. " + config.WAIL_VERSION)
        info.SetCopyright(config.aboutWindow_author)

        wx.adv.AboutBox(info)

    def ensureCorrectInstallation(self):
        # TODO: properly implement this
        # Check that the file is being executed from the correct location
        currentPath = os.path.dirname(os.path.abspath(__file__))
        if 'darwin' in sys.platform and currentPath != "/Applications":
            # Alert the user to move the file. Exit the program
            wx.MessageBox(config.msg_wrongLocation_body + currentPath,
                          config.msg_wrongLocation_title)
            print(config.msg_wrongLocation_body + currentPath)
            # sys.exit()

    def quit(self, button):
        print('Quitting!')
        if mainAppWindow.indexingTimer:
            mainAppWindow.indexingTimer.cancel()
        # os._exit(0) # Quit without buffer cleanup
        sys.exit(1)  # Be a good citizen. Cleanup your memory footprint


class WAILGUIFrame_Basic(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)

        # Forces Windows into composite mode for drawing
        self.SetDoubleBuffered(True)
        self.uriLabel = wx.StaticText(self, -1,
                                      config.buttonLabel_uri, pos=(0, 5))
        self.uri = wx.TextCtrl(self, -1, pos=(34, 0),
                               value=config.textLabel_defaultURI,
                               size=(343, 25))
        self.archiveNowButton = wx.Button(self, -1,
                                          config.buttonLabel_archiveNow,
                                          pos=(280, 30))
        self.checkArchiveStatus = wx.Button(self,  -1,
                                            config.buttonLabel_checkStatus,
                                            pos=(110, 30))
        self.viewArchive = wx.Button(self, -1, config.buttonLabel_viewArchive,
                                     pos=(0, 30))

        self.archiveNowButton.SetDefault()

        # self.mementoCountInfo = wx.Button(self, -1,
        #                                  buttonLabel_mementoCountInfo,
        #                                  pos=(270,85), size=(25,15))

        # Basic interface button actions
        self.archiveNowButton.Bind(wx.EVT_BUTTON, self.archiveNow)
        self.checkArchiveStatus.Bind(wx.EVT_BUTTON, self.checkIfURLIsInArchive)
        self.viewArchive.Bind(wx.EVT_BUTTON, self.viewArchiveInBrowser)
        # hJob = HeritrixJob([self.uri.GetValue()])

        # TODO: check environment variables
        self.ensureEnvironmentVariablesAreSet()

        self.setMementoCount(None)
        # self.setMessage(
        #   "Type a URL and click \"Archive Now!\" to begin archiving");

        # Bind changes in URI to query MemGator
        self.memgatorDelayTimer = None

        thread.start_new_thread(self.fetchMementos, ())
        # Call MemGator on URI change
        self.uri.Bind(wx.EVT_KEY_UP, self.uriChanged)

    def setMementoCount(self, mCount, aCount=0):
        ui_mementoCountMessage_pos = (105, 85)
        ui_mementoCountMessage_size = (250, 20)
        if hasattr(self, 'mementoStatus'):
            self.mementoStatus.Destroy()
            self.mementoStatusPublicArchives.Destroy()

        # Ensure mCount is an int, convert if not, allow None
        if mCount is not None and not isinstance(mCount, int):
            mCount = int(mCount)
        if mCount is not None and (mCount < 0 or aCount < 0):
            raise ValueError('Invalid memento or archive count specified')

        memCountMsg = ''
        if mCount is None:
            memCountMsg = config.msg_fetchingMementos
        elif mCount > 0:
            localeToSet = 'en_US'
            if sys.platform.startswith('win32'):
                localeToSet = ''

            locale.setlocale(locale.LC_ALL, localeToSet)

            mPlurality = 's'
            aPlurality = 's'

            if mCount == 1:
                mPlurality = ''
            if aCount == 1:
                aPlurality = ''
            mCount = locale.format_string("%d", mCount, grouping=True)
            memCountMsg = ('{0} memento{1} available '
                           'from {2} archive{3}').format(
                mCount, mPlurality, aCount, aPlurality
            )
        elif mCount == 0:
            memCountMsg = config.msg_noMementosAvailable
        else:
            ''' '''

        # Bug: Does not update UI on Windows
        self.mementoStatus = wx.StaticText(self, -1, label=memCountMsg,
                                           pos=ui_mementoCountMessage_pos,
                                           size=ui_mementoCountMessage_size)

        self.mementoStatusPublicArchives = \
            wx.StaticText(self,  -1, label="Public archives: ",
                          pos=(5, 85), size=(100, 20))

    def setMessage(self, msg):
        if hasattr(self, 'status'):
            self.status.Destroy()
        self.status = wx.StaticText(self, -1, msg, pos=(5, 65), size=(300, 20))

    def fetchMementos(self):
        # TODO: Use CDXJ for counting the mementos
        currentURIValue = self.uri.GetValue()
        print('MEMGATOR checking {0}'.format(currentURIValue))

        startupinfo = None
        # Fixes issue of Popen on Windows
        if sys.platform.startswith('win32'):
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW

        mg = Popen([config.memGatorPath,
                    '--arcs', config.archivesJSON,
                    '--format', 'cdxj',
                    '--restimeout', '0m3s',
                    '--hdrtimeout', '3s',
                    '--contimeout', '3s',
                    currentURIValue], stdout=PIPE, stdin=subprocess.PIPE, stderr=subprocess.PIPE, startupinfo=startupinfo)

        # TODO: bug, on Gogo internet MemGator cannot hit aggregator, which
        # results in 0 mementos, for which MemGator throws exception

        mCount = 0
        archHosts = set()
        for line in mg.stdout:
            cleanedLine = line.strip()
            if cleanedLine[:1].isdigit():
                mCount += 1
                archHosts.add(cleanedLine.split(b'/', 3)[2])

        # UI not updated on Windows
        self.setMementoCount(mCount, len(archHosts))

        print('MEMGATOR\n* URI-R: {0}\n* URI-Ms {1}\n* Archives: {2}'.format(
            currentURIValue,
            mCount,
            len(archHosts)
        ))
        # TODO: cache the TM

    def uriChanged(self, event):
        self.setMementoCount(None)

        if self.memgatorDelayTimer:  # Kill any currently running timer
            self.memgatorDelayTimer.cancel()
            self.memgatorDelayTimer = None

        self.memgatorDelayTimer = threading.Timer(1.0,
                                                  thread.start_new_thread,
                                                  [self.fetchMementos, ()])
        self.memgatorDelayTimer.daemon = True
        self.memgatorDelayTimer.start()

        # TODO: start timer on below, kill if another key is hit
        # thread.start_new_thread(self.fetchMementos,())
        event.Skip()

    def testCallback(self):
        print('callback executed!')

    def ensureEnvironmentVariablesAreSet(self):
        if 'darwin' not in sys.platform:
            return  # Allow windows to proceed w/o java checks for now.

        JAVA_HOME_defined = 'JAVA_HOME' in os.environ
        JRE_HOME_defined = 'JRE_HOME' in os.environ
        if not JAVA_HOME_defined or not JRE_HOME_defined:
            jreHome = ''
            javaHome = ''
            jdkPath = ''
            if 'darwin' in sys.platform:
                jdkPath = config.jdkPath
                jreHome = config.jreHome
                javaHome = config.javaHome
            else:  # Win, incomplete
                # os.environ['PATH'] # java8 does not use JRE_HOME, JAVA_HOME
                pass

            # Find java 1.7
            # /usr/libexec/java_home -v 1.7
            jdkInstalled = os.path.isdir(jdkPath)

            if jdkInstalled:
                os.environ["JAVA_HOME"] = javaHome
                os.environ["JRE_HOME"] = jreHome
                self.ensureEnvironmentVariablesAreSet()
            else:
                d = wx.MessageDialog(self, config.msg_installJava,
                                     "Install now?", config.wail_style_yesNo)
                result = d.ShowModal()
                d.Destroy()
                if result == wx.ID_NO:
                    sys.exit()
                else:
                    # self.javaInstalled()
                    self.installJava()

    def installJava(self):
        resp = requests.get(config.osx_java7DMG)
        with open('/tmp/java7.pdf', 'wb') as f:
            f.write(resp.content)

        p = Popen(["hdiutil", "attach", "/tmp/java7.dmg"],
                  stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()
        q = Popen(["open", "JDK 7 Update 79.pkg"],
                  cwd=r'/Volumes/JDK 7 Update 79/', stdout=PIPE, stderr=PIPE)
        stdout, stderr = q.communicate()
        sys.exit()

    def archiveNow(self, button):
        self.archiveNowButton.SetLabel(
            config.buttonLabel_archiveNow_initializing)
        self.setMessage('Starting Archiving Process...')
        self.archiveNowButton.Disable()
        thread.start_new_thread(self.archiveNow2Async, ())

    def archiveNow2Async(self):
        self.setMessage(config.msg_crawlStatus_writingConfig)
        self.writeHeritrixLogWithURI()
        # First check to be sure Java SE is installed.
        if self.javaInstalled():
            self.setMessage(config.msg_crawlStatus_launchingCrawler)
            if not Heritrix().accessible():
                self.launchHeritrix()
            self.setMessage(config.msg_crawlStatus_launchingWayback)
            mainAppWindow.advConfig.startTomcat(None)
            # time.sleep(4)
            self.setMessage(config.msg_crawlStatus_initializingCrawlJob)
            self.startHeritrixJob()
            mainAppWindow.advConfig.heritrixPanel.populateListboxWithJobs()
            self.setMessage(
                'Crawl of {0} started!'.format(self.uri.GetValue()[0:41]))
            wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
            # if sys.platform.startswith('darwin'): #show a notification
            # ... of success in OS X
            #  Notifier.notify('Archival process successfully initiated.',
            #  ...title="WAIL")
        else:
            print(config.msg_java6Required)
            self.setMessage(config.msg_archiveFailed_java)

        wx.CallAfter(self.onLongRunDone)

    def onLongRunDone(self):
        self.archiveNowButton.SetLabel(config.buttonLabel_archiveNow)
        self.archiveNowButton.Enable()

    def writeHeritrixLogWithURI(self):
        self.hJob = HeritrixJob(config.heritrixJobPath, [self.uri.GetValue()])
        self.hJob.write()

    def javaInstalled(self):
        # First check to be sure Java SE is installed.
        # Move this logic elsewhere in production
        noJava = config.msg_noJavaRuntime
        p = Popen(["java", "-version"], stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()
        return (noJava not in stdout) and (noJava not in stderr)

    def launchHeritrix(self):
        cmd = '{0} -a {1}:{2}'.format(
            config.heritrixBinPath, config.heritrixCredentials_username,
            config.heritrixCredentials_password)

        # TODO: shell=True was added for OS X, verify that functionality persists on Win64
        ret = subprocess.Popen(cmd, shell=True)
        time.sleep(3)
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses()

    def startHeritrixJob(self):
        self.buildHeritrixJob()
        self.launchHeritrixJob()

    def launchHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print('Launching Heririx job')
        data = {"action": "launch"}
        headers = {"Accept": "application/xml",
                   "Content-type": "application/x-www-form-urlencoded"}
        r = requests.post(
            '{0}{1}'.format(config.uri_heritrixJob, self.hJob.jobNumber),
            auth=HTTPDigestAuth(
                config.heritrixCredentials_username,
                config.heritrixCredentials_password),
            data=data, headers=headers, verify=False, stream=True)

    def buildHeritrixJob(self):
        logging.basicConfig(level=logging.DEBUG)
        print('Building Heritrix job')
        data = {"action": "build"}
        headers = {"Accept": "application/xml",
                   "Content-type": "application/x-www-form-urlencoded"}
        r = requests.post(
            '{0}{1}'.format(config.uri_heritrixJob, self.hJob.jobNumber),
            auth=HTTPDigestAuth(
                config.heritrixCredentials_username,
                config.heritrixCredentials_password),
            data=data, headers=headers, verify=False, stream=True)

        # curl -v -d "action=launch" -k -u lorem:ipsum --anyauth --location
        # -H "Accept: application/xml" https://127.0.0.1:8443/engine/job/142..
        return

    def checkIfURLIsInArchive(self, button):
        url = config.uri_wayback_allMementos + self.uri.GetValue()
        statusCode = None
        try:
            resp = urlopen(url)
            statusCode = resp.getcode()
        except HTTPError as e:
            statusCode = e.code
        except:
            # When the server is unavailable, keep the default.
            # This is necessary, as unavailability will still cause an
            # exception
            ''''''

        if statusCode is None:
            launchWaybackDialog = wx.MessageDialog(
                None, config.msg_waybackNotStarted_body,
                config.msg_waybackNotStarted_title, wx.YES_NO | wx.YES_DEFAULT)
            launchWayback = launchWaybackDialog.ShowModal()
            if launchWayback == wx.ID_YES:
                Wayback().fix(None)
                time.sleep(5)
                self.checkIfURLIsInArchive(button)
        elif 200 != statusCode:
            wx.MessageBox(config.msg_uriNotInArchives,
                          "Checking for " + self.uri.GetValue())
        else:
            mb = wx.MessageBox(config.msg_uriInArchives_body,
                               config.msg_uriInArchives_title)
            # b = wx.Button(self, -1, config.buttonLabel_mementoCountInfo,
            #              pos=(10, 85), size=(25, 15))
            # Disabled until we tie more functionality to the button
            # mb.AddButton(b)  # Will not work in wxPython >4

    def resetArchiveNowButton(self):
        self.archiveNowButton.SetLabel(config.buttonLabel_archiveNow_initializing)

    def viewArchiveInBrowser(self, button):
        if Wayback().accessible():
            webbrowser.open_new_tab(
                config.uri_wayback_allMementos + self.uri.GetValue())
        else:
            d = wx.MessageDialog(self, "Launch now?",
                                 "Wayback is not running", config.wail_style_yesNo)
            result = d.ShowModal()
            d.Destroy()
            if result == wx.ID_YES:  # Launch Wayback
                Wayback().fix(self.resetArchiveNowButton)
                # TODO: artificial delay here while we wait for
                # ...Wayback to launch
                # TODO: change button to fixing
                self.archiveNowButton.SetLabel("Initializing...")

                # Adds image, but won't animate with wxPython
                # img = wx.EmptyBitmap( 1, 1 )
                # img.LoadFile('/Users/machawk1/Downloads/Spinner.gif', wx.BITMAP_TYPE_ANY)
                # self.archiveNowButton.SetBitmap(img)

                # self.viewArchiveInBrowser(None)


class WAILGUIFrame_Advanced(wx.Panel):
    class ServicesPanel(wx.Panel, threading.Thread):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            colWidth = 60
            rowHeight = 20  # 18
            cellSize = (150, rowHeight)

            col0 = colWidth * 0 + 10
            wx.StaticText(self, 100,
                          config.tabLabel_advanced_services_serviceStatus,
                          (col0 - 10, rowHeight * 0), cellSize)
            wx.StaticText(self, 100, config.tabLabel_advanced_wayback,
                          (col0, rowHeight*1), cellSize)
            wx.StaticText(self, 100, config.tabLabel_advanced_heritrix,
                          (col0, rowHeight*2), cellSize)

            col1 = 65 + colWidth * 1

            thread.start_new_thread(self.updateServiceStatuses, ())

            col2 = col1 + colWidth
            cellSize_versionFix = (50, rowHeight)
            wx.StaticText(self, 100, 'VERSION',
                          (col2, rowHeight * 0), cellSize_versionFix)
            wx.StaticText(self, 100, self.getWaybackVersion(),
                          (col2, rowHeight*1), cellSize_versionFix)
            wx.StaticText(self, 100, self.getHeritrixVersion(True),
                          (col2, rowHeight*2), cellSize_versionFix)

            col3 = col2+colWidth
            buttonSize = (50, rowHeight - 6)
            # Redefining for Windows, needs regression testing on macOS:
            buttonSize = (50, rowHeight)

            wail_style_button_font_small = wx.Font(10, wx.SWISS, wx.NORMAL,
                                                   wx.NORMAL)

            self.fix_wayback = wx.Button(self, 1, config.buttonLabel_fix,
                                         (col3, rowHeight*1),
                                         buttonSize, wx.BU_EXACTFIT)
            self.fix_wayback.SetFont(wail_style_button_font_small)
            self.fix_heritrix = wx.Button(self, 1, config.buttonLabel_fix,
                                          (col3, rowHeight*2),
                                          buttonSize, wx.BU_EXACTFIT)
            self.fix_heritrix.SetFont(wail_style_button_font_small)

            self.fix_wayback.Bind(wx.EVT_BUTTON, Wayback().fix)
            self.fix_heritrix.Bind(wx.EVT_BUTTON, Heritrix().fix)

            col4 = col3+colWidth

            self.kill_wayback = wx.Button(self, 1, config.buttonLabel_kill,
                                          (col4, rowHeight*1),
                                          buttonSize, wx.BU_EXACTFIT)
            self.kill_wayback.SetFont(wail_style_button_font_small)
            self.kill_heritrix = wx.Button(self, 1, config.buttonLabel_kill,
                                           (col4, rowHeight*2),
                                           buttonSize, wx.BU_EXACTFIT)
            self.kill_heritrix.SetFont(wail_style_button_font_small)

            self.kill_wayback.Bind(wx.EVT_BUTTON, Wayback().kill)
            self.kill_heritrix.Bind(wx.EVT_BUTTON, Heritrix().kill)

            thread.start_new_thread(self.updateServiceStatuses, ())

        def setHeritrixStatus(self, status):
            colWidth = 60
            rowHeight = 20
            col1 = 65+colWidth*1
            cellSize = (40, rowHeight)

            if hasattr(self, 'status_heritrix'):
                self.status_heritrix.Destroy()
            self.status_heritrix = wx.StaticText(self, 100, status,
                                                 (col1, rowHeight*2), cellSize)

        def setWaybackStatus(self, status):
            colWidth = 60
            rowHeight = 20
            col1 = 65+colWidth*1
            cellSize = (40, rowHeight)
            
            if hasattr(self, 'status_wayback'):
                self.status_wayback.Destroy()
            self.status_wayback = wx.StaticText(self, 100, status,
                                                (col1, rowHeight*1), cellSize)

        def getHeritrixVersion(self, abbr=True):
            htrixLibPath = config.heritrixPath + "lib/"

            for file in os.listdir(htrixLibPath):
                if file.startswith("heritrix-commons"):
                    regex = re.compile("commons-(.*)\.")
                    return regex.findall(file)[0]

        def getWaybackVersion(self):
            tomcatLibPath = config.tomcatPath + "/webapps/lib/"

            for file in os.listdir(tomcatLibPath):
                if file.startswith("openwayback-core"):
                    regex = re.compile("core-(.*)\.")
                    return regex.findall(file)[0]

        def getTomcatVersion(self):
            # Apache Tomcat Version 7.0.30
            releaseNotesPath = config.tomcatPath + '/RELEASE-NOTES'

            if not os.path.exists(releaseNotesPath):
                return "?"
            f = open(releaseNotesPath, 'r')
            version = ""
            for line in f.readlines():
                if "Apache Tomcat Version " in line:
                    version = re.sub("[^0-9^\.]", "", line)
                    break
            f.close()
            return version

        def updateServiceStatuses(self, serviceId=None, transitionalStatus=None):
            ##################################
            # Check if each service is enabled
            # and set the GUI elements accordingly
            ##################################

            colWidth = 60
            rowHeight = 20
            col1 = 65 + colWidth * 1
            cellSize = (40, rowHeight)
            serviceEnabled = {True: config.serviceEnabledLabel_YES,
                              False: config.serviceEnabledLabel_NO}

            heritrixAccessible = serviceEnabled[Heritrix().accessible()]
            waybackAccessible = serviceEnabled[Wayback().accessible()]

            if waybackAccessible is config.serviceEnabledLabel_YES:
                tomcatAccessible = waybackAccessible
            else:
                tomcatAccessible = serviceEnabled[Tomcat().accessible()]

            # Update a transitional status and short circuit
            if serviceId and transitionalStatus:
                if serviceId is "wayback":
                    self.setWaybackStatus(transitionalStatus)
                    return
                elif serviceId is "heritrix":
                    self.setHeritrixStatus(transitionalStatus)
                    return
                else:
                    print('{0}{1}'.format(
                        'Invalid transitional service id specified. ',
                        'Updating status per usual.'))

            if not hasattr(self, 'stateLabel'):
                self.stateLabel = wx.StaticText(
                    self, 100, "STATE", (col1, rowHeight * 0), cellSize)

            self.setHeritrixStatus(heritrixAccessible)
            self.setWaybackStatus(tomcatAccessible)

            if not hasattr(self, 'fix_heritrix'):
                print('First call, UI has not been setup')
                # Initial setup call will return here, ui elements
                # ...have not been created
                return

            # Enable/disable FIX buttons based on service status
            if heritrixAccessible is config.serviceEnabledLabel_YES:
                self.fix_heritrix.Disable()
                self.kill_heritrix.Enable()
            else:
                self.fix_heritrix.Enable()
                self.kill_heritrix.Disable()

            if tomcatAccessible is config.serviceEnabledLabel_YES:
                self.fix_wayback.Disable()
                self.kill_wayback.Enable()
            else:
                self.fix_wayback.Enable()
                self.kill_wayback.Disable()

    class WaybackPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.viewWaybackInBrowserButton = wx.Button(
                self, -1, config.buttonLabel_wayback)
            self.editWaybackConfiguration = wx.Button(
                self, -1, config.buttonLabel_editWaybackConfig)
            self.viewWaybackInBrowserButton.Bind(
                wx.EVT_BUTTON, self.openWaybackInBrowser)
            self.editWaybackConfiguration.Bind(
                wx.EVT_BUTTON, self.openWaybackConfiguration)

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(self.viewWaybackInBrowserButton, 0, wx.EXPAND, 0)
            box.Add(self.editWaybackConfiguration, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

        def openWaybackInBrowser(self, button):
            if Wayback().accessible():
                webbrowser.open_new_tab(config.uri_wayback)
                self.viewWaybackInBrowserButton.SetLabel(config.buttonLabel_wayback)
                self.viewWaybackInBrowserButton.Enable()
            else:
                d = wx.MessageDialog(
                    self, "Launch now?", "Wayback is not running",
                    config.wail_style_yesNo)
                result = d.ShowModal()
                d.Destroy()
                if result == wx.ID_YES:  # Launch Wayback
                    Wayback().fix(None, lambda: self.openWaybackInBrowser(None))
                    self.viewWaybackInBrowserButton.SetLabel(
                        config.buttonLabel_wayback_launching)
                    self.viewWaybackInBrowserButton.Disable()

        def openWaybackConfiguration(self, button):
            filepath = config.tomcatPath + "/webapps/ROOT/WEB-INF/wayback.xml"
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

            # Button layout
            bsize = self.width, self.height = (125, 25 * .75)
            self.setupNewCrawlButton = wx.Button(
                self, 1, config.buttonLabel_heritrix_newCrawl, (0, 70), bsize)
            self.launchWebUIButton = wx.Button(
                self, 1, config.buttonLabel_heritrix_launchWebUI,
                (0, 92), bsize)

            # Button functionality
            self.setupNewCrawlButton.Bind(wx.EVT_BUTTON, self.setupNewCrawl)
            self.launchWebUIButton.Bind(wx.EVT_BUTTON, self.launchWebUI)

            self.panelUpdater = None  # For updating stats UI

        def populateListboxWithJobs(self):
            list = Heritrix().getListOfJobs()

            # Set to reverse chronological so newest jobs are at the top
            list.reverse()
            self.listbox.Set(list)

        def clickedListboxItem(self, event):
            self.hideNewCrawlUIElements()
            self.statusMsg.Show()

            crawlId = self.listbox.GetString(self.listbox.GetSelection())

            jobLaunches = Heritrix().getJobLaunches(crawlId)
            if self.panelUpdater:  # Kill any currently running timer
                self.panelUpdater.cancel()
                self.panelUpdater = None
            self.updateInfoPanel(crawlId)

        def updateInfoPanel(self, active):
            self.statusMsg.SetLabel(Heritrix().getCurrentStats(active))
            self.panelUpdater = threading.Timer(
                1.0, self.updateInfoPanel, [active])
            self.panelUpdater.daemon = True
            self.panelUpdater.start()

        def launchWebUI(self, button):
            self.launchWebUIButton.SetLabel(
                config.buttonLabel_heritrix_launchWebUI_launching)
            self.launchWebUIButton.Disable()
            thread.start_new_thread(self.launchWebUIAsync, ())

        def launchWebUIAsync(self):
            if not Heritrix().accessible():
                mainAppWindow.basicConfig.launchHeritrix()
            webbrowser.open_new_tab(config.uri_heritrix)
            self.launchWebUIButton.SetLabel(
                config.buttonLabel_heritrix_launchWebUI)
            self.launchWebUIButton.Enable()

        def launchHeritrixProcess(self, button):
            Heritrix().kill(None)
            time.sleep(3)
            mainAppWindow.basicConfig.launchHeritrix()

        def manageJobs(self, evt):
            # Do not show context menu without context
            if self.listbox.GetCount() == 0:
                return

            self.listbox.SetSelection(self.listbox.HitTest(evt.GetPosition()))
            self.clickedListboxItem(None)

            menu = wx.Menu()
            menu.Append(1, config.menu_forceCrawlFinish)
            menu.Bind(wx.EVT_MENU, self.forceCrawlFinish, id=1)
            menu.Append(2, config.menu_destroyJob)
            menu.Bind(wx.EVT_MENU, self.deleteHeritrixJob, id=2)
            menu.Append(3, config.menu_viewJobInWebBrowser)
            menu.Bind(wx.EVT_MENU, self.viewJobInWebBrowser, id=3)
            mainAppWindow.PopupMenu(
                menu, mainAppWindow.ScreenToClient(wx.GetMousePosition()))
            menu.Destroy()

        def finishAllCrawls(self, evt):
            for crawlId in self.listbox.GetItems():
                self.finishCrawl(crawlId)

        def finishCrawl(self, jobId):
            self.sendActionToHeritrix("terminate", jobId)
            self.sendActionToHeritrix("teardown", jobId)

        def forceCrawlFinish(self, evt):
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.finishCrawl(jobId)

        def sendActionToHeritrix(self, action, jobId):
            data = {"action": action}
            headers = {"Accept": "application/xml",
                       "Content-type": "application/x-www-form-urlencoded"}
            r = requests.post(config.uri_heritrixJob + jobId,
                              auth=HTTPDigestAuth(
                                  config.heritrixCredentials_username,
                                  config.heritrixCredentials_password),
                              data=data, headers=headers,
                              verify=False, stream=True)

        def deleteHeritrixJob(self, evt):
            jobPath = config.heritrixJobPath +\
                      str(self.listbox.GetString(self.listbox.GetSelection()))
            print('Deleting Job at ' + jobPath)
            try:
                shutil.rmtree(jobPath)
            except OSError as e:
                print('Job deletion failed.')
            self.populateListboxWithJobs()

            # Blanks details if no job entries remain in UI
            if self.listbox.GetCount() == 0:
                self.statusMsg.SetLabel("")

        def viewJobInWebBrowser(self, evt):
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            webbrowser.open_new_tab(config.uri_heritrixJob + jobId)

        def openConfigInTextEditor(self, evt):
            # TODO, most systems don't know how to open a cxml file.
            # ...Is there a way to create a system mapping from python?

            # Issue #22 prevents the context of the right-click item from
            # ...being obtained and used here.
            file = '{0}{1}/crawler-beans.cxml'.format(
                config.heritrixJobPath,
                str(self.listbox.GetString(self.listbox.GetSelection())))
            if sys.platform.startswith('darwin'):
                subprocess.call(('open', file))
            elif os.name == 'nt':
                os.startfile(file)
            elif os.name == 'posix':
                subprocess.call(('xdg-open', file))

        def restartJob(self, evt):
            # TODO: send request to API to restart job, perhaps send ID to this function
            print('Restarting job')

        def setupNewCrawl(self, evt):
            # Check if the UI elements already exist before adding them
            if hasattr(self, 'newCrawlTextCtrlLabel'):
                self.newCrawlTextCtrlLabel.Destroy()
                self.newCrawlTextCtrl.Destroy()
                self.newCrawlDepthTextCtrlLabel.Destroy()
                self.newCrawlDepthTextCtrl.Destroy()
                self.startCrawlButton.Destroy()

            self.statusMsg.Hide()

            self.newCrawlTextCtrlLabel = wx.StaticText(
                self, -1, "Enter one URI per line to crawl", pos=(135, 0))
            multiLineAndNoWrapStyle = wx.TE_MULTILINE + wx.TE_DONTWRAP
            self.newCrawlTextCtrl = \
                wx.TextCtrl(self, -1, pos=(135, 20), size=(225, 90),
                            style=multiLineAndNoWrapStyle)

            self.newCrawlDepthTextCtrlLabel = \
                wx.StaticText(self, -1, "Depth", pos=(135, 112))
            self.newCrawlDepthTextCtrl = \
                wx.TextCtrl(self, -1, pos=(180, 110), size=(40, 25))
            self.newCrawlDepthTextCtrl.SetValue("1")
            self.newCrawlDepthTextCtrl.Bind(
                wx.EVT_KILL_FOCUS, self.validateCrawlDepth)
            self.newCrawlDepthTextCtrl.Bind(
                wx.EVT_CHAR, self.handleCrawlDepthKeypress)

            # self.crawlOptionsButton = wx.Button(self, -1, "More options",
            # ...pos=(150,125))
            self.startCrawlButton = wx.Button(
                self, -1, "Start Crawl",  pos=(265, 110))
            self.startCrawlButton.SetDefault()
            self.startCrawlButton.Bind(wx.EVT_BUTTON, self.crawlURIsListed)

            self.showNewCrawlUIElements()
            self.newCrawlTextCtrl.SetFocus()

        def handleCrawlDepthKeypress(self, event):
            keycode = event.GetKeyCode()
            if keycode < 255:
                # valid ASCII
                if chr(keycode).isdigit():
                    # Valid alphanumeric character
                    event.Skip()

        def validateCrawlDepth(self, event):
            if len(self.newCrawlDepthTextCtrl.GetValue()) == 0:
                self.newCrawlDepthTextCtrl.SetValue('1')
            event.Skip()

        def hideNewCrawlUIElements(self):
            if not hasattr(self, 'newCrawlTextCtrlLabel'):
                return
            self.newCrawlTextCtrlLabel.Hide()
            self.newCrawlTextCtrl.Hide()
            self.startCrawlButton.Hide()
            self.newCrawlDepthTextCtrl.Hide()
            self.newCrawlDepthTextCtrlLabel.Hide()

        def showNewCrawlUIElements(self):
            self.newCrawlTextCtrlLabel.Show()
            self.newCrawlTextCtrl.Show()
            self.startCrawlButton.Show()

        def crawlURIsListed(self, evt):
            uris = self.newCrawlTextCtrl.GetValue().split("\n")
            depth = self.newCrawlDepthTextCtrl.GetValue()
            self.hJob = HeritrixJob(config.heritrixJobPath, uris, depth)
            self.hJob.write()
            self.populateListboxWithJobs()

            if not Heritrix().accessible():
                mainAppWindow.basicConfig.launchHeritrix()

            self.hJob.buildHeritrixJob()
            self.hJob.launchHeritrixJob()

    class MiscellaneousPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            viewArchivesFolderButtonButton = wx.Button(
                self, 1, config.buttonLabel_viewArchiveFiles)

            viewArchivesFolderButtonButton.Bind(
                wx.EVT_BUTTON, self.openArchivesFolder)
            self.testUpdate = wx.Button(
                self, 1, "Check for Updates")

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(viewArchivesFolderButtonButton, 0, wx.EXPAND, 0)
            box.Add(self.testUpdate, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

            self.testUpdate.Bind(wx.EVT_BUTTON, self.checkForUpdates)
            self.testUpdate.Disable()

        def openArchivesFolder(self, button):
            if not os.path.exists(config.warcsFolder):
                os.makedirs(config.warcsFolder)

            if sys.platform.startswith('win32'):
                os.startfile(config.warcsFolder)
            else:
                subprocess.call(["open", config.warcsFolder])

        def checkForUpdates(self, button):
            updateWindow = UpdateSoftwareWindow(parent=self, id=-1)
            updateWindow.Show()
            # return
            # check if an updates version is available

            # if an updated version is available and the user wants it,
            # ...copy the /Application/WAIL.app/Contents folder

    def __init__(self, parent):
        wx.Panel.__init__(self, parent)

        self.Notebook = wx.Notebook(self)
        vbox = wx.BoxSizer(wx.VERTICAL)
        vbox.Add(self.Notebook, 10, flag=wx.EXPAND)

        self.SetSizer(vbox)

        self.servicesPanel = WAILGUIFrame_Advanced.ServicesPanel(self.Notebook)
        self.waybackPanel = WAILGUIFrame_Advanced.WaybackPanel(self.Notebook)
        self.heritrixPanel = WAILGUIFrame_Advanced.HeritrixPanel(self.Notebook)
        self.miscellaneousPanel = WAILGUIFrame_Advanced.MiscellaneousPanel(self.Notebook)

        self.Notebook.AddPage(self.servicesPanel, config.tabLabel_advanced_services)
        self.Notebook.AddPage(self.waybackPanel, config.tabLabel_advanced_wayback)
        self.Notebook.AddPage(self.heritrixPanel, config.tabLabel_advanced_heritrix)
        self.Notebook.AddPage(self.miscellaneousPanel, config.tabLabel_advanced_miscellaneous)

        self.x, self.y = (15, 5)
        bsize = self.width, self.height = (150, 25*.80)

    def tomcatMessageOff(self):
        # self.tomcatStatus.SetLabel(msg_waybackDisabled)
        self.tomcatStatus.SetForegroundColour((255, 0, 0))
        self.startTomcatButton.SetLabel(self.startTomcatLabel)

    def tomcatMessageOn(self):
        # self.tomcatStatus.SetLabel(msg_waybackEnabled)
        self.tomcatStatus.SetForegroundColour((0, 200, 0))
        self.startTomcatButton.SetLabel(self.stopTomcatLabel)

    def startTomcat(self, button):
        # self.tomcatStatus.SetLabel(msg_startingTomcat)
        cmd = config.tomcatPathStart
        ret = subprocess.Popen(cmd)
        waitingForTomcat = True
        while waitingForTomcat:
            if Wayback().accessible():
                waitingForTomcat = False
            time.sleep(2)

        self.waybackPanel.viewWaybackInBrowserButton.Enable()  # TODO: error here
        # self.tomcatMessageOn()

    # toggleTomcat needs to be broken up into start and stop Tomcat function,
    # ...already done above

    def toggleTomcat(self, button, suppressAlert=False):  # Optimize me, Seymour
        cmd = ""

        if self.startTomcatButton.GetLabel() == self.startTomcatLabel:
            self.tomcatStatus.SetLabel(config.msg_startingTomcat)
            cmd = config.tomcatPathStart
            ret = subprocess.Popen(cmd)
            waitingForTomcat = True
            while waitingForTomcat:
                if Wayback.accessible(): waitingForTomcat = False
                time.sleep(2)
            self.viewWaybackInBrowserButton.Enable()
            # self.tomcatMessageOn()
        else:
            self.tomcatStatus.SetLabel(config.msg_stoppingTomcat)
            cmd = config.tomcatPathStop
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
                if not suppressAlert:
                    message = wx.MessageBox("Tomcat could not be stopped", "Command Failed")
                # self.tomcatMessageOn()

    def launchHeritrix(self, button):
        # self.heritrixStatus.SetLabel("Launching Heritrix")
        cmd = '{0} -a {1}:{2}'.format(
            config.heritrixBinPath, config.heritrixCredentials_username,
            config.heritrixCredentials_password)

        # TODO: shell=True was added for OS X
        # ...verify that functionality persists on Win64
        ret = subprocess.Popen(cmd, shell=True)
        # urlib won't respond to https, hard-coded sleep until I
        # ...can ping like Tomcat
        time.sleep(6)
        self.viewHeritrixButton.Enable()

    def viewWayback(self, button):
        webbrowser.open_new_tab(config.uri_wayback)

    def viewHeritrix(self, button):
        webbrowser.open_new_tab(config.uri_heritrix)

    def createListBox(self):

        self.uriListBoxTitle = wx.StaticText(
            self, 7, 'URIs to Crawl:', (self.x, 5 + self.height * 7 + 30))
        self.uriListBox = wx.ListBox(self, 99,
                                     (self.x, 5 + self.height * 8 + 25),
                                     (400 - 50, 100), [""])
        self.uriListBox.Bind(wx.EVT_LISTBOX, self.addURI)
        self.SetSize((self.GetSize().x, self.GetSize().y+300))
        self.archiveViewGroup.SetSize((self.archiveViewGroup.GetSize().x, 235))
        mainAppWindow.SetSize((mainAppWindow.GetSize().x, 400))

    def setupOneOffCrawl(self, button):
        if self.uriListBox is not None:
            return  # This function has already been done
        self.createListBox()

        self.writeConfig = wx.Button(self, 33, "Write Heritrix Config",
                                     (self.GetSize().x-175, 280),
                                     (self.width, self.height))

        wail_style_button_font = wx.Font(config.fontSize, wx.SWISS,
                                         wx.NORMAL, wx.NORMAL)

        self.writeConfig.SetFont(wail_style_button_font)
        self.writeConfig.Bind(wx.EVT_BUTTON, self.crawlURIs)
        self.writeConfig.Disable()
        self.launchCrawlButton = wx.Button(self, 33, "Launch Crawl",
                                           (self.GetSize().x-175, 305),
                                           (self.width, self.height))
        self.launchCrawlButton.SetFont(wail_style_button_font)
        self.launchCrawlButton.Bind(wx.EVT_BUTTON, self.launchCrawl)
        self.launchCrawlButton.Disable()

    def crawlURIs(self, button):
        uris = self.uriListBox.GetStrings()
        self.hJob = HeritrixJob(config.heritrixJobPath, uris)
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
            defaultMessage = self.uriListBox.GetString(
                self.uriListBox.GetSelection())
        except:
            defaultMessage = ""
        message = wx.GetTextFromUser("Enter a URI to be crawled",
                                     default_value=defaultMessage)
        if message == "" and message == defaultMessage:
            return
        url = urlparse(message)
        self.uriListBox.InsertItems([url.geturl()], 0)
        self.writeConfig.Enable()


class Service():
    uri = None  # TODO: update to use @abstractmethod + @property

    def accessible(self):
        chkMsg = 'Checking access to {0} at {1}'.format(
            self.__class__.__name__, self.uri)
        print(chkMsg)

        try:
            handle = urlopen(self.uri, None, 3)
            print(self.__class__.__name__ + ' is a go! ')
            return True
        except IOError as e:
            if hasattr(e, 'code'):  # HTTPError
                print(self.__class__.__name__ + ' Pseudo-Success in accessing ' + self.uri)
                return True

            print('Service: Failed to access {0} service at {1}'.format(
                self.__class__.__name__, self.uri
            ))
            return False
        except:
            print(('Some other error occurred trying '
                   'to check service accessibility.'))
            return False


class Wayback(Service):
    uri = config.uri_wayback

    def fix(self, button, *cb):
        thread.start_new_thread(self.fixAsync, cb)

    def accessible(self):
        try:
            handle = urlopen(self.uri, None, 3)

            accessible = 'http://mementoweb.org/terms/donotnegotiate' in handle.info().dict['link']
            if accessible:
                print(self.__class__.__name__ + ' is a go! ')
            else:
                print('Unable to access {0}, something else is running on port 8080'.format(
                    self.__class__.__name__))

            return accessible

        except Exception as e:
            print('Wayback(): Failed to access {0} service at {1}'.format(
                self.__class__.__name__, self.uri
            ))
            return False

    def fixAsync(self, cb=None):
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses("wayback", "FIXING")
        cmd = config.tomcatPathStart
        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, button):
        thread.start_new_thread(self.killAsync, ())

    def killAsync(self):
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses(
            "wayback", "KILLING")
        cmd = config.tomcatPathStop
        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)

    def index(self):
        self.generatePathIndex()
        self.generateCDX()

    def generatePathIndex(self):
        wailPath = '/Applications/WAIL.app'
        if 'darwin' not in sys.platform:
            wailPath = 'C:\wail'

        dest = wailPath + "/config/path-index.txt"
        warcsPath = wailPath + "/archives/"

        outputContents = ""
        for file in listdir(warcsPath):
            if file.endswith(".warc"):
                outputContents += file + "\t" + join(warcsPath, file) + "\n"

        print('Writing path-index.txt file...', end='')
        pathIndexFile = open(dest, "w")
        pathIndexFile.write(outputContents)
        pathIndexFile.close()
        print('COMPLETE')

    def generateCDX(self):
        print('CDX: ', end='')
        wailRoot = '/Applications/WAIL.app'
        if 'darwin' not in sys.platform:
            wailRoot = 'C:\wail'
        dest = wailRoot + "/config/path-index.txt"
        warcsPath = wailRoot + "/archives/"
        cdxFilePathPre = wailRoot + "/archiveIndexes/"
        cdxIndexerPath = '{0}{1}'.format(
            wailRoot, "/bundledApps/tomcat/webapps/bin/cdx-indexer")

        outputContents = ""
        print('generating ', end='')
        for file in listdir(warcsPath):
            if file.endswith(".warc"):
                cdxFilePath = cdxFilePathPre + file.replace('.warc', '.cdx')
                process = subprocess.Popen(
                    [cdxIndexerPath, join(warcsPath, file), cdxFilePath],
                    stdout=PIPE, stderr=PIPE)
                stdout, stderr = process.communicate()

        # Combine CDX files
        print('combining ', end='')
        allCDXesPath = wailRoot + "/archiveIndexes/*.cdx"

        filenames = glob.glob(allCDXesPath)
        cdxHeaderIncluded = False
        print('merging ', end='')

        # Is cdxt the right filename?
        unsortedPath = wailRoot + '/archiveIndexes/combined_unsorted.cdxt'

        with open(unsortedPath, 'w') as outfile:
            for fname in filenames:
                with open(fname) as infile:
                    for i, line in enumerate(infile):
                        if i > 0:
                            outfile.write(line)
                        elif not cdxHeaderIncluded:
                            # Only include first CDX header
                            outfile.write(line)
                            cdxHeaderIncluded = True
        print('cleaning ', end='')
        filelist = glob.glob(allCDXesPath)
        for f in filelist:
            os.remove(f)

        cdxTemp = wailRoot + "/archiveIndexes/combined_unsorted.cdxt"
        cdxFinal = wailRoot + "/archiveIndexes/index.cdx"
        # TODO: fix cdx sorting in Windows #281
        # if 'darwin' in sys.platform:
        print('sorting ', end='')
        # os.system("export LC_ALL=C; sort -u " + cdxTemp + " > " + cdxFinal)

        with open(cdxTemp, 'r') as tempFile:
            with open(cdxFinal, 'w') as finalFile:
                locale.setlocale(locale.LC_ALL, "C")
                entries = tempFile.readlines()
                entries = list(set(entries))  # uniq
                entries.sort(key=functools.cmp_to_key(locale.strcoll))
                for entry in entries:
                    finalFile.write(entry)

        os.remove(cdxTemp)
        print('DONE!')

        # Queue next iteration of indexing
        if mainAppWindow.indexingTimer:
            mainAppWindow.indexingTimer.cancel()
        mainAppWindow.indexingTimer = threading.Timer(INDEX_TIMER_SECONDS, Wayback().index)
        mainAppWindow.indexingTimer.daemon = True
        mainAppWindow.indexingTimer.start()


class Tomcat(Service):
    uri = config.uri_wayback

    def accessible(self):
        return Wayback().accessible()


class Heritrix(Service):
    uri = "https://{0}:{1}".format(config.host_crawler, config.port_crawler)

    def getListOfJobs(self):
        def justFile(fullPath):
            return os.path.basename(fullPath)

        return list(map(justFile, glob.glob(os.path.join(config.heritrixJobPath, '*'))))
    ''' # getListOfJobs - rewrite to use the Heritrix API, will need to parse XML
        -H "Accept: application/xml"
        # replicate curl -v -d "action=rescan" -k -u lorem:ipsum --anyauth
        --location -H "Accept: application/xml" https://0.0.0.0:8443/engine
    '''

    def getJobLaunches(self, jobId):
        jobPath = config.heritrixJobPath + jobId
        return [f for f in os.listdir(config.heritrixJobPath + jobId) if re.search(r'^[0-9]+$', f)]

    def getCurrentStats(self, jobId):
        launches = self.getJobLaunches(jobId)
        ret = ""
        status = ""
        statusTemplate = Template('JobID: $jobId\n$status')

        if len(launches) == 0:
            status = "   NOT BUILT"

        for launch in launches:
            progressLogFilePath = "{0}{1}/{2}/{3}".format(
                config.heritrixJobPath, jobId, launch,
                "logs/progress-statistics.log")
            lastLine = util.tail(progressLogFilePath)

            ll = lastLine[0].replace(" ", "|")
            logData = re.sub(r'[|]+', '|', ll).split("|")
            timeStamp, discovered, queued, downloaded = logData[0:4]

            try:  # Check if crawl is running by assuming scraped stats are ints
                int(discovered)
                status = "   {}: {}\n   {}: {}\n   {}: {}\n".format(
                    'Discovered', discovered,
                    'Queued', queued,
                    'Downloaded', downloaded)
            except ValueError:
                # Job is being built or completed
                # TODO: Show more stats
                if discovered == "CRAWL":
                    if queued == "ENDED":
                        status = "   ENDED"
                    elif queued == "RUNNING":
                        status = "   INITIALIZING"
                    elif queued == "ENDING":
                        status = "   ENDING"
                    elif queued == "EMPTY":
                        status = "   EMPTY, ENDING"
                else:  # Show unknown status for debugging
                    status = "   UNKNOWN" + discovered + queued

        return statusTemplate.safe_substitute(jobId=jobId, status=status)

    def fix(self, button, *cb):
        thread.start_new_thread(self.fixAsync, cb)

    def fixAsync(self, cb=None):
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses("heritrix", "FIXING")
        mainAppWindow.basicConfig.launchHeritrix()
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, button):
        thread.start_new_thread(self.killAsync, ())

    def killAsync(self):
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses("heritrix", "KILLING")
        # Ideally, the Heritrix API would have support for this. This will have to do. Won't work in Wintel
        cmd = """ps ax | grep 'heritrix' | grep -v grep | awk '{print "kill -9 " $1}' | sh"""
        print('Trying to kill Heritrix...')
        ret = subprocess.Popen(cmd, stderr=subprocess.STDOUT, shell=True)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)


class UpdateSoftwareWindow(wx.Frame):
    panels = ()
    updateJSONData = ''
    currentVersion_wail = "0.2015.10.11"
    latestVersion_wail = "0.2015.12.25"
    currentVersion_heritrix = ""
    latestVersion_heritrix = ""
    currentVersion_wayback = ""
    latestVersion_wayback = ""

    def updateWAIL(self, button):
        print('Downloading ' + self.updateJSONData['wail-core']['uri'])
        wailcorefile = urlopen(self.updateJSONData['wail-core']['uri'])
        output = open('/Applications/WAIL.app/support/temp.tar.gz', 'wb')
        output.write(wailcorefile.read())
        output.close()
        print('Done downloading WAIL update, backing up.')

        try:
            util.copyanything("/Applications/WAIL.app/Contents/",
                              "/Applications/WAIL.app/Contents_bkp/")
            print('Done backing up. Nuking obsolete version.')
        except:
            print('Back up previously done, continuing.')

        shutil.rmtree("/Applications/WAIL.app/Contents/")
        print('Done nuking, decompressing update.')

        tar = tarfile.open("/Applications/WAIL.app/support/temp.tar.gz")
        tar.extractall('/Applications/WAIL.app/')
        tar.close()
        print('Done, restart now.')
        os.system("defaults read /Applications/WAIL.app/Contents/Info.plist > /dev/null")
        # TODO: flush Info.plist cache
        # (cmd involving defaults within this py script)

    def fetchCurrentVersionsFile(self):
        self.srcURI = "http://matkelly.com/wail/update.json"
        f = urlopen(self.srcURI).read()
        data = f
        self.updateJSONData = json.loads(data)

    def setVersionsInPanel(self):
        self.currentVersion_wail = config.WAIL_VERSION
        self.latestVersion_wail = self.updateJSONData['wail-core']['version']
        self.currentVersion_heritrix = self.getHeritrixVersion()
        self.currentVersion_wayback = self.getWaybackVersion()

        packages = self.updateJSONData['packages']
        for package in packages:
            if package['name'] == 'heritrix-wail':
                self.latestVersion_heritrix = package['version']
            elif package['name'] == 'openwayback-wail':
                self.latestVersion_wayback = package['version']

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    def getHeritrixVersion(self):
        for file in os.listdir(config.heritrixPath + "lib/"):
            if file.startswith("heritrix-commons"):
                regex = re.compile("commons-(.*)\.")
                return regex.findall(file)[0]

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    def getWaybackVersion(self):
        for file in os.listdir(config.tomcatPath + "/webapps/lib/"):
            if file.startswith("openwayback-core"):
                regex = re.compile("core-(.*)\.")
                return regex.findall(file)[0]

    # TODO: move layout management to responsibility of sub-panels, UNUSED now
    class UpdateSoftwarePanel(wx.Frame):
        panelTitle = ''
        panelSize = (390, 90)
        panelPosition = ()
        panelLogoPath = ''

        def __init__(self, parent, panelI, indexInPanel=0, panelTitle=''):
            self.panelPosition = (5, 10*85*panelI)
            self.panelTitle = panelTitle
            self.parent = parent

        def draw(self):
            # TODO: draw icon
            pass

            self.panel = wx.StaticBox(
                self.parent, -1, self.panelTitle,
                size=self.panelSize, pos=self.panelPosition)
            box = wx.StaticBoxSizer(self.panel, wx.VERTICAL)

    def __init__(self, parent, id):
        self.fetchCurrentVersionsFile()
        self.setVersionsInPanel()

        wx.Frame.__init__(self, parent, id, 'Update WAIL', size=(400, 300),
                          style=(wx.FRAME_FLOAT_ON_PARENT | wx.CLOSE_BOX))
        wx.Frame.CenterOnScreen(self)
        # self.refresh = wx.Button(self, -1, buttonLabel_refresh,
        # pos=(0, 0), size=(0,20))

        updateFrameIcons_pos_left = 15
        updateFrameIcons_pos_top = (25, 110, 195)

        updateFrameText_version_pos_tops1 = (updateFrameIcons_pos_top[0] + 5,
                                             updateFrameIcons_pos_top[0] + 22)
        updateFrameText_version_title_pos1 = (
            (80, updateFrameText_version_pos_tops1[0]),
            (80, updateFrameText_version_pos_tops1[1]))
        updateFrameText_version_value_pos1 = (
            (180, updateFrameText_version_pos_tops1[0]),
            (180, updateFrameText_version_pos_tops1[1]))

        updateFrameText_version_pos_tops2 = (updateFrameIcons_pos_top[1],
                                             updateFrameIcons_pos_top[1] + 17)
        updateFrameText_version_title_pos2 = (
            (80, updateFrameText_version_pos_tops2[0]),
            (80, updateFrameText_version_pos_tops2[1]))
        updateFrameText_version_value_pos2 = (
            (180, updateFrameText_version_pos_tops2[0]),
            (180, updateFrameText_version_pos_tops2[1]))

        updateFrameText_version_pos_tops3 = (updateFrameIcons_pos_top[2],
                                             updateFrameIcons_pos_top[2] + 17)
        updateFrameText_version_title_pos3 = (
            (80, updateFrameText_version_pos_tops3[0]),
            (80, updateFrameText_version_pos_tops3[1]))
        updateFrameText_version_value_pos3 = (
            (180, updateFrameText_version_pos_tops3[0]),
            (180, updateFrameText_version_pos_tops3[1]))

        updateFrameText_version_size = (100, 100)

        # TODO: Akin to #293, update this icon w/ new version
        #  Need to generate a 64px version for this.
        iconPath = config.wailPath + '/build/icons/'
        updateFrame_panels_icons = (iconPath + 'whaleLogo_64.png',
                                    iconPath + 'heritrixLogo_64.png',
                                    icongPath + 'openWaybackLogo_64.png')
        updateFrame_panels_titles = ('WAIL Core', 'Preservation', 'Replay')
        updateFrame_panels_size = (390, 90)

        updateFrame_panels_pos = ((5, 10), (5, 95), (5, 180))

        # wailPanel = self.UpdateSoftwarePanel(self, 0, 0, 'WAIL')
        # wailPanel.draw()
        self.panel_wail = wx.StaticBox(
            self, 1, updateFrame_panels_titles[0],
            size=updateFrame_panels_size, pos=updateFrame_panels_pos[0])
        box1 = wx.StaticBoxSizer(self.panel_wail, wx.VERTICAL)

        self.panel_preservation = wx.StaticBox(
            self, 1, updateFrame_panels_titles[1],
            size=updateFrame_panels_size, pos=updateFrame_panels_pos[1])
        box2 = wx.StaticBoxSizer(self.panel_preservation, wx.VERTICAL)

        self.panel_replay = wx.StaticBox(self, 1, updateFrame_panels_titles[2],
                                         size=updateFrame_panels_size,
                                         pos=updateFrame_panels_pos[2])
        box3 = wx.StaticBoxSizer(self.panel_replay, wx.VERTICAL)

        # Panel 1
        wx.StaticText(self, 100, "Current Version:",
                      updateFrameText_version_title_pos1[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, "Latest Version:",
                      updateFrameText_version_title_pos1[1],
                      updateFrameText_version_size)

        wx.StaticText(self, 100,
                      self.currentVersion_wail,
                      updateFrameText_version_value_pos1[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, self.latestVersion_wail,
                      updateFrameText_version_value_pos1[1],
                      updateFrameText_version_size)

        # Panel 2
        wx.StaticText(self, 100, "Current Version:",
                      updateFrameText_version_title_pos2[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, "Latest Version:",
                      updateFrameText_version_title_pos2[1],
                      updateFrameText_version_size)

        wx.StaticText(self, 100, self.currentVersion_heritrix,
                      updateFrameText_version_value_pos2[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, self.latestVersion_heritrix,
                      updateFrameText_version_value_pos2[1],
                      updateFrameText_version_size)

        # Panel 3
        wx.StaticText(self, 100, "Current Version:",
                      updateFrameText_version_title_pos3[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, "Latest Version:",
                      updateFrameText_version_title_pos3[1],
                      updateFrameText_version_size)

        wx.StaticText(self, 100, self.currentVersion_wayback,
                      updateFrameText_version_value_pos3[0],
                      updateFrameText_version_size)
        wx.StaticText(self, 100, self.latestVersion_wayback,
                      updateFrameText_version_value_pos3[1],
                      updateFrameText_version_size)

        self.updateButton_wail = \
            wx.Button(self, 3, "Update",
                      pos=(305, updateFrameIcons_pos_top[0]),
                      size=(75, 20))
        self.updateButton_heritrix = \
            wx.Button(self, 3, "Update",
                      pos=(305, updateFrameIcons_pos_top[1]),
                      size=(75, 20))
        self.updateButton_wayback = \
            wx.Button(self, 3, "Update",
                      pos=(305, updateFrameIcons_pos_top[2]),
                      size=(75, 20))

        self.updateButton_wail.Bind(wx.EVT_BUTTON, self.updateWAIL)

        if self.currentVersion_wail == self.latestVersion_wail:
            self.updateButton_wail.Disable()
        if self.currentVersion_wayback == self.latestVersion_wayback:
            self.updateButton_wayback.Disable()
        if self.currentVersion_heritrix == self.latestVersion_heritrix:
            self.updateButton_heritrix.Disable()

        img = wx.Image(updateFrame_panels_icons[0],
                       wx.BITMAP_TYPE_ANY).ConvertToBitmap()
        wx.StaticBitmap(
            self, -1, img,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[0]),
            (img.GetWidth(), img.GetHeight()))

        heritrix_64 = wx.Image(
            updateFrame_panels_icons[1],
            wx.BITMAP_TYPE_ANY).ConvertToBitmap()
        wx.StaticBitmap(
            self, -1, heritrix_64,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[1]),
            (heritrix_64.GetWidth(), heritrix_64.GetHeight()))

        openwayback_64 = wx.Image(
            updateFrame_panels_icons[2],
            wx.BITMAP_TYPE_ANY).ConvertToBitmap()
        wx.StaticBitmap(
            self, -1, openwayback_64,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[2]),
            (openwayback_64.GetWidth(), openwayback_64.GetHeight()))


mainAppWindow = None

if __name__ == "__main__":
    # if len(sys.argv) > 1:
    #   '''A WARC file was drag-and-dropped onto WAIL'''
    #   print "WAIL was launched with file parameters."
    # else:
    #   print "WAIL was launched without any file parameters."
    # requests.packages. urllib3.disable_warnings()

    app = wx.App(redirect=False)
    mainAppWindow = TabController()
    mainAppWindow.ensureCorrectInstallation()
    mainAppWindow.Show()

    # Start indexer
    # Wayback().index()

    app.MainLoop()
