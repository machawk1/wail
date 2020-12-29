#!/usr/bin/env python
# coding: utf-8

# Web Archiving Integration Layer (WAIL)
#  This tool ties together web archiving applications including Wayback,
#   Heritrix, and Tomcat.
#  Mat Kelly <wail@matkelly.com> 2013

from __future__ import print_function

import functools
import glob
import json
import locale
import logging
import os
import re
import requests
import shutil
import ssl
import subprocess
import sys
import tarfile  # For updater
import threading
import time
import webbrowser
import wx

# from ntfy.backends.default import notify

from string import Template  # Py3.6+

from urllib.request import urlopen
from urllib.parse import urlparse
from urllib.error import HTTPError

import _thread as thread

from HeritrixJob import HeritrixJob
import WAILConfig as config
import wailUtil as util

# from wx import *
import wx.adv
from subprocess import Popen, PIPE

from requests.auth import HTTPDigestAuth
from pubsub import pub

from os import listdir
from os.path import join

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
            title=config.group_label_window,
            size=config.wail_window_size,
            style=config.wail_window_style,
        )
        panel = wx.Panel(self)
        vbox = wx.BoxSizer(wx.VERTICAL)
        wx.Frame.Center(self)

        self.notebook = wx.Notebook(panel)
        self.notebook.parent = self
        vbox.Add(self.notebook, 2, flag=wx.EXPAND)

        panel.SetSizer(vbox)

        self.sb = WAILStatusBar(self)
        self.SetStatusBar(self.sb)
        self.statusbar = self.sb

        self.statusbar.Bind(wx.EVT_LEFT_UP, self.show_memento_info)
        pub.subscribe(self.change_statusbar, 'change_statusbar')

        # Add basic config page/tab
        self.basic_config = WAILGUIFrame_Basic(self.notebook)
        self.notebook.AddPage(self.basic_config, config.tab_label_basic)

        # Add advanced config page/tab
        self.adv_config = WAILGUIFrame_Advanced(self.notebook)
        self.notebook.AddPage(self.adv_config, config.tab_label_advanced)
        self.create_menu()

        self.indexing_timer = threading.Timer(
            config.index_timer_seconds, Wayback().index
        )
        self.indexing_timer.daemon = True
        self.indexing_timer.start()

        pub.subscribe(self.basic_config.set_memento_count,
                      'change_statusbar_with_counts')

    def show_memento_info(self, evt):
        pass  # TODO: Open new window with memento info

    def change_statusbar(self, msg, includes_local):
        wx.CallAfter(self.statusbar.SetStatusText, msg)
        if includes_local:
            wx.CallAfter(self.statusbar.hide_button)
        else:
            wx.CallAfter(self.statusbar.show_button)

    def create_menu(self):
        """Configure, initialize, and attach application menus"""
        menu_bar = wx.MenuBar()

        file_menu = wx.Menu()
        edit_menu = wx.Menu()
        view_menu = wx.Menu()
        window_menu = wx.Menu()
        help_menu = wx.Menu()

        file_newcrawl = self.add_menu_item(
            file_menu, config.menu_title_file_new_crawl, "CTRL+N"
        )
        self.Bind(wx.EVT_MENU, self.setup_new_crawl_from_menu, file_newcrawl)

        file_all_crawls = wx.Menu()
        file_all_crawls_finish = self.add_menu_item(
            file_all_crawls, config.menu_title_file_all_crawls_finish
        )
        file_all_crawls_pause_unpause = self.add_menu_item(
            file_all_crawls, config.menu_title_file_all_crawls_pause
        )
        file_all_crawls_restart = self.add_menu_item(
            file_all_crawls, config.menu_title_file_all_crawls_restart
        )
        file_all_crawls.AppendSeparator()
        file_all_crawls_destroy = self.add_menu_item(
            file_all_crawls, config.menu_title_file_all_crawls_destroy
        )

        file_menu.AppendSeparator()
        file_menu.AppendSubMenu(file_all_crawls,
                                config.menu_title_file_all_crawls)

        self.Bind(
            wx.EVT_MENU,
            self.adv_config.heritrix_panel.finish_all_crawls,
            file_all_crawls_finish,
        )

        edit_undo = self.add_menu_item(
            edit_menu, config.menu_title_edit_undo, "CTRL+Z")
        edit_redo = self.add_menu_item(
            edit_menu, config.menu_title_edit_redo, "CTRL+Y")
        edit_menu.AppendSeparator()
        edit_cut = self.add_menu_item(
            edit_menu, config.menu_title_edit_cut, "CTRL+X")
        edit_copy = self.add_menu_item(
            edit_menu, config.menu_title_edit_copy, "CTRL+C")
        edit_paste = self.add_menu_item(
            edit_menu, config.menu_title_edit_paste, "CTRL+V")
        edit_select_all = self.add_menu_item(
            edit_menu, config.menu_title_edit_select_all, "CTRL+A"
        )

        # Disable Edit menu items until implemented
        edit_undo.Enable(0)
        edit_redo.Enable(0)
        edit_cut.Enable(0)
        edit_copy.Enable(0)
        edit_paste.Enable(0)
        edit_select_all.Enable(0)

        edit_undo.Enable(0)

        # self.Bind(wx.EVT_MENU, self.undo, self.edit_undo)
        # self.Bind(wx.EVT_MENU, self.redo, self.edit_redo)
        # self.Bind(wx.EVT_MENU, self.cut, self.edit_cut)
        # self.Bind(wx.EVT_MENU, self.copy, self.edit_copy)
        # self.Bind(wx.EVT_MENU, self.paste, self.edit_paste)
        # self.Bind(wx.EVT_MENU, self.selectall, self.edit_select_all)

        view_basic = self.add_menu_item(
            view_menu, config.menu_title_view_view_basic, "CTRL+0"
        )
        view_menu.AppendSeparator()
        adv = self.add_menu_item(
            view_menu, config.menu_title_view_view_advanced)
        adv.Enable(0)

        view_services = self.add_menu_item(
            view_menu, config.menu_title_view_view_advanced_services, "CTRL+1"
        )
        view_wayback = self.add_menu_item(
            view_menu, config.menu_title_view_view_advanced_wayback, "CTRL+2"
        )
        view_heritrix = self.add_menu_item(
            view_menu, config.menu_title_view_view_advanced_heritrix, "CTRL+3"
        )
        view_miscellaneous = self.add_menu_item(
            view_menu, config.menu_title_view_view_advanced_miscellaneous,
            "CTRL+4"
        )

        window_wail = window_menu.AppendCheckItem(
            wx.ID_ANY, config.menu_title_window_wail
        )
        window_wail.Check()  # Initially check menu item

        # Prevent from being unchecked
        self.Bind(wx.EVT_MENU, lambda evt: window_wail.Check(True),
                  window_wail)

        help_preferences = help_menu.Append(wx.ID_PREFERENCES,
                                           "Preferences...\tCTRL+,")
        help_preferences.Enable(0)  # TODO: implement

        if util.is_macOS():  # About at top
            help_menu.Prepend(wx.ID_ABOUT, config.menu_title_about)
        elif util.is_windows():  # About as last entry
            help_menu.Append(wx.ID_ABOUT, config.menu_title_about)

        if util.is_macOS():  # TODO: verify if wx.ID_EXIT would work better
            help_menu.Append(wx.ID_EXIT, "&QUIT")
        elif util.is_windows():
            file_menu.Append(wx.ID_EXIT, "&Exit")

        menu_bar.Append(file_menu, config.menu_title_file)
        menu_bar.Append(edit_menu, config.menu_title_edit)
        menu_bar.Append(view_menu, config.menu_title_view)
        menu_bar.Append(window_menu, config.menu_title_window)
        menu_bar.Append(help_menu, config.menu_title_help)

        self.Bind(wx.EVT_MENU, self.display_about_menu, id=wx.ID_ABOUT)
        self.Bind(wx.EVT_MENU, self.quit, id=wx.ID_EXIT)

        # Menu events
        self.Bind(
            wx.EVT_MENU,
            lambda evt, basic_tab=True: self.display_tab(basic_tab=basic_tab),
            view_basic,
        )


        self.Bind(wx.EVT_MENU, self.display_preferences, help_preferences)

        self.bind_menu(config.menu_title_view_view_advanced_services,
                       view_services)
        self.bind_menu(config.menu_title_view_view_advanced_wayback,
                       view_wayback)
        self.bind_menu(config.menu_title_view_view_advanced_heritrix,
                       view_heritrix)
        self.bind_menu(
            config.menu_title_view_view_advanced_miscellaneous,
            view_miscellaneous
        )

        # Fix Quit menuitem capitalization
        wail_menu = menu_bar.OSXGetAppleMenu()
        if wail_menu is not None:
            for m in wail_menu.GetMenuItems():
                if m.GetId() == wx.ID_EXIT:
                    m.SetItemLabel("Quit WAIL\tCTRL+Q")

        self.SetMenuBar(menu_bar)

    @staticmethod
    def add_menu_item(parent_menu, item_text, short_cut=""):
        sep = "\t"
        if short_cut == "":
            sep = ""
        return parent_menu.Append(wx.ID_ANY, f"{item_text}{sep}{short_cut}")

    def bind_menu(self, title, menu):
        self.Bind(wx.EVT_MENU, lambda evt, t=title: self.display_tab(t), menu)

    def display_tab(self, table_title="Basic", basic_tab=False):
        """Change tab currently shown in the UI"""
        if basic_tab:
            self.notebook.SetSelection(0)
            return

        self.notebook.SetSelection(1)

        pages = {
            config.menu_title_view_view_advanced_services: 0,
            config.menu_title_view_view_advanced_wayback: 1,
            config.menu_title_view_view_advanced_heritrix: 2,
            config.menu_title_view_view_advanced_miscellaneous: 3,
        }
        self.adv_config.notebook.SetSelection(pages[table_title])

    def setup_new_crawl_from_menu(self, _):
        """Change view to Advanced Crawl, display URI textbox"""
        self.display_tab(config.menu_title_view_view_advanced_heritrix)
        self.adv_config.heritrix_panel.setup_new_crawl(None)

    def display_preferences(self, button):
        """Open the Preferences window"""
        # Check for window existence, build and show if not, show if so

        try:
            self.preferencesWindow
        except AttributeError:
            self.preferencesWindow = config.PreferencesWindow()

        self.preferencesWindow.Show()
        self.preferencesWindow.Raise()
        self.preferencesWindow.Bind(wx.EVT_CLOSE, self.deletePrefWin)


    def delete_preferences_window(self, event):
        #self.preferencesWindow.Close()
        self.preferencesWindow.Hide()
        del self.preferencesWindow

    @staticmethod
    def display_about_menu(_):
        """Show new window with application information"""
        info = wx.adv.AboutDialogInfo()
        info.SetName(config.about_window_app_name)
        info.SetVersion(f"v. {config.WAIL_VERSION}")
        info.SetCopyright(config.about_window_author)

        wx.adv.AboutBox(info)

    @staticmethod
    def ensure_correct_installation():
        """Verify installation location"""
        # TODO: properly implement this
        # Check that the file is being executed from the correct location
        current_path = os.path.dirname(os.path.abspath(__file__))
        if util.is_macOS() and current_path != "/Applications":
            # Alert the user to move the file. Exit the program
            wx.MessageBox(
                f"{config.msg_wrong_location_body}{current_path}",
                config.msg_wrong_location_title,
            )
            print(f"{config.msg_wrong_location_body}{current_path}")

    def quit(self, _):
        """Kill MemGator"""
        self.basic_config.memgator.kill(None)

        """Exit the application"""
        if main_app_window.indexing_timer:
            main_app_window.indexing_timer.cancel()
        sys.exit(1)  # Be a good citizen. Cleanup your memory footprint


