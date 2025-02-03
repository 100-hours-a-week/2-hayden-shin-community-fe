import { BASE_URL } from '../config.js';
import { isValidEmail, isValidPassword } from './common.js';

// Display Lottie animation
function showSuccessAnimation() {
  const successContainer = document.getElementById('success-container');

  if (!successContainer) {
    console.error('❌ success-container element not found');
    return;
  }

  successContainer.style.display = 'flex';

  lottie.loadAnimation({
    container: document.getElementById('lottie-success'),
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: '/assets/Lottie.json',
  });

  setTimeout(() => {
    window.location.href = '/post-list';
  }, 3000);
}

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const emailHelper = document.getElementById('email-helper');
const passwordHelper = document.getElementById('password-helper');

if (
  !emailInput ||
  !passwordInput ||
  !loginButton ||
  !emailHelper ||
  !passwordHelper
) {
  console.error('⚠️ Required elements not found');
}

const checkLoginButtonState = () => {
  const emailValid = emailInput && isValidEmail(emailInput.value.trim());
  const passwordValid =
    passwordInput && isValidPassword(passwordInput.value.trim());
  const buttonActive = emailValid && passwordValid;

  if (loginButton) {
    loginButton.disabled = !buttonActive;
    loginButton.style.backgroundColor = buttonActive ? '#7F6AEE' : '#ACA0EB';
  }
};

// Login request
async function login(email, password) {
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }

  const requestData = {
    email,
    password,
  };

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      showSuccessAnimation();
    } else if (response.status === 400) {
      const result = await response.json();
      alert('Login failed: ' + result.message);
    } else if (response.status === 429) {
      alert('Too many login attempts. Please try again later.');
    } else {
      alert('An unknown error occurred');
    }
  } catch (error) {
    console.error('🔥 Login failed:', error);
    alert('Failed to connect to server. Please try again later.');
  }
}

// Input validation
emailInput?.addEventListener('input', () => {
  const emailValue = emailInput.value.trim();

  if (!emailValue) {
    emailHelper.textContent = '*이메일을 입력해주세요.';
  } else if (!isValidEmail(emailValue)) {
    emailHelper.textContent =
      '*올바른 이메일 형식을 입력해주세요. (예: example@example.com)';
  } else {
    emailHelper.textContent = '';
  }
  checkLoginButtonState();
});

passwordInput?.addEventListener('input', () => {
  const passwordValue = passwordInput.value.trim();

  if (!passwordValue) {
    passwordHelper.textContent = '*비밀번호를 입력해주세요.';
  } else if (!isValidPassword(passwordValue)) {
    passwordHelper.textContent =
      '*비밀번호는 8~20자이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
  } else {
    passwordHelper.textContent = '';
  }
  checkLoginButtonState();
});

loginButton?.addEventListener('click', async (event) => {
  event.preventDefault();

  const emailValue = emailInput?.value.trim();
  const passwordValue = passwordInput?.value.trim();

  if (emailValue && passwordValue) {
    await login(emailValue, passwordValue);
  }
});

// Set initial button state
checkLoginButtonState();
