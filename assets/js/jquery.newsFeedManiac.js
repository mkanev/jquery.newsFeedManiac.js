/**
 * Created with JetBrains WebStorm.
 * User: Maksim.Kanev
 * Date: 09.10.13
 * Time: 15:23
 */
(function ($) {
    var activationCmd = 'activateManiac' //
        , requestParamsPatterns = {
            id: '|id|' //
            , size: '|count|' //
        } //
        , _defaults = {
            count: 10 //
            , headingLength: 51 //
            , textLength: 160 //
            , showShortDescription: true //
            , showThumbnail: true //
        };

    function NewsFeedManiac(element, options) {
        this.element = element;
        this.$elem = $(this.element);
        this.options = $.extend({}, _defaults, options);
        this.init();
    }

    NewsFeedManiac.prototype = {
        init: function () {
            var $element = this.$elem //
                , options = this.options //
                , requests = [] //
                , itemObjects = [] //
                ;
            $element.css('list-style', 'none');
            $.each(options.channels, function () {
                var channel = this;
                channel.collect = function (newItem) {
                    itemObjects.push(newItem)
                };
                var curLoader = maniacHelpers.dataLoaders[channel.type] //
                    , requestUrl = curLoader.url //
                    ;
                requestUrl = requestUrl.replace(requestParamsPatterns.id, encodeURIComponent(channel.id));
                requestUrl = requestUrl.replace(requestParamsPatterns.size, options.count);
                requests.push(maniacHelpers.doRequest(channel, requestUrl, curLoader, options));
            });

            $.when.apply($, requests).always(function () {
                $.each(itemObjects, function () {
                    $element.append(maniacHelpers.buildHtml(this, options));
                });
            });
        }
    };

    var maniacHelpers = {
        doRequest: function (channel, url, dataLoader, options) {
            return $.ajax({
                url: url //
                , type: "GET" //
                , dataType: dataLoader.dataType //
                , success: function (data) {
                    maniacHelpers[dataLoader.parseMethod](channel, data, options);
                } //
                , error: function (status) {
                    console.log(status);
                }
            });
        } //
        , parseRss: function (channel, data, options) {
            var rssFeed = data.responseData.feed;
            $.each(rssFeed.entries, function () {
                var entry = this //
                    , heading = maniacHelpers.shorten(maniacHelpers.stripHtml(entry.title), options.headingLength) //
                    , content = maniacHelpers.shorten(maniacHelpers.stripHtml(entry.content), options.textLength) //
                    , imgSrc = $(entry.content).find('img:lt(1)').attr('src') //
                    , imgHref = $(entry.content).find('img:lt(1)').parent().attr('href') || entry.link || $(entry.content).find('a:lt(1)').attr('href') //
                    , imgAlt = entry.contentSnippet //
                    , linkHref = '#' //
                    , pubDate = entry.publishedDate //
                    ;
                channel.collect(maniacHelpers.buildItemObj(channel.type, heading, content, imgSrc, imgHref, imgAlt, linkHref, pubDate));
            });
        } //
        , buildItemObj: function (channelType, heading, content, imgSrc, imgHref, imgAlt, linkHref, pubDate) {
            return {
                type: channelType //
                , heading: heading //
                , content: content //
                , image: {"src": (imgSrc ? imgSrc : 'http://placehold.it/80x80&amp;text=[no image]'), "href": imgHref, "alt": imgAlt} //
                , link: {"href": linkHref, "alt": imgAlt} //
                , pubDate: pubDate //
            };
        } //
        , buildHtml: function (itemObj, options) {
            var container = $('<li class=\"row\"></li>') //
                , thumbDiv = $('<div class=\"small-3 large-2 columns\">' +
                    '<a href=\"' + itemObj.image.href + '\" target=\"_blank\" class=\"th radius\">' +
                    '<img src=\"' + itemObj.image.src + '\" alt=\"' + itemObj.image.alt + '\" width=\"100%\"/>' +
                    '</a>' +
                    '</div>'
                ) //
                , contentDiv = $('<div class=\"' + (options.showThumbnail ? 'small-9 large-10' : 'small-12 large-12') + ' columns\">' + //
                    '<p class=\"lead\"><a href=\"' + itemObj.image.href + '\" target=\"_blank\">' + itemObj.heading + '</a></p>' +
                    (options.showShortDescription ? '<p>' + itemObj.content + '</p>' : '') +
                    '</div>'
                ) //
                ;
            if (options.showThumbnail) {
                container.append(thumbDiv);
            }
            container.append(contentDiv);
            return container;
        } //
        , fixCase: function (string) {
            if (string === null)
                return null;

            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        } //
        , shorten: function (string, length) {
            if (typeof string === "undefined" || string === null)
                return null;

            if (string.length > length)
                return string.substring(0, Math.max(0, length - 3)) + "...";
            else
                return string;
        } //
        , stripHtml: function (w) {
            if (typeof w === "undefined" || w === null)
                return null;

            return w.replace(/(<([^>]+)>)|nbsp;|\s{2,}|/ig, "");

        } //
        , dataLoaders: {
            rss: {
                url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + requestParamsPatterns.size + '&q=' + requestParamsPatterns.id //
                , heading: 'RSS' //
                , dataType: 'jsonp' //
                , parseMethod: 'parseRss'
            }
        }
    };

    $.fn[activationCmd] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + activationCmd)) {
                $.data(this, "plugin_" + activationCmd, new NewsFeedManiac(this, options));
            }
        });
    };

})(jQuery);