-- Tablas necesarias para el sistema SCM completo

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  id_rol INT NULL,
  telefono VARCHAR(50) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL,
  telefono VARCHAR(100) NULL,
  direccion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(255) NULL,
  direccion VARCHAR(255) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  codigo_producto VARCHAR(100) NULL,
  nombre_producto VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  id_categoria INT NULL,
  id_proveedor INT NULL,
  unidad_medida VARCHAR(50) NULL,
  precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  stock_maximo INT NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS almacenes (
  id_almacen INT AUTO_INCREMENT PRIMARY KEY,
  nombre_almacen VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NULL,
  encargado VARCHAR(255) NULL,
  telefono VARCHAR(50) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventario (
  id_inventario INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL,
  id_almacen INT NULL,
  stock_actual INT NOT NULL DEFAULT 0,
  ubicacion VARCHAR(255) NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
  FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen)
);

CREATE TABLE IF NOT EXISTS gestion_pedidos (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE IF NOT EXISTS pedido_detalles (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total_item DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES gestion_pedidos(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE IF NOT EXISTS ordenes_compra (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor VARCHAR(255) NOT NULL,
  id_proveedor INT NULL,
  fecha DATE NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  autorizada TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS ordenes_compra_detalles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_item DECIMAL(10,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (orden_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE IF NOT EXISTS recepciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  fecha_recepcion DATE NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  id_almacen INT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orden_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen)
);

CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha DATE NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transportistas (
  id_transportista INT AUTO_INCREMENT PRIMARY KEY,
  nombre_transportista VARCHAR(255) NOT NULL,
  telefono VARCHAR(50) NULL,
  correo VARCHAR(255) NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'EXTERNO',
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehiculos (
  id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
  placa VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NULL,
  modelo VARCHAR(100) NULL,
  capacidad_carga DECIMAL(10,2) NULL,
  id_transportista INT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_transportista) REFERENCES transportistas(id_transportista)
);

CREATE TABLE IF NOT EXISTS rutas (
  id_ruta INT AUTO_INCREMENT PRIMARY KEY,
  nombre_ruta VARCHAR(255) NOT NULL,
  origen VARCHAR(255) NOT NULL,
  destino VARCHAR(255) NOT NULL,
  distancia_km DECIMAL(10,2) NULL,
  tiempo_estimado DECIMAL(10,2) NULL,
  costo_base DECIMAL(10,2) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ubicaciones_almacen (
  id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
  id_almacen INT NOT NULL,
  pasillo INT NULL,
  estante INT NULL,
  nivel INT NULL,
  descripcion TEXT NULL,
  FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen)
);

CREATE TABLE IF NOT EXISTS envios (
  id_envio INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NULL,
  id_transportista INT NULL,
  id_vehiculo INT NULL,
  id_ruta INT NULL,
  direccion_entrega VARCHAR(255) NOT NULL,
  fecha_salida DATE NULL,
  fecha_entrega DATE NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  costo_envio DECIMAL(10,2) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES gestion_pedidos(id_pedido),
  FOREIGN KEY (id_transportista) REFERENCES transportistas(id_transportista),
  FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo),
  FOREIGN KEY (id_ruta) REFERENCES rutas(id_ruta)
);

CREATE TABLE IF NOT EXISTS costos_operativos (
  id_costo INT AUTO_INCREMENT PRIMARY KEY,
  tipo_costo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  id_usuario INT NULL,
  id_producto INT NULL,
  id_inventario INT NULL,
  fecha_costo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
  FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
);

CREATE TABLE IF NOT EXISTS pagos_proveedores (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT NOT NULL,
  id_orden_compra INT NULL,
  monto_pagado DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id),
  FOREIGN KEY (id_orden_compra) REFERENCES ordenes_compra(id) ON DELETE SET NULL
);

INSERT INTO roles (nombre_rol, descripcion, estado)
SELECT 'Pedidos', 'Gestión y seguimiento de pedidos', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre_rol = 'Pedidos');
