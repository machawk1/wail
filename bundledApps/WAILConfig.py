#!/usr/bin/env python
# coding: utf-8

import os
import platform
import re
import sys
import wx

from xml.dom import minidom
from configparser import ConfigParser

if os.name == 'nt':
    from win32com.client import Dispatch

WAIL_VERSION = "-1"

wail_path = os.path.dirname(os.path.realpath(__file__))
wail_path = wail_path.replace("\\bundledApps", "")  # Fix for dev mode

info_plist_path = ""
if "darwin" in sys.platform:
    info_plist_path = "/Applications/WAIL.app/Contents/Info.plist"
else:
    info_plist_path = wail_path + "\\build\\Info.plist"


try:
    if "darwin" in sys.platform:
        with open(info_plist_path, "r", encoding='latin1') as myfile:
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
msg_waybackEnabled = "Currently Enabled"
msg_waybackDisabled = "Currently Disabled"
msg_wayback_not_started_title = "Wayback does not appear to be running."
msg_wayback_not_started_body = "Launch Wayback and re-check?"
msg_uri_not_in_archive = "The URL is not yet in the archives."
msg_uri_in_archives_title = "Archived Status"
msg_uri_in_archives_body = ("Archival captures (mementos) for this URL "
                            "are locally available.")
msg_wrong_location_body = (
    "WAIL must reside in your Applications directory. "
    "Move it there then relaunch. \n* Current Location: "
)
msg_wrong_location_title = "Wrong Location"
msg_no_java_runtime = b"No Java runtime present, requesting install."
msg_fetching_mementos = "⌛ Fetching memento count..."
msg_no_mementos_available = "No mementos available."

msg_crawl_status_writing_config = "Writing Crawl Configuration..."
msg_crawl_status_launching_crawler = "Launching Crawler..."
msg_crawl_status_launching_wayback = "Launching Wayback..."
msg_crawl_status_initializing_crawl_job = "Initializing Crawl Job..."

msg_java6_required = (
    "Java SE 6 needs to be installed. "
    "WAIL should invoke the installer here."
)
msg_archive_failed_java = "Archive Now failed due to Java JRE Requirements"
msg_java_resolving = "Resolving Java Dependency"
msg_java7_downloading = "Downloading Java 7 DMG"
msg_error_tomcat_noStop = "Tomcat could not be stopped"
msg_error_tomcat_failed = "Command Failed"
msg_py3 = "ERROR: WAIL requires Python 3."

tab_label_basic = "Basic"
tab_label_advanced = "Advanced"

tab_label_advanced_services = "Services"
tab_label_advanced_wayback = "Wayback"
tab_label_advanced_heritrix = "Heritrix"
tab_label_advanced_miscellaneous = "Miscellaneous"
tab_label_advanced_services_serviceStatus = "SERVICE STATUS"

service_enabled_label_YES = "OK"  # "✓"
service_enabled_label_NO = "X"  # "✗"
service_enabled_label_FIXING = "FIXING"
service_enabled_label_KILLING = "KILLING"

# Basic Tab Buttons
button_label_archive_now = "Archive Now!"
button_label_archive_now_initializing = "INITIALIZING"
button_label_check_status = "Check Archived Status"
button_label_view_archive = "View Archive"
button_label_mementoCountInfo = "?"
button_label_uri = "URL:"
button_label_fix = "Fix"
button_label_kill = "Kill"
button_label_refresh = "Refresh"
button_label_start_crawl = "Start Crawl"
button_label_local_archive_included = ""
button_label_local_archive_excluded = "❗"

text_label_default_uri = "https://matkelly.com/wail"
text_label_default_uri_title = "WAIL homepage"
text_label_uri_entry = "Enter one URI per line to crawl"
text_label_depth = "Depth"
text_label_depth_default = "1"
text_label_launch_crawl = "Launch Crawl"
text_label_uris_to_crawl = "URIs to Crawl:"
text_label_crawl_jobs = "Crawl Jobs"
text_label_status_init = ('Type a URL and click "Archive Now!" '
                          'to begin archiving.')

text_label_no_jobs_available = "(No jobs available)"

tooltip_local_archive_excluded = (
    'This URI is not present in the local archive')
tooltip_local_archive_included = (
    'This URI is present in the local archive')

text_statusbar_no_captures = 'There are no local captures for this URL.'
text_statusbar_wayback_not_running = 'Wayback is not running. Click again to fix.'
text_statusbar_fixing_wayback = 'Launching Wayback'

