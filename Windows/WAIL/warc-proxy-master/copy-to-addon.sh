#!/bin/bash
for i in css img skin js list.html
do
  rm -r firefox-addon/data/$i
  cp -r html/$i firefox-addon/data/
done

sed --in-place "s/addonType = null/addonType = 'mozilla'/" firefox-addon/data/list.html
sed --in-place "s/proxyRoot = ''/proxyRoot = 'http:\/\/127.0.0.1:8000'/" firefox-addon/data/list.html

