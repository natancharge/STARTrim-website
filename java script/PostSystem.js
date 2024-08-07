var comments = [];
var likes = [];
var activeForm = '';

function toggleContentOptions() {
    var contentOptions = document.getElementById('content-options');
    if (contentOptions.style.display === 'none' || contentOptions.style.display === '') {
        contentOptions.style.display = 'block';
    } else {
        contentOptions.style.display = 'none';
    }
}

function addPost() {
    var postForm = document.getElementById('post-form');
    var eventForm = document.getElementById('event-form');
    var STARTCAFEForm = document.getElementById('STARTCAFE-form');
    var postList = document.querySelector('.posts');

    if (postForm.style.display === 'block') {
        postForm.style.display = 'none';
        activeForm = '';
    } else {
        postForm.style.display = 'block';
        eventForm.style.display = 'none';
        STARTCAFEForm.style.display = 'none';
        postList.style.display = 'block';
        activeForm = 'post-form';
    }
}

function addEvent() {
    var postForm = document.getElementById('post-form');
    var eventForm = document.getElementById('event-form');
    var STARTCAFEForm = document.getElementById('STARTCAFE-form');
    var eventList = document.querySelector('.events');

    if (eventForm.style.display === 'block') {
        eventForm.style.display = 'none';
        activeForm = '';
    } else {
        eventForm.style.display = 'block';
        postForm.style.display = 'none';
        STARTCAFEForm.style.display = 'none';
        eventList.style.display = 'block';
        activeForm = 'event-form';
    }
}

function addSTARTCAFE() {
    var postForm = document.getElementById('post-form');
    var eventForm = document.getElementById('event-form');
    var STARTCAFEForm = document.getElementById('STARTCAFE-form');
    var STARTCAFEList = document.querySelector('.STARTCAFE');

    if (STARTCAFEForm.style.display === 'block') {
        STARTCAFEForm.style.display = 'none';
        activeForm = '';
    } else {
        STARTCAFEForm.style.display = 'block';
        postForm.style.display = 'none';
        eventForm.style.display = 'none';
        STARTCAFEList.style.display = 'block';
        activeForm = 'STARTCAFE-form';
    }
}

function openWindow(windowId) {
    var windows = ['post-form', 'event-form', 'STARTCAFE-form'];
    windows.forEach(function(id) {
        var windowElement = document.getElementById(id);
        if (id === windowId) {
            windowElement.style.display = 'block';
            activeForm = windowId;
        } else {
            windowElement.style.display = 'none';
        }
    });
}

document.getElementById('new-post-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var title = document.getElementById('post-title').value;
    var content = document.getElementById('post-content').value;
    var image = document.getElementById('post-image').files[0];
    var video = document.getElementById('post-video').value;

    var list = document.getElementById('post-list');

    var newElement = document.createElement('div');
    newElement.className = 'post';

    var innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <div class="post-actions">
            <button onclick="toggleComments(this)">Comments</button>
            <button onclick="likePost(this)">👍</button>
            <button onclick="addComment(this)">Add Comment</button>
        </div>
        <div class="comments-section" style="display:none;"></div>
    `;

    newElement.innerHTML = innerHTML;

    if (image) {
        var imageElement = document.createElement('img');
        imageElement.src = URL.createObjectURL(image);
        newElement.appendChild(imageElement);
    }

    if (video) {
        var videoElement = document.createElement('iframe');
        videoElement.src = video;
        newElement.appendChild(videoElement);
    }

    list.appendChild(newElement);
    document.getElementById('post-form').style.display = 'none';

    checkNewPostForWhatsApp();
});

document.getElementById('new-event-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var title = document.getElementById('event-title').value;
    var content = document.getElementById('event-content').value;
    var date = document.getElementById('event-date').value;
    var arrivalTime = document.getElementById('event-arrival-time').value;
    var endTime = document.getElementById('event-end-time').value;
    var image = document.getElementById('event-image').files[0];
    var location = document.getElementById('event-location').value;

    var eventList = document.getElementById('event-list');
    var newEventElement = document.createElement('div');
    newEventElement.className = 'event';

    newEventElement.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        <p>Date: ${date}</p>
        <p>Arrival Time: ${arrivalTime}</p>
        <p>End Time: ${endTime}</p>
        <p>Location: ${location}</p>
        <div class="post-actions">
            <button onclick="toggleComments(this)">Comments</button>
            <button onclick="likePost(this)">👍</button>
            <button onclick="addComment(this)">Add Comment</button>
        </div>
        <div class="comments-section" style="display:none;"></div>
    `;

    if (image) {
        var imageElement = document.createElement('img');
        imageElement.src = URL.createObjectURL(image);
        newEventElement.appendChild(imageElement);
    }

    eventList.appendChild(newEventElement);
    document.getElementById('event-form').style.display = 'none';
});

