import { BASE_URL, CDN_URL } from '../config.js';
import { showToast } from './common.js';

const title = document.getElementById('post-title');
const content = document.getElementById('post-content');
const imageInput = document.getElementById('image-url');
const imagePreview = document.getElementById('image-preview');
const updateButton = document.getElementById('update-post-button');
const charCountDisplay = document.getElementById('char-count');

const MAX_TITLE_LENGTH = 26;

document.addEventListener('DOMContentLoaded', async () => {
  const postId = new URLSearchParams(window.location.search).get('id');

  if (!postId) {
    alert('게시글 ID를 찾을 수 없습니다.');
    window.location.href = '/post-list';
    return;
  }

  try {
    // Fetch existing post data
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('게시글 데이터를 불러올 수 없습니다.');
    }

    const result = await response.json();
    const post = result.data.post;

    // Set existing data
    title.value = post.title;
    content.value = post.content;

    if (post.image) {
      imagePreview.src = `${CDN_URL}${post.image}`;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }

    updateButtonState();
  } catch (error) {
    console.error('🔥 Failed to load post data:', error);
    alert('게시글 데이터를 불러오는 중 문제가 발생했습니다.');
  }

  // Title character limit handler
  title.addEventListener('input', () => {
    if (title.value.length > MAX_TITLE_LENGTH) {
      title.value = title.value.slice(0, MAX_TITLE_LENGTH);
      showToast('제목은 최대 26자까지 작성 가능합니다.');
    }
    updateButtonState();
  });

  // Image upload preview handler
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result; // 📸 Show uploaded image preview
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = ''; // Reset if no image
      imagePreview.style.display = 'none';
    }
  });

  // Update button click handler
  updateButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const newTitle = title.value.trim();
    const newContent = content.value.trim();
    const newimage = imageInput.files[0];

    if (!newTitle || !newContent) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    await editPost(postId, newTitle, newContent, newimage);
  });

  // Set initial button state
  updateButtonState();
});

// Post update request function
async function editPost(postId, newTitle, newText, newimage = null) {
  const formData = new FormData();
  formData.append('title', newTitle);
  formData.append('content', newText);
  if (newimage) formData.append('image', newimage);

  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    });

    if (response.ok) {
      showToast('게시글이 성공적으로 수정되었습니다.');
      setTimeout(() => {
        window.location.href = `/post-view?id=${postId}`;
      }, 2000);
    } else {
      alert('게시글 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('🔥 Failed to update post:', error);
    alert('서버와의 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// Update button state
function updateButtonState() {
  const isValid =
    title.value.trim().length > 0 &&
    title.value.trim().length <= MAX_TITLE_LENGTH &&
    content.value.trim().length > 0;

  updateButton.disabled = !isValid;
  updateButton.style.backgroundColor = isValid ? '#7F6AEE' : '#ACA0EB';
}
