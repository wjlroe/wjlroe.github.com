---
layout: post
title: How to install Ubuntu Natty on the Sony Vaio VPC Y21 S1E
---

This is a howto guide for installing Ubuntu Natty on the troublesome Sony Vaio VPC-Y21-S1E. I say troublesome because no distribution of Linux installs a fully working system on this laptop to the best of my knowledge, even though the hardware is all very common and not very new. Owning this laptop and running Linux is like going back in time to the early 2000s when installing Linux was a week's work on any machine. It's horrendous that even distros that favour ease of use by default have yet to achieve good hardware support.

## Step 1 - install Ubuntu

I used the alternative amd64 ISO image for this (and a USB CDROM drive). The text mode installer worked fine as usual and installed in an hour or so. Not exactly quick, but probably that's due to very slow IO on this machine.

Once Ubuntu Natty is installed and reboots into your new system, you will notice a couple of things. Firstly the graphics will be running in some kind of generic mode with the wrong resolution. The native resolution of this panel is the now relatively standard 1366x768 of this class of laptop. Out of the box though, Ubuntu will boot in 1024x768 and it looks horrendous. According to Xorg.0.log it will select the VESA driver instead of the intel one it should be using. This is why it will start in unaccelerated, not much works mode. Needless to say, Unity will not be making an appearance yet. I think this is because there is a regression in the 2.6.36 kernel - according to another user of this laptop, the previous kernel version (2.6.37rc8) should work fine.

## Step 2 - get a working kernel

You're going to need to get the network setup before you can do anything useful. Out of the box, I'm not sure if the wireless is working or not because no mouse will work. The touchpad does nothing and any mouse I plugged in didn't work either. This is extremely poor if even a simple USB mouse won't work.

The first thing to try is to get a working kernel installed. I headed here [Index of /~kernel-ppa/mainline/v2.6.37-rc8-natty](http://kernel.ubuntu.com/~kernel-ppa/mainline/v2.6.37-rc8-natty/) to get the headers and image packages for the amd64. It's pretty difficult to get anything onto the laptop since USB isn't working at all under Natty. I tried using a USB flash drive to copy the kernel files over - no luck. So what I did was shorten the kernel-ppa link [http://bit.ly/ieDkmQ](http://bit.ly/ieDkmQ), connected the laptop to my ADSL router with an ethernet cable and downloaded those files. I had to keep telling myself it was in fact still 2011.

Once I'd installed the older kernel and rebooted, things started to work. The bootup screen was garbled however and I got what looked like a kernel panic, with a stackframe all over the place - but it wasn't because I could switch to a random VC and back to the 7th VC and see GDM there. It's just a complete mess. I think I'm gonna have to disable the bootspash stuff because it's so incredibly messed up (for every other install of Linux on this laptop I've had to do that).

## Step 3 - Change the default kernel

We need to change the default kernel that boots to avoid booting a broken kernel every time we turn the laptop on.

- Set `GRUB_DEFAULT=saved` in the file `/etc/default/grub`, so we can set the default kernel.
- I wanted to find out what the menuentry is for the kernel I've just installed, so I ran:

{% codeblock lang:bash %}
grep menuentry /boot/grub/grub.cfg
{% endcodeblock %}

This will print out every entry in GRUB. This is all from the [Grub2](https://help.ubuntu.com/community/Grub2) page.

- Now use the appropriate menuentry to set as the default. If you installed the same one I did, then that will be "Ubuntu, with Linux 2.6.37-020637rc8-generic":

{% codeblock lang:bash %}
sudo grub-set-default 'Ubuntu, with Linux 2.6.37-020637rc8-generic'
{% endcodeblock %}

- Save all that to grub:

{% codeblock lang:bash %}
sudo update-grub
{% endcodeblock %}

That's it, should be set now. This didn't work for me though. With ever release of grub and ubuntu tools, it gets more and more difficult to do simple things. It's cool that update-grub can detect all the OSes on your hard drive and boot them (it ignored the other Ubuntu install ironically so it's not included in the boot menu, pretty silly bug). But please! the ability to set a default kernel or menuentry should be easy and *should work*. In the end, I set `GRUB_SAVEDEFAULT=true` in `/etc/default/grub` and chose the kernel I wanted so that in future it'll boot that one every time. What a joke.

For my sanity, I turned off the bootscreen which, on this laptop is severly broken. Even though I've turned the boot splash off, I still have to switch to another VC and back to 7 to see the GDM login screen. Broken.

## Step 4 - Getting wireless working

Now we have the mouse working, and USB mice work and graphics are as good as you'll probably ever get on Linux (i.e. not great).

Wireless is disabled though and you can't enable it from the networking icon (Network Manager). This is an issue I've had with Ubuntu on this machine before and I had to dig around to find out how to force it to be enabled.

Enabling the wirelss is not a simple task. It involves messing around with `rfkill` and it's not a simple matter of running `rfkill unblock all` either - which is maddening. The wireless card is still soft-blocked after that. (Hard blocked means the hardware switch is off and soft blocked means it's turned off in software somewhere).

I couldn't find the solution by googling and browsing a million Ubuntu forum threads, but checking my `/etc/modprobe.d/` directory in the other Ubuntu install pointed the way. You need a file with the following contents:

{% codeblock lang:bash %}
blacklist acer-wmi
{% endcodeblock %}

I called that file `blacklist-acer-wmi.conf` and this time I remembered to copy it into my Dropbox folder so that I won't forget about it again.

## Suspend

Suspend and resume works with Natty! Yay! It didn't work on this laptop with Maverick. So we have *some* progress.

## Multiple monitors

I tried plugging a VGA monitor in and it was detected and the correct resolution was selected. Wonderful. However, when I tried to change the layout of the monitors, it messed up completely and I ended up with random desktops being drawn all over the monitors. Unplugging and plugging the monitor in fixed that, with only some minor rendering issues (there was a black border around much of the second desktop that went away when I moved a window around). This sort of thing should have been sorted a long time ago, it's tiresome to be messing around with such a mess.

## Other problems

1. When you launch the Update Manager, it still reports everything is up do date without checking first. This is really stupid, having to click on "Check" to download the latest package definitions before it realises there are updates to install. It should take the fact that you've deliberately openned Update Manager for the sole purpose of checking whether your software is up-to-date and not tell you out-of-date information.
1. Keyboard navigation is still horrible in Gnome (that's the Classic desktop thing that Ubuntu puts you in if there are problems with your drivers - very likely).

## Summary

Linux and Ubuntu have a very long way to go before they can start to compete with the commercial alternatives. Although Unity is a refreshing innovation on desktop interfaces, it really needs to be backed up with great hardware support and general ease of use that goes a little more than skin deep.

I think I will be posting a review of Natty later - that will focus on Natty as a working system, rather than specific to this laptop. So far though, having used it for a couple of hours setting up my environment, it's a great system. It needs a lot more QA to sort out the hardware and system problems though.
