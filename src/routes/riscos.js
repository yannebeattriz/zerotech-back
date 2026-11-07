
const express = require("express");
const db = require("../config/database");

const router = express.Router();

// LISTAR RISCOS
router.get("/", async (req, res) => {
    try {
        const [riscos] = await db.query(
            "SELECT * FROM riscos ORDER BY id DESC"
        );

        return res.json(riscos);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar riscos"
        });
    }
});

// REGISTRAR RISCO
router.post("/", async (req, res) => {
    try {
        const {
            descricao,
            tipo,
            severidade,
            localizacao,
            foto,
            audio,
            responsavel,
            prazo
        } = req.body;

        if (!descricao || !severidade) {
            return res.status(400).json({
                mensagem: "Descrição e severidade são obrigatórias"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO riscos
            (descricao, tipo, severidade, localizacao,
            foto, audio, responsavel, prazo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                descricao,
                tipo || null,
                severidade,
                localizacao || null,
                foto || null,
                audio || null,
                responsavel || null,
                prazo || null,
                "Aberto"
            ]
        );

        return res.status(201).json({
            mensagem: "Risco registrado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao registrar risco"
        });
    }
});

// ATUALIZAR RISCO E ACOMPANHAR RESOLUÇÃO
router.put("/:id", async (req, res) => {
    try {
        const {
            descricao,
            tipo,
            severidade,
            localizacao,
            responsavel,
            prazo,
            status,
            acao_corretiva,
            evidencia_fechamento
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE riscos
            SET descricao = ?, tipo = ?, severidade = ?,
            localizacao = ?, responsavel = ?, prazo = ?,
            status = ?, acao_corretiva = ?,
            evidencia_fechamento = ?
            WHERE id = ?`,
            [
                descricao,
                tipo || null,
                severidade,
                localizacao || null,
                responsavel || null,
                prazo || null,
                status || "Aberto",
                acao_corretiva || null,
                evidencia_fechamento || null,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Risco não encontrado"
            });
        }

        return res.json({
            mensagem: "Risco atualizado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar risco"
        });
    }
});

// EXCLUIR RISCO
router.delete("/:id", async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM riscos WHERE id = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Risco não encontrado"
            });
        }

        return res.json({
            mensagem: "Risco excluído com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao excluir risco"
        });
    }
});

module.exports = router;
