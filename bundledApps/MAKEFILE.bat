pip install --upgrade wxPython
pip install -r requirements.txt

pyinstaller --onefile --windowed --version-file=build/version.txt --icon=build/icons/wail_blue.ico bundledApps/WAIL.py

::Windows shell (CMD.exe)
move /Y ".\dist\WAIL.exe" ".\WAIL.exe"

::Unix shell (e.g., from Git Bash on Windows)
::mv "./dist/WAIL.exe" "./WAIL.exe" 