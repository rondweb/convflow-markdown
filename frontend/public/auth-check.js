// Script para verificar o processo de autenticação após o redirecionamento do Keycloak

window.onload = function() {
  console.log('Keycloak callback check running...');
  console.log('Current URL:', window.location.href);
  
  // Verificar se estamos em uma URL de callback
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  const code = urlParams.get('code') || hashParams.get('code');
  const sessionState = urlParams.get('session_state') || hashParams.get('session_state');
  const error = urlParams.get('error') || hashParams.get('error');
  
  if (error) {
    console.error('Keycloak authentication error:', error);
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    console.error('Error description:', errorDescription);
    
    // Salvar erro para debug
    sessionStorage.setItem('keycloak-auth-error', error);
    sessionStorage.setItem('keycloak-auth-error-description', errorDescription || '');
  }
  
  if (code) {
    console.log('Authentication code detected in URL');
    
    // Verificar se estamos na página de login e redirecionar
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      console.log('We are on login page with auth code, redirecting to dashboard...');
      // Redirecionar diretamente para dashboard em vez de depender de outros mecanismos
      window.location.href = '/dashboard';
      return;
    }
    
    // Disparar evento personalizado para que o KeycloakService saiba que um callback ocorreu
    const callbackEvent = new Event('keycloak-callback');
    window.dispatchEvent(callbackEvent);
    
    // Salvar informação no sessionStorage para depuração
    sessionStorage.setItem('keycloak-callback-detected', 'true');
    sessionStorage.setItem('keycloak-callback-timestamp', new Date().toISOString());
    sessionStorage.setItem('keycloak-callback-url', window.location.href);
    
    console.log('Keycloak authentication flow should complete shortly...');
  }
  
  // Verificar se o usuário deve estar autenticado
  const authenticated = sessionStorage.getItem('keycloak-authenticated');
  const keycloakInitiated = sessionStorage.getItem('keycloak-login-initiated');
  
  if (authenticated === 'true' && window.location.pathname === '/login') {
    console.log('User appears to be authenticated but is on login page. Redirecting to dashboard...');
    window.location.href = '/dashboard';
  } else if (keycloakInitiated === 'true' && !code && window.location.pathname === '/login') {
    console.log('Login was initiated but we are back on login page without code. Possible error.');
    sessionStorage.removeItem('keycloak-login-initiated');
  }
  
  console.log('Auth check complete.');
};
