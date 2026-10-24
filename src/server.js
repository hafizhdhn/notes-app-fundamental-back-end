import server from './server/index.js';

const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 5000; // Ubah ke 5000

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});