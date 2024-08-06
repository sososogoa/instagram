import React from 'react';
import { Modal, Box, Button } from '@mui/material';

const UnfollowConfirmationModal = ({ showUnfollowConfirmationModal, setShowUnfollowConfirmationModal, handleUnfollow, unfollowUserId }) => {
  return (
    <Modal open={showUnfollowConfirmationModal} onClose={() => setShowUnfollowConfirmationModal(false)}>
      <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '400px', margin: 'auto', marginTop: '20vh' }}>
        <h2 className="text-lg font-semibold mb-4">언팔로우 확인</h2>
        <p>생각이 바뀌면 상대 사용자님에게 팔로우를 다시 요청할 수 있습니다.</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowUnfollowConfirmationModal(false)} className="mr-2">취소</Button>
          <Button onClick={() => handleUnfollow(unfollowUserId)} className="bg-red-500 text-white">언팔로우</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default UnfollowConfirmationModal;
