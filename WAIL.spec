# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['bundledApps/WAIL.py'],
    pathex=['bundledApps'],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='WAIL',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch='universal2',
    codesign_identity=87FC5BD9729DA162BF0B9767F8847AED82F88839,
    entitlements_file=./test_location.txt,
    icon=['build/icons/wail_blue.icns'],
)
app = BUNDLE(
    exe,
    name='WAIL.app',
    icon='./build/icons/wail_blue.icns',
    bundle_identifier=None,
)
