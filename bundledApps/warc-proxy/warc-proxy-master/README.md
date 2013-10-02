WARC viewer for browsing the contents of a WARC file.

1. Find one or more WARC files (here's an example: https://github.com/downloads/alard/warc-proxy/picplz-00454713-20120603-143400.warc.gz).
2. Install the Python Tornado library. Sometimes: <code>pip install tornado</code>,  on Ubuntu or Debian: <code>sudo apt-get install python-tornado</code>
3. Check out the code: <code>git clone https://github.com/alard/warc-proxy</code>
4. Run the proxy: <code>python warcproxy.py</code>

On Firefox: install the <code>firefox-addon/warc-viewer.xpi</code> and start the WARC viewer from the Tools menu.

On other browsers:

5. Set the HTTP proxy of your browser to <code>localhost</code> port <code>8000</code>
6. Visit <code>http://warc/</code>

