var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXX-XX']); // will be replaced to "GA_TRACKING_ID" from ".conf.json" (if the file exists)
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();