(function($) {
    $.fn.buzzbee = function(user, options) {
        options = $.extend({
            error: 'Unable to connect.',
            empty: 'No available Buzz.',
            limit: 10,
            max_media_height: 120,
            entry_separator: '',
            detail_separator: ' - ',
            url_prefix: 'http://jquery-buzzbee.appspot.com/feed/',
            url_suffix: ''
        }, options);

        $.ajax({
            type: 'GET',
            dataType: 'xml',
            url: options.url_prefix + user + options.url_suffix,
            context: this,
            error: function(xhr, status) {
                $(this).text(options.error);
            },
            success: function(data) {
                var buzz_box = this;
                if($(data).find('entry').length == 0) {
                    $(buzz_box).text(options.empty);
                    return;
                }

                $(buzz_box).text('');
                var count = 0;
                $(data).find('entry').each(function() {
                    count++;
                    if(options.limit > 0 && count > options.limit) {
                        return;
                    }

                    var entry = $('<div></div>')
                                    .addClass('entry')
                                    .appendTo(buzz_box);

                    var content = $('<div></div>')
                                      .addClass('content')
                                      .appendTo(entry);
                    content.html($(this).find('> content').text());

                    // Handle media.
                    $(this).find('> media\\:content').each(function() {
                        var medium = $(this).attr('medium');
                        var media = $('<div></div>')
                                        .addClass('media')
                                        .addClass(medium)
                                        .appendTo(content);

                        var link = $('<a></a>')
                                       .attr('href', $(this).attr('url'))
                                       .appendTo(media);

                        if(medium == 'image') {
                            var player = $(this).find('> media\\:player');

                            // See if media needs to be resized.
                            var src = player.attr('url');
                            if(options.max_media_height > 0 && player.attr('height') > options.max_media_height) {
                                src = 'http://jquery-buzzbee.appspot.com/resize/' + options.max_media_height + '/' + escape(src);
                            }

                            var img = $('<img />')
                                          .attr('src', src)
                                          .attr('alt', '')
                                          .appendTo(link);
                        }
                    });

                    var details = $('<div></div>')
                                      .addClass('details')
                                      .appendTo(entry);

                    var profile_url = $(this).find('> author uri').text();
                    var title = $('<a></a>')
                                    .addClass('title')
                                    .attr('href', profile_url)
                                    .appendTo(details);
                    title.html($(this).find('> title').text());

                    var updated = $('<span></span>')
                                        .addClass('date')
                                        .appendTo(details);
                    var time = $(this).find('> updated').text();
                    var prettyTime = $.fn.buzzbee.prettyDate(time.replace(/\.\d+/g, ''));
                    updated.text(prettyTime).attr('title', time);

                    var alternate_link = $(this)
                                             .find('> link[rel="alternate"]')
                                             .attr('href');

                    var total = $(this).find('> thr\\:total').text();

                    // Fallback gracefully if XML namespaces can't be found.
                    if(total.length > 0) {
                        var permalink = $('<a></a>')
                                            .attr('href', alternate_link)
                                            .appendTo(details);
                        permalink.text('(' + total + ' comment' + (total != 1 ? 's' : '') + ')');
                    }

                    $(details).find('> :gt(0)').before(options.detail_separator);
                });

                $(buzz_box).find('> :gt(0)').before(options.entry_separator);
            }
        });

        return this;
    };

    // John Resig's "Pretty Date"
    $.fn.buzzbee.prettyDate = function(time) {
        var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
            diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);

        if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
            return;

        return day_diff == 0 && (
                diff < 60 && "just now" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
    };
})(jQuery);