about_window_app_name = "Web Archiving Integration Layer (WAIL)"
about_window_author = "By Mat Kelly <wail@matkelly.com>"
about_window_icon_path = "/build/icons/wail_blue.ico"
about_window_iconWidth = 128
about_window_iconHeight = 128

# Advanced Tab Buttons
button_label_wayback = "View Wayback in Browser"
button_label_wayback_launching = "Launching Wayback..."
button_label_edit_wayback_config = "Edit Wayback Configuration"
button_label_reset_wayback_config = "Reset Wayback Configuration"
button_label_start_heritrix = "Start Heritrix Process"
button_label_view_heritrix = "View Heritrix in Browser"
button_label_setup_crawl = "Setup One-Off Crawl"
button_label_view_archive_files = "View Archive Files"
button_label_check_for_updates = "Check for Updates"
button_label_heritrix_launch_web_ui = "Launch WebUI"
button_label_heritrix_launch_web_ui_launching = "Launching..."
button_label_heritrix_new_crawl = "New Crawl"

group_label_window = "Web Archiving Integration Layer"

menu_title_about = "&About WAIL"
menu_title_file = "&File"
menu_title_edit = "&Edit"
menu_title_view = "&View"
menu_title_window = "&Window"
menu_title_help = "&Help"
menu_title_file_new_crawl = "&New Crawl"

menu_title_about_preferences = "Preferences..."
menu_title_about_quit = "Quit WAIL"

menu_title_file_all_crawls = "All Crawls"
menu_title_file_all_crawls_finish = "Finish"
menu_title_file_all_crawls_pause = "Pause"
menu_title_file_all_crawls_restart = "Restart"
menu_title_file_all_crawls_destroy = "Destroy (does not delete archive)"

menu_title_edit_undo = "Undo"
menu_title_edit_redo = "Redo"
menu_title_edit_cut = "Cut"
menu_title_edit_copy = "Copy"
menu_title_edit_paste = "Paste"
menu_title_edit_select_all = "Select All"

menu_title_view_view_basic = "Basic Interface"
menu_title_view_view_advanced = "Advanced Interface"
menu_title_view_view_advanced_services = "Services"
menu_title_view_view_advanced_wayback = "Wayback"
menu_title_view_view_advanced_heritrix = "Heritrix"
menu_title_view_view_advanced_memgator = "MemGator"
menu_title_view_view_advanced_miscellaneous = "Miscellaneous"

menu_title_window_wail = "Web Archiving Integration Layer"

menu_destroy_job = "Destroy Job (Does not delete archive)"
menu_force_crawl_to_finish = "Force crawl to finish"
menu_view_job_in_web_browser = "View job in web browser"
menu_rebuild_job = "Rebuild job"
menu_rebuild_and_launch_job = "Rebuild and launch job"

menu_shortcut_about_preferences = 'CTRL+,'
menu_shortcut_about_quit = 'CTRL+Q'

menu_shortcut_view_view_basic = "CTRL+0"
menu_shortcut_view_view_advanced_services = "CTRL+1"
menu_shortcut_view_view_advanced_wayback = "CTRL+2"
menu_shortcut_view_view_advanced_heritrix = "CTRL+3"
menu_shortcut_view_view_advanced_miscellaneous = "CTRL+4"



heritrix_credentials_username = "lorem"
heritrix_credentials_password = "ipsum"

host_crawler = "0.0.0.0"
host_replay = "0.0.0.0"
host_aggregator = "0.0.0.0"

port_crawler = "8443"
port_replay = "8080"
port_aggregator = "1208"

index_timer_seconds = 10.0

jdk_path = ""
jre_home = ""
java_home = ""

###############################
# Platform-specific paths
###############################

heritrix_path = ""
heritrix_bin_path = ""
heritrix_job_path = ""
warcs_folder = ""
tomcat_path = ""
tomcat_path_start = ""
tomcat_path_stop = ""
memgator_path = ""
archives_json = ""
font_size = 8
wail_window_size = (410, 275)
wail_window_style = wx.DEFAULT_FRAME_STYLE & ~(wx.RESIZE_BORDER | wx.MAXIMIZE_BOX)
wail_style_yes_no = wx.YES_NO | wx.YES_DEFAULT | wx.ICON_QUESTION