class WAILGUIFrame_Basic(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        self.parent = parent
        self.memgator = MemGator()

        # Forces Windows into composite mode for drawing
        self.SetDoubleBuffered(True)

        self.uri = wx.TextCtrl(self, wx.ID_ANY,
                               value=config.text_label_default_uri)

        basic_sizer = wx.BoxSizer(wx.VERTICAL)
        basic_sizer_uri = wx.BoxSizer()
        basic_sizer_buttons = wx.BoxSizer()
        basic_sizer_messages = wx.BoxSizer()

        basic_sizer_uri.Add(
            wx.StaticText(self, wx.ID_ANY, config.button_label_uri),
            flag=wx.CENTER
        )
        basic_sizer_uri.Add(self.uri, proportion=1, flag=wx.CENTER)

        self.archive_now_button = wx.Button(
            self, wx.ID_ANY, config.button_label_archive_now
        )
        self.check_archive_status = wx.Button(
            self, wx.ID_ANY, config.button_label_check_status
        )
        self.view_archive = wx.Button(self, wx.ID_ANY,
                                      config.button_label_view_archive)

        basic_sizer_buttons.Add(self.view_archive, proportion=1,
                                flag=wx.CENTER)
        basic_sizer_buttons.AddStretchSpacer()
        basic_sizer_buttons.Add(self.check_archive_status, proportion=1,
                                flag=wx.CENTER)
        basic_sizer_buttons.AddStretchSpacer()
        basic_sizer_buttons.Add(self.archive_now_button, proportion=1,
                                flag=wx.CENTER)

        self.status = wx.StaticText(self, wx.ID_ANY,
                                    config.text_label_status_init)

        basic_sizer.Add(basic_sizer_uri, proportion=0, flag=wx.EXPAND)
        basic_sizer.AddSpacer(3)
        basic_sizer.Add(basic_sizer_buttons, proportion=0, flag=wx.EXPAND)
        basic_sizer.AddSpacer(3)
        basic_sizer.Add(self.status, proportion=0, flag=wx.EXPAND)
        basic_sizer.AddStretchSpacer()
        basic_sizer.Add(basic_sizer_messages, proportion=1)

        self.SetSizerAndFit(basic_sizer)
        self.archive_now_button.SetDefault()

        # Basic interface button actions
        self.archive_now_button.Bind(wx.EVT_BUTTON, self.archive_now)
        self.check_archive_status.Bind(wx.EVT_BUTTON,
                                       self.check_if_url_is_in_archive)
        self.view_archive.Bind(wx.EVT_BUTTON, self.view_archive_in_browser)

        # TODO: check environment variables
        self.ensure_environment_variables_are_set()

        self.set_memento_count(None)

        # Bind changes in URI to query MemGator
        self.memgator_delay_timer = None

        if not util.is_linux():  # GitHub issue #404
            thread.start_new_thread(self.fetch_mementos, ())
        # Call MemGator on URI change
        self.uri.Bind(wx.EVT_KEY_UP, self.uri_changed)
        pub.subscribe(self.uri_changed, 'recheck_uri_in_basic_interface')

        self.memgator_delay_timer = threading.Timer(
            1.0, thread.start_new_thread, [self.fetch_mementos, ()]
        )
        self.memgator_delay_timer.daemon = True
        self.memgator_delay_timer.start()

    def set_memento_count(self, m_count, a_count=0, includes_local=False):
        """Display the number of mementos in the interface based on the
        results returned from MemGator
        """
        # Ensure m_count is an int, convert if not, allow None
        if m_count is not None and not isinstance(m_count, int):
            m_count = int(m_count)
        if m_count is not None and (m_count < 0 or a_count < 0):
            raise ValueError("Invalid memento or archive count specified")

        mem_count_msg = ""
        if m_count is None:
            mem_count_msg = config.msg_fetching_mementos
            includes_local = True
        elif m_count > 0:
            locale_to_set = "en_US"
            if not util.is_macOS():  # Let system determine locale
                locale_to_set = ""

            if util.is_linux():
                locale_to_set = "en_US.UTF-8"

            locale.setlocale(locale.LC_ALL, locale_to_set)

            m_plurality = "s"
            a_plurality = "s"

            if m_count == 1:
                m_plurality = ""
            if a_count == 1:
                a_plurality = ""
            m_count = locale.format_string("%d", m_count, grouping=True)
            mem_count_msg = (
                f"🕒 {m_count} memento{m_plurality} available from "
                f"{a_count} archive{a_plurality}"
            )
        elif m_count == 0:
            mem_count_msg = config.msg_no_mementos_available
        else:
            """ """

        status_string = f"{mem_count_msg}"
        pub.sendMessage('change_statusbar', msg=status_string, includes_local=includes_local)

        self.Layout()

    def set_message(self, msg):
        self.status.SetLabel(msg)

    def fetch_mementos(self):  # MemGator in server mode
        """Request memento count from MemGator based on URI currently
        displayed in the Basic interface
        """
        # TODO: Use CDXJ for counting the mementos
        current_uri_value = self.uri.GetValue()
        print(f"MEMGATOR checking {current_uri_value}")

        startup_info = None
        # Fixes issue of Popen on Windows
        if sys.platform.startswith("win32"):
            startup_info = subprocess.STARTUPINFO()
            startup_info.dwFlags |= subprocess.STARTF_USESHOWWINDOW

        while not self.memgator.accessible():
            self.memgator.fix()
            time.sleep(500)
        tm = self.memgator.get_timemap(current_uri_value, 'cdxj').split('\n')

        m_count = 0
        arch_hosts = set()

        for line in tm:
            cleaned_line = line.strip()

            if cleaned_line[:1].isdigit():
                m_count += 1
                arch_hosts.add(cleaned_line.split('/', 3)[2])

        includes_local = 'localhost:8080' in arch_hosts
        # UI not updated on Windows
        pub.sendMessage('change_statusbar_with_counts',
                        m_count=m_count, a_count=len(arch_hosts),
                        includes_local=includes_local)

        print((
            f"MEMGATOR\n* URI-R: {current_uri_value}\n* URI-Ms {m_count}\n* "
            f"Archives: {len(arch_hosts)}"
            )
        )
        # TODO: cache the TM

    def uri_changed(self, event=None):
        """React when the URI has changed in the interface, call MemGator"""
        if event is not None and event.GetUnicodeKey() == wx.WXK_NONE:
            return  # Prevent modifiers from causing MemGator query

        self.set_memento_count(None)

        if self.memgator_delay_timer:  # Kill any currently running timer
            self.memgator_delay_timer.cancel()
            self.memgator_delay_timer = None

        self.memgator_delay_timer = threading.Timer(
            1.0, self.fetch_mementos
        )
        self.memgator_delay_timer.daemon = True
        self.memgator_delay_timer.start()

        pub.subscribe(self.set_memento_count, 'change_statusbar_with_counts')

        # TODO: start timer on below, kill if another key is hit
        # thread.start_new_thread(self.fetch_mementos,())
        if event:
            event.Skip()

    def ensure_environment_variables_are_set(self):
        """Check system to verify that Java variables have been set.
        Notify the user if not and initialize the Java installation process.
        """
        # if util.is_windows() or util.is_linux():
        #    return True # Allow windows to proceed w/o java checks for now.

        JAVA_HOME_defined = "JAVA_HOME" in os.environ
        JRE_HOME_defined = "JRE_HOME" in os.environ
        if not JAVA_HOME_defined or not JRE_HOME_defined:
            jre_home = ""
            java_home = ""
            if util.is_macOS() or util.is_windows():
                jre_home = config.jre_home
                java_home = config.java_home
            else:  # Win, incomplete
                # os.environ['PATH'] # java8 does not use JRE_HOME, JAVA_HOME
                pass

            os.environ["JAVA_HOME"] = java_home
            os.environ["JRE_HOME"] = jre_home
            self.ensure_environment_variables_are_set()
        return True

    def archive_now(self, _):
        """Call asynchronous version of archiving process to prevent
        the UI from locking up

        """
        if not self.ensure_environment_variables_are_set():
            print("Java must be installed to archive using Heritrix")
            return

        self.archive_now_button.SetLabel(
            config.button_label_archive_now_initializing)
        self.set_message("Starting Archiving Process...")
        self.archive_now_button.Disable()
        thread.start_new_thread(self.archive_now2Async, ())

    def archive_now2Async(self):
        """Create Heritrix crawl job, execute job, and update WAIL UI
        to indicate that a crawl has been initialized
        """
        self.set_message(config.msg_crawl_status_writing_config)
        self.write_heritrix_log_with_uri()
        # First check to be sure Java SE is installed.
        if self.java_installed():
            self.set_message(config.msg_crawl_status_launching_crawler)
            if not Heritrix().accessible():
                self.launch_heritrix()
            self.set_message(config.msg_crawl_status_launching_wayback)
            main_app_window.adv_config.start_tomcat()
            # time.sleep(4)
            self.set_message(config.msg_crawl_status_initializing_crawl_job)
            self.start_heritrix_job()
            main_app_window.adv_config.heritrix_panel.populate_listbox_with_jobs()
            self.set_message(f"Crawl of {self.uri.GetValue()[0:41]} started!")
            wx.CallAfter(
                main_app_window.adv_config.services_panel.update_service_statuses)
            # if sys.platform.startswith('darwin'): #show a notification
            # ... of success in OS X
            #  Notifier.notify('Archival process successfully initiated.',
            #  ...title="WAIL")
        else:
            print("JAVA not INSTALLED")
            print(config.msg_java6Required)
            self.set_message(config.msg_archive_failed_java)

        wx.CallAfter(self.on_long_run_done)

    def on_long_run_done(self):
        """Re-enable archive now UI once the previous process is
        done being initialized and executed

        """
        self.archive_now_button.SetLabel(config.button_label_archive_now)
        self.archive_now_button.Enable()

    def write_heritrix_log_with_uri(self):
        """Create crawl job files with URI currently in Basic interface"""
        self.h_job = HeritrixJob(
            config.heritrix_job_path, [self.uri.GetValue()])
        self.h_job.write()

    def java_installed(self):
        """Check that a java binary is available"""
        # First check to be sure Java SE is installed.
        # Move this logic elsewhere in production
        no_java = config.msg_no_java_runtime
        try:
            p = Popen(["java", "-version"], stdout=PIPE, stderr=PIPE)
            stdout, stderr = p.communicate()
        except FileNotFoundError:
            return False

        return (no_java not in stdout) and (no_java not in stderr)

    def launch_heritrix(self):
        """Execute Heritrix binary to allow jobs to be submitted"""
        cmd = (f"{config.heritrix_bin_path} "
               f"-a {config.heritrix_credentials_username}:"
               f"{config.heritrix_credentials_password}")

        print(cmd)

        # TODO: shell=True was added for OS X
        # TODO: verify that functionality persists on Win64
        subprocess.Popen(cmd, shell=True)
        time.sleep(3)
        main_app_window.adv_config.services_panel.update_service_statuses()

    def start_heritrix_job(self):
        """Build a previously created Heritrix job file and start the
        Heritrix binary process to begin processing job
        """
        self.build_heritrix_job()
        self.launch_heritrix_job()

    def launch_heritrix_job(self):
        """ Launch Heritrix job after building"""
        logging.basicConfig(level=logging.DEBUG)
        print("Launching Heririx job")
        data = {"action": "launch"}
        headers = {
            "Accept": "application/xml",
            "Content-type": "application/x-www-form-urlencoded",
        }
        requests.post(
            f"{config.uri_heritrix_job}{self.h_job.job_number}",
            auth=HTTPDigestAuth(
                config.heritrix_credentials_username,
                config.heritrix_credentials_password
            ),
            data=data,
            headers=headers,
            verify=False,
            stream=True,
        )
        # TODO: Verify that the post request was received

    def build_heritrix_job(self):
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
            f"{config.uri_heritrix_job}{self.h_job.job_number}",
            auth=HTTPDigestAuth(
                config.heritrix_credentials_username,
                config.heritrix_credentials_password
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

    def check_if_url_is_in_archive(self, button):
        """Send a request to the local Wayback instance and check if a
        Memento exists, inferring that a capture has been generated by
        Heritrix and an index generated from a WARC and the memento replayable


        """
        url = f"{config.uri_wayback_all_mementos}{self.uri.GetValue()}"
        status_code = None
        try:
            resp = urlopen(url)
            status_code = resp.getcode()
        except HTTPError as e:
            status_code = e.code
        except:
            # When the server is unavailable, keep the default.
            # This is necessary, as unavailability will still cause an
            # exception
            """"""

        if status_code is None:
            launch_wayback_dialog = wx.MessageDialog(
                None,
                config.msg_wayback_not_started_body,
                config.msg_wayback_not_started_title,
                wx.YES_NO | wx.YES_DEFAULT,
            )
            launch_wayback = launch_wayback_dialog.ShowModal()
            if launch_wayback == wx.ID_YES:
                wx.GetApp().Yield()
                Wayback().fix(None,
                              lambda: self.check_if_url_is_in_archive(button))
        elif 200 != status_code:
            wx.MessageBox(
                config.msg_uri_not_in_archive,
                f"Checking for {self.uri.GetValue()}"
            )
        else:
            mb = wx.MessageDialog(self, config.msg_uri_in_archives_body,
                                  config.msg_uri_in_archives_title,
                                  style=wx.OK | wx.CANCEL)
            mb.SetOKCancelLabels("View Latest", "Go Back")
            resp = mb.ShowModal()

            if resp == wx.ID_OK:  # View latest capture
                print('Showing latest capture')
                self.view_archive_in_browser(None, True)
            else:  # Show main window again
                print('Show main window again')

    def reset_archive_now_button(self):
        """Update the Archive Now button in the UI to be in its initial
        state

        """
        self.archive_now_button.SetLabel(
            config.button_label_archive_now_initializing)

    def view_archive_in_browser(self, button, latest_memento=False):
        """Open the OS's default browser to display the locally running
        Wayback instance

        """
        if Wayback().accessible():
            uri = f"{config.uri_wayback_all_mementos}{self.uri.GetValue()}"

            if latest_memento:
                uri = f"{config.uri_wayback}{self.uri.GetValue()}"

            webbrowser.open_new_tab(uri)
        else:
            d = wx.MessageDialog(
                self, "Launch now?", "Wayback is not running",
                config.wail_style_yes_no
            )
            result = d.ShowModal()
            d.Destroy()
            if result == wx.ID_YES:  # Launch Wayback
                Wayback().fix(self.reset_archive_now_button)
                self.archive_now_button.SetLabel("Initializing...")


class WAILGUIFrame_Advanced(wx.Panel):
    class services_panel(wx.Panel, threading.Thread):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.fix_wayback = wx.Button(
                self, 1, config.button_label_fix, style=wx.BU_EXACTFIT
            )
            self.fix_heritrix = wx.Button(
                self, 1, config.button_label_fix, style=wx.BU_EXACTFIT
            )
            self.fix_memgator = wx.Button(
                self, 1, config.button_label_fix, style=wx.BU_EXACTFIT
            )

            self.kill_wayback = wx.Button(
                self, 1, config.button_label_kill, style=wx.BU_EXACTFIT
            )
            self.kill_heritrix = wx.Button(
                self, 1, config.button_label_kill, style=wx.BU_EXACTFIT
            )
            self.kill_memgator = wx.Button(
                self, 1, config.button_label_kill, style=wx.BU_EXACTFIT
            )

            self.status_wayback = wx.StaticText(self, wx.ID_ANY, "X")
            self.status_heritrix = wx.StaticText(self, wx.ID_ANY, "X")
            self.status_memgator = wx.StaticText(self, wx.ID_ANY, "X")

            self.draw()
            thread.start_new_thread(self.update_service_statuses, ())

            self.fix_wayback.Bind(wx.EVT_BUTTON, Wayback().fix)
            self.fix_heritrix.Bind(wx.EVT_BUTTON, Heritrix().fix)
            self.fix_memgator.Bind(wx.EVT_BUTTON, MemGator().fix)

            self.kill_wayback.Bind(wx.EVT_BUTTON, Wayback().kill)
            self.kill_heritrix.Bind(wx.EVT_BUTTON, Heritrix().kill)
            self.kill_memgator.Bind(wx.EVT_BUTTON, MemGator().kill)

            thread.start_new_thread(self.update_service_statuses, ())

        def draw(self):
            self.sizer = wx.BoxSizer()

            gs = wx.FlexGridSizer(4, 5, 0, 0)

            gs.AddMany(
                [
                    wx.StaticText(
                        self, wx.ID_ANY,
                        config.tab_label_advanced_services_serviceStatus
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
                                      self.get_wayback_version()),
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
                                      self.get_heritrix_version()),
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    self.fix_heritrix,
                    self.kill_heritrix,
                    (
                        wx.StaticText(self, wx.ID_ANY, "MemGator"),
                        1,
                        wx.ALIGN_CENTER_VERTICAL,
                    ),
                    (
                        self.status_memgator,
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    (
                        wx.StaticText(self, wx.ID_ANY,
                                      self.get_memgator_version()),
                        1,
                        wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
                    ),
                    self.fix_memgator,
                    self.kill_memgator,
                ]
            )
            gs.AddGrowableCol(0, 1)
            gs.AddGrowableCol(1, 1)
            gs.AddGrowableCol(2, 1)

            self.sizer.Add(gs, proportion=1)
            self.SetSizer(self.sizer)
            self.Layout()

        def set_heritrix_status(self, status):
            self.status_heritrix.SetLabel(status)

        def set_wayback_status(self, status):
            self.status_wayback.SetLabel(status)

        def set_memgator_status(self, status):
            self.status_memgator.SetLabel(status)

        def get_heritrix_version(self):
            htrix_lib_path = f"{config.heritrix_path}lib/"

            for file in os.listdir(htrix_lib_path):
                if file.startswith("heritrix-commons"):
                    regex = re.compile("commons-(.*)\.")
                    h_version = regex.findall(file)[0]
                    try:
                        h_version = f'{h_version[: h_version.index("-")]}*'
                    except ValueError:
                        pass
                    return h_version

        @staticmethod
        def get_wayback_version():
            tomcat_lib_path = f"{config.tomcat_path}/webapps/lib/"

            for file in os.listdir(tomcat_lib_path):
                if file.startswith("openwayback-core"):
                    regex = re.compile("core-(.*)\.")
                    return regex.findall(file)[0]

        @staticmethod
        def get_memgator_version():
            cmd = f'{config.memgator_path} -v'
            ret = subprocess.run(cmd, capture_output=True, shell=True,
                                 encoding='utf8')

            return ret.stdout[len('MemGator ('):-2]

        @staticmethod
        def get_tomcat_version():
            # Apache Tomcat Version 7.0.30
            release_notes_path = f"{config.tomcat_path}/RELEASE-NOTES"

            if not os.path.exists(release_notes_path):
                return "?"
            f = open(release_notes_path, "r")
            version = ""
            for line in f.readlines():
                if "Apache Tomcat Version " in line:
                    version = re.sub("[^0-9^\.]", "", line)
                    break
            f.close()
            return version

        def update_service_statuses(self, service_id=None,
                                    transitional_status=None):
            """Check if each service is enabled and set the GUI elements
            accordingly

            """
            service_enabled = {
                True: config.service_enabled_label_YES,
                False: config.service_enabled_label_NO,
            }

            heritrix_accessible = service_enabled[Heritrix().accessible()]
            wayback_accessible = service_enabled[Wayback().accessible()]
            memgator_accessible = service_enabled[MemGator().accessible()]

            if wayback_accessible is config.service_enabled_label_YES:
                tomcat_accessible = wayback_accessible
            else:
                tomcat_accessible = service_enabled[Tomcat().accessible()]

            # Update a transitional status and short circuit
            if service_id and transitional_status:
                if service_id == "wayback":
                    self.set_wayback_status(transitional_status)
                    return
                elif service_id == "heritrix":
                    self.set_heritrix_status(transitional_status)
                    return
                elif service_id == "memgator":
                    self.set_memgator_status(transitional_status)
                    return
                else:
                    print((
                        "Invalid transitional service id specified. "
                        "Updating status per usual."
                    ))

            self.set_wayback_status(tomcat_accessible)
            self.set_heritrix_status(heritrix_accessible)
            self.set_memgator_status(memgator_accessible)

            if not hasattr(self, "fix_heritrix"):
                print("First call, UI has not been setup")
                # Initial setup call will return here, ui elements
                # ...have not been created
                return

            # Enable/disable FIX buttons based on service status
            if heritrix_accessible is config.service_enabled_label_YES:
                self.fix_heritrix.Disable()
                self.kill_heritrix.Enable()
            else:
                self.fix_heritrix.Enable()
                self.kill_heritrix.Disable()

            if tomcat_accessible is config.service_enabled_label_YES:
                self.fix_wayback.Disable()
                self.kill_wayback.Enable()
            else:
                self.fix_wayback.Enable()
                self.kill_wayback.Disable()

            if memgator_accessible is config.service_enabled_label_YES:
                self.fix_memgator.Disable()
                self.kill_memgator.Enable()
            else:
                self.fix_memgator.Enable()
                self.kill_memgator.Disable()

    class WaybackPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.view_wayback_in_browser_button = wx.Button(
                self, -1, config.button_label_wayback
            )
            self.edit_wayback_configuration = wx.Button(
                self, -1, config.button_label_edit_wayback_config
            )
            self.view_wayback_in_browser_button.Bind(
                wx.EVT_BUTTON, self.open_wayback_in_browser
            )
            self.edit_wayback_configuration.Bind(
                wx.EVT_BUTTON, self.open_wayback_configuration
            )

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(self.view_wayback_in_browser_button, 0, wx.EXPAND, 0)
            box.Add(self.edit_wayback_configuration, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

        def open_wayback_in_browser(self, _):
            if Wayback().accessible():
                webbrowser.open_new_tab(config.uri_wayback)
                self.view_wayback_in_browser_button.SetLabel(
                    config.button_label_wayback)
                self.view_wayback_in_browser_button.Enable()
            else:
                d = wx.MessageDialog(
                    self,
                    "Launch now?",
                    "Wayback is not running",
                    config.wail_style_yes_no,
                )
                result = d.ShowModal()
                d.Destroy()
                if result == wx.ID_YES:  # Launch Wayback
                    Wayback().fix(None,
                                  lambda: self.open_wayback_in_browser(None))
                    self.view_wayback_in_browser_button.SetLabel(
                        config.button_label_wayback_launching
                    )
                    self.view_wayback_in_browser_button.Disable()

        @staticmethod
        def open_wayback_configuration(_):
            file_path = (
                f"{config.tomcat_path}/webapps/ROOT/WEB-INF/"
                "wayback.xml"
            )

            if util.is_macOS():
                subprocess.call(("open", file_path))
            elif util.is_windows():
                os.startfile(file_path)
            elif util.is_linux():
                subprocess.call(("xdg-open", file_path))

    class heritrix_panel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)

            self.listbox = wx.ListBox(self)
            self.populate_listbox_with_jobs()

            # TODO: Convert status_msg to use sizers
            self.status_msg = wx.StaticText(self, wx.ID_ANY, "", pos=(150, 0))

            self.listbox.Bind(wx.EVT_LISTBOX, self.clicked_listbox_item)
            self.listbox.Bind(wx.EVT_RIGHT_UP, self.manage_jobs)

            self.listbox.Bind(wx.EVT_SET_FOCUS, self.select_on_focus)

            self.crawl_jobs_text_ctrl_label = wx.StaticText(
                self, wx.ID_ANY, config.text_label_crawl_jobs
            )
            self.setup_new_crawl_button = wx.Button(
                self, wx.ID_ANY, config.button_label_heritrix_new_crawl
            )
            self.launch_webui_button = wx.Button(
                self, wx.ID_ANY, config.button_label_heritrix_launch_web_ui
            )

            # Button functionality
            self.setup_new_crawl_button.Bind(wx.EVT_BUTTON, self.setup_new_crawl)
            self.launch_webui_button.Bind(wx.EVT_BUTTON, self.launch_web_ui)

            self.panel_updater = None  # For updating stats UI

            panel_sizer = wx.FlexGridSizer(rows=1, cols=2, vgap=3, hgap=3)
            left_col_sizer = wx.FlexGridSizer(rows=4, cols=1, vgap=2, hgap=2)

            left_col_sizer.AddMany(
                [
                    self.crawl_jobs_text_ctrl_label,
                    self.listbox,
                    (self.setup_new_crawl_button, 0, wx.EXPAND),
                    (self.launch_webui_button, 0, wx.EXPAND),
                ]
            )

            panel_sizer.Add(left_col_sizer)
            self.SetSizer(panel_sizer)

        def select_on_focus(self, _):
            if self.listbox.GetItems()[0] != config.text_label_no_jobs_available:
                # There is a legitimate value, select it
                self.listbox.SetSelection(0)
                self.clicked_listbox_item()

        def populate_listbox_with_jobs(self):
            jobs_list = Heritrix().get_list_of_jobs()

            # Set to reverse chronological so newest jobs are at the top
            jobs_list.reverse()

            if len(jobs_list) == 0:
                jobs_list = [config.text_label_no_jobs_available]
                self.clear_info_panel()

            self.listbox.Set(jobs_list)

        def clicked_listbox_item(self, _=None):
            self.hide_new_crawl_ui_elements()
            self.status_msg.Show()

            selectionIndex = self.listbox.GetSelection()
            if selectionIndex == -1:
                raise InvalidSelectionContextException("Selected empty space")

            crawl_id = self.listbox.GetString(selectionIndex)
            if crawl_id == config.text_label_no_jobs_available:
                self.clear_info_panel()
                raise InvalidSelectionContextException(
                    "Selected empty placeholder")

            if self.panel_updater:  # Kill any currently running timer
                self.panel_updater.cancel()
                self.panel_updater = None
            self.updateInfoPanel(crawl_id)

        def updateInfoPanel(self, active):
            self.status_msg.SetLabel(Heritrix().get_current_stats(active))
            self.panel_updater = threading.Timer(
                1.0, self.updateInfoPanel, [active])
            self.panel_updater.daemon = True
            self.panel_updater.start()

        def clear_info_panel(self):
            if hasattr(self, "status_msg"):
                self.status_msg.SetLabel("")

        def launch_web_ui(self, _):
            self.launch_webui_button.SetLabel(
                config.button_label_heritrix_launch_web_ui_launching
            )
            self.launch_webui_button.Disable()
            thread.start_new_thread(self.launch_webui_async, ())

        def launch_webui_async(self):
            if not Heritrix().accessible():
                main_app_window.basic_config.launch_heritrix()
            webbrowser.open_new_tab(config.uri_heritrix)
            self.launch_webui_button.SetLabel(
                config.button_label_heritrix_launch_web_ui)
            self.launch_webui_button.Enable()

        @staticmethod
        def launch_heritrix_process(_):
            Heritrix().kill(None)
            time.sleep(3)
            main_app_window.basic_config.launch_heritrix()

        def manage_jobs(self, evt):
            # Do not show context menu without context
            if self.listbox.GetCount() == 0:
                return

            # Do not show context menu for empty placeholder
            if self.listbox.GetItems()[0] == config.text_label_no_jobs_available:
                return

            self.listbox.SetSelection(self.listbox.HitTest(evt.GetPosition()))
            try:
                self.clicked_listbox_item()
            except InvalidSelectionContextException:
                # Do not create context menu for invalid selection
                return

            # Create context menu for selection
            menu = wx.Menu()
            menu.Append(1, config.menu_force_crawl_to_finish)
            menu.Bind(wx.EVT_MENU, self.force_crawl_to_finish, id=1)
            menu.Append(2, config.menu_destroy_job)
            menu.Bind(wx.EVT_MENU, self.delete_heritrix_job, id=2)
            menu.Append(3, config.menu_view_job_in_web_browser)
            menu.Bind(wx.EVT_MENU, self.view_jobs_in_web_browser, id=3)
            menu.Append(4, config.menu_rebuild_job)
            menu.Bind(wx.EVT_MENU, self.rebuild_job, id=4)
            menu.Append(5, config.menu_rebuild_and_launch_job)
            menu.Bind(wx.EVT_MENU, self.rebuild_and_launch_job, id=5)
            main_app_window.PopupMenu(
                menu, main_app_window.ScreenToClient(wx.GetMousePosition())
            )
            menu.Destroy()

        def finish_all_crawls(self, _):
            for crawl_id in self.listbox.GetItems():
                self.finish_crawl(crawl_id)

        def finish_crawl(self, job_id):
            """Cleanup Heritrix job after finishing"""
            self.send_action_to_heritrix("terminate", job_id)
            self.send_action_to_heritrix("teardown", job_id)

        def force_crawl_to_finish(self, _):
            """Read currently selected crawl_id and instruct Heritrix
            to finish the job.

            """
            job_id = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.finish_crawl(job_id)

        @staticmethod
        def send_action_to_heritrix(action, job_id):
            """Communicate with the local Heritrix binary via its HTTP API"""
            data = {"action": action}
            headers = {
                "Accept": "application/xml",
                "Content-type": "application/x-www-form-urlencoded",
            }
            requests.post(
                f"{config.uri_heritrix_job}{job_id}",
                auth=HTTPDigestAuth(
                    config.heritrix_credentials_username,
                    config.heritrix_credentials_password,
                ),
                data=data,
                headers=headers,
                verify=False,
                stream=True,
            )

        def delete_heritrix_job(self, _):
            """Read the currently selected crawl_id and delete its
            configuration files from the file system.

            """
            job_path = (
                f"{config.heritrix_job_path}"
                f"{str(self.listbox.GetString(self.listbox.GetSelection()))}"
            )
            print(f"Deleting Job at {job_path}")
            try:
                shutil.rmtree(job_path)
            except OSError:
                print("Job deletion failed.")
            self.populate_listbox_with_jobs()

            # Blanks details if no job entries remain in UI
            if self.listbox.GetCount() == 0:
                self.status_msg.SetLabel("")

        def view_jobs_in_web_browser(self, _):
            """Display crawl information in the Heritrix web interface
            based on the currently selected crawl_id.

            """
            job_id = str(self.listbox.GetString(self.listbox.GetSelection()))
            webbrowser.open_new_tab(f"{config.uri_heritrix_job}{job_id}")

        def rebuild_job(self, _):
            job_id = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.send_action_to_heritrix("build", job_id)

        def rebuild_and_launch_job(self, _):
            job_id = str(self.listbox.GetString(self.listbox.GetSelection()))
            self.send_action_to_heritrix("build", job_id)
            self.send_action_to_heritrix("launch", job_id)

        def open_config_in_text_editor(self, _):
            # TODO, most systems don't know how to open a cxml file.
            # ...Is there a way to create a system mapping from python?

            # Issue #22 prevents the context of the right-click item from
            # ...being obtained and used here.
            file = (
                f"{config.heritrix_job_path}"
                f"{str(self.listbox.GetString(self.listbox.GetSelection()))}"
                f"/crawler-beans.cxml"
            )
            if util.is_macOS():
                subprocess.call(("open", file))
            elif util.is_windows():
                os.startfile(file)
            elif util.is_linux():
                subprocess.call(("xdg-open", file))

        def restart_job(self, _):
            # TODO: send request to API to restart job, perhaps send ID to
            # this function
            print("Restarting job")

        def remove_new_crawl_ui(self):
            chil = self.Sizer.GetChildren()
            if len(chil) > 1:
                self.Sizer.Hide(len(chil) - 1)
                self.Sizer.Remove(len(chil) - 1)

                self.Layout()

        def deselect_crawl_listbox_items(self, _):
            self.listbox.Deselect(self.listbox.GetSelection())

        def add_new_crawl_ui(self):
            self.status_msg.Hide()
            chil = self.Sizer.GetChildren()
            if len(chil) > 1:
                self.remove_new_crawl_ui()

            self.new_crawl_text_ctrl_label = wx.StaticText(
                self, wx.ID_ANY, config.text_label_uri_entry
            )
            multline_and_no_wrap_style = wx.TE_MULTILINE + wx.TE_DONTWRAP
            self.new_crawl_text_ctrl = wx.TextCtrl(
                self, wx.ID_ANY, size=(220, 90), style=multline_and_no_wrap_style
            )

            right_col_sizer = wx.FlexGridSizer(3, 1, 2, 2)

            right_col_sizer.AddMany(
                [self.new_crawl_text_ctrl_label, self.new_crawl_text_ctrl])

            depth_sizer = wx.GridBagSizer(2, 2)

            self.new_crawl_depth_text_ctrl = wx.TextCtrl(self, wx.ID_ANY,
                                                         size=(44, -1))

            self.new_crawl_depth_text_ctrl.SetValue(
                config.text_label_depth_default)
            self.new_crawl_depth_text_ctrl.Bind(wx.EVT_KILL_FOCUS,
                                                self.validate_crawl_depth)
            self.new_crawl_depth_text_ctrl.Bind(
                wx.EVT_CHAR, self.handle_crawl_depth_keypress)

            # When a new crawl UI textbox is selected, deselect listbox
            self.new_crawl_text_ctrl.Bind(wx.EVT_SET_FOCUS,
                                          self.deselect_crawl_listbox_items)
            self.new_crawl_depth_text_ctrl.Bind(wx.EVT_SET_FOCUS,
                                                self.deselect_crawl_listbox_items)

            self.start_crawl_button = wx.Button(
                self, wx.ID_ANY, config.button_label_start_crawl
            )
            self.start_crawl_button.SetDefault()
            self.start_crawl_button.Bind(wx.EVT_BUTTON, self.crawl_uris_listed)

            depth_sizer.Add(
                wx.StaticText(self, wx.ID_ANY, config.text_label_depth),
                pos=(0, 0),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
            )
            depth_sizer.Add(
                self.new_crawl_depth_text_ctrl,
                pos=(0, 1),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_CENTER_HORIZONTAL,
            )
            depth_sizer.Add(
                self.start_crawl_button,
                pos=(0, 6),
                span=(2, 1),
                flag=wx.ALIGN_CENTER_VERTICAL | wx.ALIGN_RIGHT,
            )

            right_col_sizer.Add(depth_sizer)

            self.Sizer.Add(right_col_sizer)
            self.Layout()

            # Deselect any highlighted selection in the jobs listbox
            self.deselect_crawl_listbox_items()

        def setup_new_crawl(self, _):
            """Create UI elements for user to specify the URIs and other
            attributes for a new Heritrix crawl.

            """
            self.add_new_crawl_ui()
            self.new_crawl_text_ctrl.SetFocus()

        @staticmethod
        def handle_crawl_depth_keypress(event):
            """Ensure that values for the crawl depth text input field
            are numerical.

            """
            keycode = event.GetKeyCode()
            if keycode < 255:
                # valid ASCII
                if chr(keycode).isdigit():
                    # Valid alphanumeric character
                    event.Skip()

        def validate_crawl_depth(self, event):
            """Verify that the value supplied for the crawl depth text
            field is numerical.

            """
            if len(self.new_crawl_depth_text_ctrl.GetValue()) == 0:
                self.new_crawl_depth_text_ctrl.SetValue("1")
            event.Skip()

        def hide_new_crawl_ui_elements(self):
            """Hide UI elements related to a new Heritrix crawl."""

            self.remove_new_crawl_ui()

        def show_new_crawl_ui_elements(self):
            """Display UI elements related to a new Heritrix crawl."""
            self.new_crawl_text_ctrl_label.Show()
            self.new_crawl_text_ctrl.Show()
            self.start_crawl_button.Show()

        def crawl_uris_listed(self, _):
            """Build and initialize a new Heritrix crawl based on the
            list of URIs specified in the WAIL UI.

            """
            uris = self.new_crawl_text_ctrl.GetValue().split("\n")
            depth = self.new_crawl_depth_text_ctrl.GetValue()
            self.h_job = HeritrixJob(config.heritrix_job_path, uris, depth)
            self.h_job.write()
            self.populate_listbox_with_jobs()

            if not Heritrix().accessible():
                main_app_window.basic_config.launch_heritrix()

            self.h_job.build_heritrix_job()
            self.h_job.launch_heritrix_job()

    class MiscellaneousPanel(wx.Panel):
        def __init__(self, parent):
            wx.Panel.__init__(self, parent)
            view_archives_folder_button_button = wx.Button(
                self, 1, config.button_label_view_archive_files
            )

            view_archives_folder_button_button.Bind(wx.EVT_BUTTON,
                                                    self.open_archives_folder)
            self.test_update = wx.Button(self, 1,
                                         config.button_label_check_for_updates)

            box = wx.BoxSizer(wx.VERTICAL)
            box.Add(view_archives_folder_button_button, 0, wx.EXPAND, 0)
            box.Add(self.test_update, 0, wx.EXPAND, 0)

            self.SetAutoLayout(True)
            self.SetSizer(box)
            self.Layout()

            self.test_update.Bind(wx.EVT_BUTTON, self.check_for_updates)
            self.test_update.Disable()

        @staticmethod
        def open_archives_folder(_):
            """Display the folder in which generated WARCs reside in the
            operating system's file manager.

            """
            if not os.path.exists(config.warcs_folder):
                os.makedirs(config.warcs_folder)

            if util.is_windows():
                os.startfile(config.warcs_folder)
            else:
                subprocess.call(["open", config.warcs_folder])

        def check_for_updates(self, _):
            """Display the window for updating WAIL."""

            update_window = UpdateSoftwareWindow(parent=self, id=-1)
            update_window.Show()
            # return
            # check if an updates version is available

            # if an updated version is available and the user wants it,
            # ...copy the /Application/WAIL.app/Contents folder

    def __init__(self, parent):
        wx.Panel.__init__(self, parent)

        self.notebook = wx.Notebook(self)
        self.notebook.my_status_bar = self
        vbox = wx.BoxSizer(wx.VERTICAL)
        vbox.Add(self.notebook, 10, flag=wx.EXPAND)

        self.SetSizer(vbox)

        self.services_panel = WAILGUIFrame_Advanced.services_panel(
            self.notebook)
        self.wayback_panel = WAILGUIFrame_Advanced.WaybackPanel(
            self.notebook)
        self.heritrix_panel = WAILGUIFrame_Advanced.heritrix_panel(
            self.notebook)
        self.miscellaneous_panel = WAILGUIFrame_Advanced.MiscellaneousPanel(
            self.notebook)

        self.notebook.AddPage(self.services_panel,
                              config.tab_label_advanced_services)
        self.notebook.AddPage(self.wayback_panel,
                              config.tab_label_advanced_wayback)
        self.notebook.AddPage(self.heritrix_panel,
                              config.tab_label_advanced_heritrix)
        self.notebook.AddPage(
            self.miscellaneous_panel, config.tab_label_advanced_miscellaneous
        )

        self.x, self.y = (15, 5)
        self.height = (150, 25 * 0.80)

        # Inits for 'self' references uses in methods
        self.write_config = None
        self.h_job = None

    def start_tomcat(self):
        cmd = config.tomcat_path_start
        subprocess.Popen(cmd)
        waiting_for_tomcat = True
        while waiting_for_tomcat:
            if Wayback().accessible():
                waiting_for_tomcat = False
            time.sleep(2)

        self.wayback_panel.view_wayback_in_browser_button.Enable()

    @staticmethod
    def launch_heritrix(_):
        # self.heritrixStatus.SetLabel("Launching Heritrix")
        cmd = (
            f"{config.heritrix_bin_path} -a "
            f"{config.heritrix_credentials_username}:"
            f"{config.heritrix_credentials_password}"
        )

        # TODO: shell=True was added for macOS
        # ...verify that functionality persists on Win64
        subprocess.Popen(cmd, shell=True)
        # urlib won't respond to https, hard-coded sleep until I
        # ...can ping like Tomcat
        time.sleep(6)
        # self.view_heritrixButton.Enable()

    @staticmethod
    def view_wayback(_):
        webbrowser.open_new_tab(config.uri_wayback)

    @staticmethod
    def view_heritrix(_):
        webbrowser.open_new_tab(config.uri_heritrix)

    def create_listboxx(self):
        self.uri_list_box_title = wx.StaticText(
            self, 7, config.text_label_urisToCrawl,
            (self.x, 5 + self.height * 7 + 30)
        )
        self.uri_list_box = wx.ListBox(self, wx.ID_ANY, [""])
        self.uri_list_box.Bind(wx.EVT_LISTBOX, self.add_uri)
        self.SetSize((self.GetSize().x, self.GetSize().y + 300))

        main_app_window.SetSize((main_app_window.GetSize().x, 400))

    def setup_one_off_crawl(self, _):
        if self.uri_list_box is not None:
            return  # This function has already been done
        self.create_listboxx()

        self.write_config = wx.Button(
            self,
            33,
            "Write Heritrix Config",
            (self.GetSize().x - 175, 280),
            (self.width, self.height),
        )

        wail_style_button_font = wx.Font(
            config.font_size,
            wx.FONTFAMILY_SWISS,
            wx.FONTSTYLE_NORMAL,
            wx.FONTWEIGHT_NORMAL,
        )

        self.write_config.SetFont(wail_style_button_font)
        self.write_config.Bind(wx.EVT_BUTTON, self.crawl_uris)
        self.write_config.Disable()
        self.launch_crawl_button = wx.Button(
            self,
            33,
            config.text_label_launch_crawl,
            (self.GetSize().x - 175, 305),
            (self.width, self.height),
        )
        self.launch_crawl_button.SetFont(wail_style_button_font)
        self.launch_crawl_button.Bind(wx.EVT_BUTTON, self.launch_crawl)
        self.launch_crawl_button.Disable()

    def crawl_uris(self, _):
        uris = self.uri_list_box.GetStrings()
        self.h_job = HeritrixJob(config.heritrix_job_path, uris)
        self.h_job.write()
        self.write_config.Disable()
        self.uri_list_box.Set([""])
        self.launch_crawl_button.Enable()

    def launch_crawl(self, _):
        main_app_window.basic_config.h_job = self.h_job
        main_app_window.basic_config.launch_heritrix()
        main_app_window.basic_config.start_heritrix_job()

    def add_uri(self, _):
        default_message = ""
        try:
            default_message = self.uri_list_box.GetString(
                self.uri_list_box.GetSelection())
        except:
            default_message = ""
        message = wx.GetTextFromUser(
            "Enter a URI to be crawled", default_value=default_message
        )
        if message == "" and message == default_message:
            return
        url = urlparse(message)
        self.uri_list_box.InsertItems([url.geturl()], 0)
        self.write_config.Enable()


class Service:
    uri = None  # TODO: update to use @abstractmethod + @property

    def accessible(self):
        chk_msg = f"Checking access to {self.__class__.__name__} at {self.uri}"
        print(chk_msg)

        try:
            urlopen(self.uri, None, 3)
            print(f"Service: {self.__class__.__name__} is a go!")
            return True
        except IOError as e:
            if hasattr(e, "code"):  # HTTPError
                print((
                    f"{self.__class__.__name__} "
                    f"Pseudo-Success in accessing {self.uri}"
                ))
                return True

            print((
                f"Service: Failed to access {self.__class__.__name__} service"
                f" at {self.uri}"
            ))
            return False
        except:
            print((
                "Some other error occurred trying "
                "to check service accessibility."
            ))
            return False


class MemGator(Service):
    uri = config.uri_aggregator
    last_uri = ''

    def __init__(self, archives_json=config.archives_json,
                 restimeout=config.memgator_restimeout,
                 hdrtimeout=config.memgator_hdrtimeout,
                 contimeout=config.memgator_contimeout):
        self.archives_json = archives_json
        self.restimeout = restimeout
        self.hdrtimeout = hdrtimeout
        self.contimeout = contimeout

    def get_flags(self):
        return [
            f'--hdrtimeout={self.hdrtimeout}',
            f'--contimeout={self.contimeout}',
            f'--restimeout={self.contimeout}',
            f'--arcs={self.archives_json}'
        ]

    def get_timemap(self, uri, timemap_format=config.memgator_format):
        tm_uri = f'{config.uri_aggregator}timemap/{timemap_format}/{uri}'
        resp = requests.get(tm_uri)

        if 'text/plain' in resp.headers['content-type']:  # 404, no mementos
            return ""
        self.last_uri = tm_uri
        return resp.text

    def fix(self, cb=None):
        cmd = [config.memgator_path] + self.get_flags() + ['server']

        subprocess.Popen(cmd, stdout=subprocess.DEVNULL,
                         stderr=subprocess.STDOUT)
        time.sleep(3)
        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)
        # if cb:
        #     wx.CallAfter(cb)

    @staticmethod
    def kill(_):
        main_app_window.adv_config.services_panel.status_memgator.SetLabel(
            "KILLING")

        if sys.platform.startswith('win32'):
            os.system("taskkill /f /im  memgator-windows-amd64.exe")
        else:
            sp = subprocess.Popen(['ps', '-A'], stdout=subprocess.PIPE)
            output, error = sp.communicate()
            target_process = "memgator"
            for line in output.splitlines():
                if target_process in str(line):
                    pid = int(line.split(None, 1)[0])
                    os.kill(pid, 9)

        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)


