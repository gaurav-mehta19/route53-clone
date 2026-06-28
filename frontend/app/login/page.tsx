'use client';

import Box from '@cloudscape-design/components/box';
import Spinner from '@cloudscape-design/components/spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/features/auth/login-form';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Box
      padding={{ top: 'xxxl' }}
      textAlign="center"
    >
      <div style={{ display: 'inline-block', minWidth: 420, textAlign: 'left' }}>
        <LoginForm />
      </div>
    </Box>
  );
}
