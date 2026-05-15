import http from 'http';

const data = JSON.stringify({ codigo_producto: '1010A', nombre_producto: 'Prueba Duplicado', precio_compra: 1, precio_venta: 2 });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/productos',
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
