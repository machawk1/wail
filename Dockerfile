FROM ubuntu:18.10

# libsdl or wxPython 4.0.4
RUN apt update && apt install -y \
 apt-file \
 libsdl1.2debian \
 python2 \
 python-pip \
 git && \
 apt-file update && apt-file search libSDL-1.2.so.0 

RUN pip install -U -f https://extras.wxpython.org/wxPython4/extras/linux/gtk3/ubuntu-18.04 wxPython && \
    pip install pyinstaller && \
    git clone https://github.com/machawk1/wail && \
    cd wail && \ 
    pip install -r requirements.txt && \
    pyinstaller -p bundledApps bundledApps/WAIL.py --onefile --windowed --clean

