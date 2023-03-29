py -m pip install --upgrade wxPython
py -m pip install -r requirements.txt
py -m pip install pywin32

pyinstaller -p bundledApps --onefile --windowed --clean --version-file=build/version.txt --icon=build/icons/wail_blue.ico bundledApps/WAIL.py

::Windows shell (CMD.exe)
move /Y ".\dist\WAIL.exe" ".\WAIL.exe"

::Unix shell (e.g., from Git Bash on Windows)
::mv "./dist/WAIL.exe" "./WAIL.exe" 