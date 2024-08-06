import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      const { token, user } = response.data;
      handleLogin(token, user);
      navigate('/');
    } catch (error) {
      console.error('로그인 실패', error);
      setError('로그인에 실패했습니다. 입력한 정보를 확인해주세요.');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="w-full md:w-1/2 max-w-md">
      <div className="max-w-md mx-auto my-5 p-6 bg-white border border-gray-300">
        <h1 className="text-4xl font-cursive text-center mb-8">Instagram</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 transition duration-200"
          >
            로그인
          </button>
        </form>
        {/* <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">또는</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <p className="text-center text-sm text-blue-900 mt-4">비밀번호를 잊으셨나요?</p> */}
      </div>
      <div className="max-w-md mx-auto mt-4 p-4 bg-white border border-gray-300 text-center">
        <p className="text-sm">
          계정이 없으신가요? <a href="/register" className="text-blue-500 font-semibold">가입하기</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
