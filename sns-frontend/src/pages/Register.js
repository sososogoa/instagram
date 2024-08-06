import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { Modal, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

const MAX_FILE_SIZE = 1 * 1024 * 1024;

const Input = styled('input')({
  display: 'none',
});

const Overlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  borderRadius: '50%',
}));

const AvatarWrapper = styled('div')({
  position: 'relative',
  width: 80,
  height: 80,
  '&:hover': {
    cursor: 'pointer',
  },
  '&:hover .overlay': {
    opacity: 1,
  },
});

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setOpen(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProfileImage(null);
      setImagePreview('');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('파일 크기가 1MB를 초과합니다.');
      setOpen(true);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      setOpen(true);
      return;
    }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ username, email, password, profileImage });
      navigate('/');
    } catch (error) {
      console.error('회원가입 실패', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xs">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-4xl font-cursive text-center mb-6">Instagram</h1>
          <h2 className="text-center font-bold text-lg text-gray-700 mb-4">친구들의 사진과 동영상을 보려면 가입하세요.</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center mb-4">
              <label htmlFor="profile-image-upload">
                <Input accept="image/*" id="profile-image-upload" type="file" onChange={handleImageChange} />
                <AvatarWrapper>
                  <Avatar
                    sx={{ width: 80, height: 80, bgcolor: blue[500] }}
                    src={imagePreview}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Overlay className="overlay">
                    <AddAPhotoIcon />
                  </Overlay>
                </AvatarWrapper>
              </label>
            </div>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              type="text"
              placeholder="아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              type="text"
              placeholder="이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              가입
            </button>
          </form>
        </div>
        <div className="text-center">
          <p className="text-sm">
            계정이 있으신가요? <a href="/" className="text-blue-500 font-semibold">로그인</a>
          </p>
        </div>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            파일 오류
          </Typography>
          <Typography sx={{ mt: 2 }}>
            {error}
          </Typography>
          <Button onClick={handleClose} sx={{ mt: 2 }} variant="contained" color="primary">
            확인
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Register;
