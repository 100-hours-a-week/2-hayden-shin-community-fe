// 게시글 작성 버튼
const createPostButton = document.getElementById('create-post-button');

// 게시글 목록 컨테이너
const postListContainer = document.querySelector('.post-list');

// 토스트 메시지 + 리다이렉트
const showToastAndRedirect = (message, url, duration = 2000) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    window.location.href = url;
  }, duration);
};

// 날짜 및 시간 포맷 함수
const formatDateTime = (date) => {
  const dateObj = new Date(date); // 날짜 문자열을 Date 객체로 변환
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

// 숫자 축약 함수 (1k, 10k, 100k)
const formatNumber = (number) => {
  if (number >= 100000) return `${Math.floor(number / 1000)}k`;
  if (number >= 10000) return `${Math.floor(number / 1000)}k`;
  if (number >= 1000) return `${Math.floor(number / 1000)}k`;
  return number;
};

// 게시글 작성 페이지로 이동 이벤트
createPostButton.addEventListener('click', () => {
  showToastAndRedirect('게시글 작성 페이지로 이동합니다.', '/post-create');
});

// 게시글 리스트
async function postList() {
  try {
    // API 호출: 게시글 목록 요청
    const response = await fetch(`http://localhost:3000/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // 서버 응답 상태 코드 처리
    if (response.status === 200) {
      const result = await response.json();
      console.log('Fetched posts:', result.data); // 디버그 로그
      renderPosts(result.data); // 게시글 데이터를 화면에 렌더링
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 리다이렉트
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('게시글 목록 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 게시글 렌더링 함수
const renderPosts = (postsData) => {
  // 게시글 목록 초기화
  const postListContainer = document.getElementById('post-list-container'); // 게시글 목록 컨테이너

  if (!postListContainer) {
    console.error('post-list-container element not found!');
    return; // Prevent further errors
  }

  postListContainer.innerHTML = ''; // 기존 내용을 초기화

  // 게시글 데이터가 없을 경우 메시지 출력
  if (!postsData || postsData.length === 0) {
    postListContainer.innerHTML = '<p>게시글이 없습니다.</p>';
    return;
  }

  // 게시글 데이터 순회 및 렌더링
  postsData.forEach(
    ({
      post_id,
      title,
      content,
      author_id,
      author_profile_url,
      author_nickname,
      created_at,
      likes,
      views,
      comment_ids,
    }) => {
      // 게시글 요소 생성
      const postItem = document.createElement('div');
      postItem.classList.add('post-item');
      postItem.dataset.id = post_id; // 게시글 ID 저장

      // 게시글 아이템 HTML 구조 생성
      postItem.innerHTML = `
      <h3 class="post-title">${title}</h3>
      <div class="post-stats">
        <span>조회수: ${formatNumber(views)}</span>
        <span>댓글: ${formatNumber(comment_ids.length)}</span>
        <span>좋아요: ${formatNumber(likes)}</span>
        <p class="post-date">${formatDateTime(created_at)}</p>
      </div>
      <hr />
      <div class="post-author">
        <img src="${author_profile_url}" alt="프로필 이미지" class="post-author-img">
        <span>${author_nickname}</span>
      </div>
    `;

      // 게시글 클릭 시 게시글 상세 페이지로 이동
      postItem.addEventListener('click', () => {
        window.location.href = `/post-view?id=${post_id}`;
      });

      // 게시글 목록 컨테이너에 추가
      postListContainer.appendChild(postItem);
    }
  );
};

// 페이지 로딩 시 게시글 목록 로드
document.addEventListener('DOMContentLoaded', () => {
  postList();
});
