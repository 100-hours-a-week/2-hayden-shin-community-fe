document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 선택
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login-button');
  const emailHelper = document.getElementById('email-helper');
  const passwordHelper = document.getElementById('password-helper');

  // 유효한 이메일 형식 확인
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 유효한 비밀번호 형식 확인
  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      password
    );

  // 헬퍼 텍스트 업데이트
  const updateHelperText = (helperElement, message, color) => {
    helperElement.textContent = message;
    helperElement.style.color = color;
  };

  // 로그인 버튼 활성화 상태 확인
  const checkLoginButtonState = () => {
    const emailValid = isValidEmail(emailInput.value.trim());
    const passwordValid = isValidPassword(passwordInput.value.trim());
    const buttonActive = emailValid && passwordValid;

    loginButton.disabled = !buttonActive;
    loginButton.style.backgroundColor = buttonActive ? '#7F6AEE' : '#ACA0EB';
  };

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

  // 로그인 처리
  async function login(email, password) {
    // 입력값 유효성 검사
    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!isValidPassword) {
      alert(
        '비밀번호는 8자 이상 20자 이하이며, 영문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      );
      return;
    }

    if (!isValidEmail) {
      alert('올바르지 않은 이메일 입니다.');
    }

    // API 요청 데이터
    const requestData = {
      email,
      password,
    };

    if (isValidEmail(email) && isValidPassword(password)) {
      try {
        // API 호출
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        });

        // 응답 상태 코드 처리
        if (response.status === 200) {
          const result = await response.json();
          alert(`로그인 성공! 환영합니다, ${result.data.nickname}님!`);
          console.log('로그인 응답:', result);

          // 세션에 사용자 정보 저장
          localStorage.setItem('user_nickname', result.data.nickname);

          // 성공 시 대시보드로 이동
          window.location.href = '/post-list';
        } else if (response.status === 400) {
          const result = await response.json();
          alert('로그인 실패: ' + result.message);
        } else if (response.status === 429) {
          alert('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert('알 수 없는 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('로그인 요청 실패:', error);
        alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  }

  // 이벤트 리스너 등록
  emailInput.addEventListener('input', () => {
    const emailValue = email.value.trim();

    if (!emailValue) {
      updateHelperText(emailHelper, '*이메일을 입력해주세요.', 'red');
      console.log('이메일을 입력하세요.');
    } else if (!isValidEmail(emailValue)) {
      updateHelperText(
        emailHelper,
        '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
        'red'
      );
      console.log('올바른 이메일을 입력하세요.');
    } else checkLoginButtonState();
  });

  passwordInput.addEventListener('input', () => {
    const passwordValue = password.value.trim();

    if (!passwordValue) {
      updateHelperText(passwordHelper, '*비밀번호를 입력해주세요.', 'red');
      console.log('비밀번호를 입력하세요.');
    } else if (!isValidPassword(passwordValue)) {
      updateHelperText(
        passwordHelper,
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
        'red'
      );
      console.log('올바른 비밀번호를 입력하세요.');
    } else checkLoginButtonState();
  });

  loginButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    await login(emailValue, passwordValue);
  });

  // 버튼 상태 설정
  checkLoginButtonState();
});
