#!/usr/bin/env python
# coding: utf-8

# Web Archiving Integration Layer (WAIL)
#  This tool ties together web archiving applications including Wayback,
#   Heritrix, and Tomcat.
#  Mat Kelly <wail@matkelly.com> 2013

from __future__ import print_function

import wx
import subprocess
import webbrowser
import os
import time
import sys
import locale
import functools

# from ntfy.backends.default import notify

import hashlib
from string import Template  # Py3.6+

from six.moves.urllib.request import urlopen
from six.moves.urllib.parse import urlparse
from six.moves.urllib.error import HTTPError

try:  # Py3
    import _thread as thread  # For a more responsive UI
except ImportError:  # Py2
    import thread  # For a more responsive UI

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
from subprocess import Popen, PIPE

# For a more asynchronous UI, esp with accessible()s
from multiprocessing import Pool as Thread
import logging
import requests
import threading  # Necessary for polling/indexing

from requests.auth import HTTPDigestAuth

from os import listdir
from os.path import join
import tarfile  # For updater

ssl._create_default_https_context = ssl._create_unverified_context


#  from pync import Notifier # OS X notifications

###############################
# Tab Controller (Notebook)
###############################


class TabController(wx.Frame):
    def __init__(self):
        wx.Frame.__init__(
            self,
            None,
            title=config.groupLabel_window,
            size=config.wailWindowSize,
            style=config.wailWindowStyle,
        )
        panel = wx.Panel(self)
        vbox = wx.BoxSizer(wx.VERTICAL)
        wx.Frame.Center(self)

        self.notebook = wx.Notebook(panel)
        self.notebook.parent = self
        vbox.Add(self.notebook, 2, flag=wx.EXPAND)

        panel.SetSizer(vbox)

        self.statusbar = self.CreateStatusBar()

        # Add basic config page/tab
        self.basicConfig = WAILGUIFrame_Basic(self.notebook)
        self.notebook.AddPage(self.basicConfig, config.tabLabel_basic)

        # Add advanced config page/tab
        self.advConfig = WAILGUIFrame_Advanced(self.notebook)
        self.notebook.AddPage(self.advConfig, config.tabLabel_advanced)
        self.createMenu()


        self.indexingTimer = threading.Timer(
            config.index_timer_seconds, Wayback().index
        )
        self.indexingTimer.daemon = True
        self.indexingTimer.start()

    def createMenu(self):
        """Configure, initialize, and attach application menus"""
        menu_bar = wx.MenuBar()

        file_menu = wx.Menu()
        edit_menu = wx.Menu()
        view_menu = wx.Menu()
        window_menu = wx.Menu()
        help_menu = wx.Menu()

        file_newcrawl = self.addMenuItem(
            file_menu, config.menuTitle_file_newCrawl, "CTRL+N"
        )
        self.Bind(wx.EVT_MENU, self.setupNewCrawlFromMenu, file_newcrawl)

        file_allcrawls = wx.Menu()
        file_allcrawls_finish = self.addMenuItem(
            file_allcrawls, config.menuTitle_file_allCrawls_finish
        )
        file_allcrawls_pauseUnpause = self.addMenuItem(
            file_allcrawls, config.menuTitle_file_allCrawls_pause
        )
        file_allcrawls_restart = self.addMenuItem(
            file_allcrawls, config.menuTitle_file_allCrawls_restart
        )
        file_allcrawls.AppendSeparator()
        file_allcrawls_destroy = self.addMenuItem(
            file_allcrawls, config.menuTitle_file_allCrawls_destroy
        )

        file_menu.AppendSeparator()
        file_menu.AppendSubMenu(file_allcrawls,
                                config.menuTitle_file_allCrawls)

        self.Bind(
            wx.EVT_MENU,
            self.advConfig.heritrixPanel.finishAllCrawls,
            file_allcrawls_finish,
        )

        edit_undo = self.addMenuItem(edit_menu, config.menuTitle_edit_undo,
                                     "CTRL+Z")
        edit_redo = self.addMenuItem(edit_menu, config.menuTitle_edit_redo,
                                     "CTRL+Y")
        edit_menu.AppendSeparator()
        edit_cut = self.addMenuItem(edit_menu, config.menuTitle_edit_cut,
                                    "CTRL+X")
        edit_copy = self.addMenuItem(edit_menu, config.menuTitle_edit_copy,
                                     "CTRL+C")
        edit_paste = self.addMenuItem(edit_menu, config.menuTitle_edit_paste,
                                      "CTRL+V")
        edit_selectall = self.addMenuItem(
            edit_menu, config.menuTitle_edit_selectAll, "CTRL+A"
        )

        # Disable Edit menu items until implemented
        edit_undo.Enable(0)
        edit_redo.Enable(0)
        edit_cut.Enable(0)
        edit_copy.Enable(0)
        edit_paste.Enable(0)
        edit_selectall.Enable(0)

        edit_undo.Enable(0)

        # self.Bind(wx.EVT_MENU, self.undo, self.edit_undo)
        # self.Bind(wx.EVT_MENU, self.redo, self.edit_redo)
        # self.Bind(wx.EVT_MENU, self.cut, self.edit_cut)
        # self.Bind(wx.EVT_MENU, self.copy, self.edit_copy)
        # self.Bind(wx.EVT_MENU, self.paste, self.edit_paste)
        # self.Bind(wx.EVT_MENU, self.selectall, self.edit_selectall)

        viewBasic = self.addMenuItem(
            view_menu, config.menuTitle_view_viewBasic, "CTRL+0"
        )
        view_menu.AppendSeparator()
        adv = self.addMenuItem(view_menu, config.menuTitle_view_viewAdvanced)
        adv.Enable(0)

        viewServices = self.addMenuItem(
            view_menu, config.menuTitle_view_viewAdvanced_services, "CTRL+1"
        )
        viewWayback = self.addMenuItem(
            view_menu, config.menuTitle_view_viewAdvanced_wayback, "CTRL+2"
        )
        viewHeritrix = self.addMenuItem(
            view_menu, config.menuTitle_view_viewAdvanced_heritrix, "CTRL+3"
        )
        viewMiscellaneous = self.addMenuItem(
            view_menu, config.menuTitle_view_viewAdvanced_miscellaneous,
            "CTRL+4"
        )

        windowWail = window_menu.AppendCheckItem(
            wx.ID_ANY, config.menuTitle_window_wail
        )
        windowWail.Check()  # Initially check menu item

        # Prevent from being unchecked
        self.Bind(wx.EVT_MENU, lambda evt: windowWail.Check(True), windowWail)

        helpPreferences = help_menu.Append(wx.ID_PREFERENCES,
                                           "Preferences...\tCTRL+,")
        helpPreferences.Enable(0)  # TODO: implement

        if util.is_macOS():  # About at top
            help_menu.Prepend(wx.ID_ABOUT, config.menuTitle_about)
        elif util.is_windows():  # About as last entry
            help_menu.Append(wx.ID_ABOUT, config.menuTitle_about)

        if util.is_macOS():  # TODO: verify if wx.ID_EXIT would work better
            help_menu.Append(wx.ID_EXIT, "&QUIT")
        elif util.is_windows():
            file_menu.Append(wx.ID_EXIT, "&Exit")

        menu_bar.Append(file_menu, config.menuTitle_file)
        menu_bar.Append(edit_menu, config.menuTitle_edit)
        menu_bar.Append(view_menu, config.menuTitle_view)
        menu_bar.Append(window_menu, config.menuTitle_window)
        menu_bar.Append(help_menu, config.menuTitle_help)

        self.Bind(wx.EVT_MENU, self.displayAboutMenu, id=wx.ID_ABOUT)
        self.Bind(wx.EVT_MENU, self.quit, id=wx.ID_EXIT)

        # Menu events
        self.Bind(
            wx.EVT_MENU,
            lambda evt, basicTab=True: self.displayTab(basicTab=basicTab),
            viewBasic,
        )

        self.bindMenu(config.menuTitle_view_viewAdvanced_services,
                      viewServices)
        self.bindMenu(config.menuTitle_view_viewAdvanced_wayback, viewWayback)
        self.bindMenu(config.menuTitle_view_viewAdvanced_heritrix,
                      viewHeritrix)
        self.bindMenu(
            config.menuTitle_view_viewAdvanced_miscellaneous, viewMiscellaneous
        )

        # Fix Quit menuitem capitalization
        wailMenu = menu_bar.OSXGetAppleMenu()
        if wailMenu is not None:
            for m in wailMenu.GetMenuItems():
                if m.GetId() == wx.ID_EXIT:
                    m.SetItemLabel("Quit WAIL\tCTRL+Q")

        self.SetMenuBar(menu_bar)

    def addMenuItem(self, parentMenu, itemText, shortCut=""):
        sep = "\t"
        if shortCut == "":
            sep = ""
        return parentMenu.Append(wx.ID_ANY,
                                 "{0}{1}{2}".format(itemText, sep, shortCut))

    def bindMenu(self, title, menu):
        self.Bind(wx.EVT_MENU, lambda evt, t=title: self.displayTab(t), menu)

    def displayTab(self, tableTitle="Basic", basicTab=False):
        """Change tab currently shown in the UI"""
        if basicTab:
            self.Notebook.SetSelection(0)
            return

        self.Notebook.SetSelection(1)

        pages = {
            config.menuTitle_view_viewAdvanced_services: 0,
            config.menuTitle_view_viewAdvanced_wayback: 1,
            config.menuTitle_view_viewAdvanced_heritrix: 2,
            config.menuTitle_view_viewAdvanced_miscellaneous: 3,
        }
        self.advConfig.Notebook.SetSelection(pages[tableTitle])

    def setupNewCrawlFromMenu(self, menu):
        """Change view to Advanced Crawl, display URI textbox"""
        self.displayTab(config.menuTitle_view_viewAdvanced_heritrix)
        self.advConfig.heritrixPanel.setupNewCrawl(None)

    def displayAboutMenu(self, button):
        """Show new window with application information"""
        info = wx.adv.AboutDialogInfo()
        info.SetName(config.aboutWindow_appName)
        info.SetVersion("v. " + config.WAIL_VERSION)
        info.SetCopyright(config.aboutWindow_author)

        wx.adv.AboutBox(info)

    def ensureCorrectInstallation(self):
        """Verify installation location"""
        # TODO: properly implement this
        # Check that the file is being executed from the correct location
        currentPath = os.path.dirname(os.path.abspath(__file__))
        if util.is_macOS() and currentPath != "/Applications":
            # Alert the user to move the file. Exit the program
            wx.MessageBox(
                config.msg_wrongLocation_body + currentPath,
                config.msg_wrongLocation_title,
            )
            print(config.msg_wrongLocation_body + currentPath)

    def quit(self, button):
        """Exit the application"""
        if mainAppWindow.indexingTimer:
            mainAppWindow.indexingTimer.cancel()
        sys.exit(1)  # Be a good citizen. Cleanup your memory footprint


