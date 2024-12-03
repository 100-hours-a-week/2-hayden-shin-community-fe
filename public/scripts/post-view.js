const backButton = document.getElementById('back-button');
const editPostButton = document.getElementById('edit-post-button');
const deletePostButton = document.getElementById('delete-post-button');
const likeButton = document.getElementById('like-button');
const commentInput = document.getElementById('comment-input');
const commentButton = document.getElementById('comment-button');
const commentList = document.getElementById('comment-list');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const modalCancelButton = document.getElementById('modal-cancel-button');
const modalConfirmButton = document.getElementById('modal-confirm-button');

// 유틸리티 함수
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
};

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

const toggleButtonState = (button, enabled) => {
  button.disabled = !enabled;
  button.style.backgroundColor = enabled ? '#7F6AEE' : '#ACA0EB';
};

const showModal = (message, onConfirm) => {
  modalMessage.textContent = message;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  modalConfirmButton.onclick = () => {
    onConfirm();
    closeModal();
  };

  modalCancelButton.onclick = closeModal;
};

const closeModal = () => {
  modal.style.display = 'none';
  document.body.style.overflow = '';
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

// 게시글 보기 이벤트
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // 현재 게시글 ID 가져오기

  if (!postId || isNaN(postId)) {
    alert('post id가 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  viewPost(postId); // Fetch and render the post
});

async function viewPost(postId) {
  try {
    // 댓글 포함 여부에 따라 쿼리 파라미터 설정
    // const query = includeComments ? '?comments=include' : '';

    // API 호출: 특정 게시글 조회
    const response = await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // 서버 응답 상태 코드 처리
    if (response.status === 200) {
      const result = await response.json();
      console.log('Post data:', result); // fetched 포스트 데이터 로그
      renderPost(result.data); // 게시글 데이터를 화면에 렌더링

      // 댓글 데이터가 포함된 경우 렌더링
      // if (includeComments && result.data.comments) {
      //   renderComments(result.data.comments);
      // }

      if (result.data.comments) {
        renderComments(result.data.comments);
      }
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 리다이렉트
    } else if (response.status === 404) {
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = '/post-list'; // 게시글 목록 페이지로 리다이렉트
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('게시글 조회 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

function renderPost(postData) {
  // 게시글 요소 가져오기
  document.getElementById('post-title').textContent = postData.title;
  document.getElementById('post-author').textContent = postData.author_nickname;
  document.getElementById('post-date').textContent = formatDateTime(
    postData.created_at
  );
  document.getElementById('post-content').innerHTML = postData.content;

  // 좋아요, 조회수, 댓글 수 업데이트
  document.getElementById('like-button').innerHTML =
    `${formatNumber(postData.likes)}<span>좋아요</span>`;
  document.getElementById('view-count').innerHTML =
    `${formatNumber(postData.views)}<span>조회수</span>`;
  document.getElementById('comment-count').innerHTML =
    `${formatNumber(postData.comments.length)}<span>댓글</span>`;
}

function renderComments(comments) {
  const commentList = document.getElementById('comment-list'); // 댓글 리스트 컨테이너
  commentList.innerHTML = ''; // 기존 내용을 초기화

  if (comments.length === 0) {
    commentList.innerHTML = '<p>댓글이 없습니다.</p>';
    return;
  }

  // 댓글 데이터 순회 및 렌더링
  comments.forEach(
    ({ author_profile_url, author_nickname, created_at, content }) => {
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');

      commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">
          <img src="${author_profile_url}" alt="User Icon" class="author-img">
          <span class="comment-author">${author_nickname}</span>
          <span class="comment-date">${formatDateTime(created_at)}</span>
        </div>
      </div>
      <p class="comment-content">${content}</p>
    `;

      commentList.appendChild(commentElement);
    }
  );
}

// 조회수 증가 요청
// async function increaseView(postId) {
//   try {
//     // API 호출: 조회수 증가 요청
//     const response = await fetch(`http://localhost:3000/posts/${postId}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ view: true }), // 조회수 증가 플래그
//     });

//     // 서버 응답 상태 코드 처리
//     if (response.status === 200) {
//       const result = await response.json();
//       console.log('조회수 증가 성공:', result.data);

//       // 조회수 UI 업데이트
//       const viewCountElement = document.getElementById('view-count');
//       viewCountElement.innerHTML = `${result.data.views}<span>조회수</span>`;
//     } else if (response.status === 400) {
//       alert('잘못된 요청입니다. 조회수를 증가시킬 수 없습니다.');
//     } else if (response.status === 500) {
//       alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
//     } else {
//       alert('알 수 없는 오류가 발생했습니다.');
//     }
//   } catch (error) {
//     // 네트워크 또는 기타 오류 처리
//     console.error('조회수 증가 요청 실패:', error);
//     alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
//   }
// }

// // 게시글 보기 이벤트
// document.addEventListener('DOMContentLoaded', () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const postId = urlParams.get('post_id'); // URL에서 게시글 ID 가져오기

//   if (!postId) {
//     alert('잘못된 요청입니다.');
//     window.location.href = '/post-list'; // 게시글 목록 페이지로 리다이렉트
//     return;
//   }

//   viewPost(postId, true); // 게시글 조회 함수 호출, 댓글 포함
// });

// // 조회수 증가 이벤트
// document.addEventListener('DOMContentLoaded', () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const postId = urlParams.get('id'); // 현재 게시글 ID 가져오기

//   if (!postId) {
//     alert('잘못된 요청입니다??????????');
//     window.location.href = '/post-list'; // 게시글 목록 페이지로 리다이렉트
//     return;
//   }

//   increaseView(postId); // 조회수 증가 함수 호출
// });

async function deletePost(postId) {
  // 삭제 확인 메시지 표시
  const userConfirmed = confirm(
    '이 게시글을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.'
  );
  if (!userConfirmed) {
    return; // 사용자가 삭제를 취소한 경우 함수 종료
  }

  try {
    // API 호출: 게시글 삭제 요청
    const response = await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // 서버 응답 상태 코드 처리
    if (response.status === 204) {
      alert('게시글이 성공적으로 삭제되었습니다.');
      window.location.href = '/post-list'; // 삭제 후 게시글 목록 페이지로 이동
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 이동
    } else if (response.status === 403) {
      alert('이 게시글을 삭제할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('삭제하려는 게시글을 찾을 수 없습니다.');
      window.location.href = '/post-list'; // 게시글 목록 페이지로 이동
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('게시글 삭제 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

document.getElementById('delete-post-button').addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // 현재 게시글 ID 가져오기

  if (!postId) {
    alert('게시글 ID를 확인할 수 없습니다??????');
    return;
  }

  deletePost(postId); // 게시글 삭제 함수 호출
});

// 이벤트 리스너
backButton.addEventListener('click', () => window.history.back());

editPostButton.addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // 현재 게시글 ID 가져오기
  window.location.href = `/post-edit?id=${postId}`;
});

deletePostButton.addEventListener('click', () => {
  showModal('정말 게시글을 삭제하시겠습니까?', () => {
    showToastAndRedirect('게시글이 삭제되었습니다.', '/post-list');
  });
});

likeButton.addEventListener('click', () => {
  likeButton.classList.toggle('liked');
  showToast('좋아요를 눌렀습니다.');
});
