// Arquivo de exemplo mostrando a estrutura do padrão CSR

/**
 * PADRÃO CONTROLLER-SERVICE-REPOSITORY
 * 
 * 1. CONTROLLER (UserController.ts)
 *    - Recebe requisições HTTP
 *    - Extrai parâmetros da requisição
 *    - Chama o service
 *    - Retorna a resposta HTTP
 * 
 * 2. SERVICE (UserService.ts)
 *    - Contém a lógica de negócio
 *    - Valida dados de negócio
 *    - Coordena múltiplos repositórios
 *    - Pode fazer transformações de dados
 * 
 * 3. REPOSITORY (UserRepository.ts)
 *    - Acessa e modifica dados do banco
 *    - Implementa operações CRUD
 *    - Abstraia a implementação do banco de dados
 *    - Implementa interfaces definidas em types/
 */

/**
 * FLUXO DE UMA REQUISIÇÃO
 * 
 * Request HTTP
 *     ↓
 * Router (src/routes/user.ts)
 *     ↓
 * Controller (UserController.ts)
 *     ↓
 * Service (UserService.ts)
 *     ↓
 * Repository (UserRepository.ts)
 *     ↓
 * Database (Drizzle ORM)
 *     ↓
 * Response JSON
 */
