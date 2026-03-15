require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const Cursor = require('pg-cursor');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

let clienteGlobal = null;
let cursorGlobal = null;

app.get('/paises', async (req, res) => {
    const cantidad = parseInt(req.query.cantidad) || 5;
    const reiniciar = req.query.reiniciar === 'true';
    try {
        if (reiniciar || !cursorGlobal) {
            if (clienteGlobal) {
                if (cursorGlobal) await cursorGlobal.close();
                clienteGlobal.release();
            }
            clienteGlobal = await pool.connect();
            const queryText = 'SELECT p.nombre, p.continente, p.poblacion, pb.pib_2019, pb.pib_2020 FROM paises p INNER JOIN paises_pib pb ON p.nombre = pb.nombre ORDER BY p.nombre ASC';
            cursorGlobal = clienteGlobal.query(new Cursor(queryText));
        }
        cursorGlobal.read(cantidad, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length === 0) {
                cursorGlobal.close();
                clienteGlobal.release();
                cursorGlobal = null;
                clienteGlobal = null;
            }
            res.json(rows);
        });
    } catch (e) {
        if (clienteGlobal) clienteGlobal.release();
        cursorGlobal = null;
        res.status(500).json({ error: e.message });
    }
});

app.post('/paises', async (req, res) => {
    const { nombre, continente, poblacion, pib_2019, pib_2020 } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('INSERT INTO paises (nombre, continente, poblacion) VALUES ($1, $2, $3)', [nombre, continente, poblacion]);
        await client.query('INSERT INTO paises_pib (nombre, pib_2019, pib_2020) VALUES ($1, $2, $3)', [nombre, pib_2019, pib_2020]);
        
        const sqlAuditoria = 'INSERT INTO paises_data_web (nombre_pais, accion) VALUES ($1, $2) ON CONFLICT (nombre_pais) DO UPDATE SET accion = EXCLUDED.accion';
        await client.query(sqlAuditoria, [nombre, 1]);
        
        await client.query('COMMIT');
        res.status(201).json({ mensaje: "País creado." });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

app.delete('/paises/:nombre', async (req, res) => {
    console.log("1. Entrando a la ruta DELETE para:", req.params.nombre);
    let client;
    
    try {
        client = await pool.connect();
        console.log("2. Conexión a DB establecida");

        const nombre = decodeURIComponent(req.params.nombre).trim();
        await client.query('BEGIN');
        console.log("3. Transacción iniciada (BEGIN)");

        await client.query('DELETE FROM paises_pib WHERE nombre = $1', [nombre]);
        console.log("4. Borrado de paises_pib intentado");

        const resDelete = await client.query('DELETE FROM paises WHERE nombre = $1', [nombre]);
        console.log("5. Borrado de paises intentado. Filas afectadas:", resDelete.rowCount);

        if (resDelete.rowCount === 0) {
            throw new Error("El país no existe en la tabla principal");
        }

        const sqlAuditoria = 'INSERT INTO paises_data_web (nombre_pais, accion) VALUES ($1, $2) ON CONFLICT (nombre_pais) DO UPDATE SET accion = EXCLUDED.accion';
        await client.query(sqlAuditoria, [nombre, 0]);
        console.log("6. Auditoría registrada");

        await client.query('COMMIT');
        console.log("7. COMMIT exitoso");
        res.json({ mensaje: "Eliminado con éxito" });

    } catch (e) {
        if (client) await client.query('ROLLBACK');
        console.log("¡ERROR ENCONTRADO!");
        console.error("Detalle:", e.message);
        res.status(500).json({ error: e.message });
    } finally {
        if (client) client.release();
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto 3000'));