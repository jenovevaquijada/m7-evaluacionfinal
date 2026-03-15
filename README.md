# 🌍 Sistema de Gestión de Países - Módulo 7

Este proyecto es una aplicación **Full Stack** diseñada para la gestión y visualización de datos geográficos y económicos de países. La solución destaca por el uso de técnicas avanzadas de PostgreSQL, como el manejo de cursores para optimizar grandes volúmenes de datos y transacciones seguras (TCL) para garantizar la integridad de la información en entornos relacionales.

## 📋 Características Técnicas

- **Lectura Optimizada con Cursores:** Implementación de `pg-cursor` para recuperar registros de forma segmentada (bloques de 5), evitando la sobrecarga de memoria en el servidor y permitiendo una navegación fluida entre los datos.
- **Transacciones Atómicas (TCL):** Uso de bloques `BEGIN`, `COMMIT` y `ROLLBACK` para asegurar que las operaciones multidimensionales (como inserciones o eliminaciones en múltiples tablas relacionadas) se completen totalmente o no se apliquen en absoluto en caso de error.
- **Integridad Referencial:** Lógica de eliminación controlada para manejar dependencias entre las tablas `paises` y `paises_pib`, garantizando que no existan datos huérfanos tras la eliminación de un registro principal.
- **Registro de Auditoría (UPSERT):** Sistema de historial que utiliza la cláusula `ON CONFLICT` para actualizar el estado del país (Acción 1 para creación, Acción 0 para eliminación) de forma resiliente, eliminando la posibilidad de fallos por llaves primarias duplicadas.

## 🛠️ Requisitos Previos

- **Node.js** (v14 o superior)
- **PostgreSQL** (v12 o superior)
- **NPM** (gestor de paquetes de Node)

## ⚙️ Configuración del Entorno

1. **Clonar o descargar** el proyecto en tu equipo.
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Variables de Entorno:**
Crea un archivo llamado .env en la raíz del proyecto con las credenciales de tu base de datos local:

Fragmento de código
- **DB_USER=tu_usuario_postgres**
- **DB_HOST=localhost**
- **DB_NAME=nombre_de_tu_db**
- **DB_PASSWORD=tu_contraseña**
- **PORT=3000**

4. **Estructura de la Base de Datos:**
El sistema requiere las siguientes tablas en PostgreSQL:
- **paises: Almacena el nombre (PK), continente y población.**
- **paises_pib: Almacena el nombre (FK), PIB 2019 y PIB 2020.**
- **paises_data_web: Tabla de auditoría con nombre_pais (PK) y acción (integer).**

## 🖥️ Uso de la Aplicación
Para iniciar el servidor en el puerto 3000, ejecuta:
  ```bash
  npm start
  ```
Luego, abre tu navegador en `http://localhost:3000`

---

## 👩🏻‍💻 Autora
Jenoveva Quijada
