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

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
	app.use(
		helmet({
			contentSecurityPolicy: false,	
			crossOriginEmbedderPolicy: false,
			frameguard: false,
			xContentTypeOptions: false,
			xXssProtection: false,
			referrerPolicy: false,
			permissionsPolicy: false,
		})
	);
	console.log('🔒 Modo Produção: Security headers gerenciados pelo Nginx');
} else {
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
					styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
					fontSrc: ["'self'", "https://fonts.gstatic.com"],
					imgSrc: ["'self'", "data:", "https:", "blob:"],
					mediaSrc: ["'self'", "https:", "blob:"],
					connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
					frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com", process.env.REACT_APP_BACKEND_URL || ""].filter(Boolean),
					objectSrc: ["'none'"],
					baseUri: ["'self'"],
					formAction: ["'self'"],
				},
			},
			crossOriginEmbedderPolicy: false,
			referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
			permissionsPolicy: {
				features: {
					geolocation: [],
					microphone: [],
					camera: [],
					payment: [],
					usb: [],
					magnetometer: [],
					gyroscope: [],
					accelerometer: [],
				},
			},
		})
	);
	console.log('🔧 Modo Desenvolvimento: Security headers gerenciados pelo Helmet');
}

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