class Wayback(Service):
    uri = config.uri_wayback

    def fix(self, button, *cb):
        main_app_window.basic_config.ensure_environment_variables_are_set()
        thread.start_new_thread(self.fix_async, cb)

    def accessible(self):
        try:
            handle = urlopen(self.uri, None, 3)
            headers = handle.getheaders()

            link_header = ""
            for h in headers:
                if h[0] == "Link":
                    link_header = h[1]

            accessible = "http://mementoweb.org/terms/donotnegotiate" \
                         in link_header
            if accessible:
                print((
                    f"Wayback: {self.__class__.__name__} is a go"
                    f" at {self.uri}"
                ))
            else:
                print((
                    f"Unable to access {self.__class__.__name__}, something "
                    f"else is running on port 8080"
                ))

            return accessible

        except Exception:
            print((
                f"Wayback(): Failed to access {self.__class__.__name__} "
                f"service at {self.uri}"
            ))
            return False

    @staticmethod
    def fix_async(cb=None):
        # main_app_window.adv_config.services_panel.status_wayback.SetLabel(
        #    config.service_enabled_label_FIXING)
        main_app_window.adv_config.services_panel.set_wayback_status(
            config.service_enabled_label_FIXING
        )
        cmd = config.tomcat_path_start
        main_app_window.basic_config.ensure_environment_variables_are_set()

        subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, button):
        thread.start_new_thread(self.kill_async, ())

    def kill_async(self):
        main_app_window.adv_config.services_panel.status_wayback.SetLabel(
            "KILLING")
        cmd = config.tomcat_path_stop
        subprocess.Popen(cmd)
        time.sleep(3)
        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)

    def index(self):
        self.generate_path_index()
        self.generate_cdx()

    def generate_path_index(self):
        dest = f"{config.wail_path}/config/path-index.txt"
        warcs_path = f"{config.wail_path}/archives/"

        output_contents = ""
        for file in listdir(warcs_path):
            if file.endswith(".warc") or file.endswith(".warc.gz"):
                output_contents += f"{file}\t{join(warcs_path, file)}\n"

        path_index_file = open(dest, "w")
        path_index_file.write(output_contents)
        path_index_file.close()

    @staticmethod
    def generate_cdx():
        dest = f"{config.wail_path}/config/path-index.txt"
        warcs_path = f"{config.wail_path}/archives/"
        cdx_file_path_pre = f"{config.wail_path}/archiveIndexes/"
        cdx_indexer_path = (
            f"{config.wail_path}/bundledApps/tomcat/webapps/bin/cdx-indexer"
        )

        for file in listdir(warcs_path):
            if file.endswith(".warc"):
                cdx_file_path = (
                    f"{cdx_file_path_pre}"
                    f"{file.replace('.warc', '.cdx')}")
                process = subprocess.Popen(
                    [cdx_indexer_path, join(warcs_path, file), cdx_file_path],
                    stdout=PIPE,
                    stderr=PIPE,
                )
                process.communicate()

        # Combine CDX files
        all_cdxes_path = f"{config.wail_path}/archiveIndexes/*.cdx"

        filenames = glob.glob(all_cdxes_path)
        cdx_header_included = False

        # Is cdxt the right filename?
        unsorted_path = (
            f"{config.wail_path}/archiveIndexes/combined_unsorted.cdxt")

        with open(unsorted_path, "w") as outfile:
            for fname in filenames:
                with open(fname) as infile:
                    for i, line in enumerate(infile):
                        if i > 0:
                            outfile.write(line)
                        elif not cdx_header_included:
                            # Only include first CDX header
                            outfile.write(line)
                            cdx_header_included = True

        file_list = glob.glob(all_cdxes_path)
        for f in file_list:
            os.remove(f)

        cdx_temp = f"{config.wail_path}/archiveIndexes/combined_unsorted.cdxt"
        cdx_final = f"{config.wail_path}/archiveIndexes/index.cdx"
        # TODO: fix cdx sorting in Windows #281

        with open(cdx_temp, "r") as temp_file:
            with open(cdx_final, "w") as final_file:
                locale.setlocale(locale.LC_ALL, "C")
                entries = temp_file.readlines()
                entries = list(set(entries))  # uniq
                entries.sort(key=functools.cmp_to_key(locale.strcoll))
                for entry in entries:
                    final_file.write(entry)

        os.remove(cdx_temp)

        # Queue next iteration of indexing
        if main_app_window.indexing_timer:
            main_app_window.indexing_timer.cancel()
        main_app_window.indexing_timer = threading.Timer(
            config.index_timer_seconds, Wayback().index
        )
        main_app_window.indexing_timer.daemon = True
        main_app_window.indexing_timer.start()


