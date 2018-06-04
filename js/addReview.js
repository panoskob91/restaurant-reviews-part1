var firstTime = true;
/* =================================== Create and handle submition form ========================= */
const container = document.getElementById('reviews-container');
const addReviewForm = document.createElement('form');
addReviewForm.addEventListener('submit', handleSubmit);
var showItem = true;

function addReview() {

    if (firstTime) {
        addReviewForm.setAttribute('id', 'add-review-form');
        //addReviewForm.setAttribute('action', 'http://localhost:1337/reviews');
        //let restaurantURL = '/restaurant.html?id=' + restaurantId;
        // addReviewForm.setAttribute('action', restaurantURL);
        //addReviewForm.setAttribute('method', 'post');
        addReviewForm.setAttribute('display', 'block');
        addReviewForm.innerHTML = createFormHTML();
        container.appendChild(addReviewForm);

        console.log(addReviewForm);

        getSliderValue();

        firstTime = false;
        showItem = false;
    }
    else
    {
        if (showItem)
        {
            addReviewForm.removeAttribute('class', 'form-hidden');
            showItem = false;
        }
        else
        {
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
        + '<fieldset>'

        + '<label>Name'
        + '<input type =' + 'text' + ' id=' + 'reviewer-name' + ' name=' + 'reviewer-name' + ' required' +'>'
        + '</label>'

        + '<br>'
        + '<label>Rating'
        + '<input type=' + 'range ' + 'min=' + '1 ' + 'max=' + '10' + ' value=' + '5' + ' id='
        + 'rating-slider' + ' name=' + ' rating-slider' + ' step=' + '1' + ' required' + '>'
        + '<p id=' + 'rating-label' + '></p>'
        + '</label>'

        + '<label>Comment'
        + '<br>'
        + '<textarea rows=' + '10' + ' cols=' + '50' + ' id=' + 'comment-section' +  ' name=' + 'comment-section' + ' required' + '></textarea>'
        + '</label>'

        + '<br>'
        + '<input type=' + ' submit' + ' value=' + ' Submit' + '>'

        + '</fieldset>';



    return formHTML;
}

function handleSubmit(e) {
    e.preventDefault();
    const addReviewForm = document.getElementById('add-review-form');
    const name = document.getElementById('reviewer-name');
    const restaurantRating = document.getElementById('rating-slider');
    const ratingLabel = document.getElementById('rating-label');
    const commentSection = document.getElementById('comment-section');

    console.log(ratingLabel);

    let restaurantId = getRestaurantID();
    let reviewerName = name.value;
    let rating = restaurantRating.value;
    let restaurantComments = commentSection.value;

    let postedData = {};
    postedData.restaurant_id = restaurantId;
    postedData.name = reviewerName;
    postedData.rating = rating;
    postedData.comments = restaurantComments;
    let jsonData = JSON.stringify(postedData);

    let url = 'http://localhost:1337/reviews/';
    let postReviewXHR = new XMLHttpRequest();
    postReviewXHR.setRequestHeader('Content-type','application/json; charset=utf-8');

    /*
    postReviewXHR.open('POST', url);
    postReviewXHR.onload = function() {
        //Needs to provide following parameters
        // {
        //     "restaurant_id": <restaurant_id>,
        //     "name": <reviewer_name>,
        //     "rating": <rating>,
        //     "comments": <comment_text>
        // }
    }

    postReviewXHR.send();
    */
    console.log('Correct');
}

/* ================================================================================================ */

//Validates input form
//TODO: Consider Removing this function
function validateForm() {
    var name = document.forms['add-review-form']['reviewer-name'].value;
    var comment = document.forms['add-review-form']['comment-section'].value;
    var ratingSlider = document.forms['add-review-form']['rating-label'].value;
    if (name === "")
    {
        alert('Name must be filled out');
        return false;
    }
    if (comment === '')
    {
        alert('Comment must be filled out');
        return false;
    }
    if (ratingSlider == '')
    {
        alert('Rating must be filled out');
        return false;
    }
    return true;
}

//Extracts restaurant id from restaurant object
function getRestaurantID()
{
    let restaurant = self.restaurant;
    return restaurant.id;
}