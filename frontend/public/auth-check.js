// Script para verificar o processo de autenticação após o redirecionamento do Keycloak

window.onload = function() {
  console.log('Keycloak callback check running...');
  
  // Verificar se estamos em uma URL de callback
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  const code = urlParams.get('code') || hashParams.get('code');
  const sessionState = urlParams.get('session_state') || hashParams.get('session_state');
  
  if (code) {
    console.log('Authentication code detected in URL');
    
    // Disparar evento personalizado para que o KeycloakService saiba que um callback ocorreu
    const callbackEvent = new Event('keycloak-callback');
    window.dispatchEvent(callbackEvent);
    
    // Salvar informação no sessionStorage para depuração
    sessionStorage.setItem('keycloak-callback-detected', 'true');
    sessionStorage.setItem('keycloak-callback-timestamp', new Date().toISOString());
    
    console.log('Keycloak authentication flow should complete shortly...');
  }
  
  // Verificar se o usuário deve estar autenticado
  const authenticated = sessionStorage.getItem('keycloak-authenticated');
  if (authenticated === 'true' && window.location.pathname === '/login') {
    console.log('User appears to be authenticated but is on login page. Redirecting to dashboard...');
    window.location.href = '/dashboard';
  }
};