class WAILGUIFrame_Basic(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        self.parent = parent

        # Forces Windows into composite mode for drawing
        self.SetDoubleBuffered(True)

        self.uri = wx.TextCtrl(self, wx.ID_ANY,
                               value=config.textLabel_defaultURI)

        basicSizer = wx.BoxSizer(wx.VERTICAL)
        basicSizer_URI = wx.BoxSizer()
        basicSizer_buttons = wx.BoxSizer()
        basicSizer_messages = wx.BoxSizer()

        basicSizer_URI.Add(
            wx.StaticText(self, wx.ID_ANY, config.buttonLabel_uri),
            flag=wx.CENTER
        )
        basicSizer_URI.Add(self.uri, proportion=1, flag=wx.CENTER)

        self.archiveNowButton = wx.Button(
            self, wx.ID_ANY, config.buttonLabel_archiveNow
        )
        self.checkArchiveStatus = wx.Button(
            self, wx.ID_ANY, config.buttonLabel_checkStatus
        )
        self.viewArchive = wx.Button(self, wx.ID_ANY,
                                     config.buttonLabel_viewArchive)

        basicSizer_buttons.Add(self.viewArchive, proportion=1, flag=wx.CENTER)
        basicSizer_buttons.AddStretchSpacer()
        basicSizer_buttons.Add(self.checkArchiveStatus, proportion=1,
                               flag=wx.CENTER)
        basicSizer_buttons.AddStretchSpacer()
        basicSizer_buttons.Add(self.archiveNowButton, proportion=1,
                               flag=wx.CENTER)

        self.status = wx.StaticText(self, wx.ID_ANY,
                                    config.textLabel_statusInit)

        basicSizer.Add(basicSizer_URI, proportion=0, flag=wx.EXPAND)
        basicSizer.AddSpacer(3)
        basicSizer.Add(basicSizer_buttons, proportion=0, flag=wx.EXPAND)
        basicSizer.AddSpacer(3)
        basicSizer.Add(self.status, proportion=0, flag=wx.EXPAND)
        basicSizer.AddStretchSpacer()
        basicSizer.Add(basicSizer_messages, proportion=1)

        self.SetSizerAndFit(basicSizer)
        self.archiveNowButton.SetDefault()

        # Basic interface button actions
        self.archiveNowButton.Bind(wx.EVT_BUTTON, self.archiveNow)
        self.checkArchiveStatus.Bind(wx.EVT_BUTTON, self.checkIfURLIsInArchive)
        self.viewArchive.Bind(wx.EVT_BUTTON, self.viewArchiveInBrowser)

        # TODO: check environment variables
        self.ensureEnvironmentVariablesAreSet()

        self.setMementoCount(None)

        # Bind changes in URI to query MemGator
        self.memgatorDelayTimer = None

        if not util.is_linux():  # GitHub issue #404
            thread.start_new_thread(self.fetchMementos, ())
        # Call MemGator on URI change
        self.uri.Bind(wx.EVT_KEY_UP, self.uriChanged)

    def setMementoCount(self, m_count, a_count=0):
        """Display the number of mementos in the interface based on the
        results returned from MemGator
        """

        # Ensure mCount is an int, convert if not, allow None
        if m_count is not None and not isinstance(m_count, int):
            m_count = int(m_count)
        if m_count is not None and (m_count < 0 or a_count < 0):
            raise ValueError("Invalid memento or archive count specified")

        memCountMsg = ""
        if m_count is None:
            memCountMsg = config.msg_fetchingMementos
        elif m_count > 0:
            localeToSet = "en_US"
            if not util.is_macOS():  # Let system determine locale
                localeToSet = ""

            if util.is_linux():
                localeToSet = "en_US.UTF-8"

            locale.setlocale(locale.LC_ALL, localeToSet)

            m_plurality = "s"
            a_plurality = "s"

            if m_count == 1:
                m_plurality = ""
            if a_count == 1:
                a_plurality = ""
            m_count = locale.format_string("%d", m_count, grouping=True)
            memCountMsg = (
                "{0} memento{1} available " "from {2} archive{3}").format(
                m_count, m_plurality, a_count, a_plurality
            )
        elif m_count == 0:
            memCountMsg = config.msg_noMementosAvailable
        else:
            """ """

        statusString = f"Public archives: {memCountMsg}"
        self.parent.parent.statusbar.SetStatusText(statusString)

        self.Layout()

    def setMessage(self, msg):
        self.status.SetLabel(msg)

    def fetchMementos(self):
        """Request memento count from MemGator based on URI currently
        displayed in the Basic interface
        """
        # TODO: Use CDXJ for counting the mementos
        currentURIValue = self.uri.GetValue()
        print("MEMGATOR checking {0}".format(currentURIValue))

        startupinfo = None
        # Fixes issue of Popen on Windows
        if sys.platform.startswith("win32"):
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW

        mg = Popen(
            [
                config.memGatorPath,
                "--arcs",
                config.archivesJSON,
                "--format",
                "cdxj",
                "--restimeout",
                "0m3s",
                "--hdrtimeout",
                "3s",
                "--contimeout",
                "3s",
                currentURIValue,
            ],
            stdout=PIPE,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
            startupinfo=startupinfo,
        )

        # TODO: bug, on Gogo internet MemGator cannot hit aggregator, which
        # results in 0 mementos, for which MemGator throws exception

        mCount = 0
        archHosts = set()
        for line in mg.stdout:
            cleanedLine = line.strip()
            if cleanedLine[:1].isdigit():
                mCount += 1
                archHosts.add(cleanedLine.split(b"/", 3)[2])

        # UI not updated on Windows
        self.setMementoCount(mCount, len(archHosts))

        print(
            "MEMGATOR\n* URI-R: {0}\n* URI-Ms {1}\n* Archives: {2}".format(
                currentURIValue, mCount, len(archHosts)
            )
        )
        # TODO: cache the TM

    def uriChanged(self, event):
        """React when the URI has changed in the interface, call MemGator"""
        if event.GetUnicodeKey() == wx.WXK_NONE:
            return  # Prevent modifiers from causing MemGator query

        self.setMementoCount(None)

        if self.memgatorDelayTimer:  # Kill any currently running timer
            self.memgatorDelayTimer.cancel()
            self.memgatorDelayTimer = None

        self.memgatorDelayTimer = threading.Timer(
            1.0, thread.start_new_thread, [self.fetchMementos, ()]
        )
        self.memgatorDelayTimer.daemon = True
        self.memgatorDelayTimer.start()

        # TODO: start timer on below, kill if another key is hit
        # thread.start_new_thread(self.fetchMementos,())
        event.Skip()

    def testCallback(self):
        print("callback executed!")

    def ensureEnvironmentVariablesAreSet(self):
        """Check system to verify that Java variables have been set.
        Notify the user if not and initialize the Java installation process.
        """
        # if util.is_windows() or util.is_linux():
        #    return True # Allow windows to proceed w/o java checks for now.

        JAVA_HOME_defined = "JAVA_HOME" in os.environ
        JRE_HOME_defined = "JRE_HOME" in os.environ
        if not JAVA_HOME_defined or not JRE_HOME_defined:
            jreHome = ""
            javaHome = ""
            if util.is_macOS() or util.is_windows():
                jreHome = config.jreHome
                javaHome = config.javaHome
            else:  # Win, incomplete
                # os.environ['PATH'] # java8 does not use JRE_HOME, JAVA_HOME
                pass

            os.environ["JAVA_HOME"] = javaHome
            os.environ["JRE_HOME"] = jreHome
            self.ensureEnvironmentVariablesAreSet()
        return True

    def archiveNow(self, button):
        """Call asynchronous version of archiving process to prevent
        the UI from locking up

        """
        if not self.ensureEnvironmentVariablesAreSet():
            print("Java must be installed to archive using Heritrix")
            return

        self.archiveNowButton.SetLabel(
            config.buttonLabel_archiveNow_initializing)
        self.setMessage("Starting Archiving Process...")
        self.archiveNowButton.Disable()
        thread.start_new_thread(self.archiveNow2Async, ())

    def archiveNow2Async(self):
        """Create Heritrix crawl job, execute job, and update WAIL UI
        to indicate that a crawl has been initialized
        """
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
                "Crawl of {0} started!".format(self.uri.GetValue()[0:41]))
            wx.CallAfter(
                mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
            # if sys.platform.startswith('darwin'): #show a notification
            # ... of success in OS X
            #  Notifier.notify('Archival process successfully initiated.',
            #  ...title="WAIL")
        else:
            print("JAVA not INSTALLED")
            print(config.msg_java6Required)
            self.setMessage(config.msg_archiveFailed_java)

        wx.CallAfter(self.onLongRunDone)

    def onLongRunDone(self):
        """Re-enable archive now UI once the previous process is
        done being initialized and executed

        """
        self.archiveNowButton.SetLabel(config.buttonLabel_archiveNow)
        self.archiveNowButton.Enable()

    def writeHeritrixLogWithURI(self):
        """Create crawl job files with URI currently in Basic interface"""
        self.hJob = HeritrixJob(config.heritrixJobPath, [self.uri.GetValue()])
        self.hJob.write()

    def javaInstalled(self):
        """Check that a java binary is available"""
        # First check to be sure Java SE is installed.
        # Move this logic elsewhere in production
        noJava = config.msg_noJavaRuntime
        p = Popen(["java", "-version"], stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()
        return (noJava not in stdout) and (noJava not in stderr)

    def launchHeritrix(self):
        """Execute Heritrix binary to allow jobs to be submitted"""
        cmd = "{0} -a {1}:{2}".format(
            config.heritrixBinPath,
            config.heritrixCredentials_username,
            config.heritrixCredentials_password,
        )

        print(cmd)

        # TODO: shell=True was added for OS X
        # TODO: verify that functionality persists on Win64
        ret = subprocess.Popen(cmd, shell=True)
        time.sleep(3)
        mainAppWindow.advConfig.servicesPanel.updateServiceStatuses()

    def startHeritrixJob(self):
        """Build a previously created Heritrix job file and start the
        Heritrix binary process to begin processing job
        """
        self.buildHeritrixJob()
        self.launchHeritrixJob()

    def launchHeritrixJob(self):
        """ Launch Heritrix job after building"""
        logging.basicConfig(level=logging.DEBUG)
        print("Launching Heririx job")
        data = {"action": "launch"}
        headers = {
            "Accept": "application/xml",
            "Content-type": "application/x-www-form-urlencoded",
        }
        requests.post(
            "{0}{1}".format(config.uri_heritrixJob, self.hJob.jobNumber),
            auth=HTTPDigestAuth(
                config.heritrixCredentials_username,
                config.heritrixCredentials_password
            ),
            data=data,
            headers=headers,
            verify=False,
            stream=True,
        )
        # TODO: Verify that the post request was received

    def buildHeritrixJob(self):
        """Instruct the Heritrix binary to build the previously created
        job file

        """
        logging.basicConfig(level=logging.DEBUG)
        print("Building Heritrix job")
        data = {"action": "build"}
        headers = {
            "Accept": "application/xml",
            "Content-type": "application/x-www-form-urlencoded",
        }
        requests.post(
            "{0}{1}".format(config.uri_heritrixJob, self.hJob.jobNumber),
            auth=HTTPDigestAuth(
                config.heritrixCredentials_username,
                config.heritrixCredentials_password
            ),
            data=data,
            headers=headers,
            verify=False,
            stream=True,
        )
        # TODO: Verify that the post request was received

        # curl -v -d "action=launch" -k -u lorem:ipsum --anyauth --location
        # -H "Accept: application/xml" https://127.0.0.1:8443/engine/job/142..
        return

    def checkIfURLIsInArchive(self, button):
        """Send a request to the local Wayback instance and check if a
        Memento exists, inferring that a capture has been generated by
        Heritrix and an index generated from a WARC and the memento replayable


        """
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
            """"""

        if statusCode is None:
            launchWaybackDialog = wx.MessageDialog(
                None,
                config.msg_waybackNotStarted_body,
                config.msg_waybackNotStarted_title,
                wx.YES_NO | wx.YES_DEFAULT,
            )
            launchWayback = launchWaybackDialog.ShowModal()
            if launchWayback == wx.ID_YES:
                wx.GetApp().Yield()
                Wayback().fix(None, lambda: self.checkIfURLIsInArchive(button))
        elif 200 != statusCode:
            wx.MessageBox(
                config.msg_uriNotInArchives,
                "Checking for " + self.uri.GetValue()
            )
        else:
            mb = wx.MessageDialog(self, config.msg_uriInArchives_body,
                                  config.msg_uriInArchives_title,
                                  style=wx.OK | wx.CANCEL)
            mb.SetOKCancelLabels("View Latest", "Go Back")
            resp = mb.ShowModal()

            if resp == wx.ID_OK:  # View latest capture
                print('Showing latest capture')
                self.viewArchiveInBrowser(None, True)
            else:  # Show main window again
                print('Show main window again')

    def resetArchiveNowButton(self):
        """Update the Archive Now button in the UI to be in its initial
        state

        """
        self.archiveNowButton.SetLabel(
            config.buttonLabel_archiveNow_initializing)

    def viewArchiveInBrowser(self, button, latestMemento=False):
        """Open the OS's default browser to display the locally running
        Wayback instance

        """
        if Wayback().accessible():
            uri = config.uri_wayback_allMementos + self.uri.GetValue()

            if latestMemento:
                uri = config.uri_wayback + self.uri.GetValue()

            webbrowser.open_new_tab(uri)
        else:
            d = wx.MessageDialog(
                self, "Launch now?", "Wayback is not running",
                config.wail_style_yesNo
            )
            result = d.ShowModal()
            d.Destroy()
            if result == wx.ID_YES:  # Launch Wayback
                Wayback().fix(self.resetArchiveNowButton)
                self.archiveNowButton.SetLabel("Initializing...")


class WAILGUIFrame_Advanced(wx.Panel):
    class ServicesPanel(wx.Panel, threading.Thread):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.fix_wayback = wx.Button(
                self, 1, config.buttonLabel_fix, style=wx.BU_EXACTFIT
            )
            self.fix_heritrix = wx.Button(
                self, 1, config.buttonLabel_fix, style=wx.BU_EXACTFIT
            )

            self.kill_wayback = wx.Button(
                self, 1, config.buttonLabel_kill, style=wx.BU_EXACTFIT
            )
            self.kill_heritrix = wx.Button(
                self, 1, config.buttonLabel_kill, style=wx.BU_EXACTFIT
            )

            self.status_wayback = wx.StaticText(self, wx.ID_ANY, "X")
            self.status_heritrix = wx.StaticText(self, wx.ID_ANY, "X")

            self.draw()
            thread.start_new_thread(self.updateServiceStatuses, ())

            self.fix_wayback.Bind(wx.EVT_BUTTON, Wayback().fix)
            self.fix_heritrix.Bind(wx.EVT_BUTTON, Heritrix().fix)

            self.kill_wayback.Bind(wx.EVT_BUTTON, Wayback().kill)
            self.kill_heritrix.Bind(wx.EVT_BUTTON, Heritrix().kill)

            thread.start_new_thread(self.updateServiceStatuses, ())

        def draw(self):
            self.sizer = wx.BoxSizer()

            gs = wx.FlexGridSizer(3, 5, 0, 0)

            gs.AddMany(
                [
                    wx.StaticText(
                        self, wx.ID_ANY,
                        config.tabLabel_advanced_services_serviceStatus
                    ),
                    (
                        wx.StaticText(self, wx.ID_ANY, "STATE"),
                        1,
                        wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    (
                        wx.StaticText(self, wx.ID_ANY, "VERSION"),
                        1,
                        wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    wx.StaticText(self, wx.ID_ANY, ""),  # button col 1
                    wx.StaticText(self, wx.ID_ANY, ""),  # button col 2
                    (
                        wx.StaticText(self, wx.ID_ANY, "Wayback"),
                        1,
                        wx.ALIGN_CENTER_VERTICAL,
                    ),
                    (
                        self.status_wayback,
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    (
                        wx.StaticText(self, wx.ID_ANY,
                                      self.getWaybackVersion()),
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    self.fix_wayback,
                    self.kill_wayback,
                    (
                        wx.StaticText(self, wx.ID_ANY, "Heritrix"),
                        1,
                        wx.ALIGN_CENTER_VERTICAL,
                    ),
                    (
                        self.status_heritrix,
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    (
                        wx.StaticText(self, wx.ID_ANY,
                                      self.getHeritrixVersion()),
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    self.fix_heritrix,
                    self.kill_heritrix,
                ]
            )
            gs.AddGrowableCol(0, 1)
            gs.AddGrowableCol(1, 1)
            gs.AddGrowableCol(2, 1)

            self.sizer.Add(gs, proportion=1)
            self.SetSizer(self.sizer)
            self.Layout()

        def setHeritrixStatus(self, status):
            self.status_heritrix.SetLabel(status)

        def setWaybackStatus(self, status):
            self.status_wayback.SetLabel(status)

        def getHeritrixVersion(self, abbr=True):
            htrixLibPath = config.heritrixPath + "lib/"

            for file in os.listdir(htrixLibPath):
                if file.startswith("heritrix-commons"):
                    regex = re.compile("commons-(.*)\.")
                    h_version = regex.findall(file)[0]
                    try:
                        h_version = h_version[: h_version.index("-")] + "*"
                    except ValueError:
                        pass
                    return h_version

        def getWaybackVersion(self):
            tomcatLibPath = config.tomcatPath + "/webapps/lib/"

            for file in os.listdir(tomcatLibPath):
                if file.startswith("openwayback-core"):
                    regex = re.compile("core-(.*)\.")
                    return regex.findall(file)[0]

        def getTomcatVersion(self):
            # Apache Tomcat Version 7.0.30
            releaseNotesPath = config.tomcatPath + "/RELEASE-NOTES"

            if not os.path.exists(releaseNotesPath):
                return "?"
            f = open(releaseNotesPath, "r")
            version = ""
            for line in f.readlines():
                if "Apache Tomcat Version " in line:
                    version = re.sub("[^0-9^\.]", "", line)
                    break
            f.close()
            return version

        def updateServiceStatuses(self, serviceId=None,
                                  transitionalStatus=None):
            """Check if each service is enabled and set the GUI elements
            accordingly

            """
            serviceEnabled = {
                True: config.serviceEnabledLabel_YES,
                False: config.serviceEnabledLabel_NO,
            }

            heritrixAccessible = serviceEnabled[Heritrix().accessible()]
            waybackAccessible = serviceEnabled[Wayback().accessible()]

            if waybackAccessible is config.serviceEnabledLabel_YES:
                tomcatAccessible = waybackAccessible
            else:
                tomcatAccessible = serviceEnabled[Tomcat().accessible()]

            # Update a transitional status and short circuit
            if serviceId and transitionalStatus:
                if serviceId == "wayback":
                    self.setWaybackStatus(transitionalStatus)
                    return
                elif serviceId == "heritrix":
                    self.setHeritrixStatus(transitionalStatus)
                    return
                else:
                    print(
                        "{0}{1}".format(
                            "Invalid transitional service id specified. ",
                            "Updating status per usual.",
                        )
                    )

            self.setHeritrixStatus(heritrixAccessible)
            self.setWaybackStatus(tomcatAccessible)

            if not hasattr(self, "fix_heritrix"):
                print("First call, UI has not been setup")
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
                self, -1, config.buttonLabel_wayback
            )
            self.editWaybackConfiguration = wx.Button(
                self, -1, config.buttonLabel_editWaybackConfig
            )
            self.viewWaybackInBrowserButton.Bind(
                wx.EVT_BUTTON, self.openWaybackInBrowser
            )
            self.editWaybackConfiguration.Bind(
                wx.EVT_BUTTON, self.openWaybackConfiguration
            )

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(self.viewWaybackInBrowserButton, 0, wx.EXPAND, 0)
            box.Add(self.editWaybackConfiguration, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

        def openWaybackInBrowser(self, button):
            if Wayback().accessible():
                webbrowser.open_new_tab(config.uri_wayback)
                self.viewWaybackInBrowserButton.SetLabel(
                    config.buttonLabel_wayback)
                self.viewWaybackInBrowserButton.Enable()
            else:
                d = wx.MessageDialog(
                    self,
                    "Launch now?",
                    "Wayback is not running",
                    config.wail_style_yesNo,
                )
                result = d.ShowModal()
                d.Destroy()
                if result == wx.ID_YES:  # Launch Wayback
                    Wayback().fix(None,
                                  lambda: self.openWaybackInBrowser(None))
                    self.viewWaybackInBrowserButton.SetLabel(
                        config.buttonLabel_wayback_launching
                    )
                    self.viewWaybackInBrowserButton.Disable()

        def openWaybackConfiguration(self, button):
            filepath = config.tomcatPath + "/webapps/ROOT/WEB-INF/wayback.xml"
            if util.is_macOS():
                subprocess.call(("open", filepath))
            elif util.is_windows():
                os.startfile(filepath)
            elif util.is_linux():
                subprocess.call(("xdg-open", filepath))

    class HeritrixPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.listbox = wx.ListBox(self)
            self.populateListboxWithJobs()

            # TODO: Convert statusMsg to use sizers
            self.statusMsg = wx.StaticText(self, wx.ID_ANY, "", pos=(150, 0))

            self.listbox.Bind(wx.EVT_LISTBOX, self.clickedListboxItem)
            self.listbox.Bind(wx.EVT_RIGHT_UP, self.manageJobs)

            self.listbox.Bind(wx.EVT_SET_FOCUS, self.selectOnFocus)

            self.crawlJobsTextCtrlLabel = wx.StaticText(
                self, wx.ID_ANY, config.textLabel_crawlJobs
            )
            self.setupNewCrawlButton = wx.Button(
                self, wx.ID_ANY, config.buttonLabel_heritrix_newCrawl
            )
            self.launchWebUIButton = wx.Button(
                self, wx.ID_ANY, config.buttonLabel_heritrix_launchWebUI
            )

            # Button functionality
            self.setupNewCrawlButton.Bind(wx.EVT_BUTTON, self.setupNewCrawl)
            self.launchWebUIButton.Bind(wx.EVT_BUTTON, self.launchWebUI)

            self.panelUpdater = None  # For updating stats UI

            panelSizer = wx.FlexGridSizer(rows=1, cols=2, vgap=3, hgap=3)
            leftColSizer = wx.FlexGridSizer(rows=4, cols=1, vgap=2, hgap=2)

            leftColSizer.AddMany(
                [
                    self.crawlJobsTextCtrlLabel,
                    self.listbox,
                    (self.setupNewCrawlButton, 0, wx.EXPAND),
                    (self.launchWebUIButton, 0, wx.EXPAND),
                ]
            )

            panelSizer.Add(leftColSizer)
            self.SetSizer(panelSizer)

        def selectOnFocus(self, evt=None):
            if self.listbox.GetItems()[0] != config.textLabel_noJobsAvailable:
                # There is a legitimate value, select it
                self.listbox.SetSelection(0)
                self.clickedListboxItem()

        def populateListboxWithJobs(self):
            jobs_list = Heritrix().getListOfJobs()

            # Set to reverse chronological so newest jobs are at the top
            jobs_list.reverse()

            if len(jobs_list) == 0:
                jobs_list = [config.textLabel_noJobsAvailable]
                self.clearInfoPanel()

            self.listbox.Set(jobs_list)

        def clickedListboxItem(self, event=None):
            self.hideNewCrawlUIElements()
            self.statusMsg.Show()

            selectionIndex = self.listbox.GetSelection()
            if selectionIndex == -1:
                raise InvalidSelectionContextException("Selected empty space")

            crawlId = self.listbox.GetString(selectionIndex)
            if crawlId == config.textLabel_noJobsAvailable:
                self.clearInfoPanel()
                raise InvalidSelectionContextException(
                    "Selected empty placeholder")

            jobLaunches = Heritrix().getJobLaunches(crawlId)
            if self.panelUpdater:  # Kill any currently running timer
                self.panelUpdater.cancel()
                self.panelUpdater = None
            self.updateInfoPanel(crawlId)

        def updateInfoPanel(self, active):
            self.statusMsg.SetLabel(Heritrix().getCurrentStats(active))
            self.panelUpdater = threading.Timer(1.0, self.updateInfoPanel,
                                                [active])
            self.panelUpdater.daemon = True
            self.panelUpdater.start()

        def clearInfoPanel(self):
            if hasattr(self, "statusMsg"):
                self.statusMsg.SetLabel("")

        def launchWebUI(self, button):
            self.launchWebUIButton.SetLabel(
                config.buttonLabel_heritrix_launchWebUI_launching
            )
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

            # Do not show context menu for empty placeholder
            if self.listbox.GetItems()[0] == config.textLabel_noJobsAvailable:
                return

            self.listbox.SetSelection(self.listbox.HitTest(evt.GetPosition()))
            try:
                self.clickedListboxItem(None)
            except InvalidSelectionContextException:
                # Do not create context menu for invalid selection
                return

            # Create context menu for selection
            menu = wx.Menu()
            menu.Append(1, config.menu_forceCrawlFinish)
            menu.Bind(wx.EVT_MENU, self.forceCrawlFinish, id=1)
            menu.Append(2, config.menu_destroyJob)
            menu.Bind(wx.EVT_MENU, self.deleteHeritrixJob, id=2)
            menu.Append(3, config.menu_viewJobInWebBrowser)
            menu.Bind(wx.EVT_MENU, self.viewJobInWebBrowser, id=3)
            menu.Append(4, config.menu_rebuildJob)
            menu.Bind(wx.EVT_MENU, self.rebuildJob, id=4)
            menu.Append(5, config.menu_rebuildAndLaunchJob)
            menu.Bind(wx.EVT_MENU, self.rebuildAndLaunchJob, id=5)
            mainAppWindow.PopupMenu(
                menu, mainAppWindow.ScreenToClient(wx.GetMousePosition())
            )
            menu.Destroy()

        def finishAllCrawls(self, evt):
            for crawlId in self.listbox.GetItems():
                self.finishCrawl(crawlId)

        def finishCrawl(self, jobId):
            """Cleanup Heritrix job after finishing"""
            self.sendActionToHeritrix("terminate", jobId)
            self.sendActionToHeritrix("teardown", jobId)

        def forceCrawlFinish(self, evt):
            """Read currently selected crawlID and instruct Heritrix
            to finish the job.

            """
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.finishCrawl(jobId)

        def sendActionToHeritrix(self, action, jobId):
            """Communicate with the local Heritrix binary via its HTTP API"""
            data = {"action": action}
            headers = {
                "Accept": "application/xml",
                "Content-type": "application/x-www-form-urlencoded",
            }
            requests.post(
                config.uri_heritrixJob + jobId,
                auth=HTTPDigestAuth(
                    config.heritrixCredentials_username,
                    config.heritrixCredentials_password,
                ),
                data=data,
                headers=headers,
                verify=False,
                stream=True,
            )

        def deleteHeritrixJob(self, evt):
            """Read the currently selected crawlID and delete its
            configuration files from the file system.

            """
            jobPath = "{}{}".format(
                config.heritrixJobPath,
                str(self.listbox.GetString(self.listbox.GetSelection())),
            )
            print("Deleting Job at {}".format(jobPath))
            try:
                shutil.rmtree(jobPath)
            except OSError:
                print("Job deletion failed.")
            self.populateListboxWithJobs()

            # Blanks details if no job entries remain in UI
            if self.listbox.GetCount() == 0:
                self.statusMsg.SetLabel("")

        def viewJobInWebBrowser(self, evt):
            """Display crawl information in the Heritrix web interface
            based on the currently selected crawlID.

            """
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            webbrowser.open_new_tab(config.uri_heritrixJob + jobId)

        def rebuildJob(self, evt):
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.sendActionToHeritrix("build", jobId)

        def rebuildAndLaunchJob(self, evt):
            jobId = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.sendActionToHeritrix("build", jobId)
            self.sendActionToHeritrix("launch", jobId)

        def openConfigInTextEditor(self, evt):
            # TODO, most systems don't know how to open a cxml file.
            # ...Is there a way to create a system mapping from python?

            # Issue #22 prevents the context of the right-click item from
            # ...being obtained and used here.
            file = "{0}{1}/crawler-beans.cxml".format(
                config.heritrixJobPath,
                str(self.listbox.GetString(self.listbox.GetSelection())),
            )
            if util.is_macOS():
                subprocess.call(("open", file))
            elif util.is_windows():
                os.startfile(file)
            elif util.is_linux():
                subprocess.call(("xdg-open", file))

        def restartJob(self, evt):
            # TODO: send request to API to restart job, perhaps send ID to
            # this function
            print("Restarting job")

        def removeNewCrawlUI(self):
            chil = self.Sizer.GetChildren()
            if len(chil) > 1:
                self.Sizer.Hide(len(chil) - 1)
                self.Sizer.Remove(len(chil) - 1)

                self.Layout()

        def deselectCrawlListboxItems(self, evt=None):
            self.listbox.Deselect(self.listbox.GetSelection())

        def addNewCrawlUI(self):
            self.statusMsg.Hide()
            chil = self.Sizer.GetChildren()
            if len(chil) > 1:
                self.removeNewCrawlUI()

            self.newCrawlTextCtrlLabel = wx.StaticText(
                self, wx.ID_ANY, config.textLabel_uriEntry
            )
            multiLineAndNoWrapStyle = wx.TE_MULTILINE + wx.TE_DONTWRAP
            self.newCrawlTextCtrl = wx.TextCtrl(
                self, wx.ID_ANY, size=(220, 90), style=multiLineAndNoWrapStyle
            )

            rightColSizer = wx.FlexGridSizer(3, 1, 2, 2)

            rightColSizer.AddMany(
                [self.newCrawlTextCtrlLabel, self.newCrawlTextCtrl])

            depthSizer = wx.GridBagSizer(2, 2)

            self.newCrawlDepthTextCtrl = wx.TextCtrl(self, wx.ID_ANY,
                                                     size=(44, -1))

            self.newCrawlDepthTextCtrl.SetValue(config.textLabel_depth_default)
            self.newCrawlDepthTextCtrl.Bind(wx.EVT_KILL_FOCUS,
                                            self.validateCrawlDepth)
            self.newCrawlDepthTextCtrl.Bind(wx.EVT_CHAR,
                                            self.handleCrawlDepthKeypress)

            # When a new crawl UI textbox is selected, deselect listbox
            self.newCrawlTextCtrl.Bind(wx.EVT_SET_FOCUS, self.deselectCrawlListboxItems)
            self.newCrawlDepthTextCtrl.Bind(wx.EVT_SET_FOCUS, self.deselectCrawlListboxItems)

            self.startCrawlButton = wx.Button(
                self, wx.ID_ANY, config.buttonLabel_starCrawl
            )
            self.startCrawlButton.SetDefault()
            self.startCrawlButton.Bind(wx.EVT_BUTTON, self.crawlURIsListed)

            depthSizer.Add(
                wx.StaticText(self, wx.ID_ANY, config.textLabel_depth),
                pos=(0, 0),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
            )
            depthSizer.Add(
                self.newCrawlDepthTextCtrl,
                pos=(0, 1),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
            )
            depthSizer.Add(
                self.startCrawlButton,
                pos=(0, 6),
                span=(2, 1),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_RIGHT,
            )

            rightColSizer.Add(depthSizer)

            self.Sizer.Add(rightColSizer)
            self.Layout()

            # Deselect any highlighted selection in the jobs listbox
            self.deselectCrawlListboxItems()

        def setupNewCrawl(self, evt):
            """Create UI elements for user to specify the URIs and other
            attributes for a new Heritrix crawl.

            """
            self.addNewCrawlUI()
            self.newCrawlTextCtrl.SetFocus()

        def handleCrawlDepthKeypress(self, event):
            """Ensure that values for the crawl depth text input field
            are numerical.

            """
            keycode = event.GetKeyCode()
            if keycode < 255:
                # valid ASCII
                if chr(keycode).isdigit():
                    # Valid alphanumeric character
                    event.Skip()

        def validateCrawlDepth(self, event):
            """Verify that the value supplied for the crawl depth text
            field is numerical.

            """
            if len(self.newCrawlDepthTextCtrl.GetValue()) == 0:
                self.newCrawlDepthTextCtrl.SetValue("1")
            event.Skip()

        def hideNewCrawlUIElements(self):
            """Hide UI elements related to a new Heritrix crawl."""

            self.removeNewCrawlUI()

        def showNewCrawlUIElements(self):
            """Display UI elements related to a new Heritrix crawl."""
            self.newCrawlTextCtrlLabel.Show()
            self.newCrawlTextCtrl.Show()
            self.startCrawlButton.Show()

        def crawlURIsListed(self, evt):
            """Build and initialize a new Heritrix crawl based on the
            list of URIs specified in the WAIL UI.

            """
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
                self, 1, config.buttonLabel_viewArchiveFiles
            )

            viewArchivesFolderButtonButton.Bind(wx.EVT_BUTTON,
                                                self.openArchivesFolder)
            self.testUpdate = wx.Button(self, 1,
                                        config.buttonLabel_checkForUpdates)

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(viewArchivesFolderButtonButton, 0, wx.EXPAND, 0)
            box.Add(self.testUpdate, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

            self.testUpdate.Bind(wx.EVT_BUTTON, self.checkForUpdates)
            self.testUpdate.Disable()

        def openArchivesFolder(self, button):
            """Display the folder in which generated WARCs reside in the
            operating system's file manager.

            """
            if not os.path.exists(config.warcsFolder):
                os.makedirs(config.warcsFolder)

            if util.is_windows():
                os.startfile(config.warcsFolder)
            else:
                subprocess.call(["open", config.warcsFolder])

        def checkForUpdates(self, button):
            """Display the window for updating WAIL."""

            updateWindow = UpdateSoftwareWindow(parent=self, id=-1)
            updateWindow.Show()
            # return
            # check if an updates version is available

            # if an updated version is available and the user wants it,
            # ...copy the /Application/WAIL.app/Contents folder

    def __init__(self, parent):
        wx.Panel.__init__(self, parent)

        self.notebook = wx.Notebook(self)
        self.notebook.myStatusBar = self
        vbox = wx.BoxSizer(wx.VERTICAL)
        vbox.Add(self.notebook, 10, flag=wx.EXPAND)

        self.SetSizer(vbox)

        self.servicesPanel = WAILGUIFrame_Advanced.ServicesPanel(self.notebook)
        self.waybackPanel = WAILGUIFrame_Advanced.WaybackPanel(self.notebook)
        self.heritrixPanel = WAILGUIFrame_Advanced.HeritrixPanel(self.notebook)
        self.miscellaneousPanel = WAILGUIFrame_Advanced.MiscellaneousPanel(
            self.notebook
        )

        self.notebook.AddPage(self.servicesPanel,
                              config.tabLabel_advanced_services)
        self.notebook.AddPage(self.waybackPanel,
                              config.tabLabel_advanced_wayback)
        self.notebook.AddPage(self.heritrixPanel,
                              config.tabLabel_advanced_heritrix)
        self.notebook.AddPage(
            self.miscellaneousPanel, config.tabLabel_advanced_miscellaneous
        )

        self.x, self.y = (15, 5)
        self.height = (150, 25 * 0.80)

        # Inits for 'self' references uses in methods
        self.writeConfig = None
        self.hJob = None

    def tomcatMessageOff(self):
        # self.tomcatStatus.SetLabel(msg_waybackDisabled)
        self.tomcatStatus.SetForegroundColour((255, 0, 0))
        self.startTomcatButton.SetLabel(self.startTomcatLabel)

    def tomcatMessageOn(self):
        # self.tomcatStatus.SetLabel(msg_waybackEnabled)
        self.tomcatStatus.SetForegroundColour((0, 200, 0))
        self.startTomcatButton.SetLabel(self.stopTomcatLabel)

    def startTomcat(self, button):
        cmd = config.tomcatPathStart
        ret = subprocess.Popen(cmd)
        waitingForTomcat = True
        while waitingForTomcat:
            if Wayback().accessible():
                waitingForTomcat = False
            time.sleep(2)

        self.waybackPanel.viewWaybackInBrowserButton.Enable()  # TODO: error here

    def launchHeritrix(self, button):
        # self.heritrixStatus.SetLabel("Launching Heritrix")
        cmd = "{0} -a {1}:{2}".format(
            config.heritrixBinPath,
            config.heritrixCredentials_username,
            config.heritrixCredentials_password,
        )

        # TODO: shell=True was added for macOS
        # ...verify that functionality persists on Win64
        subprocess.Popen(cmd, shell=True)
        # urlib won't respond to https, hard-coded sleep until I
        # ...can ping like Tomcat
        time.sleep(6)
        # self.viewHeritrixButton.Enable()

    def viewWayback(self, button):
        webbrowser.open_new_tab(config.uri_wayback)

    def viewHeritrix(self, button):
        webbrowser.open_new_tab(config.uri_heritrix)

    def createListBox(self):

        self.uriListBoxTitle = wx.StaticText(
            self, 7, config.textLabel_urisToCrawl,
            (self.x, 5 + self.height * 7 + 30)
        )
        self.uriListBox = wx.ListBox(self, wx.ID_ANY, [""])
        self.uriListBox.Bind(wx.EVT_LISTBOX, self.addURI)
        self.SetSize((self.GetSize().x, self.GetSize().y + 300))

        mainAppWindow.SetSize((mainAppWindow.GetSize().x, 400))

    def setupOneOffCrawl(self, button):
        if self.uriListBox is not None:
            return  # This function has already been done
        self.createListBox()

        self.writeConfig = wx.Button(
            self,
            33,
            "Write Heritrix Config",
            (self.GetSize().x - 175, 280),
            (self.width, self.height),
        )

        wail_style_button_font = wx.Font(
            config.fontSize,
            wx.FONTFAMILY_SWISS,
            wx.FONTSTYLE_NORMAL,
            wx.FONTWEIGHT_NORMAL,
        )

        self.writeConfig.SetFont(wail_style_button_font)
        self.writeConfig.Bind(wx.EVT_BUTTON, self.crawlURIs)
        self.writeConfig.Disable()
        self.launchCrawlButton = wx.Button(
            self,
            33,
            config.textLabel_launchCrawl,
            (self.GetSize().x - 175, 305),
            (self.width, self.height),
        )
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
        default_message = ""
        try:
            default_message = self.uriListBox.GetString(
                self.uriListBox.GetSelection())
        except:
            default_message = ""
        message = wx.GetTextFromUser(
            "Enter a URI to be crawled", default_value=default_message
        )
        if message == "" and message == default_message:
            return
        url = urlparse(message)
        self.uriListBox.InsertItems([url.geturl()], 0)
        self.writeConfig.Enable()


class Service:
    uri = None  # TODO: update to use @abstractmethod + @property

    def accessible(self):
        chkMsg = "Checking access to {0} at {1}".format(
            self.__class__.__name__, self.uri
        )
        print(chkMsg)

        try:
            handle = urlopen(self.uri, None, 3)
            print("Service: " + self.__class__.__name__ + " is a go! ")
            return True
        except IOError as e:
            if hasattr(e, "code"):  # HTTPError
                print(
                    self.__class__.__name__ + " Pseudo-Success in accessing " + self.uri
                )
                return True

            print(
                "Service: Failed to access {0} service at {1}".format(
                    self.__class__.__name__, self.uri
                )
            )
            return False
        except:
            print(
                (
                    "Some other error occurred trying " "to check service accessibility.")
            )
            return False


class Wayback(Service):
    uri = config.uri_wayback

    def fix(self, button, *cb):
        mainAppWindow.basicConfig.ensureEnvironmentVariablesAreSet()
        thread.start_new_thread(self.fixAsync, cb)

    def accessible(self):
        try:
            handle = urlopen(self.uri, None, 3)
            headers = handle.getheaders()

            linkHeader = ""
            for h in headers:
                if h[0] == "Link":
                    linkHeader = h[1]

            accessible = "http://mementoweb.org/terms/donotnegotiate" in linkHeader
            if accessible:
                print(
                    "Wayback: " + self.__class__.__name__ + " is a go at " + self.uri)
            else:
                print(
                    "Unable to access {0}, something else is running on port 8080".format(
                        self.__class__.__name__
                    )
                )

            return accessible

        except Exception:
            print(
                "Wayback(): Failed to access {0} service at {1}".format(
                    self.__class__.__name__, self.uri
                )
            )
            return False

    def fixAsync(self, cb=None):
        # mainAppWindow.advConfig.servicesPanel.status_wayback.SetLabel(
        #    config.serviceEnabledLabel_FIXING)
        mainAppWindow.advConfig.servicesPanel.setWaybackStatus(
            config.serviceEnabledLabel_FIXING
        )
        cmd = config.tomcatPathStart
        mainAppWindow.basicConfig.ensureEnvironmentVariablesAreSet()

        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, button):
        thread.start_new_thread(self.killAsync, ())

    def killAsync(self):
        mainAppWindow.advConfig.servicesPanel.status_wayback.SetLabel(
            "KILLING")
        cmd = config.tomcatPathStop
        ret = subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(
            mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)

    def index(self):
        self.generatePathIndex()
        self.generateCDX()

    def generatePathIndex(self):
        dest = config.wailPath + "/config/path-index.txt"
        warcsPath = config.wailPath + "/archives/"

        outputContents = ""
        for file in listdir(warcsPath):
            if file.endswith(".warc") or file.endswith(".warc.gz"):
                outputContents += file + "\t" + join(warcsPath, file) + "\n"

        print("Writing path-index.txt file...", end="")
        pathIndexFile = open(dest, "w")
        pathIndexFile.write(outputContents)
        pathIndexFile.close()
        print("COMPLETE")

    def generateCDX(self):
        print("CDX: ", end="")

        dest = config.wailPath + "/config/path-index.txt"
        warcsPath = config.wailPath + "/archives/"
        cdxFilePathPre = config.wailPath + "/archiveIndexes/"
        cdxIndexerPath = "{0}{1}".format(
            config.wailPath, "/bundledApps/tomcat/webapps/bin/cdx-indexer"
        )

        print("generating ", end="")
        for file in listdir(warcsPath):
            if file.endswith(".warc"):
                cdxFilePath = cdxFilePathPre + file.replace(".warc", ".cdx")
                process = subprocess.Popen(
                    [cdxIndexerPath, join(warcsPath, file), cdxFilePath],
                    stdout=PIPE,
                    stderr=PIPE,
                )
                stdout, stderr = process.communicate()

        # Combine CDX files
        print("combining ", end="")
        allCDXesPath = config.wailPath + "/archiveIndexes/*.cdx"

        filenames = glob.glob(allCDXesPath)
        cdxHeaderIncluded = False
        print("merging ", end="")

        # Is cdxt the right filename?
        unsortedPath = config.wailPath + "/archiveIndexes/combined_unsorted.cdxt"

        with open(unsortedPath, "w") as outfile:
            for fname in filenames:
                with open(fname) as infile:
                    for i, line in enumerate(infile):
                        if i > 0:
                            outfile.write(line)
                        elif not cdxHeaderIncluded:
                            # Only include first CDX header
                            outfile.write(line)
                            cdxHeaderIncluded = True
        print("cleaning ", end="")
        filelist = glob.glob(allCDXesPath)
        for f in filelist:
            os.remove(f)

        cdxTemp = config.wailPath + "/archiveIndexes/combined_unsorted.cdxt"
        cdxFinal = config.wailPath + "/archiveIndexes/index.cdx"
        # TODO: fix cdx sorting in Windows #281
        # if 'darwin' in sys.platform:
        print("sorting ", end="")
        # os.system("export LC_ALL=C; sort -u " + cdxTemp + " > " + cdxFinal)

        with open(cdxTemp, "r") as tempFile:
            with open(cdxFinal, "w") as finalFile:
                locale.setlocale(locale.LC_ALL, "C")
                entries = tempFile.readlines()
                entries = list(set(entries))  # uniq
                entries.sort(key=functools.cmp_to_key(locale.strcoll))
                for entry in entries:
                    finalFile.write(entry)

        os.remove(cdxTemp)
        print("DONE!")

        # Queue next iteration of indexing
        if mainAppWindow.indexingTimer:
            mainAppWindow.indexingTimer.cancel()
        mainAppWindow.indexingTimer = threading.Timer(
            config.index_timer_seconds, Wayback().index
        )
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

        return list(map(justFile,
                        glob.glob(os.path.join(config.heritrixJobPath, "*"))))

    """ # getListOfJobs - rewrite to use the Heritrix API, will need to parse XML
        -H "Accept: application/xml"
        # replicate curl -v -d "action=rescan" -k -u lorem:ipsum --anyauth
        --location -H "Accept: application/xml" https://0.0.0.0:8443/engine
    """

    def getJobLaunches(self, jobId):
        jobPath = config.heritrixJobPath + jobId
        return [
            f
            for f in os.listdir(config.heritrixJobPath + jobId)
            if re.search(r"^[0-9]+$", f)
        ]

    def getCurrentStats(self, jobId):
        launches = self.getJobLaunches(jobId)
        ret = ""
        status = ""
        statusTemplate = Template("JobID: $jobId\n$status")

        if len(launches) == 0:
            status = "   NOT BUILT"

        for launch in launches:
            progressLogFilePath = "{0}{1}/{2}/{3}".format(
                config.heritrixJobPath, jobId, launch,
                "logs/progress-statistics.log"
            )
            lastLine = util.tail(progressLogFilePath)

            ll = lastLine[0].replace(" ", "|")
            logData = re.sub(r"[|]+", "|", ll).split("|")
            timeStamp, discovered, queued, downloaded = logData[0:4]

            try:  # Check if crawl is running, assume scraped stats are ints
                int(discovered)
                status = "   {}: {}\n   {}: {}\n   {}: {}\n".format(
                    "Discovered", discovered, "Queued", queued, "Downloaded",
                    downloaded
                )
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
        mainAppWindow.advConfig.servicesPanel.status_heritrix.SetLabel(
            config.serviceEnabledLabel_FIXING
        )
        mainAppWindow.basicConfig.launchHeritrix()
        time.sleep(3)
        wx.CallAfter(
            mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, button):
        thread.start_new_thread(self.killAsync, ())

    def killAsync(self):
        mainAppWindow.advConfig.servicesPanel.status_heritrix.SetLabel(
            config.serviceEnabledLabel_KILLING
        )
        # Ideally, the Heritrix API would have support for this. This will have to do. Won't work in Wintel
        cmd = """ps ax | grep 'heritrix' | grep -v grep | awk '{print "kill -9 " $1}' | sh"""
        print("Trying to kill Heritrix...")
        ret = subprocess.Popen(cmd, stderr=subprocess.STDOUT, shell=True)
        time.sleep(3)
        wx.CallAfter(
            mainAppWindow.advConfig.servicesPanel.updateServiceStatuses)


class UpdateSoftwareWindow(wx.Frame):
    panels = ()
    updateJSONData = ""
    currentVersion_wail = "0.2015.10.11"
    latestVersion_wail = "0.2015.12.25"
    currentVersion_heritrix = ""
    latestVersion_heritrix = ""
    currentVersion_wayback = ""
    latestVersion_wayback = ""

    def updateWAIL(self, button):
        print("Downloading " + self.updateJSONData["wail-core"]["uri"])
        wailcorefile = urlopen(self.updateJSONData["wail-core"]["uri"])
        output = open(config.wailPath + "/support/temp.tar.gz", "wb")
        output.write(wailcorefile.read())
        output.close()
        print("Done downloading WAIL update, backing up.")

        try:
            util.copyanything(
                config.wailPath + "/Contents/",
                config.wailPath + "/Contents_bkp/"
            )
            print("Done backing up. Nuking obsolete version.")
        except:
            print("Back up previously done, continuing.")

        shutil.rmtree(config.wailPath + "/Contents/")
        print("Done nuking, decompressing update.")

        tar = tarfile.open(config.wailPath + "/support/temp.tar.gz")
        tar.extractall(config.wailPath + "/")
        tar.close()
        print("Done, restart now.")
        os.system(
            "defaults read {}/Contents/Info.plist > /dev/null".format(
                config.wailPath)
        )
        # TODO: flush Info.plist cache
        # (cmd involving defaults within this py script)

    def fetchCurrentVersionsFile(self):
        self.srcURI = "https://matkelly.com/wail/update.json"
        f = urlopen(self.srcURI).read()
        data = f
        self.updateJSONData = json.loads(data)

    def setVersionsInPanel(self):
        self.currentVersion_wail = config.WAIL_VERSION
        self.latestVersion_wail = self.updateJSONData["wail-core"]["version"]
        self.currentVersion_heritrix = self.getHeritrixVersion()
        self.currentVersion_wayback = self.getWaybackVersion()

        packages = self.updateJSONData["packages"]
        for package in packages:
            if package["name"] == "heritrix-wail":
                self.latestVersion_heritrix = package["version"]
            elif package["name"] == "openwayback-wail":
                self.latestVersion_wayback = package["version"]

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    def getHeritrixVersion(self):
        for file in os.listdir(config.heritrixPath + "lib/"):
            if file.startswith("heritrix-commons"):
                regex = re.compile("commons-(.*)\.")
                h_version = regex.findall(file)[0]
                try:
                    h_version = h_version[: h_version.index("-")] + "*"
                except ValueError:
                    # No dash present when parsing Heritrix version
                    pass
                return h_version

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    def getWaybackVersion(self):
        for file in os.listdir(config.tomcatPath + "/webapps/lib/"):
            if file.startswith("openwayback-core"):
                regex = re.compile("core-(.*)\.")
                return regex.findall(file)[0]

    # TODO: move layout management to responsibility of sub-panels, UNUSED now
    class UpdateSoftwarePanel(wx.Frame):
        panelTitle = ""
        panelSize = (390, 90)
        panelPosition = ()
        panelLogoPath = ""

        def __init__(self, parent, panelI, indexInPanel=0, panelTitle=""):
            self.panelPosition = (5, 10 * 85 * panelI)
            self.panelTitle = panelTitle
            self.parent = parent

        def draw(self):
            # TODO: draw icon
            pass

            self.panel = wx.StaticBox(
                self.parent,
                -1,
                self.panelTitle,
                size=self.panelSize,
                pos=self.panelPosition,
            )
            box = wx.StaticBoxSizer(self.panel, wx.VERTICAL)

    def __init__(self, parent, id):
        self.fetchCurrentVersionsFile()
        self.setVersionsInPanel()

        wx.Frame.__init__(
            self,
            parent,
            id,
            "Update WAIL",
            size=(400, 300),
            style=(wx.FRAME_FLOAT_ON_PARENT | wx.CLOSE_BOX),
        )
        wx.Frame.CenterOnScreen(self)
        # self.refresh = wx.Button(self, -1, buttonLabel_refresh,
        # pos=(0, 0), size=(0,20))

        updateFrameIcons_pos_left = 15
        updateFrameIcons_pos_top = (25, 110, 195)

        updateFrameText_version_pos_tops1 = (
            updateFrameIcons_pos_top[0] + 5,
            updateFrameIcons_pos_top[0] + 22,
        )
        updateFrameText_version_title_pos1 = (
            (80, updateFrameText_version_pos_tops1[0]),
            (80, updateFrameText_version_pos_tops1[1]),
        )
        updateFrameText_version_value_pos1 = (
            (180, updateFrameText_version_pos_tops1[0]),
            (180, updateFrameText_version_pos_tops1[1]),
        )

        updateFrameText_version_pos_tops2 = (
            updateFrameIcons_pos_top[1],
            updateFrameIcons_pos_top[1] + 17,
        )
        updateFrameText_version_title_pos2 = (
            (80, updateFrameText_version_pos_tops2[0]),
            (80, updateFrameText_version_pos_tops2[1]),
        )
        updateFrameText_version_value_pos2 = (
            (180, updateFrameText_version_pos_tops2[0]),
            (180, updateFrameText_version_pos_tops2[1]),
        )

        updateFrameText_version_pos_tops3 = (
            updateFrameIcons_pos_top[2],
            updateFrameIcons_pos_top[2] + 17,
        )
        updateFrameText_version_title_pos3 = (
            (80, updateFrameText_version_pos_tops3[0]),
            (80, updateFrameText_version_pos_tops3[1]),
        )
        updateFrameText_version_value_pos3 = (
            (180, updateFrameText_version_pos_tops3[0]),
            (180, updateFrameText_version_pos_tops3[1]),
        )

        updateFrameText_version_size = (100, 100)

        # TODO: Akin to #293, update this icon w/ new version
        #  Need to generate a 64px version for this.
        iconPath = config.wailPath + "/build/icons/"
        updateFrame_panels_icons = (
            iconPath + "whaleLogo_64.png",
            iconPath + "heritrixLogo_64.png",
            iconPath + "openWaybackLogo_64.png",
        )
        updateFrame_panels_titles = ("WAIL Core", "Preservation", "Replay")
        updateFrame_panels_size = (390, 90)

        updateFrame_panels_pos = ((5, 10), (5, 95), (5, 180))

        # wailPanel = self.UpdateSoftwarePanel(self, 0, 0, 'WAIL')
        # wailPanel.draw()
        self.panel_wail = wx.StaticBox(
            self,
            1,
            updateFrame_panels_titles[0],
            size=updateFrame_panels_size,
            pos=updateFrame_panels_pos[0],
        )
        box1 = wx.StaticBoxSizer(self.panel_wail, wx.VERTICAL)

        self.panel_preservation = wx.StaticBox(
            self,
            1,
            updateFrame_panels_titles[1],
            size=updateFrame_panels_size,
            pos=updateFrame_panels_pos[1],
        )
        box2 = wx.StaticBoxSizer(self.panel_preservation, wx.VERTICAL)

        self.panel_replay = wx.StaticBox(
            self,
            1,
            updateFrame_panels_titles[2],
            size=updateFrame_panels_size,
            pos=updateFrame_panels_pos[2],
        )
        box3 = wx.StaticBoxSizer(self.panel_replay, wx.VERTICAL)

        # Panel 1
        wx.StaticText(
            self,
            100,
            "Current Version:",
            updateFrameText_version_title_pos1[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            updateFrameText_version_title_pos1[1],
            updateFrameText_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.currentVersion_wail,
            updateFrameText_version_value_pos1[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latestVersion_wail,
            updateFrameText_version_value_pos1[1],
            updateFrameText_version_size,
        )

        # Panel 2
        wx.StaticText(
            self,
            100,
            "Current Version:",
            updateFrameText_version_title_pos2[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            updateFrameText_version_title_pos2[1],
            updateFrameText_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.currentVersion_heritrix,
            updateFrameText_version_value_pos2[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latestVersion_heritrix,
            updateFrameText_version_value_pos2[1],
            updateFrameText_version_size,
        )

        # Panel 3
        wx.StaticText(
            self,
            100,
            "Current Version:",
            updateFrameText_version_title_pos3[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            updateFrameText_version_title_pos3[1],
            updateFrameText_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.currentVersion_wayback,
            updateFrameText_version_value_pos3[0],
            updateFrameText_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latestVersion_wayback,
            updateFrameText_version_value_pos3[1],
            updateFrameText_version_size,
        )

        self.updateButton_wail = wx.Button(
            self, 3, "Update", pos=(305, updateFrameIcons_pos_top[0]),
            size=(75, 20)
        )
        self.updateButton_heritrix = wx.Button(
            self, 3, "Update", pos=(305, updateFrameIcons_pos_top[1]),
            size=(75, 20)
        )
        self.updateButton_wayback = wx.Button(
            self, 3, "Update", pos=(305, updateFrameIcons_pos_top[2]),
            size=(75, 20)
        )

        self.updateButton_wail.Bind(wx.EVT_BUTTON, self.updateWAIL)

        if self.currentVersion_wail == self.latestVersion_wail:
            self.updateButton_wail.Disable()
        if self.currentVersion_wayback == self.latestVersion_wayback:
            self.updateButton_wayback.Disable()
        if self.currentVersion_heritrix == self.latestVersion_heritrix:
            self.updateButton_heritrix.Disable()

        img = wx.Image(
            updateFrame_panels_icons[0], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            img,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[0]),
            (img.GetWidth(), img.GetHeight()),
        )

        heritrix_64 = wx.Image(
            updateFrame_panels_icons[1], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            heritrix_64,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[1]),
            (heritrix_64.GetWidth(), heritrix_64.GetHeight()),
        )

        openwayback_64 = wx.Image(
            updateFrame_panels_icons[2], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            openwayback_64,
            (updateFrameIcons_pos_left, updateFrameIcons_pos_top[2]),
            (openwayback_64.GetWidth(), openwayback_64.GetHeight()),
        )


class InvalidSelectionContextException(Exception):
    """raise when attempt to create a context menu without context"""


mainAppWindow = None

if __name__ == "__main__":
    # if len(sys.argv) > 1:
    #   '''A WARC file was drag-and-dropped onto WAIL'''
    #   print "WAIL was launched with file parameters."
    # else:
    #   print "WAIL was launched without any file parameters."
    # requests.packages. urllib3.disable_warnings()

    if sys.version_info[0] == 2:
        print(config.msg_py3)
        sys.exit()
    os.environ["JAVA_HOME"] = config.jdkPath

    app = wx.App(redirect=False)
    mainAppWindow = TabController()
    mainAppWindow.ensureCorrectInstallation()
    mainAppWindow.Show()

    # Start indexer
    # Wayback().index()

    app.MainLoop()
