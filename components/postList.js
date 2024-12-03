import React, { useEffect, useState } from 'react';
import { getAllPosts } from '../api/postsApi'; // API 호출 함수 가져오기

const PostList = () => {
  const [posts, setPosts] = useState([]); // 게시글 데이터 상태 관리
  const [error, setError] = useState(null); // 에러 상태 관리

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getAllPosts(); // API 호출
        setPosts(data); // 상태에 데이터 저장
      } catch (err) {
        setError(err.message); // 에러 상태 저장
      }
    };

    fetchPosts();
  }, []); // 컴포넌트가 처음 렌더링될 때 실행

  if (error) return <div>에러 발생: {error}</div>;
  if (!posts.length) return <div>로딩 중...</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          {post.title}: {post.content}
        </li>
      ))}
    </ul>
  );
};

export default PostList;
