document.addEventListener('DOMContentLoaded', () => {
  // 사용자 데이터 저장 변수
  let users = [];

  const signupForm = document.querySelector('.signup-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirm-password');
  const nickname = document.getElementById('nickname');
  const profileUpload = document.getElementById('profile-upload');
  const signupButton = document.getElementById('signup-button');

  // 헬퍼 텍스트 요소
  const [
    emailHelper,
    passwordHelper,
    confirmPasswordHelper,
    nicknameHelper,
    profilePictureHelper,
  ] = [
    'email-helper',
    'password-helper',
    'confirm-password-helper',
    'nickname-helper',
    'profile-picture-helper',
  ].map((id) => document.getElementById(id));

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
      password
    );

  const checkEmailDuplication = (email) =>
    users.some((user) => user.email === email);

  const checkNicknameDuplication = (nickname) =>
    users.some((user) => user.nickname === nickname);

  const checkAllValid = () =>
    isValidEmail(email.value) &&
    !checkEmailDuplication(email.value) &&
    isValidPassword(password.value) &&
    password.value === confirmPassword.value &&
    nickname.value.trim().length > 0 &&
    nickname.value.trim().length <= 10 &&
    !checkNicknameDuplication(nickname.value.trim());

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

  // 사용자 데이터 추가 (회원가입 시뮬레이션)
  const signup = async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('회원가입 성공:', result);
        showToastAndRedirect('회원가입이 완료되었습니다.', './login', 2000);
      } else if (response.status === 400) {
        const error = await response.json();
        console.error('잘못된 요청:', error);
        showToast('입력값을 확인해주세요.');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
      showToast('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 사용자 데이터 추가 (회원가입 시뮬레이션)
  const addUser = async () => {
    try {
      const newUser = {
        email: email.value.trim(),
        password: password.value.trim(),
        nickname: nickname.value.trim(),
        profilePicture: profileUpload.files[0]
          ? URL.createObjectURL(profileUpload.files[0])
          : null,
      };

      // 로컬에 새 사용자 추가
      users.push(newUser);

      console.log('New user added:', newUser); // 서버 저장 시뮬레이션
      showToastAndRedirect(
        '회원가입이 완료되었습니다.',
        '/pages/login.html',
        2000
      );
    } catch (error) {
      console.error('Error adding user:', error);
      showToast('회원가입에 실패했습니다.');
    }
  };

  // 이벤트 핸들러
  const validateInput = (input, helper, validations) => {
    for (const { condition, message, color } of validations) {
      if (condition()) {
        helper.textContent = message;
        helper.style.color = color;
        return;
      }
    }
    helper.textContent = '';
  };

  email.addEventListener('input', () =>
    validateInput(email, emailHelper, [
      {
        condition: () => !email.value.trim(),
        message: '*이메일을 입력해주세요.',
        color: 'red',
      },
      {
        condition: () => !isValidEmail(email.value),
        message:
          '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)',
        color: 'red',
      },
      {
        condition: () => checkEmailDuplication(email.value),
        message: '*중복된 이메일입니다.',
        color: 'red',
      },
      {
        condition: () => true,
        message: '올바른 이메일 형식입니다.',
        color: 'green',
      },
    ])
  );

  password.addEventListener('input', () =>
    validateInput(password, passwordHelper, [
      {
        condition: () => !password.value.trim(),
        message: '*비밀번호를 입력해주세요.',
        color: 'red',
      },
      {
        condition: () => !isValidPassword(password.value),
        message:
          '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.',
        color: 'red',
      },
      {
        condition: () => true,
        message: '안전한 비밀번호입니다.',
        color: 'green',
      },
    ])
  );

  confirmPassword.addEventListener('input', () =>
    validateInput(confirmPassword, confirmPasswordHelper, [
      {
        condition: () => !confirmPassword.value.trim(),
        message: '*비밀번호를 한번 더 입력해주세요.',
        color: 'red',
      },
      {
        condition: () => password.value !== confirmPassword.value,
        message: '*비밀번호가 일치하지 않습니다.',
        color: 'red',
      },
      {
        condition: () => true,
        message: '비밀번호가 일치합니다.',
        color: 'green',
      },
    ])
  );

  nickname.addEventListener('input', () =>
    validateInput(nickname, nicknameHelper, [
      {
        condition: () => !nickname.value.trim(),
        message: '*닉네임을 입력해주세요.',
        color: 'red',
      },
      {
        condition: () => nickname.value.trim().length > 10,
        message: '*닉네임은 최대 10자까지 작성 가능합니다.',
        color: 'red',
      },
      {
        condition: () => checkNicknameDuplication(nickname.value.trim()),
        message: '*중복된 닉네임입니다.',
        color: 'red',
      },
      {
        condition: () => true,
        message: '사용 가능한 닉네임입니다.',
        color: 'green',
      },
    ])
  );

  profileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      profilePictureHelper.textContent = '*프로필 사진을 추가해주세요.';
      profilePictureHelper.style.color = 'red';
    } else {
      profilePictureHelper.textContent = '프로필 사진이 업로드되었습니다.';
      profilePictureHelper.style.color = 'green';

      const reader = new FileReader();
      reader.onload = () => {
        const img =
          document.querySelector('.profile-img-placeholder img') ||
          document.createElement('img');
        img.src = reader.result;
        img.alt = 'Uploaded Profile Image';
        img.style.cssText = 'border-radius: 50%; width: 100px; height: 100px;';
        if (!img.parentNode)
          document.querySelector('.profile-img-placeholder').appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  signupForm.addEventListener('input', () => {
    signupButton.disabled = !checkAllValid();
    signupButton.style.backgroundColor = checkAllValid()
      ? '#7F6AEE'
      : '#ACA0EB';
  });

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (checkAllValid()) {
      await addUser(); // 사용자 데이터 추가
    } else {
      showToast('모든 필드를 올바르게 입력해주세요.');
    }
  });

  // 초기화
  fetchUsers(); // 기존 사용자 데이터 가져오기
});
