import { BASE_URL } from '../config.js';
import { isValidPassword } from './common.js';

document.addEventListener('DOMContentLoaded', () => {
  const password = document.getElementById('new-password');
  const confirmPassword = document.getElementById('confirm-password');

  const newPasswordHelper = document.getElementById('new-password-helper');
  const confirmPasswordHelper = document.getElementById(
    'confirm-password-helper'
  );

  const updatePasswordButton = document.getElementById(
    'update-password-button'
  );

  // Toggle button state
  const toggleButtonState = () => {
    const allValid =
      isValidPassword(password.value.trim()) &&
      password.value === confirmPassword.value;

    updatePasswordButton.disabled = !allValid;
    updatePasswordButton.style.backgroundColor = allValid
      ? '#7F6AEE'
      : '#ACA0EB';
  };

  // Validate new password input
  password.addEventListener('input', () => {
    const passwordValue = password.value;

    if (!passwordValue.trim()) {
      newPasswordHelper.textContent = '*비밀번호를 입력해주세요.';
      newPasswordHelper.style.color = 'red';
    } else if (!isValidPassword(passwordValue)) {
      newPasswordHelper.textContent =
        '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
      newPasswordHelper.style.color = 'red';
    }

    toggleButtonState();
  });

  // Validate confirm password input
  confirmPassword.addEventListener('input', () => {
    const confirmPasswordValue = confirmPassword.value.trim();

    if (!confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호를 한번 더 입력해주세요.';
    } else if (password.value.trim() !== confirmPasswordValue) {
      confirmPasswordHelper.textContent = '*비밀번호와 다릅니다.';
    } else {
      confirmPasswordHelper.textContent = '';
    }

    toggleButtonState();
  });

  // Update password request
  async function updatePassword(password) {
    if (!password) {
      alert('새로운 비밀번호를 입력하세요.');
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/;
    if (!passwordRegex.test(password)) {
      alert(
        '새 비밀번호는 8자 이상 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.'
      );
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        alert('비밀번호가 성공적으로 변경되었습니다!');
      } else if (response.status === 400) {
        alert('잘못된 요청입니다.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자이거나 현재 비밀번호가 틀렸습니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('🔥 Failed to update password:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  updatePasswordButton.addEventListener('click', (e) => {
    e.preventDefault();

    const password = document.getElementById('new-password').value.trim();

    updatePassword(password);
  });
});
