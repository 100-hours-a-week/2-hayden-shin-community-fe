const title = document.getElementById('post-title');
const content = document.getElementById('post-content');
const image = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const updateButton = document.getElementById('update-post-button');
const charCountDisplay = document.getElementById('char-count');

// 상수
const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 1000;

// 유틸리티 함수
const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000); // 2초 후 제거
};

// 토스트 메시지 + 리다이렉트
const showToastAndRedirect = (message, url, duration = 2000) => {
  // 토스트 메시지 생성
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove(); // 토스트 메시지 제거
    window.location.href = url; // 페이지 이동
  }, duration);
};

const updateCharCount = (inputElement, displayElement, maxLength) => {
  const currentLength = inputElement.value.length;
  displayElement.textContent = `${currentLength} / ${maxLength}`;
  displayElement.style.color = currentLength > maxLength ? 'red' : 'green';
};

const checkFormValidity = () => {
  const isTitleFilled =
    title.value.trim().length > 0 &&
    title.value.trim().length <= MAX_TITLE_LENGTH;
  const isContentFilled =
    content.value.trim().length > 0 &&
    content.value.trim().length <= MAX_CONTENT_LENGTH;

  updateButton.disabled = !(isTitleFilled && isContentFilled);
  updateButton.style.backgroundColor =
    isTitleFilled && isContentFilled ? '#7F6AEE' : '#ACA0EB';
};

// 게시글 수정 함수
async function editPost(postId, newTitle, newContent, newImageUrl) {
  try {
    // 서버로 수정 요청 보내기
    const response = await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        newTitle,
        newContent,
        newImageUrl,
      }),
    });

    if (response.status === 200 || response.status === 204) {
      alert('게시글이 성공적으로 수정되었습니다.');
      window.location.href = `/post-view?id=${postId}`;
    } else if (response.status === 400) {
      alert('잘못된 요청입니다. 입력값을 확인해주세요.');
    } else if (response.status === 401) {
      alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      window.location.href = '/login';
    } else if (response.status === 403) {
      alert('이 게시글을 수정할 권한이 없습니다.');
    } else if (response.status === 404) {
      alert('수정하려는 게시글을 찾을 수 없습니다.');
      window.location.href = '/post-list';
    } else if (response.status === 500) {
      alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('게시글 수정 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// DOMContentLoaded: 페이지 로드 완료 후 동작
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // URL에서 게시글 ID 가져오기

  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  // 이미지 미리보기
  const imageUpload = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');

  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });

  // 폼 제출 이벤트
  const postEditForm = document.querySelector('.post-edit-form');
  postEditForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 중단

    const newTitle = document.getElementById('post-title').value.trim();
    const newContent = document.getElementById('post-content').value.trim();
    const newImageUrl = imagePreview.src || ''; // 이미지 URL

    // 유효성 검사
    if (!newTitle || !newContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 게시글 수정 요청
    await editPost(postId, newTitle, newContent, newImageUrl);
  });
});

// DOMContentLoaded: 페이지 로드 완료 후 동작
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id'); // URL에서 게시글 ID 가져오기

  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  // 이미지 미리보기
  const imageUpload = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');

  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
    }
  });

  // 폼 제출 이벤트
  const postEditForm = document.querySelector('.post-edit-form');
  postEditForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 중단

    const newTitle = document.getElementById('post-title').value.trim();
    const newContent = document.getElementById('post-content').value.trim();
    const newImageUrl = imagePreview.src || ''; // 이미지 URL

    // 유효성 검사
    if (!newTitle || !newContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 게시글 수정 요청
    await editPost(postId, newTitle, newContent, newImageUrl);
  });
});

// 제목 MAX_TITLE_LENGTH 글자로 제한
title.addEventListener('input', () => {
  if (title.value.length >= MAX_TITLE_LENGTH) {
    title.value = title.value.slice(0, MAX_TITLE_LENGTH);
    showToast('제목은 최대 26자까지 작성 가능합니다.');
  }
  checkFormValidity();
});

// 업로드된 이미지 미리보기
image.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }
});

// 폼 유효성에 따라 수정 버튼 활성화/비활성화
content.addEventListener('input', () => {
  updateCharCount(content, charCountDisplay, MAX_CONTENT_LENGTH);
  checkFormValidity();
});

// 폼 제출 (데모용 시뮬레이션)
updateButton.addEventListener('click', async () => {
  await updatePost();
});

// 초기화
checkFormValidity();
