const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const nickname = document.getElementById('nickname');
const profileImage = document.getElementById('profile-image');
const signupButton = document.getElementById('signup-button');

// 헬퍼 텍스트 요소
const [
  emailHelper,
  passwordHelper,
  confirmPasswordHelper,
  nicknameHelper,
  profileImageHelper,
] = [
  'email-helper',
  'password-helper',
  'confirm-password-helper',
  'nickname-helper',
  'profile-image-helper',
].map((id) => document.getElementById(id));

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
    password
  );

const checkAllValid = () =>
  isValidEmail(email.value) &&
  isValidPassword(password.value) &&
  password.value === confirmPassword.value &&
  nickname.value.trim().length > 0 &&
  nickname.value.trim().length <= 10;

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

email.addEventListener('input', async () => {
  const emailValue = email.value;
  const validations = [
    {
      condition: () => !emailValue.trim(),
      message: '*이메일을 입력해주세요.',
      color: 'red',
    },
    {
      condition: () => !isValidEmail(emailValue),
      message: '*올바른 이메일 주소 형식을 입력해주세요.',
      color: 'red',
    },
  ];

  for (const validation of validations) {
    if (validation.condition && (await validation.condition())) {
      emailHelper.textContent = validation.message;
      emailHelper.style.color = validation.color;
      return;
    }
  }

  emailHelper.textContent = '올바른 이메일 형식입니다.';
  emailHelper.style.color = 'green';
});

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
      condition: () => true,
      message: '사용 가능한 닉네임입니다.',
      color: 'green',
    },
  ])
);

profileImage.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    profileImageHelper.textContent = '*프로필 사진을 추가해주세요.';
    profileImageHelper.style.color = 'red';
  } else {
    profileImageHelper.textContent = '프로필 사진이 업로드되었습니다.';
    profileImageHelper.style.color = 'green';

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

async function signup(profileImage, email, password, nickname) {
  // 입력값 유효성 검사
  if (!email || !password || !nickname) {
    alert('이메일, 비밀번호, 닉네임은 필수 입력값입니다.');
    return;
  }

  if (password.length < 8 || password.length > 20) {
    alert('비밀번호는 8자 이상 20자 이하로 입력해주세요.');
    return;
  }

  // 비밀번호 형식 확인 (영문자, 숫자, 특수문자를 각각 포함)
  if (!isValidPassword(password.value)) {
    alert(
      '비밀번호는 영문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.'
    );
    return;
  }

  // API 요청 데이터
  const requestData = {
    profile_url: profileImage || null, // 선택적 필드
    email,
    password,
    nickname,
  };

  try {
    // API 호출
    const response = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestData),
    });

    // 응답 상태 코드 처리
    if (response.status === 201) {
      const result = await response.json();
      alert('회원가입 성공! 사용자 ID: ' + result.data.id);
      console.log('회원가입 응답:', result);

      // 성공 시 로그인 페이지로 이동
      window.location.href = '/login';
    } else if (response.status === 400) {
      const result = await response.json();
      alert('회원가입 실패: ' + result.message);
    } else {
      alert('알 수 없는 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error('회원가입 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// HTML 폼 이벤트와 연결
const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // 상위에서 선언된 DOM 요소를 그대로 사용하여 값 참조
  const emailValue = email.value;
  const passwordValue = password.value;
  const nicknameValue = nickname.value;
  const profileImageValue = profileImage.value;

  // signup 함수 호출
  await signup(profileImageValue, emailValue, passwordValue, nicknameValue);
});

signupForm.addEventListener('input', () => {
  signupButton.disabled = !checkAllValid();
  signupButton.style.backgroundColor = checkAllValid() ? '#7F6AEE' : '#ACA0EB';
});
