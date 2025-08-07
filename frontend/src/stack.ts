import { StackClientApp } from '@stackframe/react';
import { useNavigate } from 'react-router-dom';

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || '850610a8-d033-4fc9-a3e5-f2511f7ee7bb',
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pk_8536052_2O03IH25LUZXV50QPLZ6JWS19HPV75A6',
  tokenStore: 'cookie',
  redirectMethod: { useNavigate },
});
