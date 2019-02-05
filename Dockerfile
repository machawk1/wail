FROM ubuntu:18.10

# libsdl or wxPython 4.0.4
RUN apt update && apt install -y \
 apt-file \
 libsdl1.2debian \
 libgtk-3-0 \
 libxxf86vm1 \
 libsm6 \
 libnotify4 \
 python2 \
 python-pip \
 git

RUN pip install -U -f https://extras.wxpython.org/wxPython4/extras/linux/gtk3/ubuntu-18.04 wxPython && \
    pip install pyinstaller && \
    git clone https://github.com/machawk1/wail && \
    cd wail && \ 
    pip install -r requirements.txt && \
    pyinstaller -p bundledApps bundledApps/WAIL.py --onefile --windowed --clean

RUN chmod a+x /wail/dist/WAIL