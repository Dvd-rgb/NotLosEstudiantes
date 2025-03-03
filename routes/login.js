const express = require("express");
const router = express.Router();
var path = require('path');
const db = require('../services/db');

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log("Attempting login for user:", username);

        // Buscar el usuario en la base de datos
        const result = await db.query(
            `SELECT id, nombre_usuario, contrasena FROM usuarios WHERE nombre_usuario = $1`,
            [username]
        );

        // Si no se encuentra el usuario, devolver error
        if (result.rows.length === 0) {
            console.log("No user found with username:", username);
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        const usuario = result.rows[0];
        console.log("User found:", usuario.nombre_usuario);

        // Comparar la contraseña directamente (sin hash)
        if (password !== usuario.contrasena) {
            console.log("Password mismatch for user:", username);
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        console.log("Login successful for user:", username);
        return res.json({ 
            success: true, 
            userId: usuario.id, 
            message: "Inicio de sesión exitoso",
            redirect: "/home" // Add redirect URL for frontend to use
        });

    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ success: false, message: "Ocurrió un error en el inicio de sesión" });
    }
});

module.exports = router;