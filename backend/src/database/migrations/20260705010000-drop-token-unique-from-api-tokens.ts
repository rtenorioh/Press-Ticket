import { QueryInterface } from "sequelize";

interface IndexRow {
  Key_name: string;
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // A coluna "token" era UNIQUE (desenho antigo, guardava o token puro).
    // No fluxo atual guarda-se apenas o hash (tokenHash, que já tem índice
    // único próprio) e "token" fica "" em todos os registros — então criar o
    // 2º token colidia no "" e retornava 500 (SequelizeUniqueConstraintError).
    // Remove o índice único de "token" (buscando o nome real do índice, que
    // varia conforme foi criado).
    const [rows] = (await queryInterface.sequelize.query(
      "SHOW INDEX FROM `ApiTokens` WHERE Non_unique = 0 AND Column_name = 'token'"
    )) as [IndexRow[], unknown];

    for (const row of rows) {
      if (row.Key_name && row.Key_name !== "PRIMARY") {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`ApiTokens\` DROP INDEX \`${row.Key_name}\``
        );
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    // Reverte recriando o índice único. Pode falhar se já houver múltiplos
    // tokens com token="" (esperado no fluxo novo) — nesse caso ignore.
    try {
      await queryInterface.addIndex("ApiTokens", ["token"], {
        unique: true,
        name: "api_tokens_token_unique"
      });
    } catch {
      // ignora: já existem valores duplicados ("") — não dá para reunicificar
    }
  }
};
