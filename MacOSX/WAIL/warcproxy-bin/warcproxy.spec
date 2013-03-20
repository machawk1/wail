# -*- mode: python -*-
a = Analysis(['/Users/mkelly/Downloads/warc-proxy-master/warcproxy.py'],
             pathex=['/Users/mkelly/Downloads/pyinstaller-2.0'],
             hiddenimports=[],
             hookspath=None)
pyz = PYZ(a.pure)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name=os.path.join('dist', 'warcproxy'),
          debug=False,
          strip=None,
          upx=True,
          console=True )
