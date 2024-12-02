const express = require("express");
const path = require("path");
const helmet = require("helmet");
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3333;

if (!process.env.PORT) {
	console.warn(
		"⚠️  PORT não definida no arquivo .env. Usando porta padrão: 3333. " +
		"Você pode definir isso no arquivo .env para evitar este aviso."
	);
}

app.use(
	helmet({
		contentSecurityPolicy: false, // Desativa CSP (útil para evitar problemas com bibliotecas de terceiros)
		crossOriginEmbedderPolicy: false, // Desativa política de incorporação para permitir imagens e mídias de terceiros
	})
);

const oneDay = 24 * 60 * 60 * 1000; // Cache de 1 dia em milissegundos
app.use(express.static(path.join(__dirname, "build"), { maxAge: oneDay }));

app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use((err, req, res, next) => {
	console.error("Erro interno:", err.stack);
	res.status(500).send("Algo deu errado! Verifique os logs do servidor.");
});

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
