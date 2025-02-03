import { BASE_URL, CDN_URL } from '../config.js';
import { updateCommentCount } from './comment.js';
import { showToast, showModal } from './common.js';
import {
  formatDateTime,
  formatNumber,
  formatRelativeTime,
} from '../../utils/format.js';
import { fetchUserProfile } from '../../utils/fetchUserProfile.js';

const editPostButton = document.getElementById('edit-post-button');
const deletePostButton = document.getElementById('delete-post-button');
const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

// Add performance measurement utility
const measureTime = (label) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
  };
};

// Toggle button state function
const toggleButtonState = (button, enabled) => {
  button.disabled = !enabled;
  button.style.background = enabled
    ? 'var(--color-gradient)'
    : 'var(--color-gradient-transparent)';
};

// View post
async function viewPost(postId) {
  const endTimer = measureTime('viewPost');
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      await renderPost(result.data.post);
      await renderComments(result.data.comments);
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('🔥 Failed to fetch post:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
  endTimer();
}

// Render post
async function renderPost(postData) {
  const endTimer = measureTime('renderPost');

  const postTitle = document.getElementById('post-title');
  const postDate = document.getElementById('post-date');
  const postContent = document.getElementById('post-content');
  const userImage = document.getElementById('user-image');
  const postUser = document.getElementById('post-user');
  const image = document.getElementById('post-image');

  const currentUser = await fetchUserProfile();
  const isUser = postData.userId == currentUser.id;

  const editPostButton = document.getElementById('edit-post-button');
  const deletePostButton = document.getElementById('delete-post-button');

  if (isUser) {
    editPostButton.style.display = 'block';
    deletePostButton.style.display = 'block';
  } else {
    editPostButton.style.display = 'none';
    deletePostButton.style.display = 'none';
  }

  postTitle.textContent = postData.title;
  postDate.textContent = postData.updatedAt
    ? `${formatDateTime(postData.updatedAt)} 수정됨`
    : formatRelativeTime(postData.createdAt);
  postContent.innerHTML = postData.content;

  userImage.src = `${CDN_URL}${postData.url || '/default-profile-image.jpg'}`;
  postUser.textContent = postData.username;

  if (postData.image) {
    image.src = `${CDN_URL}${postData.image}`;
    image.style.display = 'block';
  }

  document.getElementById('like-button').innerHTML =
    `<i class="fa-regular fa-thumbs-up like-icon icon"></i> <span>${formatNumber(postData.likeCount)}</span><span>좋아요</span>`;
  document.getElementById('dislike-button').innerHTML =
    `<i class="fa-regular fa-thumbs-down dislike-icon"></i> <span>${formatNumber(postData.dislikeCount)}</span><span>싫어요</span>`;
  document.getElementById('view-count').innerHTML =
    `<i class="fa-solid fa-binoculars view-icon icon"></i> <span>${formatNumber(postData.viewCount)}</span><span>조회수</span>`;
  document.getElementById('comment-count').innerHTML =
    `<i class="fa-solid fa-comments comment-icon"></i> <span>${formatNumber(postData.commentCount)}</span><span>댓글</span>`;

  endTimer();
}

// Render comments
async function renderComments(comments) {
  const endTimer = measureTime('renderComments');

  const commentList = document.getElementById('comment-list');
  const currentUser = await fetchUserProfile();

  commentList.innerHTML = '';

  comments.forEach(async (comment) => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.setAttribute('data-comment-id', comment.id);

    const isUser = comment.userId == currentUser.id;
    const timeDisplay = comment.updatedAt
      ? `${formatDateTime(comment.updatedAt)} 수정됨`
      : `${formatDateTime(comment.createdAt)}`;

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-user">
          <img src="${CDN_URL}${comment.url}" alt="User Icon" class="user-img">
          <span class="comment-user">${comment.username}</span>
          <span class="comment-date">
            ${timeDisplay}
          </span>
        </div>
        <div class="comment-buttons" style="display: ${isUser ? 'flex' : 'none'};">
          <button class="edit-comment-button"><i class="fa-solid fa-pen-to-square edit-icon comment-edit-icon"></i></button>
          <button class="delete-comment-button"><i class="fa-solid fa-trash delete-icon comment-delete-icon"></i></button>
        </div>
      </div>
      <p class="comment-content">${comment.content}</p>
    `;
    commentList.appendChild(commentElement);
  });
  updateCommentCount();
  endTimer();
}

// Delete post
async function deletePost(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      alert('게시글 삭제 완료');
      window.location.href = '/post-list';
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// Handle errors
function handleErrors(status, redirectPath) {
  switch (status) {
    case 401:
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
      break;
    case 404:
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = redirectPath;
      break;
    case 500:
      alert('서버 내부 오류가 발생했습니다.');
      break;
    default:
      alert('알 수 없는 오류가 발생했습니다.');
  }
}

// Initialize like status
async function fetchLikeStatus(postId, likeButton) {
  const endTimer = measureTime('fetchLikeStatus');

  const likeIcon = document.querySelector('.like-icon');
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data.isLiked) {
        likeButton.classList.add('liked');
        likeIcon.classList.add('like-icon--liked');
        likeIcon.classList.remove('fa-regular');
        likeIcon.classList.add('fa-solid');
      } else {
        likeButton.classList.remove('liked');
        likeIcon.classList.remove('like-icon--liked');
        likeIcon.classList.add('fa-regular');
        likeIcon.classList.remove('fa-solid');
      }
      return result.data.isLiked;
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error fetching like status:', error);
  }
  endTimer();
}

// Add like
async function addLikes(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      likeButton.classList.add('liked');
      document.getElementById('like-button').innerHTML =
        `<i class="fa-solid fa-thumbs-up like-icon icon liked"></i> <span>${formatNumber(result.data.likeCount)}</span><span>좋아요</span>`;
      showToast('좋아요 성공');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error adding like:', error);
  }
}

// Remove like
async function removeLikes(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      likeButton.classList.remove('liked');
      document.getElementById('like-button').innerHTML =
        `<i class="fa-regular fa-thumbs-up like-icon icon"></i> <span>${formatNumber(result.data.likeCount)}</span><span>좋아요</span>`;
      showToast('좋아요 취소');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error removing like:', error);
  }
}

// Initialize dislike status
async function fetchDislikeStatus(postId) {
  try {
    const dislikeIcon = document.querySelector('.dislike-icon');
    if (!dislikeIcon) {
      console.error('❌ Dislike icon element not found');
      return;
    }

    const response = await fetch(`${BASE_URL}/posts/${postId}/dislikes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      if (result.data.isDisliked) {
        dislikeIcon.classList.add('dislike-icon--disliked');
        dislikeIcon.classList.remove('fa-regular');
        dislikeIcon.classList.add('fa-solid');
      } else {
        dislikeIcon.classList.remove('dislike-icon--disliked');
        dislikeIcon.classList.add('fa-regular');
        dislikeIcon.classList.remove('fa-solid');
      }
      return result.data.isDisliked;
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error fetching dislike status:', error);
  }
}

// Add dislike
async function addDislikes(postId) {
  const dislikeButton = document.getElementById('dislike-button');
  const dislikeIcon = dislikeButton.querySelector('.dislike-icon');

  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/dislikes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      dislikeIcon.classList.add('dislike-icon--disliked');
      document.getElementById('dislike-button').innerHTML =
        `<i class="fa-solid fa-thumbs-down dislike-icon icon dislike-icon--disliked"></i> <span>${formatNumber(result.data.dislikeCount)}</span><span>싫어요</span>`;
      showToast('싫어요 성공');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error adding dislike:', error);
  }
}

