Buzzbee
=======

Buzzbee is a service to embed Google Buzz in your website using jQuery.

You can see an example at
[http://jquery-buzzbee.appspot.com/](http://jquery-buzzbee.appspot.com/)

The code can be as simple as:

    <div class="buzz-box">Loading...</div>

    <script type="text/javascript">
    $(document).ready(function() {
        // Your profile ID can be found from your profile URL.
        // http://www.google.com/profiles/example#buzz
        // Means the ID is 'example'
         $('.buzz-box').buzzbee('example');
    });
    </script>

Usage
-----

Buzzbee currently requires jQuery 1.4.0 or higher.

Cross-domain restrictions may change how you can use Buzzbee.

If you are targeting old browsers, you must make sure the Buzz request is
performed on the same domain as the JavaScript. The easiest way is to just
to directly link to the hosted version of Buzzbee:

    <script src="http://jquery-buzzbee.appspot.com/jquery.buzzbee.js"
        type="text/javascript">
    </script>

If you don't like directly linking to JavaScript, you can host it locally and
require browsers to support Access-Control-Allow-Origin (so far, Firefox 3.5 and
IE8).

Options
-------

The `buzzbee` function can take two arguments; the first being a Google Profile
ID and an optional options object containing:

`error`

A string to display if Buzzbee can't retreive any Buzz from Google. The default
is `'Unable to connect.'`.

`empty`

A string to display if Google returns no Buzz. The default is `'No available
Buzz.'`.

`limit`

The maximum number of entires to display. Use 0 for no limit. The default is
`10`.

`max_media_height`

The maximum height (in pixels) of media. Use 0 for no limit. The default is
`120`.

`entry_separator`

An element or string to insert between Buzz entries. The default is empty.

`detail_separator`

An element or string to insert between entry details (the title, date and
comments). The default is `' - '`.

`url_prefix`

A string useful for when you want to use a local Buzz proxy. The URL used is
`url_prefix + user + url_suffix` and it must return a Buzz profile feed. The
default is `'http://jquery-buzzbee.appspot.com/feed/'`

`url_suffix`

See above. The default is empty.
