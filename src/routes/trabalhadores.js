
const express = require("express");
const db = require("../config/database");

const router = express.Router();

// LISTAR TRABALHADORES
router.get("/", async (req, res) => {
    try {
        const [trabalhadores] = await db.query(
            "SELECT * FROM trabalhadores ORDER BY id DESC"
        );

        return res.json(trabalhadores);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar trabalhadores"
        });
    }
});

// BUSCAR TRABALHADOR POR ID
router.get("/:id", async (req, res) => {
    try {
        const [resultado] = await db.query(
            "SELECT * FROM trabalhadores WHERE id = ?",
            [req.params.id]
        );

        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Trabalhador não encontrado"
            });
        }

        return res.json(resultado[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar trabalhador"
        });
    }
});

// CADASTRAR TRABALHADOR
router.post("/", async (req, res) => {
    try {
        const { nome, cpf, cargo, setor, telefone } = req.body;

        if (!nome || !cpf || !cargo) {
            return res.status(400).json({
                mensagem: "Nome, CPF e cargo são obrigatórios"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO trabalhadores
            (nome, cpf, cargo, setor, telefone)
            VALUES (?, ?, ?, ?, ?)`,
            [nome, cpf, cargo, setor || null, telefone || null]
        );

        return res.status(201).json({
            mensagem: "Trabalhador cadastrado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar trabalhador"
        });
    }
});

// ATUALIZAR TRABALHADOR
router.put("/:id", async (req, res) => {
    try {
        const { nome, cpf, cargo, setor, telefone } = req.body;

        const [resultado] = await db.query(
            `UPDATE trabalhadores
            SET nome = ?, cpf = ?, cargo = ?, setor = ?, telefone = ?
            WHERE id = ?`,
            [nome, cpf, cargo, setor || null, telefone || null, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Trabalhador não encontrado"
            });
        }

        return res.json({
            mensagem: "Trabalhador atualizado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar trabalhador"
        });
    }
});

// EXCLUIR TRABALHADOR
router.delete("/:id", async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM trabalhadores WHERE id = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Trabalhador não encontrado"
            });
        }

        return res.json({
            mensagem: "Trabalhador excluído com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao excluir trabalhador"
        });
    }
});

module.exports = router;