class Tomcat(Service):
    uri = config.uri_wayback

    def accessible(self):
        return Wayback().accessible()


class Heritrix(Service):
    uri = f"https://{config.host_crawler}:{config.port_crawler}"

    @staticmethod
    def get_list_of_jobs():
        def just_file(full_path):
            return os.path.basename(full_path)

        return list(map(just_file, glob.glob(
            os.path.join(config.heritrix_job_path, "*"))))

    """ # get_list_of_jobs - rewrite to use the Heritrix API,
        will need to parse XML
        -H "Accept: application/xml"
        # replicate curl -v -d "action=rescan" -k -u lorem:ipsum --anyauth
        --location -H "Accept: application/xml" https://0.0.0.0:8443/engine
    """

    @staticmethod
    def get_job_launches(job_id):
        # job_path = f"{config.heritrix_job_path}{job_id}"
        return [
            f
            for f in os.listdir(f"{config.heritrix_job_path}{job_id}")
            if re.search(r"^[0-9]+$", f)
        ]

    def get_current_stats(self, job_id):
        launches = self.get_job_launches(job_id)
        status = ""
        status_template = Template("job_id: $job_id\n$status")

        if len(launches) == 0:
            status = "   NOT BUILT"

        for launch in launches:
            progress_log_file_path = (
                f"{config.heritrix_job_path}{job_id}/"
                f"{launch}/logs/progress-statistics.log"
            )
            last_line = util.tail(progress_log_file_path)

            ll = last_line[0].replace(" ", "|")
            log_data = re.sub(r"[|]+", "|", ll).split("|")
            time_stamp, discovered, queued, downloaded = log_data[0:4]

            try:  # Check if crawl is running, assume scraped stats are ints
                int(discovered)
                status = (
                    f"   Discovered: {discovered}\n"
                    f"   Queued: {queued}\n"
                    f"   Downloaded: {downloaded}\n"
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
                    status = f"   UNKNOWN{discovered}{queued}"

        return status_template.safe_substitute(job_id=job_id, status=status)

    def fix(self, _, *cb):
        thread.start_new_thread(self.fix_async, cb)

    @staticmethod
    def fix_async(cb=None):
        main_app_window.adv_config.services_panel.status_heritrix.SetLabel(
            config.service_enabled_label_FIXING
        )
        main_app_window.basic_config.launch_heritrix()
        time.sleep(3)
        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)
        if cb:
            wx.CallAfter(cb)

    def kill(self, _):
        thread.start_new_thread(self.kill_async, ())

    @staticmethod
    def kill_async():
        main_app_window.adv_config.services_panel.status_heritrix.SetLabel(
            config.service_enabled_label_KILLING
        )
        # Ideally, the Heritrix API would have support for this.
        # This will have to do. Won't work in Wintel
        cmd = (
            "ps ax | grep 'heritrix' | grep -v grep | "
            """awk '{print "kill -9 " $1}' | sh"""
        )
        print("Trying to kill Heritrix...")
        subprocess.Popen(cmd, stderr=subprocess.STDOUT, shell=True)
        time.sleep(3)
        wx.CallAfter(
            main_app_window.adv_config.services_panel.update_service_statuses)


