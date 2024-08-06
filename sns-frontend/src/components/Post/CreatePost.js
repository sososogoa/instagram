import React, { useState, useCallback, useContext, useEffect } from 'react';
import { Box, Button, Paper, Typography, IconButton, Modal, Grid, Switch, Avatar } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useDropzone } from 'react-dropzone';
import { AuthContext } from '../../context/AuthContext';
import { createPost, uploadFile } from '../../api';
import { useModal } from '../../context/ModalContext';

const CreatePost = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [cropper, setCropper] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const { user: currentUser } = useContext(AuthContext);
  const { notifyNewPostCreated } = useModal();
  const [isPrivate, setIsPrivate] = useState(false);
  const [textLength, setTextLength] = useState(0);
  const [postText, setPostText] = useState('');

  const MAX_TEXT_LENGTH = 2000;

  useEffect(() => {
    if (file) {
      setIsCropping(true);
    }
  }, [file]);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(URL.createObjectURL(acceptedFiles[0]));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    }
  });

  const handleTextChange = (e) => {
    const text = e.target.value;
    setPostText(text);
    setTextLength(text.length);
  };

  const handleFileChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]));
    e.target.value = null;
  };

  const handleCrop = () => {
    if (cropper) {
      const croppedImageDataUrl = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedImageDataUrl);
      setIsExpanded(true);
    }
  };

  const handleBack = () => {
    setShowDiscardModal(true);
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = '';
      if (croppedImage) {
        const byteString = atob(croppedImage.split(',')[1]);
        const mimeString = croppedImage.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        const file = new File([blob], "image.png", { type: "image/png" });
        const response = await uploadFile(file);
        imageUrl = response.data.filePath;
      }

      const postData = { content: postText, imageUrl: imageUrl, user: currentUser.id, isPublic: !isPrivate };
      await createPost(postData);
      notifyNewPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDiscard = () => {
    setFile(null);
    setIsCropping(false);
    setIsDragging(false);
    setShowDiscardModal(false);
    setIsExpanded(false);
    setCroppedImage(null);
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleSwitchChange = (event) => {
    setIsPrivate(event.target.checked);
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-10" onClick={handleOutsideClick}>
      <Box
        {...getRootProps()}
        className="w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Paper
          className="flex flex-col items-center justify-center space-y-4 shadow-lg"
          style={{
            width: isExpanded ? '1200px' : '900px',
            height: '900px',
            transition: 'width 0.25s ease-in-out',
            overflow: 'hidden'
          }}
        >
          {isCropping ? (
            <Grid container className="w-full h-full">
              <Grid item xs={12} className="flex flex-col items-center justify-center space-y-4">
                <Box className="w-full h-full">
                  <Box className="flex justify-between items-center border-b border-gray-300">
                    <IconButton onClick={handleBack}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" className="flex justify-center w-full">{isExpanded ? "새 게시물 만들기" : "자르기"} </Typography>
                    <button
                      onClick={isExpanded ? handleSubmit : handleCrop}
                      className="font-semibold text-blue-500 whitespace-nowrap border-none bg-transparent cursor-pointer pr-4"
                    >
                      {isExpanded ? "공유하기" : "다음"}
                    </button>
                  </Box>
                  <Grid container className="w-full h-full">
                    <Grid item xs={isExpanded ? 8 : 12} className="flex items-center justify-center">
                      <Box className="w-full h-full">
                        {croppedImage ? (
                          <img src={croppedImage} alt="Cropped" className="w-full h-full object-cover" />
                        ) : (
                          <Cropper
                            src={file}
                            style={{ height: '100%', width: '100%' }}
                            aspectRatio={1}
                            guides={true}
                            viewMode={0}
                            responsive={true}
                            autoCropArea={0}
                            checkOrientation={false}
                            onInitialized={(instance) => {
                              setCropper(instance);
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                    {isExpanded && (
                      <Grid item xs={4} className="border-b border-l border-gray-300">
                        <div className="pl-4 pr-4 pt-4 flex items-center mb-4">
                          <Avatar
                            sx={{ width: 40, height: 40 }}
                            src={currentUser.profilePicture ? `http://localhost:5000${currentUser.profilePicture}` : ''}
                          >
                            {!currentUser.profilePicture && currentUser.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <p className='font-semibold ml-2'>{currentUser.username}</p>
                        </div>
                        <textarea
                          placeholder="문구를 입력하세요.."
                          maxLength={MAX_TEXT_LENGTH - 1}
                          onChange={handleTextChange}
                          className="pl-4 w-full h-full border-none outline-none resize-none"
                          style={{
                            width: '100%',
                            height: 'calc(100% - 250px)',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::WebkitScrollbar': {
                              display: 'none'
                            }
                          }}
                        />
                        <div className="flex justify-end w-full border-b pb-2 pr-4 border-gray-300 text-gray-500">
                          {textLength}/{MAX_TEXT_LENGTH}
                        </div>

                        <div className="flex items-center justify-between pt-2 pl-4 pr-4">
                          <p className={`${isPrivate ? `font-semibold text-blue-500` : ``}`}>이 게시물을 비공개 포스트로 게시합니다.</p>
                          <Switch checked={isPrivate} onChange={handleSwitchChange} />
                        </div>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box className="flex flex-col items-center justify-center space-y-4 w-full h-full">
              <Typography variant="h6" className="flex justify-center w-full pb-1 pt-1 border-b border-gray-300">새 게시물 만들기</Typography>
              <div className={`w-full h-full flex flex-col items-center justify-center ${isDragging ? 'bg-gray-200' : ''}`}>
                <input {...getInputProps()} />
                <UploadIcon sx={{ fontSize: 60, color: 'gray' }} />
                {isDragActive ? (
                  <Typography className="text-center text-gray-500 mt-2">
                    여기에 파일을 놓으세요
                  </Typography>
                ) : (
                  <Typography className="text-center text-gray-500 mt-2">
                    사진과 동영상을 여기에 끌어다 놓으세요
                  </Typography>
                )}
                <label htmlFor="file-upload" className="mt-4">
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Button variant="contained" component="span" color="primary">
                    컴퓨터에서 선택
                  </Button>
                </label>
              </div>
              {file && (
                <>
                  <Typography variant="body2" className="text-gray-500 mt-2">
                    {file.name}
                  </Typography>
                  <Button type="submit" variant="contained" color="primary">
                    새 게시물 만들기
                  </Button>
                </>
              )}
            </Box>
          )}

          <Modal
            open={showDiscardModal}
            onClose={handleCancelDiscard}
            className="flex items-center justify-center rounded"
          >
            <Paper className="flex flex-col items-center justify-center shadow-lg">
              <div className={"flex flex-col items-center justify-center p-6"}>
                <Typography variant="h6" className="mb-2">게시물을 삭제하시겠어요?</Typography>
                <Typography className="text-gray-500 mb-4">
                  지금 나가면 수정 내용이 저장되지 않습니다.
                </Typography>
              </div>
              <div onClick={handleDiscard} className={"w-full flex justify-center border-t p-2 cursor-pointer"}>
                <p className="text-red-500">
                  삭제
                </p>
              </div>
              <div onClick={handleCancelDiscard} className={"w-full flex justify-center border-t p-2 cursor-pointer"}>
                <p className="text-gray-500">
                  취소
                </p>
              </div>
            </Paper>
          </Modal>
        </Paper>
      </Box>
    </div>
  );
};

export default CreatePost;
