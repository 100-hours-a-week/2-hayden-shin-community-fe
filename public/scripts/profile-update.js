document.addEventListener('DOMContentLoaded', () => {
  const dropdownMenu = document.getElementById('dropdown-menu');
  const profileIcon = document.querySelector('.header-profile-img');
  const logout = document.getElementById('logout');
  const editNicknameButton = document.getElementById('edit-nickname-button');
  const nicknameInput = document.getElementById('nickname');
  const nicknameHelper = document.getElementById('nickname-helper');
  const deleteAccountButton = document.getElementById('delete-account-button');
  const modal = document.getElementById('confirmation-modal');
  const modalCancelButton = document.getElementById('modal-cancel-button');
  const modalConfirmButton = document.getElementById('modal-confirm-button');

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

  // 사용자 데이터 가져오기
  const fetchUsers = async () => {
    try {
      const response = await fetch('/data/users.json');
      if (!response.ok) {
        throw new Error('Failed to fetch users data');
      }
      users = await response.json();

      // 현재 사용자 설정 (예: 첫 번째 사용자, 실제로는 인증을 통해 결정)
      currentUser = users[0];
      populateUserProfile(currentUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('사용자 데이터를 불러오는 데 실패했습니다.');
    }
  };

  // 사용자 프로필 데이터 폼에 채우기
  const populateUserProfile = (user) => {
    if (user.nickname) {
      nicknameInput.value = user.nickname;
    }
  };

  // 닉네임 유효성 검사
  const validateNickname = () => {
    const nickname = nicknameInput.value.trim();

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

  // 닉네임 업데이트
  const updateNickname = async (newNickname) => {
    try {
      currentUser.nickname = newNickname; // 로컬 데이터 업데이트
      console.log('Nickname updated:', currentUser); // 서버 통신 시뮬레이션
      showToast('닉네임이 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Error updating nickname:', error);
      showToast('닉네임 수정에 실패했습니다.');
    }
  };

  // 회원 탈퇴 처리
  const deleteAccount = async () => {
    try {
      // 사용자 데이터 삭제 시뮬레이션
      users = users.filter((user) => user !== currentUser);
      console.log('User deleted:', currentUser); // 서버 삭제 시뮬레이션
      showToastAndRedirect('회원 탈퇴가 완료되었습니다.', './login');
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('회원 탈퇴에 실패했습니다.');
    }
  };

  // 로그아웃 요청
  const logout = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        showToastAndRedirect('로그아웃 성공!', './login');
      } else if (response.status === 400) {
        showToast('잘못된 요청입니다.');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      showToast('서버와 연결할 수 없습니다.');
    }
  };

  // 회원탈퇴 요청
  const deleteAccount = async (password) => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.status === 204) {
        showToastAndRedirect('회원 탈퇴가 완료되었습니다.', './login');
      } else if (response.status === 400) {
        showToast('잘못된 요청입니다.');
      } else if (response.status === 401) {
        showToast('인증에 실패했습니다. 비밀번호를 확인하세요.');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('회원 탈퇴에 실패했습니다.');
    }
  };

  // 닉네임 변경 요청
  const updateNickname = async (newNickname) => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${currentUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_nickname: newNickname }),
        }
      );

      if (response.status === 201) {
        showToast('닉네임이 성공적으로 수정되었습니다.');
        currentUser.nickname = newNickname; // 로컬 데이터 업데이트
      } else if (response.status === 400) {
        showToast('닉네임 수정 요청이 잘못되었습니다.');
      } else if (response.status === 401) {
        showToast('인증되지 않은 사용자입니다.');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('Error updating nickname:', error);
      showToast('닉네임 수정에 실패했습니다.');
    }
  };

  //프로필 이미지 변경 요청
  const updateProfileImage = async (newImageURL) => {
    try {
      const response = await fetch(
        `http://localhost:3000/users/${currentUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_profile_image: newImageURL }),
        }
      );

      if (response.status === 201) {
        showToast('프로필 이미지가 성공적으로 수정되었습니다.');
        currentUser.profileImage = newImageURL; // 로컬 데이터 업데이트
      } else if (response.status === 400) {
        showToast('프로필 이미지 요청이 잘못되었습니다.');
      } else if (response.status === 401) {
        showToast('인증되지 않은 사용자입니다.');
      } else {
        throw new Error('서버 오류');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      showToast('프로필 이미지 수정에 실패했습니다.');
    }
  };

  // 헤더 프로필 아이콘 드롭다운
  const toggleDropdownMenu = (event) => {
    event.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === 'block' ? 'none' : 'block';
  };

  const closeDropdownMenu = () => {
    dropdownMenu.style.display = 'none';
  };

  const handleDropdownHover = (event) => {
    if (event.target.tagName === 'LI') {
      event.target.style.backgroundColor =
        event.type === 'mouseover' ? '#E9E9E9' : 'transparent';
    }
  };

  profileIcon.addEventListener('click', toggleDropdownMenu);
  window.addEventListener('click', closeDropdownMenu);
  dropdownMenu.addEventListener('mouseover', handleDropdownHover);
  dropdownMenu.addEventListener('mouseout', handleDropdownHover);

  const handleDropdownClick = (event) => {
    const { id } = event.target;
    const navigationMap = {
      'profile-update': './profile-update',
      'password-update': './password-update',
      logout: './login',
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
  editNicknameButton.addEventListener('click', updateNickname);
});
