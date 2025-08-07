// Conteúdo adicional para carregar na página após a autenticação com o Keycloak
// Este arquivo é responsável por processar o token de autenticação após o redirecionamento

window.onload = function() {
  console.log('Handling Keycloak callback...');
  
  // Obter fragmentos da URL (que podem conter o token)
  const fragment = window.location.hash.substring(1);
  const params = new URLSearchParams(fragment);
  
  // Verificar se temos código de autorização ou erro
  const code = params.get('code');
  const error = params.get('error');
  const state = params.get('state');
  
  console.log('Authorization code received:', code ? 'Yes' : 'No');
  console.log('State token:', state);
  
  if (error) {
    console.error('Authentication error:', error);
    const errorDescription = params.get('error_description');
    alert(`Authentication failed: ${errorDescription || error}`);
  }
  
  // O processamento real do código será feito pelo KeycloakJS
  // Estamos apenas registrando a chegada do redirecionamento
  
  // Verificar se este arquivo foi carregado corretamente
  console.log('Keycloak callback handler loaded successfully');
};
