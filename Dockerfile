FROM node
MAINTAINER John Berlin <jberlin@cs.odu.edu>

ADD . /usr/src/app
WORKDIR /usr/src/app
RUN npm install

RUN npm run-script download-externals-all

CMD bash
