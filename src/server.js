import server from './server/index.js';
 
const port = process.env.PORT;
const host = process.env.HOST;
 
const requiredEnv = ['ACCESS_TOKEN_KEY', 'REFRESH_TOKEN_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Environment variable belum di-set: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const httpServer = server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});

// Cegah koneksi keep-alive ditutup server lebih dulu (penyebab 'socket hang up' / ECONNRESET di Postman Runner)
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;
