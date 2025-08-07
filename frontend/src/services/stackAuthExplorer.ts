// Stack Auth API Explorer - Descobrir endpoints corretos
export class StackAuthExplorer {
  private projectId = '850610a8-d033-4fc9-a3e5-f2511f7ee7bb';
  private publishableKey = 'pck_rz58p82a8cd930c2q491km3v4nrh2vzntxw8f736cry8g';

  private async tryRequest(url: string, method: string = 'GET', data: any = null) {
    try {
      console.log(`🔍 Tentando: ${method} ${url}`);
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-stack-publishable-client-key': this.publishableKey,
          'x-stack-project-id': this.projectId
        }
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      const text = await response.text();
      
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { raw: text };
      }

      console.log(`📊 ${response.status}: ${JSON.stringify(result, null, 2)}`);
      
      return { 
        url, 
        status: response.status, 
        ok: response.ok, 
        data: result 
      };
    } catch (error) {
      console.error(`❌ Erro em ${url}:`, error);
      return { url, error: error.message };
    }
  }

  async discoverEndpoints() {
    console.log('🚀 Iniciando descoberta de endpoints Stack Auth...');
    
    const baseUrls = [
      'https://api.stack-auth.com',
      'https://api.stack-auth.com/api/v1',
      `https://api.stack-auth.com/api/v1/projects/${this.projectId}`,
      'https://stack-auth.com/api',
      'https://auth.stack-auth.com'
    ];

    const endpoints = [
      '/',
      '/health',
      '/users',
      '/auth/signup',
      '/auth/register',
      '/auth/signin',
      '/auth/me'
    ];

    const testData = {
      email: 'test@convflow.com',
      password: 'Test123456!',
      display_name: 'Test User'
    };

    for (const baseUrl of baseUrls) {
      console.log(`\n🔧 Testando base URL: ${baseUrl}`);
      
      for (const endpoint of endpoints) {
        const fullUrl = baseUrl + endpoint;
        
        // Teste GET primeiro
        await this.tryRequest(fullUrl, 'GET');
        
        // Se for endpoint de registro, teste POST
        if (endpoint.includes('signup') || endpoint.includes('register') || endpoint === '/users') {
          await this.tryRequest(fullUrl, 'POST', testData);
        }
        
        // Pequena pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log('✅ Descoberta completa!');
  }

  async testSpecificEndpoint(url: string, method: string = 'POST') {
    const testData = {
      email: 'test@convflow.com',
      password: 'Test123456!',
      display_name: 'Test User'
    };

    return await this.tryRequest(url, method, testData);
  }
}

// Criar instância global para uso no console
if (typeof window !== 'undefined') {
  (window as any).stackAuthExplorer = new StackAuthExplorer();
  console.log('🔧 Stack Auth Explorer disponível em: window.stackAuthExplorer');
  console.log('📝 Use: stackAuthExplorer.discoverEndpoints() para descobrir endpoints');
  console.log('📝 Use: stackAuthExplorer.testSpecificEndpoint(url, method) para testar endpoint específico');
}

export default StackAuthExplorer;