class UpdateSoftwareWindow(wx.Frame):
    panels = ()
    update_json_data = ""
    current_version_wail = "0.2015.10.11"
    latest_version_wail = "0.2015.12.25"
    current_version_heritrix = ""
    latest_version_heritrix = ""
    current_version_wayback = ""
    latest_version_wayback = ""

    def update_wail(self, _):
        print(f'Downloading {self.update_json_data["wail-core"]["uri"]}')
        wailcorefile = urlopen(self.update_json_data["wail-core"]["uri"])
        output = open(f"{config.wail_path}/support/temp.tar.gz", "wb")
        output.write(wailcorefile.read())
        output.close()
        print("Done downloading WAIL update, backing up.")

        try:
            util.copy_anything(
                f"{config.wail_path}/Contents/",
                f"{config.wail_path}/Contents_bkp/"
            )
            print("Done backing up. Nuking obsolete version.")
        except:
            print("Back up previously done, continuing.")

        shutil.rmtree(f"{config.wail_path}/Contents/")
        print("Done nuking, decompressing update.")

        tar = tarfile.open(f"{config.wail_path}/support/temp.tar.gz")
        tar.extractall(f"{config.wail_path}/")
        tar.close()
        print("Done, restart now.")
        os.system((
            f"defaults read {config.wail_path}/Contents/Info.plist > "
            f"/dev/null"
        ))
        # TODO: flush Info.plist cache
        # (cmd involving defaults within this py script)

    def fetch_current_versions_file(self):
        src_uri = "https://matkelly.com/wail/update.json"
        f = urlopen(src_uri).read()
        data = f
        self.update_json_data = json.loads(data)

    def set_versions_in_panel(self):
        self.current_version_wail = config.WAIL_VERSION
        self.latest_version_wail = self.update_json_data["wail-core"]["version"]
        self.current_version_heritrix = self.get_heritrix_version()
        self.current_version_wayback = self.get_wayback_version()

        packages = self.update_json_data["packages"]
        for package in packages:
            if package["name"] == "heritrix-wail":
                self.latest_version_heritrix = package["version"]
            elif package["name"] == "openwayback-wail":
                self.latest_version_wayback = package["version"]

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    @staticmethod
    def get_heritrix_version():
        for file in os.listdir(f"{config.heritrix_path}lib/"):
            if file.startswith("heritrix-commons"):
                regex = re.compile("commons-(.*)\.")
                h_version = regex.findall(file)[0]
                try:
                    h_version = f'{h_version[: h_version.index("-")]}*'
                except ValueError:
                    # No dash present when parsing Heritrix version
                    pass
                return h_version

    # TODO: Redundant of Advanced Panel implementation, very inaccessible here
    @staticmethod
    def get_wayback_version():
        for file in os.listdir(f"{config.tomcat_path}/webapps/lib/"):
            if file.startswith("openwayback-core"):
                regex = re.compile("core-(.*)\.")
                return regex.findall(file)[0]

    # TODO: move layout management to responsibility of sub-panels, UNUSED now
    class UpdateSoftwarePanel(wx.Frame):
        panelTitle = ""
        panelSize = (390, 90)
        panelPosition = ()
        panelLogoPath = ""

        def __init__(self, parent, panelI, index_in_panel=0, panel_title=""):
            self.panelPosition = (5, 10 * 85 * panelI)
            self.panelTitle = panel_title
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
        self.fetch_current_versions_file()
        self.set_versions_in_panel()

        wx.Frame.__init__(
            self,
            parent,
            id,
            "Update WAIL",
            size=(400, 300),
            style=(wx.FRAME_FLOAT_ON_PARENT | wx.CLOSE_BOX),
        )
        wx.Frame.CenterOnScreen(self)
        # self.refresh = wx.Button(self, -1, button_label_refresh,
        # pos=(0, 0), size=(0,20))

        update_frame_icons_pos_left = 15
        update_frame_icons_pos_top = (25, 110, 195)

        update_frame_text_version_pos_tops1 = (
            update_frame_icons_pos_top[0] + 5,
            update_frame_icons_pos_top[0] + 22,
        )
        update_frame_text_version_title_pos1 = (
            (80, update_frame_text_version_pos_tops1[0]),
            (80, update_frame_text_version_pos_tops1[1]),
        )
        update_frame_text_version_value_pos1 = (
            (180, update_frame_text_version_pos_tops1[0]),
            (180, update_frame_text_version_pos_tops1[1]),
        )

        update_frame_text_version_pos_tops2 = (
            update_frame_icons_pos_top[1],
            update_frame_icons_pos_top[1] + 17,
        )
        update_frame_text_version_title_pos2 = (
            (80, update_frame_text_version_pos_tops2[0]),
            (80, update_frame_text_version_pos_tops2[1]),
        )
        update_frame_text_version_value_pos2 = (
            (180, update_frame_text_version_pos_tops2[0]),
            (180, update_frame_text_version_pos_tops2[1]),
        )

        update_frame_text_version_pos_tops3 = (
            update_frame_icons_pos_top[2],
            update_frame_icons_pos_top[2] + 17,
        )
        update_frame_text_version_title_pos3 = (
            (80, update_frame_text_version_pos_tops3[0]),
            (80, update_frame_text_version_pos_tops3[1]),
        )
        update_frame_text_version_value_pos3 = (
            (180, update_frame_text_version_pos_tops3[0]),
            (180, update_frame_text_version_pos_tops3[1]),
        )

        update_frame_text_version_size = (100, 100)

        # TODO: Akin to #293, update this icon w/ new version
        #  Need to generate a 64px version for this.
        icon_path = f"{config.wail_path}/build/icons/"
        update_frame_panels_icons = (
            f"{icon_path}whaleLogo_64.png",
            f"{icon_path}heritrixLogo_64.png",
            f"{icon_path}openWaybackLogo_64.png",
        )
        update_frame_panels_titles = ("WAIL Core", "Preservation", "Replay")
        update_frame_panels_size = (390, 90)

        update_frame_panels_pos = ((5, 10), (5, 95), (5, 180))

        # wailPanel = self.UpdateSoftwarePanel(self, 0, 0, 'WAIL')
        # wailPanel.draw()
        self.panel_wail = wx.StaticBox(
            self,
            1,
            update_frame_panels_titles[0],
            size=update_frame_panels_size,
            pos=update_frame_panels_pos[0],
        )
        box1 = wx.StaticBoxSizer(self.panel_wail, wx.VERTICAL)

        self.panel_preservation = wx.StaticBox(
            self,
            1,
            update_frame_panels_titles[1],
            size=update_frame_panels_size,
            pos=update_frame_panels_pos[1],
        )
        box2 = wx.StaticBoxSizer(self.panel_preservation, wx.VERTICAL)

        self.panel_replay = wx.StaticBox(
            self,
            1,
            update_frame_panels_titles[2],
            size=update_frame_panels_size,
            pos=update_frame_panels_pos[2],
        )
        box3 = wx.StaticBoxSizer(self.panel_replay, wx.VERTICAL)

        # Panel 1
        wx.StaticText(
            self,
            100,
            "Current Version:",
            update_frame_text_version_title_pos1[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            update_frame_text_version_title_pos1[1],
            update_frame_text_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.current_version_wail,
            update_frame_text_version_value_pos1[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latest_version_wail,
            update_frame_text_version_value_pos1[1],
            update_frame_text_version_size,
        )

        # Panel 2
        wx.StaticText(
            self,
            100,
            "Current Version:",
            update_frame_text_version_title_pos2[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            update_frame_text_version_title_pos2[1],
            update_frame_text_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.current_version_heritrix,
            update_frame_text_version_value_pos2[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latest_version_heritrix,
            update_frame_text_version_value_pos2[1],
            update_frame_text_version_size,
        )

        # Panel 3
        wx.StaticText(
            self,
            100,
            "Current Version:",
            update_frame_text_version_title_pos3[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            "Latest Version:",
            update_frame_text_version_title_pos3[1],
            update_frame_text_version_size,
        )

        wx.StaticText(
            self,
            100,
            self.current_version_wayback,
            update_frame_text_version_value_pos3[0],
            update_frame_text_version_size,
        )
        wx.StaticText(
            self,
            100,
            self.latest_version_wayback,
            update_frame_text_version_value_pos3[1],
            update_frame_text_version_size,
        )

        self.update_button_wail = wx.Button(
            self, 3, "Update", pos=(305, update_frame_icons_pos_top[0]),
            size=(75, 20)
        )
        self.update_button_heritrix = wx.Button(
            self, 3, "Update", pos=(305, update_frame_icons_pos_top[1]),
            size=(75, 20)
        )
        self.update_button_wayback = wx.Button(
            self, 3, "Update", pos=(305, update_frame_icons_pos_top[2]),
            size=(75, 20)
        )

        self.update_button_wail.Bind(wx.EVT_BUTTON, self.update_wail)

        if self.current_version_wail == self.latest_version_wail:
            self.update_button_wail.Disable()
        if self.current_version_wayback == self.latest_version_wayback:
            self.update_button_wayback.Disable()
        if self.current_version_heritrix == self.latest_version_heritrix:
            self.update_button_heritrix.Disable()

        img = wx.Image(
            update_frame_panels_icons[0], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            img,
            (update_frame_icons_pos_left, update_frame_icons_pos_top[0]),
            (img.GetWidth(), img.GetHeight()),
        )

        heritrix_64 = wx.Image(
            update_frame_panels_icons[1], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            heritrix_64,
            (update_frame_icons_pos_left, update_frame_icons_pos_top[1]),
            (heritrix_64.GetWidth(), heritrix_64.GetHeight()),
        )

        openwayback_64 = wx.Image(
            update_frame_panels_icons[2], wx.BITMAP_TYPE_ANY
        ).ConvertToBitmap()
        wx.StaticBitmap(
            self,
            -1,
            openwayback_64,
            (update_frame_icons_pos_left, update_frame_icons_pos_top[2]),
            (openwayback_64.GetWidth(), openwayback_64.GetHeight()),
        )


class MementoInfoWindow(wx.Frame):
    def __init__(self, title, parent=None):
        wx.Frame.__init__(self, parent=parent, title=title)
        self.Show()


class WAILStatusBar(wx.StatusBar):
    def __init__(self, parent):
        wx.StatusBar.__init__(self, parent, -1)
        self.parent = parent

        self.SetFieldsCount(2)
        self.SetStatusWidths([-2, 30])
        self.sb_button = wx.Button(
            self, wx.ID_ANY, "", style=wx.BU_EXACTFIT | wx.BORDER_NONE
        )

        self.msg = ''
        self.sb_button.Bind(wx.EVT_BUTTON, self.press_button)
        self.reposition()

    def reposition(self):
        rect = self.GetFieldRect(1)
        rect.x += 1
        rect.y += 1
        self.sb_button.SetRect(rect)
        self.sizeChanged = False

    def hide_button(self):
        self.sb_button.SetLabel(config.button_label_local_archive_included)
        self.sb_button.SetToolTip(config.tooltip_local_archive_included)

    def show_button(self):
        self.sb_button.SetLabel(config.button_label_local_archive_excluded)
        self.sb_button.SetToolTip(config.tooltip_local_archive_excluded)

    def press_button(self, _):
        local_wayback_accessible = Wayback().accessible()

        if local_wayback_accessible:
            self.msg = config.text_statusbar_no_captures
        elif self.msg == config.text_statusbar_wayback_not_running:
            self.msg = config.text_statusbar_fixing_wayback

            Wayback().fix(self.press_button)
            pub.sendMessage('recheck_uri_in_basic_interface')
            return
        else:
            self.msg = config.text_statusbar_wayback_not_running

        pub.sendMessage('change_statusbar', msg=self.msg,
                        includes_local=local_wayback_accessible)
        pass


class InvalidSelectionContextException(Exception):
    """raise when attempt to create a context menu without context"""


main_app_window = None

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
    os.environ["JAVA_HOME"] = config.jdk_path

    app = wx.App(redirect=False)
    main_app_window = TabController()
    main_app_window.ensure_correct_installation()
    main_app_window.Show()

    # Start indexer
    # Wayback().index()

    app.MainLoop()