if "darwin" in sys.platform:  # macOS-specific code
    # This should be dynamic but doesn't work with WAIL binary
    wail_path = '/Applications/WAIL.app'
    heritrix_path = f'{wail_path}/bundledApps/heritrix-3.2.0/'
    heritrix_bin_path = f'sh {heritrix_path}bin/heritrix'
    heritrix_job_path = f'{heritrix_path}jobs/'
    font_size = 10
    tomcat_path = f'{wail_path}/bundledApps/tomcat'
    warcs_folder = f'{wail_path}/archives'
    tomcat_path_start = f'{tomcat_path}/bin/startup.sh'
    tomcat_path_stop = f'{tomcat_path}/bin/shutdown.sh'

    jdk_path = (f"{wail_path}/bundledApps/Java"
                "/JavaVirtualMachines/jdk1.7.0_79.jdk"
                "/Contents/Home/"
               )
    jre_home = jdk_path
    java_home = jdk_path

    about_window_icon_path = f'{wail_path}{about_window_icon_path}'

    memgator_bin = 'memgator-darwin-amd64'
    if 'arm64' in platform.machine():
        memgator_bin = 'memgator-darwin-arm64'

    memgator_path = f'{wail_path}/bundledApps/{memgator_bin}'
    archives_json = f'{wail_path}/config/archives.json'

    # Fix tomcat control scripts' permissions
    os.chmod(tomcat_path_start, 0o744)
    os.chmod(tomcat_path_stop, 0o744)
    os.chmod(f'{tomcat_path}/bin/catalina.sh', 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wail_path):
        os.chmod(r, 0o777)
elif sys.platform.startswith("linux"):
    # Should be more dynamics but suitable for Docker-Linux testing
    wail_path = '/wail'
    heritrix_path = f'{wail_path}/bundledApps/heritrix-3.2.0/'
    heritrix_bin_path = f'sh {heritrix_path}bin/heritrix'
    heritrix_job_path = f'{heritrix_path}jobs/'
    font_size = 10
    tomcat_path = f'{wail_path}/bundledApps/tomcat'
    warcs_folder = f'{wail_path}/archives'
    tomcat_path_start = f'{tomcat_path}/bin/startup.sh'
    tomcat_path_stop = f'{tomcat_path}/bin/shutdown.sh'

    about_window_icon_path = f'{wail_path}{about_window_icon_path}'

    memgator_path = f'{wail_path}/bundledApps/memgator-linux-amd64'
    archives_json = f'{wail_path}/config/archives.json'

    # Fix tomcat control scripts' permissions
    os.chmod(tomcat_path_start, 0o744)
    os.chmod(tomcat_path_stop, 0o744)
    os.chmod(f'{tomcat_path}/bin/catalina.sh', 0o744)
    # TODO, variable encode paths, ^ needed for startup.sh to execute

    # Change all permissions within the app bundle (a big hammer)
    for r, d, f in os.walk(wail_path):
        os.chmod(r, 0o777)

elif sys.platform.startswith("win32"):
    # Win Specific Code here, this applies to both 32 and 64 bit
    # Consider using http://code.google.com/p/platinfo/ in the future
    # ...for finer refinement
    wail_path = 'C:\\wail'

    about_window_icon_path = f'{wail_path}{about_window_icon_path}'
    jdk_path = f'{wail_path}\\bundledApps\\Java\\Windows\\jdk1.7.0_80\\'
    jre_home = jdk_path
    java_home = jdk_path

    heritrix_path = wail_path + "\\bundledApps\\heritrix-3.2.0\\"
    heritrix_bin_path = f'{heritrix_path}bin\\heritrix.cmd'
    heritrix_job_path = f'{heritrix_path}\\jobs\\'
    tomcat_path = f'{wail_path}\\bundledApps\\tomcat'
    warcs_folder = f'{wail_path}\\archives'
    memgator_path = f'{wail_path}\\bundledApps\\memgator-windows-amd64.exe'
    archives_json = f'{wail_path}\\config\\archives.json'
    tomcat_path_start = f'{wail_path}\\support\\catalina_start.bat'
    tomcat_path_stop = f'{wail_path}\\support\\catalina_stop.bat'

    memgator_start = f'{memgator_path} server'

    host_crawler = "localhost"
    host_replay = "localhost"

