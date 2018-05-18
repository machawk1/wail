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
import bundledApps

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
#from HeritrixJob import HeritrixJob
from bundledApps import WAILConfig as config
from bundledApps import wailUtil as util
from bundledApps import WAIL

# from wx import *
import wx.adv
from bundledApps import waybackConfigWriter
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

app = wx.App(redirect=False)
mainAppWindow = bundledApps.WAIL.TabController()
mainAppWindow.ensureCorrectInstallation()
mainAppWindow.Show()

# Start indexer
# Wayback().index()

app.MainLoop()