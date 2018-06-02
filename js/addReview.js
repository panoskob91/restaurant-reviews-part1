var firstTime = true;
/* =================================== Create and handle submition form ========================= */
const container = document.getElementById('reviews-container');
const addReviewForm = document.createElement('form');
var showItem = true;

function addReview() {

    if (firstTime) {
        addReviewForm.setAttribute('id', 'add-review-form');
        addReviewForm.setAttribute('onsubmit', 'handleSubmit()');
        addReviewForm.setAttribute('action', '');
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
    const slider = document.getElementsByName('rating-slider')[0];
    //const slider = document.getElementById('rating-slider');
    const ratingLabel = document.getElementById('rating-label');
    var sliderValue = slider.value;
    slider.oninput = function () {
        sliderValue = this.value;
        ratingLabel.innerHTML = sliderValue;
    }
}

function createFormHTML() {
    //with name tag form fields are added to the URL
    const formHTML = 'Name <br>'
        + '<input type =' + 'text' + ' name=' + 'reviewer-name' + ' id=' + 'reviewer-name' + '>' +
        '<br>'
        + 'Rating <br>'
        + '<input type=' + 'range ' + 'min=' + '1 ' + 'max=' + '10' + ' value=' + '5' + ' name=' + 'rating-slider' +
        ' step=' + '1' + '>'
        + '<p id=' + 'rating-label' + '></p>'
        + 'Comment <br>'
        + '<textarea rows=' + '10' + ' cols=' + '50' + ' name=' + 'comment-section' +  ' id =' + 'comment-section' + '></textarea>'
        + '<br>'
        + '<input type=' + ' submit' + '>';

    return formHTML;
}

function handleSubmit() {

    // const name = document.getElementById('reviewer-name');
    // const restaurantRating = document.getElementById('rating-slider');
    // const commentSection = document.getElementById('comment-section');

    validateForm();

    console.log('Correct');
}

/* ================================================================================================ */

function validateForm() {
    var name = document.forms['add-review-form']['reviewer-name'].value;
    var comment = document.forms['add-review-form']['comment-section'].value;
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
    return true;
}

function launchPopup(firstTime) {
    if (firstTime === true) {
        const popupWindow = document.createElement('div');
        popupWindow.setAttribute('class', 'modal-window');
    }
}

