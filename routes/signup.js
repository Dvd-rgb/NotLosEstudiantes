const express = require("express");
const db = require("../services/db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { nombre_usuario, email, contrasena, universidad, plan_de_estudios } = req.body;

        if (!nombre_usuario || !email || !contrasena || !universidad || !plan_de_estudios) {
            return res.json({ success: false, message: "All fields are required." });
        }

        console.log("📥 Received signup request:", req.body);

        try {
            // Check if user already exists
            const existingUser = await db.query(
                "SELECT * FROM usuarios WHERE email = $1 OR nombre_usuario = $2",
                [email, nombre_usuario]
            );

            console.log("✅ Query executed successfully. Users found:", existingUser.rows.length);

            if (existingUser.rows.length > 0) {
                return res.json({ success: false, message: "Username or email already exists." });
            }

            // Insert new user
            const insertUser = await db.query(
                "INSERT INTO usuarios (nombre_usuario, email, contrasena, fecha_creacion_usuario, universidad, plan_de_estudios, es_moderador) VALUES ($1, $2, $3, NOW(), $4, $5, 0) RETURNING *",
                [nombre_usuario, email, contrasena, universidad, plan_de_estudios]
            );

            console.log("✅ New user inserted:", insertUser.rows[0]);

            res.json({ success: true, message: "Account created successfully!",  redirect: "/home"  });
        } catch (dbError) {
            console.error("❌ Database operation error:", dbError);
            
            // Check for specific PostgreSQL errors
            if (dbError.code === '42P01') {
                return res.status(500).json({ success: false, message: "Table does not exist. Check your database setup." });
            } else if (dbError.code === '23505') {
                return res.json({ success: false, message: "Username or email already exists." });
            } else {
                return res.status(500).json({ success: false, message: "Database error: " + dbError.message });
            }
        }
    } catch (error) {
        console.error("❌ Signup error:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

module.exports = router;