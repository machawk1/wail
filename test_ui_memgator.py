# Lack of relative imports prevents this from running from tests/

import wx
import sys
from bundledApps.WAIL import WAILGUIFrame_Basic as basic
from bundledApps import WAILConfig as config


class Test(wx.Frame):
    def __init__(self, m_count, a_count):
        wx.Frame.__init__(self, None)
        panel = wx.Panel(self)
        self.notebook = wx.Notebook(panel)
        b = basic(self.notebook)
        b.set_memento_count(m_count, a_count)
        self.result = b.memento_status.GetLabel()


testCases = [
    [0, 0, config.msg_no_mementos_available],
    [0, 1, config.msg_no_mementos_available],
    [1, 0, "1 memento available from 0 archives"],
    [1, 1, "1 memento available from 1 archive"],
    [2, 1, "2 mementos available from 1 archive"],
    [1, 2, "1 memento available from 2 archives"],
    [2, 2, "2 mementos available from 2 archives"],
    [-1, 0, ValueError()],
    [0, -1, ValueError()],
    [-1, -1, ValueError()]
]

for case in testCases:
    [m_count, a_count, expected_value] = case
    app = wx.App()
    try:
        main_app_window = Test(m_count, a_count)
        res = main_app_window.result
        testPass = (res == expected_value)
        assert testPass
    except ValueError:
        assert type(expected_value) is type(ValueError())
    app.Destroy()


