
const express = require("express");
const db = require("../config/database");

const router = express.Router();

// LISTAR EPIs
router.get("/", async (req, res) => {
    try {
        const [epis] = await db.query(
            "SELECT * FROM epis ORDER BY id DESC"
        );

        return res.json(epis);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar EPIs"
        });
    }
});

// CADASTRAR EPI
router.post("/", async (req, res) => {
    try {
        const { nome, descricao, ca, fabricante, quantidade } = req.body;

        if (!nome || !ca) {
            return res.status(400).json({
                mensagem: "Nome e CA são obrigatórios"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO epis
            (nome, descricao, ca, fabricante, quantidade)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nome,
                descricao || null,
                ca,
                fabricante || null,
                quantidade ?? 0
            ]
        );

        return res.status(201).json({
            mensagem: "EPI cadastrado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar EPI"
        });
    }
});

// ATUALIZAR EPI
router.put("/:id", async (req, res) => {
    try {
        const { nome, descricao, ca, fabricante, quantidade } = req.body;

        const [resultado] = await db.query(
            `UPDATE epis
            SET nome = ?, descricao = ?, ca = ?,
            fabricante = ?, quantidade = ?
            WHERE id = ?`,
            [
                nome,
                descricao || null,
                ca,
                fabricante || null,
                quantidade ?? 0,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "EPI não encontrado"
            });
        }

        return res.json({
            mensagem: "EPI atualizado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar EPI"
        });
    }
});

// EXCLUIR EPI
router.delete("/:id", async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM epis WHERE id = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "EPI não encontrado"
            });
        }

        return res.json({
            mensagem: "EPI excluído com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao excluir EPI"
        });
    }
});

module.exports = router;
