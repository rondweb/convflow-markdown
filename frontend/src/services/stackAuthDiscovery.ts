// Stack Auth Endpoint Auto-Discovery
import { STACK_PUBLISHABLE_KEY, STACK_PROJECT_ID } from '../config/api';

export class StackAuthEndpointDiscovery {
  private baseUrl = 'https://api.stack-auth.com/api/v1';
  
  private commonHeaders = {
    'Content-Type': 'application/json',
    'x-stack-publishable-client-key': STACK_PUBLISHABLE_KEY,
    'x-stack-project-id': STACK_PROJECT_ID,
    'x-stack-access-type': 'client'
  };

  async discoverLoginEndpoint(): Promise<string | null> {
    const possibleEndpoints = [
      '/auth/sign-in',
      '/auth/signin',
      '/auth/login',
      '/auth/sign_in',
      '/session/signin',
      '/session/sign-in',
      '/users/signin',
      '/users/sign-in'
    ];

    const testCredentials = {
      email: 'test@invalid-email-for-discovery.com',
      password: 'InvalidPassword123!'
    };

    console.log('🔍 Descobrindo endpoint de login...');

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🧪 Testando: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.commonHeaders,
          body: JSON.stringify(testCredentials)
        });

        // Se não for 404, encontramos um endpoint válido
        if (response.status !== 404) {
          console.log(`✅ Endpoint válido encontrado: ${endpoint} (Status: ${response.status})`);
          
          // Mesmo com credenciais inválidas, status 400/401/422 indica endpoint válido
          if ([400, 401, 422].includes(response.status)) {
            return endpoint;
          }
          
          // Status 200 seria ideal mas improvável com credenciais falsas
          if (response.status === 200) {
            return endpoint;
          }
        } else {
          console.log(`❌ ${endpoint}: 404 (não existe)`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Erro - ${error.message}`);
      }
      
      // Pausa entre requests para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('❌ Nenhum endpoint de login válido encontrado');
    return null;
  }

  async discoverRegisterEndpoint(): Promise<string | null> {
    const possibleEndpoints = [
      '/auth/signup',
      '/auth/sign-up',
      '/auth/register',
      '/auth/sign_up',
      '/users',
      '/users/register',
      '/users/signup',
      '/session/signup'
    ];

    const testUser = {
      email: 'test@invalid-email-for-discovery.com',
      password: 'InvalidPassword123!',
      display_name: 'Test User'
    };

    console.log('🔍 Descobrindo endpoint de registro...');

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🧪 Testando: ${this.baseUrl}${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: this.commonHeaders,
          body: JSON.stringify(testUser)
        });

        if (response.status !== 404) {
          console.log(`✅ Endpoint válido encontrado: ${endpoint} (Status: ${response.status})`);
          
          // Status 400/422 com email inválido indica endpoint válido
          if ([400, 422].includes(response.status)) {
            return endpoint;
          }
          
          if (response.status === 200) {
            return endpoint;
          }
        } else {
          console.log(`❌ ${endpoint}: 404 (não existe)`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Erro - ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('❌ Nenhum endpoint de registro válido encontrado');
    return null;
  }

  async discoverAllEndpoints(): Promise<{login: string | null, register: string | null}> {
    console.log('🚀 Iniciando descoberta automática de endpoints Stack Auth...');
    
    const [loginEndpoint, registerEndpoint] = await Promise.all([
      this.discoverLoginEndpoint(),
      this.discoverRegisterEndpoint()
    ]);

    const result = {
      login: loginEndpoint,
      register: registerEndpoint
    };

    console.log('📋 Resultados da descoberta:', result);
    
    return result;
  }
}

// Função de conveniência para usar no console
export const discoverStackAuthEndpoints = async () => {
  const discovery = new StackAuthEndpointDiscovery();
  return await discovery.discoverAllEndpoints();
};

// Tornar disponível globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).discoverStackAuthEndpoints = discoverStackAuthEndpoints;
  console.log('🔧 Stack Auth Discovery disponível em: window.discoverStackAuthEndpoints()');
}
