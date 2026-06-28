'use client';

import Alert from '@cloudscape-design/components/alert';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { isApiError } from '@/lib/api/errors';
import { useAuth } from '@/providers/auth-provider';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo1234');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(isApiError(err) ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container header={<Header variant="h2">Sign in to AWS Console (Clone)</Header>}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
      >
        <Form
          actions={
            <Button variant="primary" formAction="submit" loading={submitting}>
              Sign in
            </Button>
          }
        >
          <SpaceBetween size="m">
            {error ? (
              <Alert type="error" header="Could not sign in">
                {error}
              </Alert>
            ) : null}
            <FormField label="Email">
              <Input
                value={email}
                onChange={(e) => setEmail(e.detail.value)}
                type="email"
                autoFocus
                disabled={submitting}
              />
            </FormField>
            <FormField
              label="Password"
              description="Demo credentials: demo@example.com / demo1234"
            >
              <Input
                value={password}
                onChange={(e) => setPassword(e.detail.value)}
                type="password"
                disabled={submitting}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    </Container>
  );
}
