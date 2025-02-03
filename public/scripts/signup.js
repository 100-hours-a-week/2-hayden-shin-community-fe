/*
회원가입 성공 alert 삭제
현재 focusout 시 helper text 작업중
*/

import { isValidEmail, isValidPassword } from './common.js';
import { BASE_URL } from '../config.js';

const checkAllValid = () => {
  return (
    isValidEmail(email.value.trim()) &&
    isValidPassword(password.value.trim()) &&
    password.value === confirmPassword.value &&
    username.value.trim().length > 0 &&
    username.value.trim().length <= 10
  );
};

/*
              --- email ---
*/
const validateEmail = (emailValue = '') => {
  if (!emailValue) {
    emailHelper.textContent = '*이메일을 입력해주세요.';
  } else if (!isValidEmail(emailValue)) {
    emailHelper.textContent = '*올바른 이메일 주소 형식을 입력해주세요.';
  } else {
    emailHelper.textContent = '';
  }
};

const email = document.getElementById('email');
const emailHelper = document.getElementById('email-helper');
email.addEventListener('input', async () => {
  validateEmail(email.value.trim());
});

/*
              --- password ---
*/
const validatePassword = (passwordValue = null) => {
  if (!passwordValue) {
    passwordHelper.textContent = '*비밀번호를 입력해주세요.';
  } else if (!isValidPassword(passwordValue)) {
    passwordHelper.textContent =
      '*비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
  } else {
    passwordHelper.textContent = '';
  }
};

const password = document.getElementById('password');
const passwordHelper = document.getElementById('password-helper');
password.addEventListener('input', () => {
  validatePassword(password.value.trim());
});

/*
              --- confirm password ---
*/
const validateConfirmPassword = (confirmPassword = '') => {
  if (!confirmPassword) {
    confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordHelper.textContent = '*비밀번호가 일치하지 않습니다.';
  } else {
    confirmPasswordHelper.textContent = '';
  }
};
const confirmPassword = document.getElementById('confirm-password');
const confirmPasswordHelper = document.getElementById(
  'confirm-password-helper'
);
confirmPassword.addEventListener('input', () => {
  validateConfirmPassword(confirmPassword.value.trim());
});

/*
              --- username ---
*/

const validateUsername = (username) => {
  if (!username) {
    usernameHelper.textContent = '*닉네임을 입력해주세요.';
  } else if (username.length > 10) {
    usernameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
  } else {
    usernameHelper.textContent = '';
  }
};
const username = document.getElementById('username');
const usernameHelper = document.getElementById('username-helper');
username.addEventListener('input', () => {
  validateUsername(username.value.trim());
});

/*
              --- profile-image ---
*/
const url = document.querySelector('.image-placeholder');
const fileInput = document.getElementById('profile-image');
url.addEventListener('click', () => {
  fileInput.click();
});
const urlHelper = document.getElementById('profile-image-helper');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) {
    urlHelper.textContent = '*프로필 사진을 추가해주세요.';
    return;
  }

  // 이미지 미리보기
  urlHelper.textContent = '';
  const reader = new FileReader();
  reader.onload = () => {
    url.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// 회원가입 요청
async function signup(email, password, username, url = null) {
  if (!email || !password || !username) {
    alert('이메일, 비밀번호, 닉네임은 필수 입력값입니다.');
    return;
  }

  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('username', username);

  if (url) {
    formData.append('image', url);
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (response.status === 201) {
      const result = await response.json();
      console.log(`회원가입 데이터: ${result.data}`);
      window.location.href = '/login';
    } else if (response.status === 400) {
      const result = await response.json();
      alert('회원가입 실패: ' + result.message);
    } else {
      showToast(`${message}: 알 수 없는 오류가 발생했습니다.`);
    }
  } catch (error) {
    console.error('회원가입 요청 실패:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

const signupButton = document.getElementById('signup-button');
const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const usernameValue = username.value.trim();
  const urlValue = fileInput.files[0];

  await signup(emailValue, passwordValue, usernameValue, urlValue);
});

document.addEventListener('focusout', (event) => {
  const target = event.target;

  if (
    target.id === 'email' ||
    target.id === 'password' ||
    target.id === 'confirm-password' ||
    target.id === 'username'
  ) {
    if (target.id === 'email') {
      validateEmail(target.value.trim());
    } else if (target.id === 'password') {
      validatePassword(target.value.trim());
    } else if (target.id === 'confirm-password') {
      validateConfirmPassword(target.value.trim());
    } else if (target.id === 'username') {
      validateUsername(target.value.trim());
    }
  }
});

/*
              --- 버튼 활성화 ---
*/

signupForm.addEventListener('input', () => {
  signupButton.disabled = !checkAllValid();
  signupButton.style.backgroundColor = checkAllValid() ? '#7F6AEE' : '#ACA0EB';
});
