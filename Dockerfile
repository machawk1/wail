FROM ubuntu:18.10

#TZdata will interactively ask for this info
ENV TZ=Europe/Minsk
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt update && apt install -y \
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
  && rm -rf /var/lib/apt/lists/*

COPY . /wail/

RUN pip3 install -U -f https://extras.wxpython.org/wxPython4/extras/linux/gtk3/ubuntu-18.04 wxPython==4.0.4 && \
    pip3 install pyinstaller==3.4 && \
    cd wail && \ 
    pip3 install -r requirements.txt && \
    pyinstaller -p bundledApps ./bundledApps/WAIL.py --onefile --windowed --clean

# VNC
ENV DISPLAY :20
EXPOSE 5920

RUN mv /wail/dist/WAIL /wail/WAIL
RUN chmod a+x /wail/WAIL
RUN chmod a+x /wail/entrypoint.sh

ENTRYPOINT ["/wail/entrypoint.sh"]
