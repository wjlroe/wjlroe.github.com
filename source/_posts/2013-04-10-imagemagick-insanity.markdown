---
layout: post
title: Imagemagick SVG insanity
date: 2013-04-10
categories: [linux, ubuntu]
---

<!--more-->
If you are trying to read SVGs and convert them (through STDIN/STDOUT, from a script for example), like this:

    cat test.svg | convert svg: png:- > test.png

And you get this error:

```
Error reading SVG:
convert: delegate failed `"rsvg-convert" -o "%o" "%i"' @ error/delegate.c/InvokeDelegate/1058.
convert: unable to open image `/tmp/magick-Oj094Z9n':  @ error/blob.c/OpenBlob/2587.
convert: unable to open file `/tmp/magick-Oj094Z9n':  @ error/constitute.c/ReadImage/571.
convert: missing an image filename `png:-' @ error/convert.c/ConvertImageCommand/3011.
```

Then you need to install (on Ubuntu anyway):

    apt-get install libmagickcore4-extra

I had to strace the `convert` command to find out that it was looking for a missing file. This is from the strace output:

```
stat("/usr/lib/ImageMagick-6.6.9/modules-Q16/coders/svg.la", 0x7fffe6cace90) = -1 ENOENT (No such file or directory)
```

Words cannot describe how I feel about Imagemagick right now.

Note to self: install this required package (stupidly called "-extra").

Also note to self: avoid Imagemagick like the plague.
