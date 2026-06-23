// JavaScript Document

    // One-time cleanup: unregister legacy service workers and clear old caches
    // (handles users coming back from the previous site version).
    (function () {
        try {
            if (!localStorage.getItem('dgb_sw_reset_v2')) {
                localStorage.setItem('dgb_sw_reset_v2', '1');
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(function (regs) {
                        regs.forEach(function (r) { r.unregister(); });
                    });
                }
                if (typeof caches !== 'undefined' && caches.keys) {
                    caches.keys().then(function (keys) {
                        keys.forEach(function (k) { if (k.indexOf('dgb-v2026-05-02') !== 0) caches.delete(k); });
                    });
                }
            }
        } catch (e) { /* noop */ }
    })();

    // Bail out if we're already inside a locale subdirectory — prevents
    // infinite /en-us/en-us/... redirect loops.
    (function () {
        var LOCALES = ['af','ar','bg','cs','da','de','el','en','en-us','es','fa','fi','fil','fr','hi','hr','hu','id','it','ja','ms','nb','nl','pl','pt','pt-br','ro','ru','sl','sq','sv','sw','th','tr','vi','zh'];
        var first = location.pathname.split('/').filter(Boolean)[0];
        if (first && LOCALES.indexOf(first.toLowerCase()) !== -1) {
            // Already on a localized page; do not redirect.
            window.__dgbSkipLangRouter = true;
        }
    })();
    if (window.__dgbSkipLangRouter) { /* skip rest of router */ }
    else {

    var target = location.hash
	
    if (['#ecosystem', '#jared', '#developers', '#foundation', '#dgbat', '#wiki', '#telegram', '#socialmedia', '#digiassetservices', '#dgbcore', '#dgbmobile', '#dgbgo', '#docs', '#contribute', '#history', '#digidservices'].indexOf(target) >= 0)
    
       window.addEventListener("load", function(){
		 setTimeout(function(){
           window.scrollTo(0, $(target).offset().top -100);
		 }, 1000);
       });
		
	else if (target.length > 0)
    
       window.addEventListener("load", function(){
		 setTimeout(function(){
           window.scrollTo(0, $(target).offset().top);
		 }, 1000);
       });
		
    else
    null

	const isEnglish = (data, definitelyIsEnglish=false) => {
		//Will set any of these locale detections to en-US translation
		let c;
		if (definitelyIsEnglish) c = data.toLowerCase()
		else c = data.country.toLowerCase();

		if (c === "us" || c === "gb" || c === "ca" || c === "au" || c === "nz" || c === "in" || c === "ng") window.location.replace(`en-us/${target}`);
		if (c === "en-us" || c === "en-gb" || c === "en-ca" || c === "en-au" || c === "en-nz" || c === "en-in" || c === "en-ng") window.location.replace(`en-us/${target}`)
	}

    var langvalue = location.search.substring(1);
    var browserlang = navigator.language || navigator.userLanguage;
	var langcode5 = browserlang.substr(0,5);
	var langcode3 = browserlang.substr(0,3);
	var langcode2 = browserlang.substr(0,2);
		
	if (langvalue == "lang=en") null

	else if (langcode3 == "fil")
	window.location.replace('fil/'+target)
		
    else if (['nb', 'no', 'nn'].indexOf(langcode2) >= 0)
	window.location.replace('nb/'+target)
		
	else if (['hr', 'sr', 'bs'].indexOf(langcode2) >= 0)
	window.location.replace('hr/'+target)
		
	else if (['cs', 'sk'].indexOf(langcode2) >= 0)
	window.location.replace('cs/'+target)

	else if (langcode5.toLowerCase() == 'pt-br')
	window.location.replace('pt-br/'+target)

	else if (['af', 'da', 'de', 'es', 'fr', 'id', 'it', 'sw', 'hu', 'ms', 'nl', 'pl', 'pt', 'ro', 'sq', 'sl', 'fi', 'sv', 'vi', 'tr', 'ru', 'bg', 'el', 'hi', 'th', 'ja', 'zh', 'ar', 'fa'].indexOf(langcode2) >= 0)
			
	window.location.replace(langcode2+'/'+target)
		
	else {
	fetch('https://ipinfo.io/json?token=d0930e5241b7f2')
    .then((response) => {
    return response.json()
    })
		
	  .then((data) => {
        if (data.country == "BR")
	    window.location.replace('pt-br/'+target)
		
		else if (['KE', 'TZ', 'CD', 'RW', 'UG'].indexOf(data.country) >= 0)
	    window.location.replace('sw/'+target)
		
		else if (data.country == "VN")
	    window.location.replace('vi/'+target)
		
		else if (data.country == "MY")
	    window.location.replace('ms/'+target)
		
		else if (data.country == "ID")
	    window.location.replace('id/'+target)

		else isEnglish(data)
      })
		
      .catch((err) => {
	    if (langcode5 == "pt-BR")
	    window.location.replace('pt-br/'+target)
		
		else isEnglish(langcode5, true)
	  })
	}
    } // end else (skip router guard)