// 좋아요 증가 요청
async function increaseLike(postId) {
  try {
    // API 호출: 좋아요 증가 요청
    const response = await fetch(
      `http://localhost:3000/posts/${postId}/likes`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ like: true }), // 좋아요 증가 플래그
      }
    );

    // 서버 응답 상태 코드 처리
    if (response.status === 200) {
      const result = await response.json();
      console.log('좋아요 증가 성공:', result.data);
      setTimeout(() => {
        showToast('좋아요');
      }, 2000);

      // 좋아요 UI 업데이트
      const likeCountElement = document.getElementById('like-button');
      likeCountElement.innerHTML = `${result.data.likes}<span>좋아요</span>`;
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/pages/login'; // 로그인 페이지로 이동
    } else if (response.status === 404) {
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = '/pages/post-list'; // 게시글 목록 페이지로 이동
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('좋아요 증가 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// 좋아요 취소 요청
async function cancelLike(postId) {
  try {
    // API 호출: 좋아요 취소 요청
    const response = await fetch(
      `http://localhost:3000/posts/${postId}/likes`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ like: false }), // 좋아요 취소 플래그
      }
    );

    // 서버 응답 상태 코드 처리
    if (response.status === 200) {
      const result = await response.json();
      console.log('좋아요 취소 성공:', result.data);

      // 좋아요 UI 업데이트
      const likeCountElement = document.getElementById('like-button');
      likeCountElement.innerHTML = `${result.data.likes}<span>좋아요</span>`;
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/pages/login'; // 로그인 페이지로 이동
    } else if (response.status === 404) {
      alert('게시글을 찾을 수 없습니다.');
      window.location.href = '/pages/post-list'; // 게시글 목록 페이지로 이동
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    // 네트워크 또는 기타 오류 처리
    console.error('좋아요 취소 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

document.getElementById('like-button').addEventListener('click', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // URL에서 게시글 ID 가져오기

  if (!postId) {
    alert('게시글 ID를 확인할 수 없습니다.');
    return;
  }

  // 좋아요 상태에 따라 증가 또는 취소 함수 호출
  const likeButton = document.getElementById('like-button');
  if (likeButton.classList.contains('liked')) {
    cancelLike(postId); // 좋아요 취소 함수 호출
    likeButton.classList.remove('liked'); // 버튼 상태 변경
  } else {
    increaseLike(postId); // 좋아요 증가 함수 호출
    likeButton.classList.add('liked'); // 버튼 상태 변경
  }
});
