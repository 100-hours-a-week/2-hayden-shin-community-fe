import express from 'express';
import path from 'path';

const app = express();

// 현재 디렉토리 설정
const __dirname = path.resolve();

// 정적 파일 제공을 위한 미들웨어 설정
app.use(express.static(path.join(__dirname, 'public')));

// utils 폴더를 정적 파일로 제공
app.use('/utils', express.static(path.join(__dirname, 'utils')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/signup.html'));
});

app.get('/post-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/post-list.html'));
});

app.get('/post-create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/post-create.html'));
});

app.get('/post-view', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/post-view.html'));
});

app.get('/post-edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/post-edit.html'));
});

app.get('/profile-update', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/profile-update.html'));
});

app.get('/password-update', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/password-update.html'));
});

// health check
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// 서버 시작
const PORT = 2000;
app.listen(PORT, () => {
  console.log(`✨ frontend is listening at port ${PORT}`);
});
