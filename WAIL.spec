# -*- mode: python -*-
a = Analysis(['./bundledApps/WAIL.py'],
             pathex=['/Users/machawk1/Desktop/wail'],
             hiddenimports=[],
             hookspath=None,
             runtime_hooks=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='WAIL',
          debug=False,
          strip=None,
          upx=True,
          console=False , icon='build/icons/whale_1024.icns')
app = BUNDLE(exe,
             name='WAIL.app',
             icon='./build/icons/whale_1024.icns')
