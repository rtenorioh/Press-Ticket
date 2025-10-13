#!/usr/bin/env node

/**
 * Script para gerar templates de documentação Swagger
 * Uso: node scripts/generate-swagger-template.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generateTemplate() {
  console.log('\n📚 Gerador de Template Swagger\n');

  const path = await question('Path da rota (ex: /v1/users): ');
  const method = await question('Método HTTP (get/post/put/delete): ');
  const summary = await question('Resumo da rota: ');
  const tag = await question('Tag (Messages/Contacts/Users/etc): ');
  const permission = await question('Permissão necessária (ex: read:users): ');
  
  let template = `
/**
 * @swagger
 * ${path}:
 *   ${method}:
 *     summary: ${summary}
 *     description: ${summary}
 *     tags: [${tag}]
 *     security:
 *       - apiToken: []`;

  // Adicionar parâmetros de path se houver
  if (path.includes('{') || path.includes(':')) {
    const hasParams = await question('Adicionar parâmetros de path? (s/n): ');
    if (hasParams.toLowerCase() === 's') {
      const paramName = await question('Nome do parâmetro: ');
      const paramType = await question('Tipo (string/integer): ');
      template += `
 *     parameters:
 *       - in: path
 *         name: ${paramName}
 *         required: true
 *         schema:
 *           type: ${paramType}
 *         description: ID do recurso`;
    }
  }

  // Adicionar requestBody para POST/PUT
  if (method === 'post' || method === 'put') {
    const hasBody = await question('Adicionar requestBody? (s/n): ');
    if (hasBody.toLowerCase() === 's') {
      template += `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campo1
 *             properties:
 *               campo1:
 *                 type: string
 *                 example: "valor exemplo"`;
    }
  }

  // Adicionar responses
  template += `
 *     responses:
 *       200:
 *         description: Operação realizada com sucesso
 *       401:
 *         description: Token inválido ou não fornecido
 *       403:
 *         description: Sem permissão ${permission}`;

  if (method === 'get' && (path.includes('{') || path.includes(':'))) {
    template += `
 *       404:
 *         description: Recurso não encontrado`;
  }

  template += `
 *       500:
 *         description: Erro interno
 */`;

  console.log('\n✅ Template gerado:\n');
  console.log(template);
  console.log('\n📋 Copie e cole acima da sua rota no arquivo openApiRoutes.ts\n');

  rl.close();
}

generateTemplate().catch(console.error);
