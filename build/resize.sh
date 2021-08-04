convert -resize 512x512 icon_1024x1024.png icon_512x512.png
convert -resize 256x256 icon_1024x1024.png icon_256x256.png
convert -resize 128x128 icon_1024x1024.png icon_128x128.png
convert -resize 32x32 icon_1024x1024.png icon_32x32.png  
convert -resize 16x16 icon_1024x1024.png icon_16x16.png

cp icon_1024x1024.png icon_512x512@2x.png
cp icon_512x512.png icon_256x256@2x.png
cp icon_256x256.png icon_128x128@2x.png
convert -resize 64x64 icon_1024x1024.png icon_32x32@2x.png
cp icon_32x32.png icon_16x16@2x.png
