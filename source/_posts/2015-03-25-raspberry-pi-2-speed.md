---
layout: post
title: Raspberry Pi 2 speed
date: 2015-03-25 22:18
js_gamedev_signup: true
comments: true
categories: [clojurescript, raspberry-pi, linux]
---

I just benchmarked my new [Raspberry Pi 2 Model B][] against my old
[Raspberry Pi 1 Model B][] using the
[ClojureScript Quick Start Guide][] (specifically timing the build
step):

<!--more-->

    time java -cp cljs.jar:src clojure.main build.clj

On the [Raspberry Pi 1 Model B][] this takes 61.59 seconds, whereas on
the new [Raspberry Pi 2 Model B][] this takes 18.42 seconds!

<figure class="img fillwidth"><img src="/images/raspberrypi2.jpg"
alt="Raspberry Pi 2" title="Raspberry Pi 2"><figcaption>My Raspberry Pi
2 in a very fetching <a href="http://shop.pimoroni.com/products/pibow-coupe">PiBow Coupé case</a></figcaption></figure>

For comparison, on my MacBook Air (11-inch, Mid 2013, 1.4 GHz Intel
Core i5, 8GB RAM), while lots of software was running, so not a
complete fair test (the Pis were booted up into the console, not even
running X) this takes 5.75 seconds.

Considering the difference in specifications of these machines, the
Raspberry Pi 2 is remarkably fast. I could even load up and play with
[Sonic Pi][] pretty quickly (on the original Model B that took long
enough to make a cup of tea).

Looks like I'm going to be drinking less tea in the future.

[Raspberry Pi 2 Model B]: http://www.raspberrypi.org/products/raspberry-pi-2-model-b/
[Raspberry Pi 1 Model B]: http://www.raspberrypi.org/products/model-b/
[ClojureScript Quick Start Guide]: https://github.com/clojure/clojurescript/wiki/Quick-Start
[Sonic Pi]: http://sonic-pi.net/
