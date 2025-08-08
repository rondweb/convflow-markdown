// Script aprimorado para verificar o processo de autenticação após o redirecionamento do Keycloak

window.onload = function() {
  console.log('Keycloak auth check running...');
  console.log('Current URL:', window.location.href);
  
  // Verificar se estamos em uma URL de callback
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  const code = urlParams.get('code') || hashParams.get('code');
  const sessionState = urlParams.get('session_state') || hashParams.get('session_state');
  const error = urlParams.get('error') || hashParams.get('error');
  
  // Registrar detalhes para debug
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pathname: window.location.pathname,
    hasCode: !!code,
    hasSessionState: !!sessionState,
    hasError: !!error,
    authState: localStorage.getItem('keycloak-token') ? 'token-exists' : 'no-token'
  };
  
  // Salvar informações de debug
  try {
    const debugHistory = JSON.parse(localStorage.getItem('keycloak-debug-history') || '[]');
    debugHistory.push(debugInfo);
    // Manter apenas últimas 10 entradas
    if (debugHistory.length > 10) {
      debugHistory.shift();
    }
    localStorage.setItem('keycloak-debug-history', JSON.stringify(debugHistory));
  } catch (e) {
    console.error('Error saving debug history:', e);
  }
  
  if (error) {
    console.error('Keycloak authentication error:', error);
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    console.error('Error description:', errorDescription);
    
    // Salvar erro para debug
    localStorage.setItem('keycloak-auth-error', error);
    localStorage.setItem('keycloak-auth-error-description', errorDescription || '');
    localStorage.setItem('keycloak-auth-error-time', new Date().toISOString());
    
    // Redirecionar para página de erro ou login após pequeno delay
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login?error=' + encodeURIComponent(error));
      }
    }, 500);
  }
  
  if (code) {
    console.log('Authentication code detected in URL');
    localStorage.setItem('keycloak-last-code-time', new Date().toISOString());
    
    // Verificar se estamos na página de login e redirecionar
    if (window.location.pathname === '/login' || window.location.pathname === '/') {
      console.log('We are on login page with auth code, redirecting to dashboard...');
      // Redirecionar diretamente para dashboard em vez de depender de outros mecanismos
      window.location.replace('/dashboard');
      return;
    }
    
    // Disparar evento personalizado para que o KeycloakService saiba que um callback ocorreu
    const callbackEvent = new Event('keycloak-callback');
    window.dispatchEvent(callbackEvent);
    
    // Salvar informação no localStorage para depuração
    localStorage.setItem('keycloak-callback-detected', 'true');
    localStorage.setItem('keycloak-callback-timestamp', new Date().toISOString());
    localStorage.setItem('keycloak-callback-url', window.location.href);
    
    console.log('Keycloak authentication flow should complete shortly...');
    
    // Configurar timeout de segurança para garantir que o usuário não fique preso
    setTimeout(() => {
      // Se ainda estivermos na mesma URL com o código após 3 segundos
      // e não estivermos no dashboard, forçar redirecionamento
      if (window.location.href.includes('code=') && window.location.pathname !== '/dashboard') {
        console.log('Authentication flow taking too long, forcing redirect to dashboard');
        window.location.replace('/dashboard');
      }
    }, 3000);
  }
  
  // Verificar se o usuário deve estar autenticado
  const authenticated = localStorage.getItem('keycloak-token') || sessionStorage.getItem('keycloak-authenticated');
  const keycloakInitiated = sessionStorage.getItem('keycloak-login-initiated');
  
  if (authenticated && window.location.pathname === '/login') {
    console.log('User appears to be authenticated but is on login page. Redirecting to dashboard...');
    window.location.replace('/dashboard');
  } else if (keycloakInitiated === 'true' && !code && window.location.pathname === '/login') {
    console.log('Login was initiated but we are back on login page without code. Possible error.');
    
    // Verificar quanto tempo se passou desde que o login foi iniciado
    const loginTime = sessionStorage.getItem('keycloak-login-time');
    if (loginTime) {
      const elapsed = new Date().getTime() - new Date(loginTime).getTime();
      console.log(`Time elapsed since login initiated: ${elapsed}ms`);
      
      if (elapsed < 500) {
        console.log('Login redirect just happened, waiting...');
        // Não fazer nada, apenas esperar o redirecionamento acontecer
      } else if (elapsed > 30000) {
        console.log('Login timeout, clearing login initiated flag');
        sessionStorage.removeItem('keycloak-login-initiated');
        sessionStorage.removeItem('keycloak-login-time');
      }
    } else {
      // Sem timestamp, limpar para evitar estado inconsistente
      sessionStorage.removeItem('keycloak-login-initiated');
    }
  }
  
  console.log('Auth check complete.');
};
