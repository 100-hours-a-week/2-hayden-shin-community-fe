import { BASE_URL, CDN_URL } from '../config.js';
import { showToastAndRedirect } from './common.js';

async function fetchUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch user profile');
      showToastAndRedirect('Need to log in first', '/login');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('🔥 Error fetching profile data:', error);
  }
  return null;
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('header').textContent = '모두의 이야기';

  try {
    const user = await fetchUserProfile();
    if (user) {
      const headerImage = document.getElementById('header-profile-image');
      if (user.url) {
        headerImage.src = user.url;
      } else {
        headerImage.src = `${CDN_URL}/default-profile-image.jpg`;
      }
    }
  } catch (error) {
    console.error('🔥 Error updating header profile image:', error);
  }
});
