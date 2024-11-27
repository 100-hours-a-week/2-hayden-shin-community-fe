import express from 'express';
import path from 'path';

const app = express();

// 현재 디렉토리 설정
const __dirname = path.resolve();

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'signup.html'));
});

app.get('/posts', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'post-list.html'));
});

app.get('/posts/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'post-create.html'));
});

app.get('/posts/:post_id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'post-view.html'));
});

app.get('/posts/:post_id/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'post-edit.html'));
});

app.get('/users/profile-update', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'profile-update.html'));
});

app.get('/users/password-update', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages', 'password-update.html'));
});

// const pagesDir = path.join(__dirname, 'public/pages');

// app.get('/:page', (req, res) => {
//   const page = req.params.page;
//   const filePath = path.join(pagesDir, `${page}`);

//   // 파일 존재 여부 확인
//   res.sendFile(filePath, (err) => {
//     if (err) {
//       res.status(404).send(`File not found: ${filePath}`);
//     }
//   });
// });

// 서버 시작
const PORT = 2000;
app.listen(PORT, () => {
  console.log(`프론트엔드 서버가 PORT ${PORT} 에서 실행 중입니다.`);
});
