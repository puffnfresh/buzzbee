(function($) {
    $.fn.buzzbee = function(user, options) {
        options = $.extend({
            error: 'Unable to connect.',
            empty: 'No available Buzz.',
            limit: 10,
            max_media_height: 120,
            entry_separator: '',
            detail_separator: ' - ',
            server: 'http://jquery-buzzbee.appspot.com/jsonfeed/'
        }, options);

        var buzz_box = this;
        $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            url: options.server + user,
            error: function(xhr, status) {
                $(this).text(options.error);
            },
            success: function(data) {
                if(data.length == 0) {
                    $(buzz_box).text(options.empty);
                    return;
                }

                $(buzz_box).text('');
                var count = 0;
                $(data).each(function() {
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
                    content.html(this.content);

                    // Handle media.
                    $(this.media).each(function() {
                        var medium = this.medium;
                        if(this.player || medium == 'document' || medium == 'video') {
                            var media = $('<div></div>')
                                            .addClass('media')
                                            .addClass(medium)
                                            .appendTo(content);
                            
                            var link = $('<a></a>')
                                           .attr('href', this.url)
                                           .appendTo(media);
                            
                            if(medium == 'image' || medium == 'photo') {
                                // See if media needs to be resized.
                                var src = this.player.url;
                                
                                if(medium == 'photo' || !this.player.height ||
                                    (options.max_media_height > 0 && this.player.height > options.max_media_height)) {
                                    // Resize the image.
                                    src = 'http://jquery-buzzbee.appspot.com/resize/' + options.max_media_height + '/' + escape(src);
                                }
                                
                                var title = this['title'] ? this.title : '';

                                $('<img />')
                                    .attr('src', src)
                                    .attr('alt', title)
                                    .attr('title', title)
                                    .appendTo(link);
                            } else if(medium == 'video') {
                                link.attr('href', this.player.url);

                                var youtube_prefix = 'http://www.youtube.com/watch?v=';
                                
                                var caption_text = this.title + ' (watch video)';
                                
                                if(this.url.indexOf(youtube_prefix) == 0) {
                                    // If this video is from YouTube, use the YouTube thumbnail.
                                    var youtube_id = this.url.replace(youtube_prefix, '');
                                    $('<img />')
                                        .attr('src', 'http://i.ytimg.com/vi/' + youtube_id + '/default.jpg')
                                        .attr('alt', caption_text)
                                        .attr('title', caption_text)
                                        .appendTo(link);
                                } else {
                                    // Otherwise just use a text link.
                                    link.text(caption_text);
                                }
                            } else if(medium == 'document') {
                                link.text(this.title);
                            }
                        }
                    });

                    var details = $('<div></div>')
                                      .addClass('details')
                                      .appendTo(entry);

                    var profile_url = this.author.uri;
                    var title = $('<a></a>')
                                    .addClass('title')
                                    .attr('href', profile_url)
                                    .appendTo(details);
                    title.html(this.title);

                    var updated = $('<span></span>')
                                        .addClass('date')
                                        .appendTo(details);
                                        
                    var prettyTime = $.fn.buzzbee.prettyDate(this.updated.replace(/\.\d+/g, ''));
                    updated.text(prettyTime).attr('title', this.updated);

                    var alternate_link = this.links.alternate;

                    var comments = this.comments;
                    var permalink = $('<a></a>')
                                        .attr('href', alternate_link)
                                        .appendTo(details);
                    permalink.text('(' + comments + ' comment' + (comments != 1 ? 's' : '') + ')');

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
            diff = (((new Date()).getTime() - date.getTime()) / 1000) + (date.getTimezoneOffset() * 60),
            day_diff = Math.floor(diff / 86400);

        if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) {
            return "";
        }

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
