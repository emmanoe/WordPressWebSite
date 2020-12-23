'use strict';
const url=self.location.href.split('?')[0],
	arr=url.split('/');
	arr.length=arr.length-3;
const min = url.indexOf('.min.',10)!==-1?'.min':'',
	params=new URL(self.location.href),
   v = params.searchParams.get('ver'),
   tv=params.searchParams.get('tv'),
   swiperV='5.3.6',
   domain=params.hostname,
   them_url=arr.join('/').trim('/')+'/',
   fw_url=them_url+'themify/',
   builder_url=fw_url+'themify-builder/',
   CACHE_PREFIX='tf-cache-',
   CACHE_KEY=CACHE_PREFIX+v+'-'+tv,
   CACHE_URL=[
	them_url+'js/themify.script'+min+'.js?ver='+tv,
	fw_url+'css/animate.min.css?ver=3.6.2',
	fw_url+'css/modules/auto_tiles'+min+'.css?ver='+v,
	fw_url+'css/modules/masonry'+min+'.css?ver='+v,
	fw_url+'css/swiper/swiper'+min+'.css?ver='+v,
	fw_url+'css/swiper/effects/fade'+min+'.css?ver='+v,
	fw_url+'js/modules/fixedheader'+min+'.js?ver='+v,
	fw_url+'js/modules/tf_wow'+min+'.js?ver='+v,
	fw_url+'js/modules/jquery.imagesloaded.min.js?ver=4.1.0',
	fw_url+'js/modules/isotop'+min+'.js?ver='+v,
	fw_url+'js/modules/autoTiles'+min+'.js?ver='+v,
	fw_url+'js/modules/themify.sidemenu'+min+'.js?ver='+v,
	fw_url+'js/themify.gallery'+min+'.js?ver='+v,
	fw_url+'js/modules/themify.carousel'+min+'.js?ver='+v,
	fw_url+'js/modules/lax'+min+'.js?ver='+v,
	fw_url+'js/modules/jquery.isotope.min.js?ver=3.0.6',
	fw_url+'js/modules/swiper/swiper.js?ver='+swiperV,
	fw_url+'js/modules/swiper/modules/autoplay.js?ver='+swiperV,
	fw_url+'js/modules/swiper/modules/thumbs.js?ver='+swiperV,
	fw_url+'js/modules/swiper/effects/fade.js?ver='+swiperV,
	builder_url+'js/themify.builder.script'+min+'.js?ver='+v,
	builder_url+'css/modules/sliders/carousel'+min+'.css?ver='+v,
	builder_url+'css/modules/sliders/gallery'+min+'.css?ver='+v,
	builder_url+'css/modules/sliders/slider'+min+'.css?ver='+v,
	builder_url+'css/modules/sliders/testimonial-slider'+min+'.css?ver='+v,
	builder_url+'js/modules/accordion'+min+'.js?ver='+v,
	builder_url+'js/modules/tab'+min+'.js?ver='+v,
	builder_url+'js/modules/menu'+min+'.js?ver='+v,
	builder_url+'js/modules/feature'+min+'.js?ver='+v,
	builder_url+'js/modules/parallax'+min+'.js?ver='+v,
	builder_url+'js/modules/fullwidthRows'+min+'.js?ver='+v,
	builder_url+'js/modules/video'+min+'.js?ver='+v
   ];
self.addEventListener('install', function(event){
	self.caches.keys().then(function(keys) {
		for(let i=keys.length-1;i>-1;--i){
			if(keys[i]!==CACHE_KEY && keys[i].indexOf(CACHE_PREFIX)===0){
				self.caches.delete(keys[i]);
			}
		}
	});
	self.skipWaiting();
	event.waitUntil(
		self.caches.open(CACHE_KEY)
		  .then(function(cache) {
			return cache.addAll(CACHE_URL);
		})
	  );
});
self.addEventListener('activate', function(event){
	self.clients.claim();
});
self.addEventListener('fetch', function(event) {
	
	if(event.request.method==='GET'){
		const type=event.request.destination,
			url= event.request.url;	
		if(type!=='script' && type!=='style' && type!=='font' && type!=='image'){
			return;
		}
		if(url.indexOf(domain)!==-1 || url.indexOf('fonts.googleapis.com')!==-1){
			event.respondWith(
				self.caches.match(event.request)
				  .then(function(response) {
					if (response) {
					  return response;
					}
					return fetch(event.request.clone()).then(
					  function(response) {
						if(response && response.status === 200 && (response.type === 'basic' || url.indexOf('fonts.googleapis.com')!==-1)){
							const responseToCache = response.clone();
							caches.open(CACHE_KEY)
							  .then(function(cache) {
								cache.put(event.request, responseToCache);
							  });
						}
						return response;
					  }
					);
				  })
			);
		}
	}
});