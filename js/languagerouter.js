// JavaScript Document

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