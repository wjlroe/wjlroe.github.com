---
layout: post
title: css-mode broken on Debian with Emacs 24
date: 2015-01-24 09:00
comments: true
categories: [debian, linux, emacs]
---

If you get an error like this

    Symbol's function definition is void: apropos-macrop

When editing CSS files with Emacs on Debian (testing or unstable at
the time of writing), then this is because the package `css-mode`
includes code that no longer works with Emacs version 24 and has been
abandoned (emacs contains its own css-mode).

The solution is simply to uninstall `css-mode`:

    sudo apt-get remove css-mode

That's it.
