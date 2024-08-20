/**
 * @file comments.js
 * @description This file handles loading comments, adding new comments, editing, and deleting existing comments from a JSON file, and displaying them on the website. 
 * It also manages the display of the form for adding new comments and controls the edit state for existing comments.
 */

document.addEventListener('DOMContentLoaded', function () {
    loadComments();

    document.getElementById('comments-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const author = document.getElementById('comment-author').value;
        const text = document.getElementById('comment-text').value;

        const index = this.dataset.editIndex;
        if (index !== undefined) {
            await editComment(index, { author, text });
        } else {
            await addComment({ author, text });
        }

        document.getElementById('comments-form').reset();
        document.getElementById('add-comment-form').style.display = 'none';
        document.getElementById('add-comment-button').style.display = 'block';
        this.removeAttribute('data-edit-index');
        currentlyEditingIndex = null;
        loadComments();
    });

    document.getElementById('add-comment-button').addEventListener('click', showAddCommentForm);
});

/**
 * Loads comments from the JSON file and displays them on the page.
 * If an error occurs during the fetch operation, it is logged to the console.
 */
async function loadComments() {
    try {
        const response = await fetch('Data/Comments_info.json');
        const comments = await response.json();
        const container = document.getElementById('comments-container');
        container.innerHTML = '';

        const currentLanguage = 'en'; // Update if needed

        comments.forEach((comment, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="card__image">
                    <img src="${comment.imageUrl}" alt="User Image">
                </div>
                <div class="card__content">
                    <p class="card__author">${comment.username[currentLanguage]}</p>
                    <p class="card__text">${comment.description[currentLanguage]}</p>
                    <button onclick="toggleEditComment(${index})">${currentlyEditingIndex === index ? 'Cancel' : 'Edit'}</button>
                    <button onclick="deleteComment(${index})">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

/**
 * Adds a new comment to the JSON file and updates the comment list on the page.
 * If an error occurs during the fetch operation, it is logged to the console.
 * @param {Object} comment - The comment object containing the author and text.
 */
async function addComment(comment) {
    try {
        const response = await fetch('Data/Comments_info.json');
        const comments = await response.json();
        comments.push(comment);

        await fetch('Data/Comments_info.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comments)
        });
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

/**
 * Edits an existing comment in the JSON file based on the provided index and updates the comment list on the page.
 * If an error occurs during the fetch operation, it is logged to the console.
 * @param {number} index - The index of the comment to edit.
 * @param {Object} updatedComment - The updated comment object containing the new author and text.
 */
async function editComment(index, updatedComment) {
    try {
        const response = await fetch('Data/Comments_info.json');
        const comments = await response.json();
        comments[index] = updatedComment;

        await fetch('Data/Comments_info.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comments)
        });
    } catch (error) {
        console.error('Error editing comment:', error);
    }
}

/**
 * Toggles the edit mode for a specific comment. If another comment is currently being edited, it cancels that edit first.
 * @param {number} index - The index of the comment to toggle edit mode.
 */
function toggleEditComment(index) {
    if (currentlyEditingIndex !== null && currentlyEditingIndex !== index) {
        cancelEditComment(currentlyEditingIndex);
    }

    if (currentlyEditingIndex === index) {
        cancelEditComment(index);
    } else {
        startEditComment(index);
    }
}

/**
 * Starts editing a comment by replacing the author's name and text with editable text areas.
 * Also adds a save button to save the changes.
 * @param {number} index - The index of the comment to edit.
 */
function startEditComment(index) {
    console.log('Starting edit for index:', index);

    const cards = document.querySelectorAll('.card');
    if (index < 0 || index >= cards.length) {
        console.error('Index out of bounds:', index);
        return;
    }

    const card = cards[index];
    if (!card) {
        console.error('Card element not found for index:', index);
        return;
    }

    const authorElement = card.querySelector('.card__author');
    const textElement = card.querySelector('.card__text');

    if (!authorElement || !textElement) {
        console.error('Author or text element not found in card at index:', index);
        return;
    }

    const author = authorElement.innerText;
    const text = textElement.innerText;

    authorElement.innerHTML = `<textarea id="edit-author-${index}">${author}</textarea>`;
    textElement.innerHTML = `<textarea id="edit-text-${index}">${text}</textarea>`;

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('save-button');
    saveButton.onclick = () => saveComment(index);
    card.querySelector('.card__content').appendChild(saveButton);

    currentlyEditingIndex = index;
}

/**
 * Cancels the edit mode for a comment by reverting the changes and removing the save button.
 * @param {number} index - The index of the comment to cancel editing.
 */
function cancelEditComment(index) {
    const card = document.querySelectorAll('.card')[index];
    if (!card) {
        console.error('Card not found for index:', index);
        return;
    }

    const author = card.querySelector(`#edit-author-${index}`).value;
    const text = card.querySelector(`#edit-text-${index}`).value;

    card.querySelector('.card__author').innerHTML = author;
    card.querySelector('.card__text').innerHTML = text;
    card.querySelector('.card__content').querySelector('.save-button').remove();

    currentlyEditingIndex = null;
}

/**
 * Saves the changes made to a comment during editing by calling the editComment function and reloading the comments list.
 * @param {number} index - The index of the comment to save.
 */
async function saveComment(index) {
    const author = document.querySelector(`#edit-author-${index}`).value;
    const text = document.querySelector(`#edit-text-${index}`).value;

    await editComment(index, { author, text });

    currentlyEditingIndex = null;
    loadComments();
}

/**
 * Deletes a comment from the JSON file based on the provided index and updates the comment list on the page.
 * If the comment being deleted is currently being edited, it cancels the edit mode.
 * If an error occurs during the fetch operation, it is logged to the console.
 * @param {number} index - The index of the comment to delete.
 */
async function deleteComment(index) {
    try {
        const response = await fetch('Data/Comments_info.json');
        const comments = await response.json();
        comments.splice(index, 1);

        await fetch('Data/Comments_info.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comments)
        });

        if (currentlyEditingIndex === index) {
            currentlyEditingIndex = null;
        }

        loadComments();
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

/**
 * Shows or hides the form for adding a new comment based on its current visibility.
 * If the form is made visible, it sets focus on the author input field.
 */
function showAddCommentForm() {
    const form = document.getElementById('add-comment-form');
    const isFormVisible = form.style.display === 'block';
    form.style.display = isFormVisible ? 'none' : 'block';

    if (form.style.display === 'block') {
        const commentAuthor = document.getElementById('comment-author');
        if (commentAuthor) {
            commentAuthor.focus();
        }
    }
}