FROM ubuntu:18.10

#TZdata will interactively ask for this info
ENV TZ=Europe/Minsk
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt update && apt install -y \
 apt-file \
 libsdl1.2debian \
 libgtk-3-0 \
 libxxf86vm1 \
 libsm6 \
 libnotify4 \
 x11vnc \
 xvfb \
 python3 \
 python3-pip \
 git

COPY . /wail/

RUN pip3 install -U -f https://extras.wxpython.org/wxPython4/extras/linux/gtk3/ubuntu-18.04 wxPython==4.0.4 && \
    pip3 install pyinstaller==3.4 && \
    cd wail && \ 
    pip3 install -r requirements.txt && \
    pyinstaller -p bundledApps bundledApps/WAIL.py --onefile --windowed --clean

# VNC
ENV DISPLAY :20
EXPOSE 5920

RUN chmod a+x /wail/dist/WAIL
RUN chmod a+x /wail/entrypoint.sh

ENTRYPOINT ["/wail/entrypoint.sh"]