// Remove dislike
async function removeDislikes(postId) {
  try {
    const dislikeIcon = document.querySelector('.dislike-icon');
    if (!dislikeIcon) {
      console.error('❌ Dislike icon element not found');
      return;
    }

    const response = await fetch(`${BASE_URL}/posts/${postId}/dislikes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      dislikeIcon.classList.remove('dislike-icon--disliked');
      document.getElementById('dislike-button').innerHTML =
        `<i class="fa-regular fa-thumbs-down dislike-icon icon"></i> <span>${formatNumber(result.data.dislikeCount)}</span><span>싫어요</span>`;
      showToast('싫어요 취소');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Error removing dislike:', error);
  }
}

editPostButton.addEventListener('click', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (postId) window.location.href = `/post-edit?id=${postId}`;
});

deletePostButton.addEventListener('click', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (postId) {
    showModal('정말 게시글을 삭제하시겠습니까?', () => {
      deletePost(postId);
    });
  }
});

document.querySelector('.post-delete-icon').addEventListener('click', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (postId) {
    showModal('정말 게시글을 삭제하시겠습니까?', () => {
      deletePost(postId);
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const endTimer = measureTime('pageInitialization');

  const postId = new URLSearchParams(window.location.search).get('id');

  if (!postId) {
    console.error('❌ No post ID found in URL');
    alert('Post ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  try {
    await viewPost(postId);
    await fetchLikeStatus(postId, likeButton);
    likeButton.addEventListener('click', async () => {
      const endTimer = measureTime('likeOperation');
      if (likeButton.classList.contains('liked')) {
        await removeLikes(postId);
      } else {
        await addLikes(postId);
      }
      endTimer();
    });

    const dislikeIcon = document.querySelector('.dislike-icon');
    await fetchDislikeStatus(postId);
    dislikeButton.addEventListener('click', async () => {
      const currentIcon = dislikeButton.querySelector('.dislike-icon');
      if (currentIcon.classList.contains('dislike-icon--disliked')) {
        await removeDislikes(postId);
      } else {
        await addDislikes(postId);
      }
    });
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
  endTimer();
});
