import React from 'react';
import { Modal, Box, Button } from '@mui/material';

const RemoveFollowerConfirmationModal = ({ showRemoveConfirmationModal, setShowRemoveConfirmationModal, handleRemoveConfirm, selectedFollower }) => {
  return (
    <Modal open={showRemoveConfirmationModal} onClose={() => setShowRemoveConfirmationModal(false)}>
      <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '400px', margin: 'auto', marginTop: '20vh' }}>
        <h2 className="text-lg font-semibold mb-4">팔로워를 삭제하시겠어요?</h2>
        <p>{selectedFollower?.username}님은 회원님의 팔로워 리스트에서 삭제된 사실을 알 수 없습니다.</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowRemoveConfirmationModal(false)} className="mr-2">취소</Button>
          <Button onClick={handleRemoveConfirm} className="bg-red-500 text-white">삭제</Button>
        </div>
      </Box>
    </Modal>
  );
};

export default RemoveFollowerConfirmationModal;