function checkNewPostForWhatsApp() {
    fetch('/send_new_post', {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        send_whatsapp_message(data);
    })
}

function toggleComments(button) {
    var post = button.parentNode.parentNode;
    var commentsSection = post.querySelector('.comments-section');
    if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
        commentsSection.style.display = 'block';
        var index = Array.prototype.indexOf.call(post.parentNode.children, post);
        var commentsHTML = '';
        if (comments[index]) {
            comments[index].forEach(function(comment, commentIndex) {
                commentsHTML += `<div class="comment">${comment}<div class="comment-actions"><button onclick="likeComment(this, ${index}, ${commentIndex})">Like</button></div></div>`;
            });
        }
        commentsSection.innerHTML = commentsHTML;
    } else {
        commentsSection.style.display = 'none';
    }
}

function likePost(button) {
    var post = button.parentNode.parentNode;
    var index = Array.prototype.indexOf.call(post.parentNode.children, post);
    if (likes[index] === undefined) {
        likes[index] = 0;
    }
    if (!button.classList.contains('liked')) {
        likes[index]++;
        button.innerText = `👍 (${likes[index]})`;
        button.classList.add('liked');
    } else {
        likes[index]--;
        button.innerText = `👍 (${likes[index]})`;
        button.classList.remove('liked');
    }
}

function addComment(button) {
    var post = button.parentNode.parentNode;
    var index = Array.prototype.indexOf.call(post.parentNode.children, post);
    var comment = prompt("Enter your comment:");
    if (comment !== null) {
        if (comments[index] === undefined) {
            comments[index] = [];
        }
        comments[index].push(comment);
        var commentsSection = post.querySelector('.comments-section');
        commentsSection.style.display = 'block';
        var commentHTML = `<div class="comment">${comment}<div class="comment-actions"><button onclick="likeComment(this, ${index}, ${comments[index].length - 1})">Like</button></div></div>`;
        commentsSection.insertAdjacentHTML('beforeend', commentHTML);
        alert("Comment added successfully!");
    }
}

function likeComment(button, postIndex, commentIndex) {
    if (likes[postIndex] === undefined) {
        likes[postIndex] = [];
    }
    if (likes[postIndex][commentIndex] === undefined) {
        likes[postIndex][commentIndex] = 0;
    }
    if (!button.classList.contains('liked')) {
        likes[postIndex][commentIndex]++;
        button.innerText = `👍 (${likes[postIndex][commentIndex]})`;
        button.classList.add('liked');
    } else {
        likes[postIndex][commentIndex]--;
        button.innerText = `👍 (${likes[postIndex][commentIndex]})`;
        button.classList.remove('liked');
    }
}

function closeAllForms() {
    document.getElementById('post-form').style.display = 'none';
    document.getElementById('event-form').style.display = 'none';
    document.getElementById('STARTCAFE-form').style.display = 'none';

    document.getElementById('add-post-button').style.display = 'none';
    document.getElementById('add-event-button').style.display = 'none';
    document.getElementById('add-STARTCAFE-button').style.display = 'none';
}

function closeFormsExcept(visibleFormId) {
    const formIds = ['post-form', 'event-form', 'STARTCAFE-form'];
    const buttonIds = ['add-post-button', 'add-event-button', 'add-STARTCAFE-button'];

    formIds.forEach(formId => {
        if (formId !== visibleFormId) {
            document.getElementById(formId).style.display = 'none';
        }
    });

    buttonIds.forEach(buttonId => {
        if (buttonId !== `add-${visibleFormId.split('-')[0]}-button`) {
            document.getElementById(buttonId).style.display = 'none';
        }
    });
}

async function showPosts() {
    closeFormsExcept('post-form');

    document.querySelectorAll('.posts').forEach(post => {
        post.style.display = 'block';
    });
    document.querySelectorAll('.events').forEach(event => {
        event.style.display = 'none';
    });
    document.querySelectorAll('.STARTCAFE').forEach(STARTCAFE => {
        STARTCAFE.style.display = 'none';
    });

    setTimeout(async () => {
        const isAdminUser = await isAdmin();
        if (isAdminUser) {
            document.getElementById('add-post-button').style.display = 'block';
        }
    }, 0);
}

