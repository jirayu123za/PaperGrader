import React from 'react';
import { useFileStore } from '../store/FileStore'; // ตรวจสอบ path ของการนำเข้าให้ถูกต้อง
import { Button } from '@mantine/core';

const UploadFile: React.FC = () => {
  // เรียกใช้ state และฟังก์ชันจาก FileStore
  const { setTemplateFile, templateFile } = useFileStore();

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของไฟล์
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      setTemplateFile(event.currentTarget.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-4"> {/* ใช้ flex และ gap สำหรับจัดเรียงและเพิ่มระยะห่าง */}
      {/* แสดงชื่อไฟล์ที่ถูกเลือกอยู่ทางซ้าย */}
      {templateFile && (
        <p className="text-sm text-gray-700">Selected file: {templateFile.name}</p>
      )}
      {/* ปุ่มสำหรับเลือกไฟล์อยู่ทางขวา */}
      <input
        type="file"
        id="fileInput"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        onClick={() => document.getElementById('fileInput')?.click()}
        variant="default"
        size="xs"
      >
        Select PDF
      </Button>
    </div>
  );
};

export default UploadFile;
