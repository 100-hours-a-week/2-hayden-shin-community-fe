import { BASE_URL } from '../config.js';

const titleInput = document.getElementById('post-title');
const contentInput = document.getElementById('post-content');
const postButton = document.getElementById('post-button');
const postHelper = document.getElementById('post-helper');
const imagePreview = document.getElementById('image-preview');

const checkAllValid = () => {
  return (
    titleInput.value.trim().length > 0 && contentInput.value.trim().length > 0
  );
};

// Title input limit
titleInput.addEventListener('input', () => {
  if (titleInput.value.length > 26) {
    titleInput.value = titleInput.value.substring(0, 26); // 26 char limit
  }
});

// Image upload preview
const imageFileInput = document.getElementById('image-url');
imageFileInput.addEventListener('change', () => {
  const file = imageFileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.style.display = 'block';
      imagePreview.src = e.target.result; // Show uploaded image preview
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = ''; // Reset if no image
    imagePreview.style.display = 'none';
  }
});

// Create post request
async function createPost(title, content, imageFile = null) {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    // Handle server response status codes
    if (response.status === 201) {
      window.location.href = '/post-list';
    } else if (response.status === 400) {
      alert('⚠️ Invalid request. Please check title and content.');
    } else if (response.status === 500) {
      alert('🔧 Internal server error. Please try again later.');
    } else {
      alert('❌ Unknown error occurred.');
    }
  } catch (error) {
    console.error('🔥 Failed to create post:', error);
    alert('📡 Connection failed. Please try again later.');
  }
}

postButton.addEventListener('click', (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const imageFile = imageFileInput.files[0];

  createPost(title, content, imageFile);
});

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('input', () => {
    postButton.disabled = !checkAllValid();
    postButton.style.backgroundColor = checkAllValid() ? '#7F6AEE' : '#ACA0EB';
  });
});
