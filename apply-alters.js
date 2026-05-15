import db from './db.js';

const queries = [
  `CREATE TABLE IF NOT EXISTS costos_operativos (
    id_costo INT AUTO_INCREMENT PRIMARY KEY,
    tipo_costo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    id_usuario INT NULL,
    id_producto INT NULL,
    id_inventario INT NULL,
    fecha_costo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS pagos_proveedores (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_orden_compra INT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  `ALTER TABLE productos ADD COLUMN codigo_producto VARCHAR(100) NULL;`,
  `ALTER TABLE productos ADD COLUMN id_categoria INT NULL;`,
  `ALTER TABLE productos ADD COLUMN unidad_medida VARCHAR(50) NULL;`,
  `ALTER TABLE productos ADD COLUMN precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0;`,
  `ALTER TABLE productos ADD COLUMN precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0;`,
  `ALTER TABLE productos ADD COLUMN stock_minimo INT NOT NULL DEFAULT 0;`,
  `ALTER TABLE productos ADD COLUMN stock_maximo INT NOT NULL DEFAULT 0;`,
  `ALTER TABLE productos ADD COLUMN id_proveedor INT NULL;`,
  `ALTER TABLE productos ADD CONSTRAINT fk_productos_proveedores FOREIGN KEY (id_proveedor) REFERENCES proveedores(id);`,

  `ALTER TABLE ordenes_compra ADD COLUMN autorizada TINYINT(1) NOT NULL DEFAULT 0;`,
  `ALTER TABLE ordenes_compra ADD COLUMN id_proveedor INT NULL;`,

  `ALTER TABLE recepciones ADD COLUMN id_almacen INT NULL;`,

  `ALTER TABLE costos_operativos ADD COLUMN id_producto INT NULL;`,
  `ALTER TABLE costos_operativos ADD COLUMN id_inventario INT NULL;`,
  `ALTER TABLE costos_operativos ADD CONSTRAINT fk_costos_productos FOREIGN KEY (id_producto) REFERENCES productos(id_producto);`,
  `ALTER TABLE costos_operativos ADD CONSTRAINT fk_costos_inventario FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario);`,
  `ALTER TABLE pagos_proveedores ADD CONSTRAINT fk_pagos_proveedores FOREIGN KEY (id_proveedor) REFERENCES proveedores(id);`,
  `ALTER TABLE pagos_proveedores ADD CONSTRAINT fk_pagos_ordenes FOREIGN KEY (id_orden_compra) REFERENCES ordenes_compra(id) ON DELETE SET NULL;`
];

(async () => {
  try {
    console.log('Conectando a la base de datos...');
    for (const q of queries) {
      try {
        console.log('Ejecutando:', q.replace(/\s+/g, ' ').trim().slice(0, 120));
        await db.query(q);
        console.log('OK');
      } catch (err) {
        console.warn('Error (se ignora):', err.message);
      }
    }
    console.log('Aplicación de ALTERs finalizada');
    process.exit(0);
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
})();
