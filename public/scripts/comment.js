import { BASE_URL, CDN_URL } from '../config.js';
import { showModal, showToast } from './common.js';
import { formatDateTime } from '../../utils/format.js';

export const updateCommentCount = (postId) => {
  const commentList = document.getElementById(`comment-list`);
  const commentCountElement = document.getElementById(`comment-count`);

  commentCountElement.innerHTML = `${commentList.childElementCount}<span>댓글</span>`;
};

// 댓글 등록 요청
const createComment = async (postId) => {
  const commentInput = document.getElementById('comment-input');
  const content = commentInput.value.trim();

  if (!content) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);
      console.log(result.data.created);
      renderComment(result.data.created);
      updateCommentCount(postId);
      commentInput.value = '';
      showToast('댓글이 성공적으로 등록되었습니다.');
    } else {
      handleError(response.status, '댓글 등록 중 오류 발생');
    }
  } catch (error) {
    console.error('댓글 등록 실패:', error);
    alert('서버와의 연결에 실패했습니다.');
  }
};

const renderComment = (commentData) => {
  const commentList = document.getElementById(`comment-list`);

  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');
  commentElement.setAttribute('data-comment-id', commentData.id);

  commentElement.innerHTML = `
    <div class="comment-header">
      <div class="comment-user">
        <img src="${CDN_URL}${commentData.url || '/default-profile-image.jpg'}" alt="User Icon" class="user-img">
        <span class="comment-user">${commentData.username}</span>
        <span class="comment-date">${formatDateTime(commentData.createdAt)}</span>
      </div>
      <div class="comment-buttons">
        <button class="edit-comment-button">수정</button>
        <button class="delete-comment-button">삭제</button>
      </div>
    </div>
    <p class="comment-content">${commentData.content}</p>
  `;

  commentList.appendChild(commentElement);
};

const editComment = async (postId, commentId, newContent) => {
  try {
    const response = await fetch(
      `${BASE_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
        credentials: 'include',
      }
    );

    if (response.ok) {
      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"] .comment-content`
      );
      if (commentElement) {
        commentElement.textContent = newContent;
      }
      showToast('댓글이 성공적으로 수정되었습니다.');
    } else {
      handleError(response.status, '댓글 수정 중 오류 발생');
    }
  } catch (error) {
    console.error('댓글 수정 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다.');
  }
};

const deleteComment = async (postId, commentId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (response.ok) {
      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"]`
      );
      if (commentElement) {
        commentElement.remove();
      }
      updateCommentCount(postId);
      showToast('댓글이 성공적으로 삭제되었습니다.');
    } else {
      handleError(response.status, '댓글 삭제 중 오류 발생');
    }
  } catch (error) {
    console.error('댓글 삭제 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다.');
  }
};

const handleError = (status, message) => {
  switch (status) {
    case 400:
      alert('잘못된 요청입니다. 내용을 확인해주세요.');
      break;
    case 401:
      alert('인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/login';
      break;
    case 403:
      alert('권한이 없습니다.');
      break;
    case 404:
      alert('요청한 리소스를 찾을 수 없습니다.');
      break;
    case 429:
      alert('요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.');
      break;
    case 500:
      alert('서버 내부 오류가 발생했습니다.');
      break;
    default:
      alert(`${message}: 알 수 없는 오류가 발생했습니다.`);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const postId = new URLSearchParams(window.location.search).get('id');
  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    return;
  }

  const commentList = document.getElementById('comment-list');
  const commentInput = document.getElementById('comment-input');
  const commentButton = document.getElementById('comment-button');
  let isEditMode = false;

  commentButton.addEventListener('click', async () => {
    const content = commentInput.value.trim();

    if (!content) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (isEditMode) {
      const commentId = commentButton.dataset.commentId;
      await editComment(postId, commentId, content);
      isEditMode = false;
      commentButton.textContent = '댓글 작성';
      commentButton.removeAttribute('data-comment-id');
    } else {
      await createComment(postId);
    }

    commentInput.value = '';
  });

  commentList.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-comment-button')) {
      const commentElement = event.target.closest('.comment');
      const commentId = commentElement.dataset.commentId;
      const existingContent = commentElement
        .querySelector('.comment-content')
        .textContent.trim();

      commentInput.value = existingContent;
      commentButton.textContent = '댓글 수정';
      commentButton.dataset.commentId = commentId;
      isEditMode = true;
    }

    if (event.target.classList.contains('delete-comment-button')) {
      const commentElement = event.target.closest('.comment');
      const commentId = commentElement.dataset.commentId;
      showModal('정말 댓글을 삭제하시겠습니까?', () => {
        deleteComment(postId, commentId);
      });
    }
  });
});
