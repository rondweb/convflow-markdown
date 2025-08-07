// Teste rápido dos endpoints Stack Auth
console.log('🔍 Testando Stack Auth endpoints...');

const PROJECT_ID = '850610a8-d033-4fc9-a3e5-f2511f7ee7bb';
const PUBLISHABLE_KEY = 'pck_rz58p82a8cd930c2q491km3v4nrh2vzntxw8f736cry8g';

async function quickTest() {
  const testUrls = [
    // Tentativas com diferentes estruturas de URL
    'https://api.stack-auth.com/api/v1/auth/signup',
    'https://api.stack-auth.com/api/v1/users',
    `https://api.stack-auth.com/api/v1/projects/${PROJECT_ID}/auth/signup`,
    `https://api.stack-auth.com/api/v1/projects/${PROJECT_ID}/users`,
    'https://api.stack-auth.com/v1/auth/signup',
    'https://api.stack-auth.com/auth/signup',
    'https://stack-auth.com/api/v1/auth/signup'
  ];

  const headers = {
    'Content-Type': 'application/json',
    'x-stack-publishable-client-key': PUBLISHABLE_KEY,
    'x-stack-project-id': PROJECT_ID,
    'x-stack-client-key': PUBLISHABLE_KEY
  };

  const testData = {
    email: 'test@convflow.com',
    password: 'Test123456!',
    display_name: 'Test User'
  };

  for (const url of testUrls) {
    try {
      console.log(`🧪 Testando: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testData)
      });

      console.log(`📊 Status: ${response.status}`);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`📋 Resposta: ${text}`);
        
        if (response.ok) {
          console.log(`✅ SUCESSO! URL funcional: ${url}`);
          return url;
        }
      }
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('❌ Nenhuma URL funcionou');
  return null;
}

// Executar teste
quickTest().then(workingUrl => {
  if (workingUrl) {
    console.log(`🎯 URL funcional encontrada: ${workingUrl}`);
  } else {
    console.log('🔧 Talvez precisemos verificar as credenciais ou a configuração do projeto');
  }
});

export { quickTest };
