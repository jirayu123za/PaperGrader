import React from 'react';
import Image from 'next/image';
import { Modal, Button } from '@mantine/core';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { useCMULogin } from '@/hooks/useCMULogin';

interface SignInProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignIn({ opened, onClose }: SignInProps) {
  const { loginWithGoogle, loading: isGoogleLoading, error: googleError } = useGoogleLogin();
  const { loginWithCMU, loading: isCMULoading, error: cmuError } = useCMULogin();

  const handleGoogleClick = () => {
    loginWithGoogle();
  };

  const handleCMUClick = () => {
    loginWithCMU();
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
        blur: 5,
      }}
      radius="lg"
      transitionProps={{
        transition: 'fade',
        duration: 150,
        timingFunction: 'ease',
      }}
      styles={{
        content: {
          backgroundColor: '#f5f5dc',
          height: '280px',
          width: '420px',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <div className="flex flex-col space-y-4 items-center">
        <Button
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: '#9b59b6',
            color: '#fffffe',
            height: '65px',
            width: '220px',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
          radius="xl"
          onClick={handleCMUClick}
          disabled={isCMULoading}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#8e44ad')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9b59b6')}
        >
          <Image
            src="/icon/Chiang_Mai_University.svg.png"
            alt="CMU Logo"
            width={28}
            height={28}
            className="mr-3"
          />
          <span>CMU Account</span>
        </Button>

        <Button
          className="rounded-full flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: '#3457D5',
            color: '#fffffe',
            height: '65px',
            width: '220px',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
          radius="xl"
          onClick={handleGoogleClick}
          disabled={isGoogleLoading}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3457F5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3457D5')}
        >
          <Image
            src="/icon/GoogleIcon.png"
            alt="Google Logo"
            width={28}
            height={28}
            className="mr-3"
          />
          <span>Google</span>
        </Button>
      </div>
    </Modal>
  );
}