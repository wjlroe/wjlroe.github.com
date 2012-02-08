---
layout: post
title: Further Haskell exploration
---

Today I decided to embark on an exploration of Haskell web
development. I have previously bootstrapped a basic
[Snap](http://snapframework.com/) setup but never got into actual
hacking. Today I decided to give [Yesod](http://www.yesodweb.com/) a
go. I ran into a number of difficulties that drained away all my spare
time this evening but in the end I feel like I'm ready to dive in
tomorrow.

I started off by attempting to install Yesod, with a simple `cabal
install yesod`. This command took about 10 minutes to finish compiling
dependencies on my ThinkPad X61 before it died with an error. The
problem seemed to be the version of
[haskell-platform](http://hackage.haskell.org/platform/) was rather
out-of-date, meaning a tool, called `alex` was too old for Yesod. To
solve this rather small issue I took the rather drastic step of
upgrading Ubuntu on the ThinkPad to
[Precise Pangolin](https://wiki.ubuntu.com/PrecisePangolin) because
this includes the latest haskell-platform...and its all new and...just
because! This is Ubuntu after all - trigger happy upgrades are the
name of the game.

Meanwhile, in Mac land. While that upgrade was running I tried to run
the new yesod web app on a Mac. Unfortunately I ran into all the
problems I've encountered before with cabal-dev on OS X.

Firstly there's some weirdness with cabal-dev being set to install
everything in the system library location. This just makes no sense for
cabal-dev - the whole point is for it to install libraries in a
vendored, per-project location - not interfering with system
libraries. It manifested itself as asking for a password all the time
(turn on verbose `-v3` to see it running all cabal commands with sudo
- O_o). To fix that you edit the config file, outlined in a
  [blog post I found](http://passingcuriosity.com/2011/cabal-dev-configuration-tweaks/). Annoying.

Another problem I had was ghc/ld spamming the terminal with loads of
linker warnings. This really slowed down compilation. I didn't really
solve this (happened on my Mac Mini - didn't happen on my work MacBook
Air). I remember having to set options for GHC to silence that crap,
but I forget the details...

In order to get it all working on my Mac I:

- Uninstalled haskell-platform (this is homebrew installed for me)
- Re-installed haskell-platform
- cabal installed cabal-dev, yesod

Everything worked then. There's also strange voodoo you have to run to
unregister old packages - `brew info haskell-platform` splits out the
necessary commands.

After all that, things worked...mostly. Currently there seems to be
some car crash of dependencies caused by a new release of something
called tls-extras. A helpful stranger in IRC (#yesod) told me to
`cabal-dev install tls-extra-0.4.2.1` - this forces a working version
of that library and then you can happily install yesod and
everything's groovy.

Who said Haskell was difficult? Not me.

So now I have a skeleton Yesod project up and running and it's all
looking very promising. The helper script for creating projects gave
me some confidence - specifically asking if I wanted sqlite, postgres,
MongoDB or nothing seemed pretty good to me - this doesn't appear to be
a web framework/persistence system tied to a particular way of doing
things.

The main reason why I decided to dive into Yesod however was the high
volume of interesting yesod-related blog traffic - this is a pretty
crucial metric in gauging the health of a library community in my
opinion and my RSS reader has been bombarded with posts about it so I
felt I had to see what all the fuss was about.

Hopefully happy Haskell hacking henceforth
