---
layout: post
title: Parsing and ebook making
---

I have just finished a 6 hour hacking session on [parse_perseus](http://github.com/wjlroe/parse_perseus). The aims were to fix most of the encoding problems, split the content up into books and create a table of contents. Other than a few problems with encoding, I managed to complete all that.

#### Tables of contents

The table of contents was a bit strange. The Kindle's mobi format pretty much ignores the epub standard .ncx file (which is an XML file that contains `<navPoint>` elements that get mapped to entries in a generated table of contents - Adobe Digital Editions uses this for example). Here's an abridged version of the NCX file I had generated:

{% highlight xml linenos %}

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
	  "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en">
  <head>
    <meta name="dtb:uid" content="http://en.wikipedia.org/wiki/The_Odyssey"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>Ὀδύσσεια</text>
  </docTitle>
  <navMap>
    <navPoint id="toc" playOrder="0">
      <navLabel>
        <text>Table of Contents</text>
      </navLabel>
      <content src="toc.html"/>
    </navPoint>
    <navPoint class="chapter" id="book-1" playOrder="1">
      <navLabel>
        <text>Book 1</text>
      </navLabel>
      <content src="book-1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>
{% endhighlight %}

There were obviously more chapters/books than that. The Kindle/mobi format doesn't use this for the table of contents, so when you open a converted epub on a Kindle (or using the Kindle desktop software), the menu item to go to the table of contents is greyed out. After digging around on the web I discovered that the mobi format uses a toc file, which is basically an html file full of links. In order for that to work, you need to reference the toc file in the OPF file. Here's an abbreviated version of the one I generated:

{% highlight xml linenos %}

<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0"
	 unique-identifier="odyssey_gk">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"
  	    xmlns:dcterms="http://purl.org/dc/terms/"
	    xmlns:opf="http://www.idpf.org/2007/opf"
	    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>Ὀδύσσεια</dc:title>
    <dc:language xsi:type="dcterms:RFC3066">en-us</dc:language>
    <dc:identifier id="odyssey_gk" opf:scheme="URL">
    		   http://en.wikipedia.org/wiki/The_Odyssey
    </dc:identifier>
    <dc:creator opf:file-as="Homer" opf:role="aut">Homer</dc:creator>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="book-1" href="book-1.xhtml" media-type="application/xhtml+xml"/>
    <item id="stylesheet" href="style.css" media-type="text/css"/>
    <item id="ncx" href="book.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="cover" href="cover.html" media-type="application/xhtml+xml"/>
    <item id="toc" href="toc.html" media-type="application/xhtml+xml"/>
    <item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" linear="no"/>
    <itemref idref="toc" linear="no"/>
    <itemref idref="book-1"/>
  </spine>
  <guide>
    <reference href="cover.html" type="cover" title="Cover"/>
    <reference href="toc.html" type="toc" title="Table of Contents"/>
    <reference href="book-1.xhtml" type="text" title="Text"/>
  </guide>
</package>

{% endhighlight %}

The important bit there is the `<reference>` element inside `<guide>` that is of type "toc". After that, the actual table of contents file is pretty straightforward:

{% highlight xml linenos %}

<?xml version="1.0"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
	  "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Table of Contents</title>
    <style type="text/css">img { max-width: 100%; height: 100% }</style>
  </head>
  <body>
    <div id="contents">
      <h2>Contents</h2>
      <ul>
        <li>
          <a href="book-1.xhtml">Book 1</a>
        </li>
      </ul>
    </div>
  </body>
</html>

{% endhighlight %}

That's just a standard content file and can be formatted, using CSS, the way you want it rendered on the e-reader.

#### Encoding

I managed to solve the problem I was having rendering the correct unicode for Iota Dialytika Tonos. I don't expect anyone to know what that is, I didn't and it's still just a character to me. But it looks like this:

<h1>ΐ</h1>

<aside class="post">
<strong>Betacode</strong> is the ASCII language used by Perseus Digital library to represent Greek characters easily. It's used in their opensource XML files (that I've used) and as a way to search Greek books (due to the unavailability of Ancient Greek keyboards). So <code>a)/ndra</code> becomes <code>ἄνδρα</code>.
</aside>

In betacode, this is written as `i/+`. Normally, the parser encodes the character `i`, then each diacritic in turn: `/`, then `+` into combining diacritics. This resulted in characters `0x03b9 0x0301 0x0308`, which would be normalized using Java's Normalizer/normalize function as:

<h1>ί̈</h1>

The frustrating thing is that it's quite difficult to tell the difference on the terminal, when running tests - even when I'd bumped the font size up to crazy levels.

In order to match that symbol, I created the following rule:

{% highlight clojure linenos %}
(def iota-dialytika-tonos
     (constant-semantics (lit-conc-seq "i/+" lit)
                         (char 0x0390)))
{% endhighlight %}

Then I'd redefined `character` to be:

{% highlight clojure linenos %}
(def character (alt iota-dialytika-tonos final-sigma upper-char lower-char))
{% endhighlight %}

Which means that the rule `iota-dialytika-tonos` takes precedence over any other character (to prevent the dumb combining diacritic rules from matching it).

And that brings me on to final sigma. Final sigma has given me quite a lot of pain, ever since I started building this parser. For those of you who don't know Greek, like me, they have two sigma characters - one is used in the middle of a word:

<h1>σ</h1>

But if sigma is at the end of a word, it must use the final sigma character, thus:

<h1>ς</h1>

The problem with matching something at the end of a word is that fnparse's matchers are mostly greedy. There's no equivalent rule, as far as I can tell, to the regular expression `(.+)s`. The `rep+` rules always greedily gobble all the tokens, including the last `s`. At the moment, all I have is the following rule for final sigma:

{% highlight clojure linenos %}
(def final-sigma (constant-semantics (lit-conc-seq "s " lit)
                                     (str (char (- (beta-char-to-greek-char \s) 1))
                                          \space)))
{% endhighlight %}

This isn't ideal because it can't match either the last `s` of the last word in a string (or line), or `s` followed only by a non-character (such as `:`). This is something I have to work on, but fnparse isn't making it easy for me here.

- - -

### References

* [fnparse](http://github.com/joshua-choi/fnparse/) which is awesome for taming parse-m monads in Clojure.
* Thanks to [Greek Diacritics](http://www.tlg.uci.edu/~opoudjis/unicode/gkdiacritics.html) for information about combining diacritics.
* [EPUB](http://en.wikipedia.org/wiki/EPUB) Wikipedia's writup on the EPUB standard is almost all you need.
* [OPF](http://idpf.org/epub/20/spec/OPF_2.0.1_draft.htm) The OPF/NCX standard.
* [The Odyssey](http://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0135) From the Perseus Digital Library, the source for the XML files I have been consuming in this project.
