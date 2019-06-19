$(document).ready( function() {
	var htmlElement = "<!-- Root element of PhotoSwipe. Must have class pswp. -->\r\n<div class=\"pswp\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\r\n\r\n    <!-- Background of PhotoSwipe. \r\n         It\'s a separate element, as animating opacity is faster than rgba(). -->\r\n    <div class=\"pswp__bg\"><\/div>\r\n\r\n    <!-- Slides wrapper with overflow:hidden. -->\r\n    <div class=\"pswp__scroll-wrap\">\r\n\r\n        <!-- Container that holds slides. PhotoSwipe keeps only 3 slides in DOM to save memory. -->\r\n        <!-- don\'t modify these 3 pswp__item elements, data is added later on. -->\r\n        <div class=\"pswp__container\">\r\n            <div class=\"pswp__item\"><\/div>\r\n            <div class=\"pswp__item\"><\/div>\r\n            <div class=\"pswp__item\"><\/div>\r\n        <\/div>\r\n\r\n        <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->\r\n        <div class=\"pswp__ui pswp__ui--hidden\">\r\n\r\n            <div class=\"pswp__top-bar\">\r\n\r\n                <!--  Controls are self-explanatory. Order can be changed. -->\r\n\r\n                <div class=\"pswp__counter\"><\/div>\r\n\r\n                <button class=\"pswp__button pswp__button--close\" title=\"Close (Esc)\"><\/button>\r\n\r\n                <button class=\"pswp__button pswp__button--share\" title=\"Share\"><\/button>\r\n\r\n                <button class=\"pswp__button pswp__button--fs\" title=\"Toggle fullscreen\"><\/button>\r\n\r\n                <button class=\"pswp__button pswp__button--zoom\" title=\"Zoom in\/out\"><\/button>\r\n\r\n                <!-- Preloader demo http:\/\/codepen.io\/dimsemenov\/pen\/yyBWoR -->\r\n                <!-- element will get class pswp__preloader--active when preloader is running -->\r\n                <div class=\"pswp__preloader\">\r\n                    <div class=\"pswp__preloader__icn\">\r\n                      <div class=\"pswp__preloader__cut\">\r\n                        <div class=\"pswp__preloader__donut\"><\/div>\r\n                      <\/div>\r\n                    <\/div>\r\n                <\/div>\r\n            <\/div>\r\n\r\n            <div class=\"pswp__share-modal pswp__share-modal--hidden pswp__single-tap\">\r\n                <div class=\"pswp__share-tooltip\"><\/div> \r\n            <\/div>\r\n\r\n            <button class=\"pswp__button pswp__button--arrow--left\" title=\"Previous (arrow left)\">\r\n            <\/button>\r\n\r\n            <button class=\"pswp__button pswp__button--arrow--right\" title=\"Next (arrow right)\">\r\n            <\/button>\r\n\r\n            <div class=\"pswp__caption\">\r\n                <div class=\"pswp__caption__center\"><\/div>\r\n            <\/div>\r\n\r\n          <\/div>\r\n\r\n        <\/div>\r\n\r\n<\/div>";
	$("body").append(htmlElement);
	
	var pswpElement = $(".pswp").get(0);
	var currentItems = [];
	var galleries = {};
	var options = {
		bgOpacity: 0.9,
		history: false,
		getThumbBoundsFn: function(index) {
			var img = currentItems[index].elem;

			var o = img.offset();
			if(img.hasClass('cropped')){
				return {
					x: o.left + img.width() * 0.5,
					y: o.top + img.height() * 0.5,
					w: 1
				};
			} else {
				return {
					x: o.left,
					y: o.top,
					w: img.width()
				};
			}
		},
		shareButtons: [
			{id:'facebook', label:'Share on Facebook', url:'https://www.facebook.com/sharer/sharer.php?u={{url}}'},
			{id:'twitter', label:'Tweet', url:'https://twitter.com/intent/tweet?text={{text}}&url={{url}}'},
			{id:'pinterest', label:'Pin it', url:'http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}'},
		]
	};

	var imgSplit = window.location.href.split('/image:');
	var requestedImage = imgSplit.length > 1 ? imgSplit[1] : null;

	$("a[rel='lightbox']").each( function() {
		var elem = $(this).find("img");
		elem = elem.length ? elem : $(this);
		var item = {
			elem: elem,
			src: $(this).attr("href"),
			title: elem.attr("alt") || elem.attr("title")
		};

		var li = $(this).parents('li[data-gallery]');
		var id = 0;
		var galleryName = '_nogroup-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		if (li.length > 0) {
			galleryName = li.attr('data-gallery');
		}
		
		var images = $(this).attr('data-images');
		if (images) {
			galleries[galleryName] = images.split(':').slice(0, -1).map(function(src, index) {
				var img = new Image();
				img.src = src;
				img.onload = function() {
					galleries[galleryName][index].w = img.naturalWidth;
					galleries[galleryName][index].h = img.naturalHeight;
				}
				
				return {
					w: 0,
					h: 0,
					src: src,
					elem: elem
				}
			});
		} else {
			galleries[galleryName] = galleries[galleryName] || [];
			galleries[galleryName].push(item);
			
			id = galleries[galleryName].length - 1;
			$(this).attr("lightbox-index", id);
			
			var size = $(this).attr("data-size") || li.attr("data-size");
			if ( size ) {
				size = size.split("x");
				item.w = parseInt(size[0]);
				item.h = parseInt(size[1]);
			} else {
				// get size asynchronously and add it later to the items array
				var img = new Image();
				img.src = item.src;
				img.onload = function() {
					galleries[galleryName][id].w = img.naturalWidth;
					galleries[galleryName][id].h = img.naturalHeight;
				}
			}
		}
		$(this).attr('data-gallery', galleryName);
		
		if (requestedImage && requestedImage === md5(item.src.split('/').slice(-1)[0])) {
			$this = $(this);
			setTimeout(function() {
				$this.trigger('click');
			}, 33);
		}
	}).on('click', function(e) {
		var index = parseInt($(this).attr("lightbox-index")) || 0;
		var li = $(this).parents('li[data-gallery]');
		var id = 0;
		var galleryName = $(this).attr('data-gallery') || '_nogroup';
		var href = window.location.href.split('/').filter(function(p) {
			return !~p.indexOf('image:')
		});
		if (li.length > 0) {
			galleryName = li.attr('data-gallery');
		}
		currentItems = galleries[galleryName];
		var my_options = Object.assign({}, options, {
			index: index
		});
		if (!currentItems[index].elem.hasClass('cropped')) {
			currentItems[index].elem.css('opacity', 0);
		}

		var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, currentItems, my_options);
		gallery.listen('destroy', function() { 
			currentItems[gallery.getCurrentIndex()].elem.css('opacity', 1);
		});
		gallery.listen('beforeChange', function(diff) {
			if(!expected) {
				cancelled = true;
				clearTimeout(slideTimeout);
			}
			expected = false;
			if (diff) {
				if (!currentItems[gallery.getCurrentIndex()].elem.hasClass('cropped')) {
					currentItems[gallery.getCurrentIndex()].elem.css('opacity', 0);
				}
				var before = gallery.getCurrentIndex() - diff;
				before = before < 0 ? currentItems.length + before : before > currentItems.length - 1 ? currentItems.length - before : before;
				currentItems[before].elem.css('opacity', 1);
			}
		});
		gallery.listen('afterChange', function(diff) {
			var nHref = href.concat();
			nHref.push('image:' + md5(gallery.currItem.src.split('/').slice(-1)[0]))
			window.history.replaceState({}, document.title, nHref.join('/'));
			if(!gallery.currItem || !gallery.currItem.loaded){
				clearTimeout(slideTimeout);
			} else {
				waitAndSlide();
			}
		});
		gallery.listen('close', function() {
			window.history.replaceState({}, document.title, href.join('/'));
			clearTimeout(slideTimeout);
		});
		gallery.listen('imageLoadComplete', function() {
			waitAndSlide();
		});
		gallery.init();
		
		gallery.framework.bind( gallery.scrollWrap, 'pswpTap', function(e) {
			clearTimeout(slideTimeout);
		});

		
		var slideTimeout;
		var cancelled = false;
		var expected = false;
		function waitAndSlide() {
			clearTimeout(slideTimeout);
			if(cancelled) return;
			slideTimeout = setTimeout(function() {
				expected = true;
				gallery.next();
			}, 5000);
		}
		
		waitAndSlide();
		
		return false;
	});
});

//powered by https://stackoverflow.com/questions/14733374/how-to-generate-md5-file-hash-on-javascript
var md5 = function(d){result = M(V(Y(X(d),8*d.length)));return result.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}