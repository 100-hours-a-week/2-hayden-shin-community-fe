async function createComment(postId) {
  // 댓글 입력 값 가져오기
  const commentInput = document.getElementById('comment-input');
  const commentText = commentInput.value.trim();

  // 입력값 유효성 검사
  if (!commentText) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    // API 호출: 댓글 등록 요청
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id'); // URL에서 게시글 ID 가져오기

    const response = await fetch(
      `http://localhost:3000/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ comment: commentText }),
      }
    );

    // 서버 응답 상태 코드 처리
    if (response.status === 201) {
      const result = await response.json();

      // 댓글 등록 성공: 댓글을 화면에 추가하고 입력란 초기화
      renderComment(result.data);
      commentInput.value = '';
      alert('댓글이 성공적으로 등록되었습니다.');
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    } else if (response.status === 400) {
      alert('잘못된 요청입니다. 댓글 내용을 확인해주세요.');
    } else if (response.status === 429) {
      alert('댓글 등록이 너무 빈번합니다. 잠시 후 다시 시도해주세요.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('댓글 등록 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

function renderComment(commentData) {
  const commentList = document.getElementById('comment-list'); // 댓글 리스트 컨테이너

  // 댓글 요소 생성
  const commentElement = document.createElement('div');
  commentElement.classList.add('comment');
  commentElement.innerHTML = `
    <div class="comment-header">
      <div class="comment-author">
        <img src="../assets/headerpic.png" alt="User Icon" class="author-img">
        <span class="comment-author">${commentData.author_nickname}</span>
        <span class="comment-date">${formatDateTime(commentData.created_at)}</span>
      </div>
      <div class="comment-buttons">
        <button class="edit-comment-button">수정</button>
        <button class="delete-comment-button">삭제</button>
      </div>
    </div>
    <p class="comment-content">${commentData.content}</p>
  `;

  // 댓글 리스트에 새 댓글 추가
  commentList.prepend(commentElement); // 최신 댓글이 상단에 추가되도록 prepend 사용
}

document.getElementById('comment-button').addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // URL에서 게시글 ID 가져오기

  if (!postId) {
    alert('게시글 ID를 확인할 수 없습니다.');
    return;
  }

  createComment(postId); // 댓글 등록 함수 호출
});

async function editComment(postId, commentId, newComment) {
  try {
    // API 호출: 댓글 수정 요청
    const response = await fetch(
      `http://localhost:3000/posts/${postId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newComment,
        }),
      }
    );

    // 서버 응답 상태 코드 처리
    if (response.status === 200 || response.status === 204) {
      alert('댓글이 성공적으로 수정되었습니다.');
      // UI 업데이트
      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"] .comment-content`
      );
      if (commentElement) {
        commentElement.textContent = newComment; // 새 댓글 내용으로 업데이트
      }
    } else if (response.status === 400) {
      alert('잘못된 요청입니다. 입력값을 확인해주세요.');
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 이동
    } else if (response.status === 403) {
      alert('이 댓글을 수정할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('수정하려는 댓글을 찾을 수 없습니다.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('댓글 수정 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

document.addEventListener('click', (event) => {
  // 수정 버튼 클릭 시 동작
  if (event.target.classList.contains('edit-comment-button')) {
    const commentElement = event.target.closest('.comment');
    const commentId = commentElement.dataset.commentId; // 댓글 ID 가져오기
    const currentComment = commentElement
      .querySelector('.comment-content')
      .textContent.trim(); // 현재 댓글 내용
    const newComment = prompt('댓글 내용을 수정하세요:', currentComment); // 수정할 내용 입력받기

    if (!newComment || newComment === currentComment) {
      alert('변경된 내용이 없습니다.');
      return;
    }

    const postId = window.location.pathname.split('/').pop(); // URL에서 게시글 ID 가져오기

    if (!postId || !commentId) {
      alert('잘못된 요청입니다. 게시글 또는 댓글 정보를 확인할 수 없습니다.');
      return;
    }

    // 댓글 수정 요청
    editComment(postId, commentId, currentComment, newComment);
  }
});

async function deleteComment(postId, commentId) {
  try {
    // API 호출: 댓글 삭제 요청
    const response = await fetch(
      `http://localhost:3000/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // 응답 상태 처리
    if (response.status === 204) {
      alert('댓글이 성공적으로 삭제되었습니다.');
      // UI에서 댓글 제거
      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"]`
      );
      if (commentElement) {
        commentElement.remove(); // 댓글 DOM 요소 삭제
      }
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login'; // 로그인 페이지로 이동
    } else if (response.status === 403) {
      alert('이 댓글을 삭제할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('삭제하려는 댓글을 찾을 수 없습니다.');
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('댓글 삭제 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

document.addEventListener('click', (event) => {
  // 삭제 버튼 클릭 시
  if (event.target.classList.contains('delete-comment-button')) {
    const commentElement = event.target.closest('.comment');
    const commentId = commentElement.dataset.commentId; // 댓글 ID 가져오기
    const postId = window.location.pathname.split('/').pop(); // URL에서 게시글 ID 가져오기

    if (!postId || !commentId) {
      alert('잘못된 요청입니다. 게시글 또는 댓글 정보를 확인할 수 없습니다.');
      return;
    }

    // 삭제 확인 메시지
    const confirmDelete = confirm('정말로 이 댓글을 삭제하시겠습니까?');
    if (confirmDelete) {
      deleteComment(postId, commentId);
    }
  }
});

commentInput.addEventListener('input', () => {
  toggleButtonState(commentButton, commentInput.value.trim().length > 0);
});

// commentButton.addEventListener('click', () => {
//   const commentText = commentInput.value.trim();
//   if (!commentText) return;
//   createComment(commentText);
//   commentInput.value = '';
//   toggleButtonState(commentButton, false);
// });

// 초기화
toggleButtonState(commentButton, false);