async function showEvents() {
    closeFormsExcept('event-form');

    document.querySelectorAll('.posts').forEach(post => {
        post.style.display = 'none';
    });
    document.querySelectorAll('.events').forEach(event => {
        event.style.display = 'block';
    });
    document.querySelectorAll('.STARTCAFE').forEach(STARTCAFE => {
        STARTCAFE.style.display = 'none';
    });

    setTimeout(async () => {
        const isAdminUser = await isAdmin();
        if (isAdminUser) {
            document.getElementById('add-event-button').style.display = 'block';
        }
    }, 0);
}

async function showSTARTCAFE() {
    closeFormsExcept('STARTCAFE-form');

    document.querySelectorAll('.posts').forEach(post => {
        post.style.display = 'none';
    });
    document.querySelectorAll('.events').forEach(event => {
        event.style.display = 'none';
    });
    document.querySelectorAll('.STARTCAFE').forEach(STARTCAFE => {
        STARTCAFE.style.display = 'block';
    });

    document.getElementById('add-STARTCAFE-button').style.display = 'block';
}

async function fetchDataFromGoogleSheet() {
    try {
        const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1WrsrKtGqjdwbaL20Cs7TmScQNVp5kJRKcN0P6wHmdko/values/signupSTARTrim-form!A:J?key=AIzaSyAYSge_Rg_xblZbyj9vHdhMJzZOrGFylqI');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data.values;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
    }
}

function displayUserInfo() {
    var userData = getUserDataFromCookie();

    var usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = userData.username;
    }

    var userIdElement = document.querySelector('.user-id');
    if (userIdElement) {
        var fullName = userData.first_name + ' ' + userData.last_name;
        userIdElement.textContent = '@' + fullName;
    }
}

function getUserDataFromCookie() {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    var userData = {};
    for (var i = 0; i < cookieArray.length; i++) {
        var cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf("username=") == 0) {
            userData.username = cookie.substring("username=".length, cookie.length);
        } else if (cookie.indexOf("first_name=") == 0) {
            userData.first_name = cookie.substring("first_name=".length, cookie.length);
        } else if (cookie.indexOf("last_name=") == 0) {
            userData.last_name = cookie.substring("last_name=".length, cookie.length);
        }
    }
    return userData;
}
displayUserInfo();

async function isAdmin() {
    const userData = getUserDataFromCookie();
    const email = userData.username;
    const data = await fetchDataFromGoogleSheet();

    if (!data || !email) {
        console.error('Data or email not found');
        return false;
    }

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (row[0] === email) {
            if (row[9] && row[9].toUpperCase() === 'TRUE') {
                console.log('Admin status confirmed');
                return true;
            }
        }
    }
    console.log('Admin status not found');
    return false;
}

async function displayLoggedInUser() {
    var loggedInUser = getUserDataFromCookie();
    if (loggedInUser.username !== "") {
        alert("Logged in as: " + loggedInUser.username);
        const isAdminUser = await isAdmin();

        const adminLink = document.querySelector('ul li a[href="adminSpace.html"]');
        const sideMenuAdminLink = document.querySelector('#side-menu a[href="adminSpace.html"]');

        if (isAdminUser) {
            adminLink.style.display = 'block';
            sideMenuAdminLink.style.display = 'block';
            document.getElementById('add-post-button').style.display = 'block';
            document.getElementById('add-event-button').style.display = 'block';
            document.getElementById('add-STARTCAFE-button').style.display = 'none';
        } else {
            adminLink.style.display = 'none';
            sideMenuAdminLink.style.display = 'none';
            document.getElementById('add-post-button').style.display = 'none';
            document.getElementById('add-event-button').style.display = 'none';
            document.getElementById('add-STARTCAFE-button').style.display = 'none';
        }

        const hasAddPostPermission = await isAdmin('add_post');
        const hasAddEventPermission = await isAdmin('add_event');

        if (!hasAddPostPermission) {
            document.getElementById('add-post-button').style.display = 'none';
        }

        if (!hasAddEventPermission) {
            document.getElementById('add-event-button').style.display = 'none';
        }

        showPosts();
    }
}

window.onload = displayLoggedInUser;
