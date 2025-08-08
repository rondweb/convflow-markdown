// Script aprimorado para lidar com o dashboard após autenticação
window.onload = function() {
  console.log('Dashboard handler running on ' + window.location.pathname);
  
  // Se estivermos no dashboard, verificar o estado de autenticação
  if (window.location.pathname === '/dashboard') {
    // Limpar parâmetros da URL para uma experiência mais limpa
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const hasCode = urlParams.get('code') || hashParams.get('code');
    const hasState = urlParams.get('state') || hashParams.get('state');
    
    // Registrar que alcançamos o dashboard com sucesso após autenticação
    if (hasCode || hasState) {
      localStorage.setItem('keycloak-dashboard-reached', 'true');
      localStorage.setItem('keycloak-dashboard-time', new Date().toISOString());
      
      // Limpar a URL removendo os parâmetros de autenticação
      const cleanUrl = window.location.origin + '/dashboard';
      window.history.replaceState({}, document.title, cleanUrl);
      
      console.log('Dashboard loaded with auth parameters, URL cleaned');
    }
    
    // Verificar se temos token mas não temos estado de autenticação no keycloak
    // Isso pode acontecer se a página for carregada diretamente
    const hasToken = localStorage.getItem('keycloak-token');
    
    if (hasToken) {
      console.log('Token exists in localStorage, authentication should be valid');
      
      // Disparar evento para forçar validação do token se necessário
      setTimeout(() => {
        const tokenCheckEvent = new Event('keycloak-validate-token');
        window.dispatchEvent(tokenCheckEvent);
        console.log('Token validation event dispatched');
      }, 500);
    } else {
      console.log('No token found in dashboard. User may need to authenticate.');
      
      // Se não tiver token e não estiver no meio de uma autenticação,
      // verificar se deve redirecionar para login
      if (!hasCode && !hasState) {
        console.log('No authentication in progress, may need to redirect to login');
        
        // Esperar um pouco para dar tempo ao Keycloak de inicializar
        setTimeout(() => {
          // Verificar novamente se ainda não tem token
          if (!localStorage.getItem('keycloak-token')) {
            console.log('Still no token after delay, redirecting to login');
            window.location.replace('/login');
          }
        }, 2000);
      }
    }
  }
};
