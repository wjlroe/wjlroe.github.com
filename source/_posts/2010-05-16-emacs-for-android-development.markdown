---
layout: post
title: Emacs for Android development
date: 2010-05-16
comments: true
categories: [emacs, android]
---

Today I started using Emacs rather than Eclipse to work on an Android project. There are a couple of things you need to get started though.

Firstly you will need the Android SDK (which you will have already if you've started with Eclipse Android development) and you need to know where it is located on your hard drive.

There is a mode for Emacs that provides a few Android-related keybindings (for running ant tasks like install/reinstall/compile/start emulator/start ddms etc.), you can find it here: [android-mode](http://github.com/remvee/android-mode). Git clone that repository in your .emacs.d directory (~/.emacs.d/), which should already be in your emacs load path. (Emacs config for this later on).

Because Java for Android uses Java 1.5 or above, it will be full of annotations such as "@Override". The C/Java modes for emacs don't appear to have been updated to support this syntax so indentation won't be quite right. To fix this, you need a minor mode called [java-mode-indent-annotations.el](http://www.emacswiki.org/cgi-bin/wiki/java-mode-indent-annotations.el) <- click on the Download link on that page and save the file as ~/.emacs.d/java-mode-indent-annotations.el

Now the emacs config for all the above is as follows:

{% codeblock lang:cl %}
(setq android-mode-sdk-dir "~/android-sdk-mac_86/")
(require 'android-mode)
(require 'java-mode-indent-annotations)

(setq java-mode-hook
    (function (lambda()
       (java-mode-indent-annotations-setup))))
{% endcodeblock %}

Remember to change the android-mode-sdk-dir to match where you keep your Android SDK. This variable needs to be set before the android-mode is loaded. Also, if you have any other java-mode-hooks defined, you won't want to setq that variable, but use add-hook 'java-mode instead - otherwise this will overwrite your existing java-mode hooks.

If you try to use any of the provided keybindings, listed below:

Key binding | Function
----------- | --------
C-c C-c c   | android-ant-compile
C-c C-c d   | android-start-ddms
C-c C-c e   | android-start-emulator
C-c C-c i   | android-ant-install
C-c C-c l   | android-logcat
C-c C-c r   | android-ant-reinstall
C-c C-c u   | android-ant-uninstall


They will probably fail because by default, when you start an Android project in Eclipse, it will not create a build.xml file and ant requires this for any of the above to work (you can probably start the emulator though as that doesn't rely on a per-project build file). So in order to have an ant build file in your project directory you need to run the following command:

{% codeblock lang:bash %}
android update project --name <project_name> --target <target_ID> --path path/to/your/project/
{% endcodeblock %}

Name and target are optional, as you have most likely already defined those from Eclipse. But in order to list the targets available, run:

{% codeblock lang:bash %}
android list targets
{% endcodeblock %}

That's pretty much it. Remember that you can't run the install task each time because it'll fail if the project is already installed - just run the reinstall task each time you want to test your changes.

Thanks to [fmaj7's blog](http://blog.fmaj7.me/?p=18) where I found most of the information I used to get up and running.

