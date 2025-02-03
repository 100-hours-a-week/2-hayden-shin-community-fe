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
const dislikeButton = document.getElementById('dislike-button'); // Add dislike button reference

// Add performance measurement utility
const measureTime = (label) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`⏱️ ${label} took ${duration.toFixed(2)}ms`);
  };
};

// 버튼 상태 토글 함수
const toggleButtonState = (button, enabled) => {
  button.disabled = !enabled;
  button.style.background = enabled
    ? 'var(--color-gradient)'
    : 'var(--color-gradient-transparent)';
};

// 게시글 조회
async function viewPost(postId) {
  console.log(`📥 Fetching post with ID: ${postId}`);
  const endTimer = measureTime('viewPost');
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    console.log(`📊 Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('📦 Received post data:', result.data);
      await renderPost(result.data.post);
      await renderComments(result.data.comments);
    } else {
      console.warn(`⚠️ Error response: ${response.status}`);
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Post fetch error:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
  endTimer();
}

// 게시글 렌더링
async function renderPost(postData) {
  console.log('🎨 Rendering post:', postData);
  const endTimer = measureTime('renderPost');

  const postTitle = document.getElementById('post-title');
  const postDate = document.getElementById('post-date');
  const postContent = document.getElementById('post-content');
  const userImage = document.getElementById('user-image');
  const postUser = document.getElementById('post-user');
  const image = document.getElementById('post-image');

  const currentUser = await fetchUserProfile();
  console.log('👤 Current user:', currentUser);
  const isUser = postData.userId == currentUser.id;
  console.log(`🔑 Is owner: ${isUser}`);

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

  console.log('🖼️ Post render complete');
  endTimer();
}

// 댓글 렌더링
async function renderComments(comments) {
  console.log(`💬 Rendering ${comments.length} comments`);
  const endTimer = measureTime('renderComments');

  const commentList = document.getElementById('comment-list');
  const currentUser = await fetchUserProfile();

  commentList.innerHTML = '';

  comments.forEach(async (comment) => {
    console.log(`📝 Rendering comment ID: ${comment.id}`, comment);
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
          <button class="edit-comment-button"><i class="fa-solid fa-pen-to-square edit-icon"></i></button>
          <button class="delete-comment-button"><i class="fa-solid fa-trash delete-icon"></i></button>
        </div>
      </div>
      <p class="comment-content">${comment.content}</p>
    `;
    commentList.appendChild(commentElement);
  });
  updateCommentCount();
  endTimer();
}

// 게시글 삭제
async function deletePost(postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      alert('게시글이 성공적으로 삭제되었습니다.');
      window.location.href = '/post-list';
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('게시글 삭제 중 오류:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 오류 처리
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

// 좋아요 상태 초기화 함수
async function fetchLikeStatus(postId, likeButton) {
  console.log(`👍 Fetching like status for post: ${postId}`);
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
      console.log('📦 Received like status:', result.data);
      if (result.data.isLiked) {
        console.log(result.data.isLiked);
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
      console.warn(`⚠️ Error response: ${response.status}`);
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('❌ Like status fetch error:', error);
  }
  endTimer();
}

// 좋아요 추가 함수
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
    console.error('좋아요 추가 중 오류:', error);
  }
}

// 좋아요 제거 함수
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
    console.error('좋아요 취소 중 오류:', error);
  }
}

// 싫어요 상태 초기화 함수
async function fetchDislikeStatus(postId) {
  try {
    console.log('Fetching dislike status...'); // Add debug logging
    const dislikeIcon = document.querySelector('.dislike-icon');
    if (!dislikeIcon) {
      console.error('Dislike icon element not found'); // Add error logging
      return;
    }

    const response = await fetch(`${BASE_URL}/posts/${postId}/dislikes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Dislike status result:', result); // Add debug logging
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
    console.error('싫어요 상태 조회 중 오류:', error);
  }
}

// 싫어요 추가 함수
async function addDislikes(postId) {
  console.log('👎 Adding dislike');
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
    console.error('싫어요 추가 중 오류:', error);
  }
}

// 싫어요 제거 함수
async function removeDislikes(postId) {
  try {
    console.log('Removing dislike...'); // Add debug logging
    const dislikeIcon = document.querySelector('.dislike-icon');
    if (!dislikeIcon) {
      console.error('Dislike icon element not found'); // Add error logging
      return;
    }

    const response = await fetch(`${BASE_URL}/posts/${postId}/dislikes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Remove dislike result:', result); // Add debug logging
      dislikeIcon.classList.remove('dislike-icon--disliked');
      document.getElementById('dislike-button').innerHTML =
        `<i class="fa-regular fa-thumbs-down dislike-icon icon"></i> <span>${formatNumber(result.data.dislikeCount)}</span><span>싫어요</span>`;
      showToast('싫어요 취소');
    } else {
      handleErrors(response.status, '/post-list');
    }
  } catch (error) {
    console.error('싫어요 취소 중 오류:', error);
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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Page loaded, initializing...');
  const endTimer = measureTime('pageInitialization');

  const postId = new URLSearchParams(window.location.search).get('id');
  console.log(`📋 Post ID from URL: ${postId}`);

  if (!postId) {
    console.warn('⚠️ No post ID found in URL');
    alert('Post ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  try {
    await viewPost(postId);
    await fetchLikeStatus(postId, likeButton);
    likeButton.addEventListener('click', async () => {
      console.log('👆 Like button clicked');
      const endTimer = measureTime('likeOperation');
      if (likeButton.classList.contains('liked')) {
        console.log('Removing like');
        await removeLikes(postId);
      } else {
        console.log('Adding like');
        await addLikes(postId);
      }
      endTimer();
    });

    const dislikeIcon = document.querySelector('.dislike-icon');
    await fetchDislikeStatus(postId);
    dislikeButton.addEventListener('click', async () => {
      console.log('Dislike icon clicked'); // Add debug logging
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