uri_tomcat = f"http://{host_replay}:{port_replay}"
uri_wayback = f"http://{host_replay}:{port_replay}/wayback/"
uri_wayback_all_mementos = uri_wayback + "*/"
uri_heritrix = (
    f"https://"
    f"{heritrix_credentials_username}:{heritrix_credentials_password}@"
    f"{host_crawler}:{port_crawler}"
)
uri_heritrix_accessiblity_uri = (
    f"https://"
    f"{heritrix_credentials_username}:{heritrix_credentials_password}@"
    f"{host_crawler}:{port_crawler}"
)


class PrefTab_Replay(wx.Panel):
    def __init__(self, parent):
        wx.Panel.__init__(self, parent)
        sz = wx.BoxSizer()

        sz.Add(
            wx.StaticText(panel, wx.ID_ANY, "Replay"), flag=wx.CENTER
        )



        self.archive_locations = wx.StaticText(self, wx.ID_ANY,
                                               label="Archive Locations")
        self.listbox = wx.ListBox(self, style = wx.LB_HSCROLL)

        #archive_locations_list = parent.read_archive_locations()
        #self.listbox.Set(archive_locations_list)

        sz.AddMany(
            [
                (self.archive_locations, 0),
                (self.listbox, 0, wx.EXPAND),
                (wx.StaticText(self, 7, "test"), 1, wx.EXPAND)
               # (self.setupNewCrawlButton, 0, wx.EXPAND),
               #(self.launchWebUIButton, 0, wx.EXPAND),
            ]
        )
        #self.listbox.SetMaxSize((300, 100))

class CrawlerPreferencesPane(wx.PreferencesPage):
    def CreateWindow(self, parent):
        panel = wx.Panel(parent)
        self.vbox = wx.BoxSizer(wx.VERTICAL)

        self.box_creds = wx.StaticBox(panel, wx.ID_ANY,
                                      "Web Interface Credentials")

        cc_labelsize = (80, -1)
        cc_inputsize = (250, -1)

        self.username_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.box_creds_u = wx.StaticText(panel, wx.ID_ANY, "Username",
                                         size=cc_labelsize, style=wx.ALIGN_RIGHT | wx.ALIGN_CENTER_VERTICAL)
        self.box_creds_u_input = wx.TextCtrl(panel, wx.ID_ANY,
                                             value="lorem")
        self.username_sizer.Add(self.box_creds_u)
        self.username_sizer.Add(self.box_creds_u_input)

        self.password_sizer = wx.BoxSizer(wx.HORIZONTAL)
        self.box_creds_p = wx.StaticText(panel, wx.ID_ANY, "Password",
                                         size=cc_labelsize, style=wx.ALIGN_RIGHT | wx.ALIGN_CENTER_VERTICAL)
        self.box_creds_p_input = wx.TextCtrl(panel, wx.ID_ANY,
                                   value="ipsum")
        self.password_sizer.Add(self.box_creds_p)
        self.password_sizer.Add(self.box_creds_p_input)

        ca_labelsize = (140, -1)
        ca_inputsize = (250, -1)

        self.box_attrs = wx.StaticBox(panel, wx.ID_ANY,
                                      "Default Crawl Attributes")

        self.jURL_boxsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.jURL = wx.StaticText(panel, wx.ID_ANY, "Operator Contact URL",
                                  size=ca_labelsize, style=wx.ALIGN_RIGHT | wx.ALIGN_CENTER_VERTICAL)
        self.jURL_input = wx.TextCtrl(panel, wx.ID_ANY, value="foo", size=ca_inputsize)
        self.jURL_boxsizer.Add(self.jURL)
        self.jURL_boxsizer.Add(self.jURL_input)

        self.jName_boxsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.jName = wx.StaticText(panel, wx.ID_ANY, "Job Name",
                                   size=ca_labelsize, style=wx.ALIGN_RIGHT)
        self.jName_input = wx.TextCtrl(panel, wx.ID_ANY, value="basic", size=ca_inputsize)
        self.jName_boxsizer.Add(self.jName, wx.ALIGN_RIGHT)
        self.jName_boxsizer.Add(self.jName_input)

        self.jDesc_boxsizer = wx.BoxSizer(wx.HORIZONTAL)
        self.jDesc = wx.StaticText(panel, wx.ID_ANY, "Job Description",
                                   size=ca_labelsize, style=wx.ALIGN_RIGHT)
        self.jDesc_input = wx.TextCtrl(panel, wx.ID_ANY,
                                       value="Basic crawl starting with useful defaults",
                                       size=ca_inputsize)
        self.jDesc_boxsizer.Add(self.jDesc)
        self.jDesc_boxsizer.Add(self.jDesc_input)

        self.sbs_creds = wx.StaticBoxSizer(self.box_creds, wx.VERTICAL)

        self.sbs_creds.Add(self.username_sizer, 0, wx.TOP | wx.LEFT)
        self.sbs_creds.Add(self.password_sizer, 0, wx.TOP | wx.LEFT)

        self.sbs_attrs = wx.StaticBoxSizer(self.box_attrs, wx.VERTICAL)
        self.sbs_attrs.Add(self.jURL_boxsizer, 0, wx.TOP | wx.LEFT)
        self.sbs_attrs.Add(self.jName_boxsizer, 0, wx.TOP | wx.LEFT)
        self.sbs_attrs.Add(self.jDesc_boxsizer, 0, wx.TOP | wx.LEFT)

        self.vbox.Add(self.sbs_creds, 1, wx.EXPAND | wx.ALL, 10)
        self.vbox.Add(self.sbs_attrs, 1, wx.EXPAND | wx.ALL, 10)

        panel.SetSizer(self.vbox)
        return panel

    def GetLargeIcon(self):
        '''Return a 32x32 icon'''
        return wx.Bitmap("images/crawler.png")

    def GetName(self):
        return "Crawler"

