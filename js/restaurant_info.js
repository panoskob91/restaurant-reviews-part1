let restaurant;
var map;
var reviews = [];
//Ensure that IndexedDb will be used only if it is supported by the browser
var idbIsSupported = true;
var isFavorite;

if (!window.indexedDB) {
  idbIsSupported = false;
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then(function (res) {
    console.log('Restaurant info success: ' + res);
  }).catch(function (err) {
    console.log('Restaurants info failure: ' + err);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      // fetchRestaurantReviews();

      self.isFavorite = self.restaurant.is_favorite;
      if (self.isFavorite) {
        const favoriteButtonIcon = document.getElementById('favorite-reastaurant-indicator');
        favoriteButtonIcon.setAttribute('src', 'img/filled-star.png');
        favoriteButtonIcon.setAttribute('alt', 'favorite');
      }
      if (navigator.onLine) {
        //Post reviews stored into idb object store
        DBHelper.getAllNewReviews().then(function (array) {
          // console.log(array);
          DBHelper.clearObjectStore('new-reviews', 'new-review');
          array.forEach(function (element) {
            DBHelper.postNewReview(element).then(function (xhr) {
              // console.log(xhr);
            }).catch(function (error) {
              DBHelper.addNewReviewToIndexedDB(element);
              console.log('posting error :', error);
            });
          });
        }).catch(function (error) {
          console.log('error :', error);
        });
      }

      let restaurantReviewsPromise = fetchRestaurantReviews();
      restaurantReviewsPromise.then(function (reviews) {
        fillReviewsHTML(reviews);
      }).catch(function (error) {
        console.log(error);
      });


      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute('tabindex', '0');
  name.setAttribute('aria-label', 'restaurant name, ' + restaurant.name);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.setAttribute('tabindex', '0');
  address.setAttribute('aria-label', 'restaurant address' + restaurant.address);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = 'restaurant, ' + restaurant.name + ' image';
  image.setAttribute('tabindex', '0');
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute('tabindex', '0');
  cuisine.setAttribute('aria-label', 'restaurant cuisine, ' + restaurant.cuisine_type);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    //console.log('Day:' + key + ' Hours: ' + operatingHours[key]);

    const day = document.createElement('td');
    day.innerHTML = key;
    // day.setAttribute('tabindex', '0');
    // day.setAttribute('aria-label', 'day' + key);
    row.appendChild(day);
    row.setAttribute('tabindex', '0');

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute('aria-label', ' , hours, ' + operatingHours[key]);
    row.appendChild(time);

    hours.appendChild(row);
  }
}

function fetchAllRestaurantReviews() {

  let reviewsXHR = new XMLHttpRequest();
  let reviewsURL = DBHelper.REVIEWS_URL;
  reviewsXHR.open('GET', reviewsURL);
  var outputJSONObject = [];

  reviewsXHR.onload = function () {
    if (reviewsXHR.status === 200) {

      var reviews = JSON.parse(reviewsXHR.responseText);
      reviews.forEach(function (review) {
        let jsonObject = {
          "id": review.id,
          "restaurant_id": review.restaurant_id,
          "name": review.name,
          "rating": review.rating,
          "createdAt": review.createdAt,
          "updatedAt": review.updatedAt,
          "comments": review.comments
        };
        outputJSONObject.push(jsonObject);

      });
    }
  }
  reviewsXHR.onerror = function (error) {
    console.log('Reviews fetching error occured : ', error);
  }
  reviewsXHR.send();
  return outputJSONObject;
}


//Fetch all reviews sbmited on a restaurant
function fetchRestaurantReviews(restaurant = self.restaurant) {
  //TODO: Refactor response. Check behaviour in case of an array
  return new Promise(function (resolve, reject) {

    // let restaurantReviewsURL = getRestaurantReviewsURL();
    let restaurantReviewsURL = 'http://localhost:1337/reviews/';
    let reviewsXHR = new XMLHttpRequest();
    var restaurantReviewsArray = [];

    reviewsXHR.open('GET', restaurantReviewsURL);
    reviewsXHR.onload = function () {
      //Check if an OK response is sent from server
      if (reviewsXHR.status === 200) {
        //Store data to JSON object(s)
        let reviews = JSON.parse(reviewsXHR.responseText);
        if (reviews) {
          // if (typeof reviews === 'object') {
          // let reviewJsonObject = {
          //   "id": reviews.id,
          //   "restaurant_id": reviews.restaurant_id,
          //   "name": reviews.name,
          //   "createdAt": reviews.createdAt,
          //   "updatedAt": reviews.updatedAt,
          //   "rating": reviews.rating,
          //   "comments": reviews.comments
          // };
          reviews.forEach(function (review) {
            let reviewJSON = {
              "id": review.id,
              "restaurant_id": review.restaurant_id,
              "name": review.name,
              "createdAt": review.createdAt,
              "updatedAt": review.updatedAt,
              "rating": review.rating,
              "comments": review.comments
            };
            if (review.restaurant_id === restaurant.id) {
              // console.log(reviewJSON.name);
              restaurantReviewsArray.push(reviewJSON);
              self.reviews.push(reviewJSON);
            }

            if (self.idbIsSupported) {
              storeReviewsInIndexedDb(review);
            }
          });
          // console.log(restaurantReviewsArray);
          keepLatestObjectStoreEntries();
          // restaurantReviewsArray.push(reviewJsonObject);
          // }
          // else if (typeof reviews === 'object' &&
          //   reviews.constructor === Array)
          //   {
          //   reviews.forEach(function (review) {
          //     let reviewJSONObject = {
          //                  "id" : review.id,
          //       "restaurant_id" : review.restaurant_id,
          //                "name" : review.name,
          //           "createdAt" : review.createdAt,
          //           "updatedAt" : review.updatedAt,
          //              "rating" : review.rating,
          //            "comments" : review.comments
          //     };
          //     restaurantReviewsArray.push(reviewJSONObject);
          //   });
          // }

          resolve(restaurantReviewsArray);
        }
      }
    };
    reviewsXHR.onerror = reject;
    reviewsXHR.send();
  });
}

function storeReviewsInIndexedDb(review) {
  var openRequest = indexedDB.open('reviews', 1);
  openRequest.onupgradeneeded = function (e) {
    var db = e.target.result;
    if (!db.objectStoreNames.contains('reviews')) {
      var objectStore = db.createObjectStore('reviews', { keypath: 'name' });
      var index = objectStore.createIndex('updatedAt', 'updatedAt');
    }
  }
  openRequest.onsuccess = function (e) {
    var db = e.target.result;
    var transaction = db.transaction('reviews', 'readwrite');
    var store = transaction.objectStore('reviews');
    store.put(review, review.id);

    // transaction.oncomplete = function () {
    //   db.close();
    // };
  };


  openRequest.onerror = function (event) {
    console.log(event.target.errorCode);
  };
}

function keepLatestObjectStoreEntries() {
  var openRequest = indexedDB.open('reviews', 1);
  let limit = 3;
  let i = 0;
  let objectStoreEntriesCount = 0;

  openRequest.onsuccess = function (event) {
    let db = event.target.result;
    let transaction = db.transaction('reviews', 'readwrite');
    let store = transaction.objectStore('reviews');
    var countRequest = store.count();
    //Count the number of entries
    countRequest.onsuccess = function () {
      objectStoreEntriesCount = countRequest.result;
      limit = Math.floor(objectStoreEntriesCount / 3);
    };
    let index = store.index('updatedAt');

    // index.openCursor(null, 'prev').onsuccess = function (event) {
    index.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (objectStoreEntriesCount >= 50) {
        if (cursor && i < limit) {
          cursor.delete();
          cursor.continue();
          i += 1;
        }
      }
    }
  };
}

