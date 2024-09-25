import React from 'react';
import { Modal, Button } from '@mantine/core';
import Image from 'next/image';
import { useGoogleLogin } from '../hooks/useGoogleLogin'; // import custom hook

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const { loginWithGoogle, loading, error } = useGoogleLogin(); // ใช้ custom hook ที่สร้างไว้

  const handleGoogleClick = () => {
    loginWithGoogle(); // เรียกใช้งานฟังก์ชัน loginWithGoogle
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      withCloseButton={false}
      centered
      overlayProps={{
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 3,
      }}
      styles={{
        content: {
          backgroundColor: '#f5f5dc',
          height: '240px',
          width: '400px',
          padding: '20px',
        },
      }}
    >
      <div className="flex flex-col space-y-4 items-center">
        {/* ปุ่ม CMU พร้อมไอคอน */}
        <Button
          className="rounded-full flex items-center justify-center"
          style={{
            backgroundColor: '#9b59b6',
            color: '#fffffe',
            height: '60px',
            width: '200px',
          }}
          radius="lg"
        >
          <Image
            src="/icon/Chiang_Mai_University.svg.png"
            alt="CMU Logo"
            width={28}
            height={28}
            className="mr-2 text-lg"
          />
          <span>CMU Account</span>
        </Button>

        {/* ปุ่ม Google สี Default */}
        <Button
          className="rounded-full flex items-center justify-center text-lg"
          style={{
            backgroundColor: '#3457D5',
            color: '#fffffe',
            height: '60px',
            width: '200px',
          }}
          radius="lg"
          onClick={handleGoogleClick} // เรียกใช้งานเมื่อคลิกปุ่ม Google
          disabled={loading} // ปิดการใช้งานปุ่มเมื่อกำลังโหลด
        >
          <Image
            src="/icon/GoogleIcon.png"
            alt="Google Logo"
            width={28}
            height={28}
            className="mr-2 text-lg"
          />
          <span>{loading ? 'Logging in...' : 'Google'}</span> {/* แสดงข้อความ loading */}
        </Button>

        {/* แสดงข้อความ error ถ้ามี */}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </Modal>
  );
}
