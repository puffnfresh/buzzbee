Buzzbee
=======

Buzzbee is a jQuery plugin and web service to embed Google Buzz in your website.

You can see an example at
[http://jquery-buzzbee.appspot.com/](http://jquery-buzzbee.appspot.com/)

Usage
-----

**Update:** Buzzbee no longer requires jQuery 1.4.1 or a browser that supports
cross-domain headers!

Getting started with Buzzbee is as easy as:

    <div class="buzz-box">Loading...</div>

    <script src="http://jquery-buzzbee.appspot.com/jquery.buzzbee.js"
        type="text/javascript">
    </script>

    <script type="text/javascript">
    $(document).ready(function() {
        // Your profile ID can be found from your profile URL.
        // http://www.google.com/profiles/example#buzz
        // Means the ID is 'example'
        $('.buzz-box').buzzbee('example');
    });
    </script>

If you would like to host the JavaScript files yourself, you can download the
latest JavaScript files from GitHub.

Options
-------

The `buzzbee` function can take two arguments; the first being a Google Profile
ID and an optional options object containing:

`error`

A string to display if Buzzbee can't retrieve any Buzz from Google. The default
is `'Unable to connect.'`.

`empty`

A string to display if Google returns no Buzz. The default is `'No available
Buzz.'`.

`limit`

The maximum number of entries to display. Use 0 for no limit. The default is
`10`.

`max_media_height`

The maximum height (in pixels) of media. Use 0 for no limit. The default is
`120`.

`entry_separator`

An element or string to insert between Buzz entries. The default is empty.

`detail_separator`

An element or string to insert between entry details (the title, date and
comments). The default is `' - '`.

`server`

A string to use to use for the Google Buzz JSONP request. The URL used is
`url_prefix + user + '?callback=padding'` and it must return a JSONP formatted
Buzz profile feed. The default is
`'http://jquery-buzzbee.appspot.com/jsonfeed/'`