//get restaurant id
function getRestaurantId(restaurant = self.restaurant) {
  return restaurant.id;
}
//Get API restaurant reviews url
function getRestaurantReviewsURL(restaurant = self.restaurant) {
  const port = 1337;
  const restaurantID = getRestaurantId();
  return 'http://localhost:' + port + '/reviews/' + restaurantID;
}

let reviewsArray = fetchAllRestaurantReviews();

/**
 * Create all reviews HTML and add them to the webpage.
 */
//fillReviewsHTML = (reviews = self.restaurant.reviews) => {
// fillReviewsHTML = (reviews = reviewsArray) => {
fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  const addReviewButton = document.createElement('button');

  title.innerHTML = 'Reviews';
  title.setAttribute('tabindex', '0');
  container.appendChild(title);

  addReviewButton.setAttribute('id', 'add-reviews');
  addReviewButton.setAttribute('onclick', 'addReview()');
  addReviewButton.innerHTML = 'Add a review';

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.setAttribute('tabindex', '0');
    container.appendChild(noReviews);
    container.appendChild(addReviewButton);
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
  container.appendChild(addReviewButton);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'reviewer-name';
  name.innerHTML = review.name;
  name.setAttribute('tabindex', '0');
  name.setAttribute('aria-label', 'reviewer name, ' + review.name);
  li.appendChild(name);

  const date = document.createElement('p');
  //date.innerHTML = review.date;
  date.innerHTML = review.createdAt;
  date.className = 'review-date';
  date.setAttribute('tabindex', '0');
  // date.setAttribute('aria-label', 'review date, ' + review.date);
  date.setAttribute('aria-label', 'review-date' + review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `RATING: ${review.rating}`;
  rating.className = 'restaurant-rating';
  rating.setAttribute('tabindex', '0');
  rating.setAttribute('aria-label', 'reviewer rating, ' + review.rating);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'reviewer-comments';
  comments.setAttribute('tabindex', '0');
  comments.setAttribute('aria-label', 'reviewer comments, ' + review.comments);
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function favoriteButtonClicked() {
  const favoriteImage = document.getElementById('favorite-reastaurant-indicator');
  let restaurantID = self.restaurant.id;

  if (self.isFavorite) {
    //Set image to filled star
    favoriteImage.setAttribute('src', 'img/filled-star.png');
    favoriteImage.setAttribute('alt', 'favorite');
    self.restaurant.is_favorite = false;

    //Update dataSource favorite flag
    updateDataSource(self.isFavorite, restaurantID);
    self.isFavorite = false;
  }
  else {
    //Set image to unfilled star
    favoriteImage.setAttribute('src', 'img/empty-star.png');
    favoriteImage.setAttribute('alt', 'no favorite');
    self.restaurant.is_favorite = true;

    //Update data source favorite flag
    updateDataSource(self.isFavorite, restaurantID);
    self.isFavorite = true;
  }
}

function updateDataSource(isFavorite, restaurantID) {
  const restaurantApiEndPoint = 'http://localhost:1337/restaurants/' + restaurantID;

  let favoriteXHR = new XMLHttpRequest();
  favoriteXHR.open('POST', restaurantApiEndPoint);
  favoriteXHR.setRequestHeader('Content-Type', 'application/json');
  let postedObject = self.restaurant;
  postedObject.is_favorite = isFavorite;

  favoriteXHR.send(JSON.stringify(postedObject));
  favoriteXHR.onload = function () {
    //console.log(this.responseText);
  }
}

// //Gets all restaurants
// function fetchRestaurants() {
//   return new Promise(function(resolve, reject){
//     const url = 'http://localhost:1337/restaurants';
//     let restaurantXHR = new XMLHttpRequest();
//     let restaurants = new Array();
//     restaurantXHR.open('GET', url);
//     restaurantXHR.onload = function() {
//       if (restaurantXHR.status === 200) {
//         const restaurantsResponse = JSON.parse(restaurantXHR.responseText);
//         restaurantsResponse.forEach(function(restaurant) {
//           if (restaurant.name) {
//             restaurants.push(restaurant);
//           }
//         });
//       }
//       resolve(restaurants);
//     }
//     restaurantXHR.onerror = function(error) {
//       reject(error);
//     }
//     restaurantXHR.send();
//   });
// }
