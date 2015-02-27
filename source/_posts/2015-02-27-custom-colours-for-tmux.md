---
layout: post
title: Custom colours for tmux
date: 2015-02-27 17:31
comments: true
categories: [tmux, cli, tips]
---

I have been using a rather dull [Solarized][] (by
[Ethan Schoonover][]) tmux theme for a while now, it looks like this:

<img src="/images/tmux-solarized.png" class="extrawide">

I tried to tweak the colours to vaguely match the magenta powerline theme of an
Emacs theme called [moe-theme][] (Emacs doesn't work well with the
powerline-patched fonts, so the unicode arrows look funny):

<img src="/images/emacs-moe-theme.png" class="extrawide">

I have acheived something close and it looks like this (you need
powerline-patched fonts for the unicode characters to work):

<img src="/images/tmux-magenta.png" class="extrawide">

Here is the final config for the status colours and content (I decided
to ditch the segment that shows my username, since it's always the
same and I know who I am). This goes in your `~/.tmux.conf`:

```
set -g status-fg black
set -g status-bg colour231
set -g status-left '#[fg=colour234,bg=colour162,bold] ❐ #S #[fg=colour162,bg=colour231,nobold]⮀'
set -g window-status-format "#[fg=black,bg=colour231] #I #[fg=black,bg=colour231]#W "
set -g window-status-current-format "#[fg=colour231,bg=colour141]⮀#[fg=colour231,bg=colour141,bold] #I ⮁ #W #[fg=colour141,bg=colour231,nobold]⮀"
set -g status-right '#[fg=colour162,bg=colour231]⮂##[fg=colour231,bg=colour162] %H:%M %d-%b-%y'
```

Emacs themes and tmux have different colour palettes. Here's how
moe-theme specifies some powerline colours for the modeline:

```elisp
(set-face-attribute 'powerline-active1 nil :background "#ffafff" :foreground "#ff1f8b")
```

Which is easy enough - they are simply hex colour codes, the same as
can be used in CSS. However tmux uses 24-bit [xterm colour codes][]
(for a generous total of 256 colours). In order to map between them
and find the closest colour I found a handy [python script][] which
you can call with a hex code (e.g. `python colortrans.py ff4ea3`) and
it'll print the nearest xterm colour code. If you call the script with
no arguments it'll print a mapping table of xterm colour codes to hex
codes, so you can tweak the value you're using. Or you can simply use
this [colour chart][]. One thing that stalled my progress for a while
was I kept writing `[fg=color183,bg=color213]` sort of thing and tmux
is unusual in using the French/British spelling of colour, which is
unusual in programming. At least it's otherwise straightforward,
unlike [bash color codes][] which look like somebody fell on the keyboard.

[moe-theme]: https://github.com/kuanyui/moe-theme.el
[Solarized]: http://ethanschoonover.com/solarized
[Ethan Schoonover]: http://observer.com/2015/02/meet-the-man-behind-solarized-the-most-important-color-scheme-in-computer-history/
[python script]: https://gist.github.com/MicahElliott/719710
[colour chart]: http://www.calmar.ws/vim/256-xterm-24bit-rgb-color-chart.html
[xterm colour codes]: http://pln.jonas.me/xterm-colors
[bash color codes]: https://wiki.archlinux.org/index.php/Color_Bash_Prompt#List_of_colors_for_prompt_and_Bash
