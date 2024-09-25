import React, { useCallback } from 'react';
import { useFileStore } from '../store/FileStore';
import { useUploadFile } from '../hooks/UploadFile';

const UploadFile = () => {
  const { setFile } = useFileStore();
  const { mutate: uploadFile } = useUploadFile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleUpload = () => {
    uploadFile(); // ทำการอัปโหลดไฟล์
  };
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setFile(file);
    }
  }, [setFile]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[#f5f5dc]">

      {/* Drop files area */}
      <div
        className="border-dashed border-2 border-gray-400 rounded-md w-2/3 h-[40vh] flex items-center justify-center bg-white text-gray-700 mb-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        Drop files area
      </div>

      {/* Button and description in the center */}
      <div className="flex flex-col items-center bg-[#edf4e0] p-4 rounded-md shadow-md absolute top-4 right-4">
        <p className="text-center text-gray-700 mb-2">
          Drop file anywhere on the page or select file using the button
        </p>
        <label className="bg-[#b7410e] text-white px-4 py-2 rounded-md cursor-pointer">
          SELECT PDF FILES
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf"
          />
        </label>
      </div>

      {/* Invisible button for handling upload */}
      <button onClick={handleUpload} className="hidden">
        Upload
      </button>
    </div>
  );
};

export default UploadFile;
