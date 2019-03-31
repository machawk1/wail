FROM       ubuntu:18.10

LABEL      app.name="WAIL" \
           app.description="Web Archiving Integration Layer: One-Click User Instigated Preservation" \
           app.license="MIT License" \
           app.license.url="https://github.com/machawk1/wail/blob/osagnostic/LICENSE" \
           app.repo.url="https://github.com/machawk1/wail"

#TZdata will interactively ask for this info
ENV        TZ=Europe/Minsk
RUN        ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# VNC
ENV        DISPLAY :20
EXPOSE     5920

RUN        apt update && apt install -y \
             apt-file \
             git \
             libgtk-3-0 \
             libnotify4 \
             libsdl1.2debian \
             libsm6 \
             libxxf86vm1 \
             python3 \
             python3-pip \
             x11vnc \
             xvfb \
             language-pack-en \
       &&  rm -rf /var/lib/apt/lists/*

RUN        pip3 install -U -f https://extras.wxpython.org/wxPython4/extras/linux/gtk3/ubuntu-18.04 wxPython==4.0.4 \
       &&  pip3 install pyinstaller==3.4

WORKDIR    /wail
COPY       requirements.txt ./
RUN        pip3 install -r requirements.txt
COPY       . ./

RUN        pyinstaller -p bundledApps ./bundledApps/WAIL.py --onefile --windowed --clean \
       &&  mv /wail/dist/WAIL /wail/WAIL

RUN        chmod a+x /wail/WAIL /wail/entrypoint.sh

ENTRYPOINT ["/wail/entrypoint.sh"]
