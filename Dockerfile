FROM ubuntu
MAINTAINER John Berlin <jberlin@cs.odu.edu>

RUN apt-get update && apt-get install -y libgtk2.0-0 libgconf-2-4 libasound2 libxtst6 libxss1 libnss3 xvfb libcanberra-gtk* firefox

RUN groupadd wail && useradd -m -g wail wail

ADD . /wail
ADD settings.json /home/wail/.config/wail/wail-settings/

RUN chown -R wail:wail /home/wail /wail

ENV JAVA_HOME=/wail/resources/app/bundledApps/openjdk

USER wail

CMD ["/wail/wail"]
