document.addEventListener('DOMContentLoaded', () => {
  const newPassword = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');
  const passwordUpdateButton = document.getElementById(
    'password-update-button'
  );
  const newPasswordHelper = document.getElementById('new-password-helper');
  const confirmPasswordHelper = document.getElementById(
    'confirm-password-helper'
  );

  // 사용자 데이터 저장 변수
  let currentUser = null;

  // 비밀번호 유효성 검사 함수
  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(password);
  };

  // 모든 필드가 유효한지 확인
  const allFieldsValid = () =>
    isValidPassword(newPassword.value) &&
    newPassword.value === confirmPassword.value;

  // 버튼 상태 토글
  const toggleButtonState = () => {
    if (allFieldsValid()) {
      passwordUpdateButton.disabled = false;
      passwordUpdateButton.style.backgroundColor = '#7F6AEE'; // 활성 상태 색상
    } else {
      passwordUpdateButton.disabled = true;
      passwordUpdateButton.style.backgroundColor = '#ACA0EB'; // 비활성 상태 색상
    }
  };

  // 토스트 메시지 + 리다이렉트
  const showToastAndRedirect = (message, url, duration = 2000) => {
    // 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);

    if (url) {
      // 지정된 시간 후 토스트 메시지 제거 및 페이지 이동
      setTimeout(() => {
        toast.remove(); // 토스트 메시지 제거
        window.location.href = url; // 페이지 이동
      }, duration);
    }
  };

  // 사용자 데이터 가져오기
  const fetchUserData = async () => {
    try {
      const response = await fetch('/data/users.json');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const users = await response.json();
      // 현재 사용자 가정 (예: 첫 번째 사용자)
      currentUser = users[0]; // 실제 구현에서는 사용자 인증에 따라 결정됨
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // 비밀번호 업데이트 시뮬레이션
  const updatePassword = async () => {
    try {
      // 서버에 업데이트 요청 시뮬레이션 (실제 백엔드 없이)
      console.log('Updating password for user:', currentUser);
      currentUser.password = newPassword.value; // 로컬 데이터 수정 시뮬레이션
      showToastAndRedirect('비밀번호가 성공적으로 변경되었습니다!', './login');
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  // 초기화
  fetchUserData(); // 사용자 데이터 가져오기
  passwordUpdateButton.disabled = true;
  passwordUpdateButton.style.backgroundColor = '#ACA0EB'; // 초기 비활성 상태

  // 새 비밀번호 입력 유효성 검사
  newPassword.addEventListener('input', () => {
    const newPasswordValue = newPassword.value;

    if (!newPasswordValue.trim()) {
      newPasswordHelper.textContent = '*비밀번호를 입력해주세요.';
      newPasswordHelper.style.color = 'red';
    } else if (!isValidPassword(newPasswordValue)) {
      newPasswordHelper.textContent =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      newPasswordHelper.style.color = 'red';
    } else {
      newPasswordHelper.textContent = '유효한 비밀번호입니다.';
      newPasswordHelper.style.color = 'green';
    }

    toggleButtonState();
  });

  // 비밀번호 확인 입력 유효성 검사
  confirmPassword.addEventListener('input', () => {
    const confirmPasswordValue = confirmPassword.value;

    if (!confirmPasswordValue.trim()) {
      confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
      confirmPasswordHelper.style.color = 'red';
    } else if (newPassword.value !== confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호와 다릅니다.';
      confirmPasswordHelper.style.color = 'red';
    } else {
      confirmPasswordHelper.textContent = '비밀번호가 일치합니다.';
      confirmPasswordHelper.style.color = 'green';
    }

    toggleButtonState();
  });

  // 비밀번호 변경 버튼 클릭 핸들러
  passwordUpdateButton.addEventListener('click', async (event) => {
    event.preventDefault();

    if (allFieldsValid()) {
      await updatePassword(); // 비밀번호 업데이트
    }
  });
});
