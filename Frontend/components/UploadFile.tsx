import React from 'react';
import { useFileStore } from '../store/useFileStore';
import { Button, Checkbox, Input } from '@mantine/core';

const UploadFile: React.FC = () => {
   const { files, addFile, templateFile, setTemplateFile } = useFileStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      const newFiles = Array.from(event.currentTarget.files);
      newFiles.forEach(file => {
        addFile(file);
      });
    }
  };

  const handleTemplateSelect = (index: number) => {
    setTemplateFile(files[index]);
  };

  return (
    <div className="flex flex-col gap-4">
    <div className="flex items-start gap-4 justify-between">
      <Button
        onClick={() => document.getElementById('fileInput')?.click()}
        variant="default"
        size="xs"
      >
        Select PDF(s)
      </Button>

      {/* ส่วนแสดงไฟล์ทั้งหมดทางขวา */}
      <div className="flex flex-col gap-2">
        {files.length > 0 ? (
          files.map((file, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={templateFile === file}
                onChange={() => handleTemplateSelect(index)}
                label={file.name}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-700">No files uploaded yet.</p>
        )}
      </div>
    </div>

    <Input
      type="file"
      id="fileInput"
      accept=".pdf"
      multiple
      style={{ display: 'none' }}
      onChange={handleFileChange}
    />
  </div>
  );
};

export default UploadFile;
