pip install --upgrade wxPython
pip install -r requirements.txt

pyinstaller -p bundledApps --onefile --windowed --clean --version-file=build/version.txt --icon=build/icons/wail_blue.ico bundledApps/WAIL.py

::Windows shell (CMD.exe)
move /Y ".\dist\WAIL.exe" ".\WAIL.exe"

::Unix shell (e.g., from Git Bash on Windows)
::mv "./dist/WAIL.exe" "./WAIL.exe" 