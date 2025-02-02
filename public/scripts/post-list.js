import { BASE_URL, CDN_URL } from '../config.js';
import { formatDateTime, formatNumber } from '../../utils/format.js';
import { showToastAndRedirect } from './common.js';

// 게시글 리스트 새로고침
export const refreshPostList = async () => {
  await postList();
  console.log('게시글 요소값 변경 후 게시글 리스트 새로고침');
};

// 게시글 렌더링 함수
const renderPosts = (postsData) => {
  const postListContainer = document.getElementById('post-list-container');

  if (!postListContainer) {
    console.error('게시글이 없습니다.');
    return;
  }

  postListContainer.innerHTML = '';

  // 게시글 데이터 순회 및 렌더링
  postsData.forEach(
    ({
      id,
      title,
      createdAt,
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

      postItem.innerHTML = `
        <h3 class="post-title">${title}</h3>
        <div class="post-stats">
          <span><i class="fa-solid fa-binoculars view-icon"></i> ${formatNumber(viewCount)}</span>
          <span><i class="fa-solid fa-comments comment-icon"></i> ${formatNumber(commentCount)}</span>
          <span><i class="fa-solid fa-thumbs-up like-icon"></i> ${formatNumber(likeCount)}</span>
          <span><i class="fa-solid fa-thumbs-down dislike-icon"></i> ${formatNumber(dislikeCount)}</span>
          <p class="post-date">${formatDateTime(createdAt)}</p>
        </div>
        <hr />
        <div class="post-user">
          <img src="${CDN_URL}${url || '/default-profile-image.jpg'}" alt="프로필 이미지" class="post-user-img">
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

// 게시글 리스트
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
      console.log('Fetched posts:', result.data);
      renderPosts(result.data);
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('게시글 목록 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 게시글 로딩
document.addEventListener('DOMContentLoaded', () => {
  const createPostButton = document.getElementById('create-post-button');
  if (createPostButton) {
    createPostButton.addEventListener('click', () => {
      showToastAndRedirect('게시글 작성 페이지로 이동합니다.', '/post-create');
    });
  }

  postList();

  const arrowUp = document.querySelector('.arrow-up');
  const card = document.querySelector('.post-item');
  const cardHeight = card.offsetHeight;
  arrowUp.style.opacity = 0;
  document.addEventListener('scroll', () => {
    if (window.scrollY > cardHeight * 3) {
      arrowUp.style.opacity = 1;
    } else {
      arrowUp.style.opacity = 0;
    }
  });
});
