
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const router = express.Router();

// CADASTRAR USUÁRIO
router.post("/register", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            });
        }

        const [existente] = await db.query(
            "SELECT id FROM usuario WHERE email = ?",
            [email]
        );

        if (existente.length > 0) {
            return res.status(409).json({
                mensagem: "E-mail já cadastrado"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await db.query(
            "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)",
            [nome, email, senhaHash]
        );

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe e-mail e senha"
            });
        }

        const [usuarios] = await db.query(
            "SELECT * FROM usuario WHERE email = ?",
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        const usuario = usuarios[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha
        );
        console.log("E-mail encontrado:", usuario.email);
console.log("Hash existe:", !!usuario.senha);
console.log("Senha corresponde:", senhaValida);

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "E-mail ou senha inválidos"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurado");
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            mensagem: "Login realizado com sucesso",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao realizar login"
        });
    }
});

module.exports = router;
