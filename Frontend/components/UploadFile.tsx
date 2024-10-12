import React, { useState } from 'react';
import { useFileStore } from '../store/FileStore'; // ตรวจสอบ path ของการนำเข้าให้ถูกต้อง
import { Button, Checkbox } from '@mantine/core';

const UploadFile: React.FC = () => {
  // เรียกใช้ state และฟังก์ชันจาก FileStore
  const { setTemplateFile, templateFile } = useFileStore();
  const [files, setFiles] = useState<File[]>([]); // state สำหรับเก็บไฟล์ทั้งหมดที่อัพโหลด
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null); // state สำหรับเก็บไฟล์ที่เลือกเป็น template

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของไฟล์
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      const newFiles = Array.from(event.currentTarget.files);
      setFiles(newFiles);
    }
  };

  // ฟังก์ชันสำหรับเลือกไฟล์ template
  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index);
    setTemplateFile(files[index]); // ตั้งค่า template ใน store ตามไฟล์ที่เลือก
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4 justify-between"> {/* Flex สำหรับวางปุ่มทางซ้ายและไฟล์ทางขวา */}
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
                  checked={selectedTemplate === index}
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

      <input
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
