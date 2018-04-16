const elementsCacheName = 'restaurant-reviews-page-elements';
const dataCacheName = 'restaurant-reviews-data';
const scriptCacheName = 'Restaurant-reviews-scripts';


//Setup and populate caches
self.addEventListener('install', function(event) {
    console.log('SW installed');

    event.waitUntil(
        //Setup and populate element cache
        caches.open(elementsCacheName).then(function(cache){
            return cache.addAll([

                '/css/styles.css',
                '/index.html',
                '/restaurant.html'

            ]);
        }).catch(function(error) {
            console.log('elements cache error: ' + error);
        }),
        //Setup and populate data cache
        caches.open(dataCacheName).then(function(cache){
            return cache.addAll([

                '/img/1.jpg',
                '/img/2.jpg',
                '/img/3.jpg',
                '/img/4.jpg',
                '/img/4.jpg',
                '/img/5.jpg',
                '/img/6.jpg',
                '/img/7.jpg',
                '/img/8.jpg',
                '/img/9.jpg',
                '/img/10.jpg',
                '/data/restaurants.json'

            ]);
        }).catch(function(error) {
            console.log('data cache error: ' + error);
        }),
        //Setup and populate script cache
        caches.open(scriptCacheName).then(function(cache) {
            return cache.addAll([

                '/sw.js',
                '/js/dbhelper.js',
                '/js/main.js',
                '/js/restaurant_info.js'

            ]);
        }).catch(function(error) {
            console.log('script cache error: ' + error);
        })

    );
});

self.addEventListener('activate', function() {
    console.log('SW active');
});


self.addEventListener('fetch', function(event) {

     event.respondWith(
        caches.match(event.request).then(function(response) {

            if (response){
            //console.log('REQUEST: ', event.request);
            //console.log('RESPONSE: ', response);
                return response;
        }
        let requestClone = event.request.clone();
            return fetch(requestClone).then(function(networkResponse) {

                    return networkResponse;

            });

        }).catch(function(error) {
            console.log('Cache fetching error: ' + error);
                return caches.match('index.html');
        })

    );

});