class ReplayPreferencesPane(wx.PreferencesPage):
    def CreateWindow(self, parent):
        panel = wx.Panel(parent)
        sz = wx.BoxSizer()

        sz.Add(
            wx.StaticText(panel, wx.ID_ANY, "Replay"), flag=wx.CENTER
        )

        self.archive_locations = wx.StaticText(panel, wx.ID_ANY,
                                               label="Archive Locations")
        self.listbox = wx.ListBox(panel, style=wx.LB_HSCROLL)

        # archive_locations_list = parent.read_archive_locations()
        # self.listbox.Set(archive_locations_list)

        sz.AddMany(
            [
                (self.archive_locations, 0, 10),
                (self.listbox, 0, wx.EXPAND, 10),
                (wx.StaticText(panel, 7, "test"), 1, wx.EXPAND, 10)
            ]
        )
        return panel

    def GetLargeIcon(self):
        '''Return a 32x32 icon'''
        return wx.Bitmap("images/replay.png")

    def GetName(self):
        return "Replay"

class AggregatorPreferencesPane(wx.PreferencesPage):
    def CreateWindow(self, parent):
        panel = wx.Panel(parent)
        panel.SetMinSize((500, 500))
        sz = wx.BoxSizer()
        gs = wx.FlexGridSizer(2, 2, 0, 0)

        self.ua = wx.TextCtrl(panel, wx.ID_ANY,
                               value="test")
        self.timeout = wx.TextCtrl(panel, wx.ID_ANY,
                              value="100")

        gs.AddMany([
            wx.StaticText(panel, wx.ID_ANY, "User Agent"),
            self.ua,
            wx.StaticText(panel, wx.ID_ANY, "Default Timeout (ms)"),
            self.timeout
        ])

        sz.Add(gs, proportion=1)
        #self.SetSizer(sz)
        sz.Layout()
        return panel

    def GetLargeIcon(self):
        '''Return a 32x32 icon'''
        return wx.Bitmap("images/aggregator.png")

    def GetName(self):
        return "Aggregator"

class PreferencesWindow2(wx.PreferencesEditor):
    def __init__(self):
        super().__init__()

        self.AddPage(CrawlerPreferencesPane())
        self.AddPage(ReplayPreferencesPane())
        self.AddPage(AggregatorPreferencesPane())

class PreferencesWindow(wx.Frame):
    """UI elements for graphically setting WAIL preferences"""
    def __init__(self):
        wx.Frame.__init__(self, None, title="WAIL Preferences")
        panel = wx.Panel(self)
        box = wx.BoxSizer(wx.VERTICAL)
        wx.Frame.Center(self)

        config = ConfigParser()
        config.read('config.ini')

        # TODO: Bind events to write config.ini (save), or close window (cancel)
        # config.add_section('crawler')
        # config.set('crawler', 'keyfoo', 'valuebar')
        # with open('config.ini', 'w') as f:
        #    config.write(f)



    def read_archive_locations(self):
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

uri_heritrix_job = f'{uri_heritrix}/engine/job/'
uri_aggregator = f"http://{host_aggregator}:{port_aggregator}/"

memgator_format = 'cdxj'
memgator_restimeout = '0m3s'
memgator_hdrtimeout = '3s'
memgator_contimeout = '3s'

