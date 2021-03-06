/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  static get RESTAURANTS_URL() {
    const port = 1337;
    return 'http://localhost:' + port + '/restaurants';
  }

  static get REVIEWS_URL() {
    const port = 1337;
    return 'http://localhost:' + port + '/reviews/';
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    let XHR = new XMLHttpRequest();
    XHR.open('GET', DBHelper.RESTAURANTS_URL);
    XHR.onload = function () {
      if (XHR.status === 200) {
        const jsonObject = JSON.parse(XHR.responseText);
        const restaurants = jsonObject;
        //Handle IndexedDB
        var openRequest = indexedDB.open('restaurants', 1);

        openRequest.onupgradeneeded = function (e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains('restaurant')) {
            var objectStore = db.createObjectStore('restaurant', { keypath: 'name' });
            var index = objectStore.createIndex('updatedAt', 'updatedAt');
          }
        };
        openRequest.onsuccess = function (e) {
          var db = e.target.result;
          var transaction = db.transaction('restaurant', 'readwrite');
          var store = transaction.objectStore('restaurant');

          for (let i = 0; i < jsonObject.length; i++) {
            if (jsonObject[i].name) {
              store.put(jsonObject[i], jsonObject[i].name);
            }
          }
          transaction.oncomplete = function () {
            db.close();
          };

        };
        callback(null, restaurants);
      } else {
        const error = 'Request failed. Returned status of ' + XHR.status;
        callback(error, null);
      }

    };
    XHR.onerror = function (error) {
      console.log('An error occured: ', error);
    }
    XHR.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    //return ('/img/' + restaurant.id + '.jpg');
    return ('/converted-images-toJPEG/' + restaurant.id + '.jpeg');
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

  static postNewReview(postObject) {
    return new Promise(function (resolve, reject) {
      let url = 'http://localhost:1337/reviews/';
      let postReviewXHR = new XMLHttpRequest();
      postReviewXHR.open('POST', url);
      postReviewXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      postReviewXHR.send(JSON.stringify(postObject));

      postReviewXHR.onload = function () {
        // if (postReviewXHR.status === 200 || postReviewXHR.status === 201) {
        resolve(postReviewXHR);
        // }
      }

      postReviewXHR.onerror = function (e) {
        reject(e);
      }
    });

  }

  static addNewReviewToIndexedDB(postedData) {
    var openRequest = indexedDB.open('new-reviews', 1);
    openRequest.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains('new-reviews')) {
        db.createObjectStore('new-review', { keypath: 'name' });
        // var index = objectStore.createIndex('name', 'name');
      }
    }

    openRequest.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction('new-review', 'readwrite');
      let store = transaction.objectStore('new-review');
      store.put(postedData, postedData.name);
      transaction.oncomplete = function () {
        db.close();
      };
    };
  }

  static getAllNewReviews() {

    return new Promise(function (resolve, reject) {
      var openRequest = indexedDB.open('new-reviews', 1);
      var outputArray = new Array();

      openRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction('new-review', 'readwrite');
        let store = transaction.objectStore('new-review');
        let request = store.getAll();

        request.onsuccess = function (event) {
          //Get all reviews on object store
          let results = event.target.result;

          results.forEach(function (result) {
            outputArray.push(result);
          });
          resolve(outputArray);
        };

        transaction.oncomplete = function () {
          db.close();
        }
      };
      openRequest.onerror = function (error) {
        reject(error);
      };
    });
  }

  static clearObjectStore(database, objectStoreName) {
    var openRequest = indexedDB.open(database, 1);
    openRequest.onsuccess = function (event) {
      let db = event.target.result;
      let transaction = db.transaction(objectStoreName, 'readwrite');
      let store = transaction.objectStore(objectStoreName);
      store.clear();
      transaction.oncomplete = function () {
        db.close();
      }
    }
  }

}




