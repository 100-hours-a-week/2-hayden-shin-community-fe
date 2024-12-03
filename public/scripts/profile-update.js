document.addEventListener('DOMContentLoaded', () => {
  const dropdownMenu = document.getElementById('dropdown-menu');
  const profileIcon = document.querySelector('.header-profile-img');

  const newNickname = document.getElementById('nickname');
  const nicknameHelper = document.getElementById('nickname-helper');

  // 토스트 메시지 표시
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = `toast-message`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  };

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

  // 사용자 프로필 데이터 폼에 채우기
  const populateUserProfile = (user) => {
    if (user.nickname) {
      newNickname.value = user.nickname;
    }
  };

  // 닉네임 유효성 검사
  const validateNickname = () => {
    const nickname = newNickname.value.trim();

    if (!nickname) {
      nicknameHelper.textContent = '*닉네임을 입력해주세요.';
      nicknameHelper.style.color = 'red';
    } else if (nickname.length > 10) {
      nicknameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
      nicknameHelper.style.color = 'red';
    } else if (
      users.some((user) => user.nickname === nickname && user !== currentUser)
    ) {
      nicknameHelper.textContent = '*중복된 닉네임 입니다.';
      nicknameHelper.style.color = 'red';
    } else {
      nicknameHelper.textContent = '';
      updateNickname(nickname);
    }
  };

  // 로그아웃 요청
  async function logout() {
    try {
      // API 호출: 로그아웃 요청을 보냄
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 응답 상태 코드에 따른 처리
      if (response.status === 204) {
        // 로그아웃 성공: 로컬 스토리지 삭제 및 로그인 페이지로 리다이렉트
        alert('로그아웃 성공! 로그인 페이지로 이동합니다.');
        localStorage.removeItem('user_nickname'); // 사용자 정보 삭제
        window.location.href = '/login';
      } else if (response.status === 400) {
        const result = await response.json();
        alert('로그아웃 실패: ' + result.message);
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      // 네트워크 또는 기타 오류 처리
      console.error('로그아웃 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 로그아웃 버튼과 이벤트 연결
  const logoutButton = document.getElementById('logout');
  logoutButton.addEventListener('click', logout); // 클릭 시 logout() 함수 호출

  // 회원 탈퇴 이벤트
  modalConfirmButton.addEventListener('click', async () => {
    const password = prompt('비밀번호를 입력하세요:');
    if (password) {
      await deleteAccount(password);
    }
  });

  // 프로필 업데이트 요청
  async function updateProfile(userId) {
    // 입력값 가져오기
    const newNickname = document.getElementById('nickname').value; // 닉네임 필드 값
    const newProfileImage = document.getElementById('profile-image').value; // 프로필 이미지 필드 값

    // 입력값 유효성 검사
    if (!newNickname && !newProfileImage) {
      alert('변경할 닉네임 또는 프로필 이미지를 입력해주세요.');
      return;
    }

    // 닉네임이 입력된 경우, 최대 10자를 초과하지 않도록 검증
    if (newNickname && newNickname.length > 10) {
      alert('닉네임은 최대 10자까지 입력 가능합니다.');
      nicknameHelper.textContent = '*닉네임은 최대 10자까지 작성 가능합니다.';
      return;
    }

    // 프로필 이미지 URL이 입력된 경우, 유효한 URL인지 검증
    if (newProfileImage && !isValidURL(newProfileImage)) {
      alert('올바른 프로필 이미지 URL을 입력해주세요.');
      return;
    }

    // 요청 데이터 생성 (닉네임 또는 프로필 이미지만 포함)
    const requestData = {};
    if (newNickname) requestData.new_nickname = newNickname;
    if (newProfileImage) requestData.new_profile_image = newProfileImage;

    try {
      // API 호출: 닉네임 or 프로필 이미지 업데이트 요청
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // 서버 응답 처리
      if (response.status === 204) {
        alert('프로필이 성공적으로 업데이트되었습니다!');
        console.log('프로필 업데이트 성공');
      } else if (response.status === 400) {
        alert('요청이 잘못되었습니다. 입력값을 확인해주세요.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자입니다. 다시 로그인해주세요.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      // 네트워크 또는 기타 오류 처리
      console.error('프로필 업데이트 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // URL 유효성 검사 함수
  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // 프로필 수정 버튼과 이벤트 연결
  const updateProfileButton = document.getElementById('update-profile-button'); // 프로필 수정 버튼 선택
  updateProfileButton.addEventListener('click', () => {
    const userId = localStorage.getItem('user_id'); // 사용자 ID를 로컬 스토리지에서 가져온다고 가정
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    updateProfile(userId); // 프로필 업데이트 함수 호출
  });

  // 회원탈퇴 요청
  async function deleteAccount(userId) {
    try {
      // DELETE 요청을 통해 계정 삭제
      const response = await fetch(`http://localhost:3000/users/{userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // 비밀번호를 요청 본문으로 전송
      });

      // 서버 응답 상태 코드 처리
      if (response.status === 204) {
        alert('계정이 성공적으로 삭제되었습니다.');
        localStorage.clear(); // 로컬 스토리지 초기화
        window.location.href = '/signup'; // 회원가입 페이지로 이동
      } else if (response.status === 400) {
        alert('요청이 잘못되었습니다. 입력값을 확인해주세요.');
      } else if (response.status === 401) {
        alert('인증되지 않은 사용자이거나 비밀번호가 틀렸습니다.');
      } else if (response.status === 500) {
        alert('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      // 네트워크 또는 기타 오류 처리
      console.error('계정 삭제 요청 실패:', error);
      alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 이벤트 리스너를 통해 삭제 요청 처리
  const deleteAccountButton = document.getElementById('delete-account-button'); // 계정 삭제 버튼 선택
  deleteAccountButton.addEventListener('click', () => {
    const userId = localStorage.getItem('user_id'); // 사용자 ID 가져오기 (가정)

    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    deleteAccount(userId); // deleteAccount 함수 호출
  });

  const modal = document.getElementById('modal');
  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');

  profileIcon.addEventListener('click', toggleDropdownMenu);
  window.addEventListener('click', closeDropdownMenu);
  dropdownMenu.addEventListener('mouseover', handleDropdownHover);
  dropdownMenu.addEventListener('mouseout', handleDropdownHover);

  const handleDropdownClick = (event) => {
    const { id } = event.target;
    const navigationMap = {
      'profile-update': '/profile-update',
      'password-update': '/password-update',
      logout: '/login',
    };

    if (navigationMap[id]) {
      window.location.href = navigationMap[id];
    }
  };

  dropdownMenu.addEventListener('click', handleDropdownClick);

  // 회원 탈퇴 모달
  const openModal = () => {
    modal.style.display = 'block';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  const confirmDeleteAccount = () => {
    deleteAccount();
  };

  deleteAccountButton.addEventListener('click', openModal);
  modalCancelButton.addEventListener('click', closeModal);
  modalConfirmButton.addEventListener('click', confirmDeleteAccount);
  updateProfileButton.addEventListener('click', updateProfile);
});
