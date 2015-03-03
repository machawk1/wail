pyinstaller --onefile --windowed --version-file=build/version.txt --icon=build/icons/whale_1024.ico bundledApps/WAIL.py
move /Y ".\dist\WAIL.exe" "./WAIL.exe"
#TODO: move to C:\WAIL #currently permissions issues
