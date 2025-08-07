# Centralização da Autenticação com Keycloak

## Objetivo

Este documento descreve as mudanças realizadas para centralizar toda a autenticação do sistema através do Keycloak, eliminando o sistema de autenticação local anteriormente utilizado.

## Visão Geral das Mudanças

Anteriormente, o sistema utilizava duas abordagens de autenticação:
1. Autenticação local (JWT) com endpoints próprios para login e registro
2. Autenticação via Keycloak

Para eliminar esta duplicidade e tornar o sistema mais seguro e coeso, todas as rotas de autenticação foram centralizadas no Keycloak.

## Alterações Realizadas

### Backend

1. **Serviço Keycloak**
   - Implementado o `keycloak_user_manager.py` para gerenciar operações de usuários
   - Configuradas rotas no `keycloak_users.py` para administração de usuários

2. **Rotas de API**
   - Removidas rotas duplicadas de autenticação local (`/auth/login`, `/auth/signup`)
   - Todas as operações de autenticação são delegadas ao Keycloak

### Frontend

1. **Interface de Usuário**
   - Simplificada a interface do cabeçalho removendo opções duplicadas de login
   - Unificados os botões "Login" e "Login Keycloak" em uma única opção "Login"
   - Removidas referências explícitas ao Keycloak na interface

2. **Páginas de Autenticação**
   - Atualizada a página `Login.tsx` para utilizar apenas Keycloak
   - Atualizada a página `Register.tsx` para utilizar apenas Keycloak
   - Removidos formulários locais de login e registro

3. **Configuração de API**
   - Removidas constantes não utilizadas (`AUTH_LOGIN`, `AUTH_REGISTER`, etc.)
   - Atualizada a função `getApiHeaders` para obter o token diretamente do serviço Keycloak
   - Removidas interfaces relacionadas a autenticação local (`LoginRequest`, `RegisterRequest`, etc.)

4. **Serviço Keycloak**
   - O `keycloakService.ts` é agora o ponto central para todas as operações de autenticação
   - Implementadas funções para login, logout, registro e verificação de papéis
   - Configurado tratamento adequado para renovação de tokens

5. **Contexto de Autenticação**
   - O `KeycloakAuthContext.tsx` fornece estado global de autenticação para toda a aplicação
   - Implementado `useKeycloakAuth` hook para acesso fácil ao estado de autenticação
   - Adicionado hook de compatibilidade `useAuth` para facilitar a migração

## Vantagens da Centralização

1. **Segurança Aprimorada**
   - Gerenciamento centralizado de identidade através do Keycloak
   - Implementação de protocolos padronizados (OAuth 2.0, OpenID Connect)
   - Single Sign-On (SSO) para toda a aplicação

2. **Manutenção Simplificada**
   - Um único ponto para gerenciamento de autenticação
   - Código mais limpo e coeso
   - Redução de redundâncias e inconsistências

3. **Experiência do Usuário**
   - Processo de autenticação unificado e consistente
   - Mensagens claras sem referências técnicas ao provedor de autenticação
   - Interface simplificada sem opções duplicadas

## Próximos Passos

1. **Testes**
   - Verificar o fluxo completo de autenticação em diferentes ambientes
   - Testar cenários de erro e recuperação

2. **Monitoramento**
   - Implementar logs detalhados para operações de autenticação
   - Configurar alertas para falhas de autenticação

3. **Documentação**
   - Atualizar documentação de API para refletir mudanças na autenticação
   - Criar guias para desenvolvedores sobre como trabalhar com o sistema de autenticação
