import { BASE_URL, CDN_URL } from '../config.js';
import {
  formatDateTime,
  formatNumber,
  formatRelativeTime,
} from '../../utils/format.js';
import { showToastAndRedirect } from './common.js';

// Refresh post list
export const refreshPostList = async () => {
  await postList();
};

// Post rendering function
const renderPosts = (postsData) => {
  const postListContainer = document.getElementById('post-list-container');

  if (!postListContainer) {
    console.error('❌ No posts container found');
    return;
  }

  postListContainer.innerHTML = '';

  // Iterate and render post data
  postsData.forEach(
    ({
      id,
      title,
      createdAt,
      updatedAt,
      viewCount = 0,
      commentCount = 0,
      likeCount = 0,
      dislikeCount = 0,
      username,
      url,
    }) => {
      const postItem = document.createElement('div');
      postItem.classList.add('post-item');
      postItem.dataset.id = id;

      const timeDisplay = updatedAt
        ? `${formatDateTime(updatedAt)} 수정됨`
        : formatRelativeTime(createdAt);

      postItem.innerHTML = `
        <h3 class="post-title">${title}</h3>
        <div class="post-stats">
          <span><i class="fa-solid fa-binoculars view-icon"></i> ${formatNumber(viewCount)}</span>
          <span><i class="fa-solid fa-comments comment-icon"></i> ${formatNumber(commentCount)}</span>
          <span><i class="fa-solid fa-thumbs-up like-icon"></i> ${formatNumber(likeCount)}</span>
          <span><i class="fa-solid fa-thumbs-down dislike-icon"></i> ${formatNumber(dislikeCount)}</span>
          <p class="post-date">${timeDisplay}</p>
        </div>
        <hr />
        <div class="post-user">
          <img src="${CDN_URL}${url || '/default-profile-image.jpg'}" alt="Profile Image" class="post-user-img">
          <span>${username}</span>
        </div>
      `;

      postItem.addEventListener('click', () => {
        window.location.href = `/post-view?id=${id}`;
      });

      postListContainer.append(postItem);
    }
  );
};

// Get post list
async function postList() {
  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 200) {
      const result = await response.json();
      renderPosts(result.data);
    } else if (response.status === 401) {
      alert('Unauthorized user. Please login again.');
      window.location.href = '/login';
    } else if (response.status === 500) {
      alert('Internal server error occurred. Please try again later.');
    } else {
      alert('An unknown error occurred.');
    }
  } catch (error) {
    console.error('🔥 Failed to fetch posts:', error);
    alert('Failed to connect to server. Please try again later.');
  }
}

// Load posts
document.addEventListener('DOMContentLoaded', () => {
  const createPostButton = document.getElementById('create-post-button');
  if (createPostButton) {
    createPostButton.addEventListener('click', () => {
      showToastAndRedirect('Moving to post creation page', '/post-create');
    });
  }

  postList();

  const arrowUp = document.querySelector('.arrow-up');
  let card = document.querySelector('.post-item');
  let cardHeight = 0;
  if (card) {
    cardHeight = card.offsetHeight;
  } else {
    console.error('⚠️ Cannot find .post-item element');
    cardHeight = 200;
  }

  arrowUp.style.opacity = 0;

  window.addEventListener('scroll', () => {
    arrowUp.style.opacity = window.scrollY > cardHeight * 3 ? 1 : 0;
  });
});
