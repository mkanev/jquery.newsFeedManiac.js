$(document).ready(function ($) {
    $('#feedHolder').activateManiac({
        channels: [
            {type: 'rss', id: 'http://feeds.feedburner.com/good/lbvp'}
        ] //
        , count: 30 //
    });
});