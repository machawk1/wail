#!/usr/bin/env python
# coding: utf-8

import os
import sys
import re
import wx
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
msg_stoppingTomcat = "Stopping Tomcat..."
msg_startingTomcat = "Starting Tomcat..."
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
msg_fetching_mementos = "Fetching memento count..."
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
button_label_starCrawl = "Start Crawl"

text_label_default_uri = "https://matkelly.com/wail"
text_label_default_uri_title = "WAIL homepage"
text_label_uri_entry = "Enter one URI per line to crawl"
text_label_depth = "Depth"
text_label_depth_default = "1"
text_label_launch_crawl = "Launch Crawl"
text_label_uris_to_crawl = "URIs to Crawl:"
text_label_crawl_jobs = "Crawl Jobs"
text_label_status_init = 'Type a URL and click "Archive Now!" ' "to begin archiving."
text_label_no_jobs_available = "(No jobs available)"

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
    memgator_stop = ['pkill','memgator']

    jdk_path = (f"{wail_path}/bundledApps/Java"
               "/JavaVirtualMachines/jdk1.7.0_79.jdk"
               "/Contents/Home/"
               )
    jre_home = jdk_path
    java_home = jdk_path

    about_window_icon_path = f'{wail_path}{about_window_icon_path}'

    memgator_path = f'{wail_path}/bundledApps/memgator-darwin-amd64'
    archives_json = f'{wail_path}/config/archives.json'
    memgator_start = [memgator_path, 'server']

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
    memgator_stop = 'pkill memgator'

    about_window_icon_path = f'{wail_path}{about_window_icon_path}'

    memgator_path = f'{wail_path}/bundledApps/memgator-linux-amd64'
    archives_json = f'{wail_path}/config/archives.json'

    memgator_start = f'{memgator_path} server'

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
uri_heritrix_job = f'{uri_heritrix}/engine/job/'
uri_aggregator = f"http://{host_aggregator}:{port_aggregator}/"

memgator_format = 'cdxj'
memgator_restimeout = '0m3s'
memgator_hdrtimeout = '3s'
memgator_contimeout = '3s'
