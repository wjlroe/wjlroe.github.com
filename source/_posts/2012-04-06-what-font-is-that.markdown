---
layout: post
title: "What font is that?"
date: 2012-04-06 21:06
comments: true
categories: fonts
---

I often come across web pages that use fonts that I like and wonder what they are (I'm not that good at guessing fonts). On the whole this situation happens while reading on my iPhone because that's the only high-resolution screen I use - good fonts look amazing on the iPhone 4S.

This just happened to me while reading a post linked from daring fireball - [the "of course" principle of design](http://om.co/2012/04/05/the-of-course-principle-of-design/). I really liked the look of that font on the iPhone. (I also noted that I should reduce the margins on my blog for small screens because you have to zoom to read really). So how, on an iPhone, you do find out what font that is?

What I wanted was a bookmarklet, so I searched for "what font bookmarklet" and found [WhatFont Tool](http://chengyinliu.com/whatfont.html) which provides a powerful bookmarklet for finding out what font a page is using (and whether it is from Google webfonts or Typekit). Problem is, bookmarking JavaScript is not easy on the iPhone - you have to copy/paste the JavaScript somehow. Because WhatFont only provides a button (to drag to your bookmarks bar), I had to find another way. I decided to try the Mercury web browser, guessing it might have a way to copy the JavaScript for a link/button. Thankfully I was right and it allowed me to copy the JavaScript, then switch to Safari and create then edit a bookmark for it. It works wonderfully. Just touch the bookmark to active it, then touch any piece of text on a website to see info on what fonts it's using. Simple.

For your copy/paste convenience, I have provided the code for the WhatFont bookmarklet:

{% codeblock lang:javascript %}
javascript:(function(){var%20d=document,s=d.createElement('scr'+'ipt'),b=d.body,l=d.location;s.setAttribute('src','http://chengyinliu.com/wf.js?o='+encodeURIComponent(l.href)+'&t='+(new%20Date().getTime()));b.appendChild(s)})();
{% endcodeblock %}

Turned out that that post was using [Crimson Text](http://aldusleaf.org/crimson/) from Google Webfonts. Nice.

It looks like Crimson Text is a promising free font that might have Polytonic Greek characters at some point so that's useful to know for me.
