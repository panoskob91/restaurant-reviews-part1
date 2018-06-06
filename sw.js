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

                // '/img/1.jpg',
                // '/img/2.jpg',
                // '/img/3.jpg',
                // '/img/4.jpg',
                // '/img/4.jpg',
                // '/img/5.jpg',
                // '/img/6.jpg',
                // '/img/7.jpg',
                // '/img/8.jpg',
                // '/img/9.jpg',
                // '/img/10.jpg',
                // '/data/restaurants.json'

                '/converted-images-toJPEG/1.jpeg',
                '/converted-images-toJPEG/2.jpeg',
                '/converted-images-toJPEG/3.jpeg',
                '/converted-images-toJPEG/4.jpeg',
                '/converted-images-toJPEG/4.jpeg',
                '/converted-images-toJPEG/5.jpeg',
                '/converted-images-toJPEG/6.jpeg',
                '/converted-images-toJPEG/7.jpeg',
                '/converted-images-toJPEG/8.jpeg',
                '/converted-images-toJPEG/9.jpeg',
                '/converted-images-toJPEG/10.jpeg',
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
                '/js/restaurant_info.js',
                '/js/idbManagement.js'

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
        //Firstly look for responses on cache
        caches.match(event.request).then(function(response) {
            //If response exists in cache, get if from there
            if (response){
                return response;
            }
            //Else reach out to network
        let requestClone = event.request.clone();
            return fetch(requestClone).then(function(networkResponse) {
                return networkResponse;
            });
        //If fetch event fails (or no connection) get cached data
        }).catch(function(error) {
            console.log('Cache fetching error: ' + error);
                return caches.match('index.html').then(function(){
                    readRestaurantsFromIDB();
                    readReviewsFromIDB();
                });

        })

    );

});
//Function used to read data from indexed DB
function readRestaurantsFromIDB() {
    var request = indexedDB.open('restaurants');
    request.onsuccess = function(e){
        var db = e.target.result;
        var transaction = db.transaction(['restaurant'], 'readonly');
        var store = transaction.objectStore('restaurant');
        return store.getAll();
    }
  }

function readReviewsFromIDB() {
    var request = indexedDB.open('reviews');
    request.onsuccess = function(e){
        var db = e.target.result;
        var transaction = db.transaction(['reviews'], 'readonly');
        var store = transaction.objectStore('reviews');
        return store.getAll();
    }
}
