'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/login/LoginForm';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  
  return <LoginForm callbackUrl={callbackUrl} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}