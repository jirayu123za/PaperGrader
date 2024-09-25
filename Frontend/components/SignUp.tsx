import { Modal, Button } from '@mantine/core';
import Image from 'next/image';

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null} // ตั้งค่า title เป็น null เพื่อไม่ให้แสดงหัวเรื่อง
      withCloseButton={false} // ตั้งค่าไม่ให้แสดงปุ่มปิด
      centered
      overlayProps={{
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 3,
      }}
      styles={{
        content: {
          backgroundColor: '#f5f5dc',
          hight: '500px',
          width: '400px', // ปรับขนาดความกว้างของ modal
          padding: '20px', // เพิ่ม padding ภายใน modal
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
            height: '60px',  // ปรับขนาดความสูงของปุ่ม
            width: '200px',   // ปรับขนาดความกว้างของปุ่ม
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
          className="rounded-full flex items-center justify-center text-lg  "
          style={{
            backgroundColor: '#3457D5',
            color: '#fffffe',
            height: '60px',  // ปรับขนาดความสูงของปุ่ม
            width: '200px',   // ปรับขนาดความกว้างของปุ่ม
          }}
          radius="lg"
        >
          <Image
            src="/icon/GoogleIcon.png"
            alt="Google Logo"
            width={28}
            height={28}
            className="mr-2 text-lg"
          />
          <span>Google</span> 
        </Button>


      </div>
    </Modal>
  );
}
