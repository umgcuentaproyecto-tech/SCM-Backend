import http from 'http';

const data = JSON.stringify({ correo: 'anto@scm.com', password: '12345678' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/usuarios/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', chunk => console.log('body:', chunk));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
