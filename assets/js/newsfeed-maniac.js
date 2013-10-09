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
            count: 10
        };

    function NewsFeedManiac(element, options) {
        this.element = element;
        this.$elem = $(this.element);
        this.options = $.extend({}, _defaults, options);
        this.init();
    }

    NewsFeedManiac.prototype = {
        init: function () {
            var curLoader = maniacHelpers.dataLoaders.rss //
                , reqUrl = curLoader.url //
                , $element = this.$elem //
                , options = this.options //
                , requests = [] //
                , feedItems = [] //
                ;
            _.each(options.sources, function (source) {
                reqUrl = reqUrl.replace(requestParamsPatterns.id, encodeURIComponent(source.id));
                reqUrl = reqUrl.replace(requestParamsPatterns.size, options.count);
                requests.push(maniacHelpers.doRequest(reqUrl, curLoader.dataType, feedItems));
            });

            $.when.apply($, requests).always(function () {
                _.each(feedItems, function (feedItem, idx) {
                    var newElem = $('<li></li>');
                    newElem.text(feedItem.title);
                    $element.append(newElem);
                });
            });
        }
    };

    var maniacHelpers = {
        doRequest: function (url, dataType, itemContainer) {
            return $.ajax({
                url: url,
                type: "GET",
                dataType: dataType,
                success: function (data) {
                    _.each(data.responseData.feed.entries, function (entry, idx) {
                        itemContainer.push(entry);
                    });
                },
                error: function (status) {
                    console.log(status);
                }
            });
        } //
        , dataLoaders: {
            rss: {
                url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=|count|&q=|id|" //
                , dataType: "jsonp" //
                , parser: {
                    name: "rss" //
                    , resultsSelector: "data.responseData.feed.entries" //
                    , heading: "RSS" //
                    , headingSelector: "data.responseData.feed.title" //
                    , txtSelector: "item.title" //
                    , dateSelector: "item.publishedDate.substring(0,17)" //
                    , imgSrc: null //
                    , imgSrcSelector: "$(item.content).find(\"img:lt(1)\").attr('src')" //
                    , imgSrcProcessor: null //
                    , imgHref: "" //
                    , imgHrefSelector: "$(item.content).find(\"img:lt(1)\").parent().attr('href')||$(item.content).find(\"a:lt(1)\").attr('href')" //
                    , imgAltSelector: "item.contentSnippet" //
                    , link: "" //
                    , linkSelector: null //
                    , linkTipSelector: "item.contentSnippet" //
                    , preProcessor: null //
                    , preCondition: "$(item.content).find(\"img[src]:contains('http')\")" //
                }
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