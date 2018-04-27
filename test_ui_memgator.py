# Lack of relative imports prevents this from running from tests/

import wx
import sys
from bundledApps.WAIL import WAILGUIFrame_Basic as basic
from bundledApps import WAILConfig as config


class Test(wx.Frame):
    def __init__(self, mCount, aCount):
        wx.Frame.__init__(self, None)
        panel = wx.Panel(self)
        self.Notebook = wx.Notebook(panel)
        b = basic(self.Notebook)
        b.setMementoCount(mCount, aCount)
        self.result = b.mementoStatus.GetLabel()


testCases = [
    [0, 0, config.msg_noMementosAvailable],
    [0, 1, config.msg_noMementosAvailable],
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
    [mCount, aCount, expectedValue] = case
    app = wx.App()
    try:
        mainAppWindow = Test(mCount, aCount)
        res = mainAppWindow.result
        testPass = (res == expectedValue)
        assert testPass
    except ValueError:
        assert type(expectedValue) is type(ValueError())
    app.Destroy()


