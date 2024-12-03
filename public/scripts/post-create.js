document.addEventListener('DOMContentLoaded', () => {
  const title = document.getElementById('post-title');
  const content = document.getElementById('post-content');
  const postButton = document.getElementById('post-button');
  const postHelper = document.getElementById('post-helper');
  const imagePreview = document.getElementById('image-preview');

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 지정된 시간 후 토스트 메시지 제거 및 페이지 이동
    setTimeout(() => {
      toast.remove(); // 토스트 메시지 제거
      window.location.href = url; // 페이지 이동
    }, duration);
  };

  // 버튼 상태 업데이트
  const updateButtonState = () => {
    const isTitleFilled = title.value.trim() !== '';
    const isContentFilled = content.value.trim() !== '';

    if (isTitleFilled && isContentFilled) {
      postButton.style.backgroundColor = '#7F6AEE'; // 활성화 색상
      postButton.disabled = false;
    } else {
      postButton.style.backgroundColor = '#ACA0EB'; // 비활성화 색상
      postButton.disabled = true;
    }
  };

  // 제목 입력 제한
  title.addEventListener('input', () => {
    if (title.value.length > 26) {
      title.value = title.value.substring(0, 26); // 26자 제한
    }
    updateButtonState();
  });

  content.addEventListener('input', () => {
    updateButtonState();
  });

  // 이미지 업로드 미리보기
  const imageUrl = document.getElementById('image-url');
  imageUrl.addEventListener('change', () => {
    const file = imageUrl.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result; // 업로드된 이미지 미리보기
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = ''; // 이미지 없을 경우 초기화
    }
  });

  // 제목과 내용의 실시간 유효성 검사
  [title, content].forEach((input) =>
    input.addEventListener('input', updateButtonState)
  );

  // 게시글 작성 요청
  async function createPost(title, content, imageUrl) {
    // 입력값 유효성 검사
    if (!title || !content) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    // 제목 길이 제한 확인
    if (title.length > 26) {
      alert('제목은 최대 26자까지만 입력 가능합니다.');
      return;
    }

    // 요청 데이터 생성
    const requestData = {
      title,
      content,
    };

    // 이미지 URL이 입력되었을 경우 요청 데이터에 추가
    if (imageUrl) {
      requestData.image_url = imageUrl;
    }

    try {
      // API 호출: 게시글 작성 요청
      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      // 서버 응답 상태 코드 처리
      if (response.status === 201) {
        const result = await response.json();
        alert(
          `게시글이 성공적으로 작성되었습니다! 게시글 ID: ${result.data.post_id}`
        );
        console.log('게시글 생성 응답:', result);

        // await postList();
        // 게시글 작성 후 목록 페이지로 이동
        window.location.href = '/post-list';
      } else if (response.status === 400) {
        alert('요청이 잘못되었습니다. 제목 및 내용을 확인해주세요.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      // 네트워크 또는 기타 오류 처리
      console.error('게시글 작성 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 초기 버튼 상태 설정
  postButton.disabled = true;
  postButton.style.backgroundColor = '#ACA0EB'; // 초기 비활성화 상태

  // 이벤트 리스너를 통해 게시글 작성 처리
  postButton.addEventListener('click', (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    const titleValue = title.value;
    const contentValue = content.value;
    const imageUrlValue = imageUrl.value;

    createPost(titleValue, contentValue, imageUrlValue); // createPost 함수 호출
  });

  title.addEventListener('input', () => {});
});
