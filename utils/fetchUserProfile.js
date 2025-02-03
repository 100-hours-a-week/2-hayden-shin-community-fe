import { BASE_URL } from '../config.js';
import { showToast } from '../scripts/common.js';

export async function fetchUserProfile() {
  try {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      return result.data;
    } else {
      showToast('Need to log in first!');
      window.location.href = '/login';
    }
  } catch (error) {
    console.log(error);
  }
}
