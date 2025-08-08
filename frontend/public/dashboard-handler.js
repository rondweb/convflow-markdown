// Força um redirecionamento para o dashboard após autenticação bem-sucedida
window.onload = function() {
  const pathname = window.location.pathname;
  
  // Se estivermos no dashboard com código de autorização na URL, atualizar a página
  // para limpar os parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  const hasCode = urlParams.get('code') || hashParams.get('code');
  
  if (pathname === '/dashboard' && hasCode) {
    console.log('Dashboard loaded with authorization code, cleaning URL');
    
    // Apenas substitui a URL atual por uma limpa, sem recarregar a página
    const cleanUrl = window.location.origin + '/dashboard';
    window.history.replaceState({}, document.title, cleanUrl);
  }
};
