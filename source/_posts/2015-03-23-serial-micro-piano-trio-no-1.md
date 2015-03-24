---
layout: post
title: Serialist Micro Piano Trio No. 1
date: 2015-03-23 20:00
categories: [overtone, clojure, music, serialism, 12tone, art]
js_gamedev_signup: true
comments: true
---

My first "released" (algorithmically generated) composition is a micro
piano trio in a [serialist][] style.

<!--more-->

It all started when I borrowed the book [Simple Composition][] by
[Charles Wuorinen][] from the Sussex University library (I was
studying Computer Science & Artificial Intelligence at the time, some
years ago).

<figure class="img fillwidth"><img src="/images/University_of_Sussex_Library.jpg" alt="Sussex Uni Library" title="Sussex Uni Library"><figcaption>Sussex University Library -- Photo Public Domain, Wikipedia, Filtered</figcaption></figure>

This book explains the basics of composing in the
[twelve tone technique][] created by [Arnold Schoenberg][]. Some days
ago I started playing around with the concepts from that book in
[Overtone][]. It was a lot of fun.

{% tweet https://twitter.com/wjlroe/status/575775558082150402 %}

If you're not familiar with twelve-tone composition or serialism in
music, you could do a lot worse than to watch this awesome video by
[ViHart][]:

<iframe width="560" height="315" src="https://www.youtube.com/embed/4niz8TfY794" frameborder="0" allowfullscreen></iframe>

## The code

I used a library called [Leipzig][] written by [Chris Ford][] to build
up the composition from an initial tone row (a set of 12 integers),
via several functional transformations of the tone row and into 3
instrumental parts: piano, violin and cello.

Since this piece uses a randomly-generated tone row and
randomly-generated sequence of both note duration and playing style
(vibrato, non-vibrato or pizzicato),
it's not actually reproducible from the code. The code is useful
mainly for encoding the basic form of the piece and the parameters
of the work (such as instruments, length of the piece, which elements
are random and which aren't etc.).

In future I will work out some way to capture the notes being
generated. The simplest way to do this would be to save all the
structures produced by the `piano-trio` function into an [EDN][] file,
which could be trivially played back at a later date. Transformation
of that data into traditional musical notation wouldn't be too tricky
either.

The structure of this piece consists of 3 instrumental parts played in
parallel. The main function is
[`piano-trio`](https://github.com/wjlroe/serial/blob/micro-piano-trio-1/src/serial/twelve_tone.clj#L200-L213)
and is inline below:

```clojure
(defn piano-trio
  [bpm tone-row]
  (in-tempo
   bpm
   (with
    (->> (total-serial tone-row)
         (play-on :cello)
         (serial-style :cello))
    (->> (total-serial tone-row)
         (play-on :violin)
         (serial-style :violin))
    (->> (total-serial tone-row)
         (play-on :piano)
         (serial-style :piano)))))
```

The most interesting aspect as it relates to musical transformation is
the definition of retrograde, inversion and retrograde-inversion:

```clojure
(defn retrograde
  [row]
  (reverse row))

(defn inversion
  [row]
  (map - row))

(def retrograde-inversion
  (comp retrograde inversion))
```

It was for this reason - the applicability of pure functions and
functional composition - that I felt [overtone][] and Clojure were such a
good fit for writing [serialist][] music. It's even more applicable to
12-tone composition than tonal (diatonic) music since the rules are so
much more mechanistic.

## The recording

<p><iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/197309694&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false"></iframe></p>

I had a lot of fun exploring serialism through Overtone and the
Leipzig library. I was inspired to release this little track and to
spend more time on code like this when I watched a great talk called
[Make Art, Not Apps][] by [@ThisIsJohnBrown][].

[Leipzig]: https://github.com/ctford/leipzig
[Overtone]: http://overtone.github.io/
[serialist]: http://en.wikipedia.org/wiki/Serialism
[EDN]: https://github.com/edn-format/edn
[Make Art, Not Apps]: https://www.youtube.com/watch?v=kovJHzQNsg0
[@ThisIsJohnBrown]: https://twitter.com/ThisIsJohnBrown
[Charles Wuorinen]: http://en.wikipedia.org/wiki/Charles_Wuorinen
[Simple Composition]: https://www.goodreads.com/book/show/3150827-simple-composition
[Arnold Schoenberg]: http://en.wikipedia.org/wiki/Arnold_Schoenberg
[twelve tone technique]: http://en.wikipedia.org/wiki/Twelve-tone_technique
[ViHart]: http://vihart.com
[Chris Ford]: http://literateprogrammer.blogspot.co.uk/
