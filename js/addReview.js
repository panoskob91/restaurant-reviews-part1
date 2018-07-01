var firstTime = true;

/* =================================== Create and handle submition form ========================= */
const container = document.getElementById('reviews-container');
const addReviewForm = document.createElement('form');
addReviewForm.addEventListener('submit', handleSubmit);
var showItem = true;

function addReview() {

    if (firstTime) {
        addReviewForm.setAttribute('id', 'add-review-form');
        addReviewForm.setAttribute('display', 'block');
        addReviewForm.innerHTML = createFormHTML();
        container.appendChild(addReviewForm);

        getSliderValue();

        firstTime = false;
        showItem = false;
    }
    else {
        if (showItem) {
            addReviewForm.removeAttribute('class', 'form-hidden');
            showItem = false;
        }
        else {
            addReviewForm.setAttribute('class', 'form-hidden');
            showItem = true;
        }
    }
}

function getSliderValue() {
    //const slider = document.getElementsByName('rating-slider')[0];
    const slider = document.getElementById('rating-slider');
    const ratingLabel = document.getElementById('rating-label');
    var sliderValue = slider.value;
    ratingLabel.innerHTML = sliderValue;
    slider.oninput = function () {
        sliderValue = this.value;
        ratingLabel.innerHTML = sliderValue;
    }
    return sliderValue;
}

function createFormHTML() {
    //with name tag form fields are added to the URL
    const formHTML =
        '<br>'
        + '<fieldset id="submit-review">'

        + '<label>Name'
        + '<input type =' + 'text' + ' id=' + 'reviewer-name' + ' name=' + 'reviewer-name' + ' required' + '>'
        + '</label>'

        + '<br>'
        + '<label>Rating'
        + '<input type=' + 'range ' + 'min=' + '1 ' + 'max=' + '10' + ' value=' + '5' + ' id='
        + 'rating-slider' + ' name=' + ' rating-slider' + ' step=' + '1' + ' required' + '>'
        + '<p id=' + 'rating-label' + '></p>'
        + '</label>'

        + '<label>Comment'
        + '<br>'
        + '<textarea rows=' + '10' + ' cols=' + '50' + ' id=' + 'comment-section' + ' name=' + 'comment-section' + ' required' + '></textarea>'
        + '</label>'

        + '<br>'
        + '<input type=' + ' submit' + ' value=' + ' Submit' + '>'

        + '</fieldset>';



    return formHTML;
}

function handleSubmit(e) {
    e.preventDefault();
    var isOnline = navigator.onLine; //Check if user is online
    let proceedToPost = true;
    const addReviewForm = document.getElementById('add-review-form');
    const name = document.getElementById('reviewer-name');
    const restaurantRating = document.getElementById('rating-slider');
    const ratingLabel = document.getElementById('rating-label');
    const commentSection = document.getElementById('comment-section');

    // let restaurantId = getRestaurantID();
    let restaurantId = self.restaurant.id;
    let reviewerName = name.value;
    let rating = restaurantRating.value;
    // .value returns string. We need to use the integer so we take the integer
    //and assign it to the rating variable
    rating = parseInt(rating);
    let restaurantComments = commentSection.value;

    let postedData = {};
    postedData.restaurant_id = restaurantId;
    postedData.name = reviewerName;
    postedData.rating = rating;
    postedData.comments = restaurantComments;

    isOnline = navigator.onLine;
    if (!isOnline) {
         DBHelper.addNewReviewToIndexedDB(postedData);
    }

    let jsonData = JSON.stringify(postedData);
    let restaurantReviews = self.reviews;
    //Check if entry exists, in order to avoid duplicate entries
    restaurantReviews.forEach(function(review) {

        if (review.comments === postedData.comments &&
            review.name === postedData.name &&
            review.rating === postedData.rating &&
            review.restaurant_id === postedData.restaurant_id)
        {
                window.alert("Review already exists. \n Please add another review");
                proceedToPost = false;
        }
    });
    //Boolean proccedToPost is used to avoid adding duplicate data
    if (proceedToPost)
    {
        //Post new review
         DBHelper.postNewReview(postedData).then(function(xhr) {
            console.log(xhr);
        })
        //Handle error
        .catch(function(error) {
            let allReviewsPromise = getAllNewReviews();
        allReviewsPromise.then(function(newReviews){
            //Clear object store
            var openRequest = indexedDB.open('new-reviews', 1);
            openRequest.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction('new-review', 'readwrite');
                let store = transaction.objectStore('new-review');
                store.clear();
                transaction.oncomplete = function() {
                    db.close();
                }
            }
            //Post reviews stored on objectstore
            newReviews.forEach(function(newReview) {
                    //POST
                    let postIDBDataPromise =  DBHelper.postNewReview(newReview);
                    postIDBDataPromise.then(function() {

                    }).catch(function(error) {
                        DBHelper.addNewReviewToIndexedDB(newReview);
                        console.log('Posting error', error);
                    });
            });
        }).catch(function(error) {
            console.log(error);
        });
            console.log('Post error', error);
        });
    }
}

// function postNewReview(postObject) {
//     return new Promise(function(resolve, reject) {
//         let url = 'http://localhost:1337/reviews/';
//         let postReviewXHR = new XMLHttpRequest();
//         postReviewXHR.open('POST', url);
//         postReviewXHR.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
//         postReviewXHR.send(JSON.stringify(postObject));

//         postReviewXHR.onload = function() {
//             // if (postReviewXHR.status === 200 || postReviewXHR.status === 201) {
//                 resolve(postReviewXHR);
//             // }
//         }

//         postReviewXHR.onerror = function(e) {
//             reject(e);
//         }
//     });

// }

// function addNewReviewToIndexedDB(postedData) {
//     var openRequest = indexedDB.open('new-reviews', 1);
//     openRequest.onupgradeneeded = function(e){
//         var db = e.target.result;
//         if(!db.objectStoreNames.contains('new-reviews')){
//             db.createObjectStore('new-review', {keypath : 'name'});
//             var index = objectStore.createIndex('name', 'name');
//         }
//     }

//     openRequest.onsuccess = function(event) {
//         let db = event.target.result;
//         let transaction = db.transaction('new-review', 'readwrite');
//         let store = transaction.objectStore('new-review');
//         store.put(postedData, postedData.name);
//         transaction.oncomplete = function() {
//             db.close();
//         }
//     }
// }

function getAllNewReviews() {

    return new Promise(function(resolve, reject) {
        var openRequest = indexedDB.open('new-reviews', 1);
        var outputArray = new Array();

        openRequest.onsuccess = function(event) {
            let db = event.target.result;
            let transaction = db.transaction('new-review', 'readwrite');
            let store = transaction.objectStore('new-review');
            let request = store.getAll();

            request.onsuccess = function(event) {
                //Get all reviews on object store
                let results = event.target.result;

                results.forEach(function(result) {
                    outputArray.push(result);
                });
                resolve(outputArray);
            };

                transaction.oncomplete = function() {
                    db.close();
                }
        };
        openRequest.onerror = function(error) {
            reject(error);
        };
    });
}
