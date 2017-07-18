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
		var galleryName = '_nogroup';
		if (li.length > 0) {
			galleryName = li.attr('data-gallery');
		}
		
		var images = $(this).attr('data-images');
		if (images) {
			galleryName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
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
			$(this).attr('data-gallery', galleryName);
		} else {
			galleries[galleryName] = galleries[galleryName] || [];
			galleries[galleryName].push(item);
			
			id = galleries[galleryName].length - 1;
			$(this).attr("lightbox-index", id);
			
			if ( $(this).attr("data-size") ) {
				var size = $(this).attr("data-size").split("x");
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
	}).on('click', function(e) {
		var index = parseInt($(this).attr("lightbox-index")) || 0;
		var li = $(this).parents('li[data-gallery]');
		var id = 0;
		var galleryName = $(this).attr('data-gallery') || '_nogroup';
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
			if (diff) {
				if (!currentItems[gallery.getCurrentIndex()].elem.hasClass('cropped')) {
					currentItems[gallery.getCurrentIndex()].elem.css('opacity', 0);
				}
				var before = gallery.getCurrentIndex() - diff;
				before = before < 0 ? currentItems.length + before : before > currentItems.length - 1 ? currentItems.length - before : before;
				currentItems[before].elem.css('opacity', 1);
			}
		});
		gallery.init();
		return false;
	});
});