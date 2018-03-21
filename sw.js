const elementsCacheName = 'Restaurant Reviews page elements';
const dataCacheName = 'Restaurant Reviews Data';
const scriptCacheName = 'Restaurant Reviews scripts';


//Setup and populate caches
self.addEventListener('install', function(event) {
    console.log('I am installed');

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
    console.log('I am active');
});


self.addEventListener('fetch', function(event) {
    console.log('fetch');
    console.log(event.request);
     event.respondWith(
        caches.match(event.request).then(function(response) {
        let requestClone = event.request.clone();
            if (response){
            //return response || fetch(event.request);
            return response;
        }
            return fetch(event.request);

        }).catch(function(error) {
            console.log('Fetching error occured ' + error);
        })

    );

});
