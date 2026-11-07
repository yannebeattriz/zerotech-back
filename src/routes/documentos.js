
const express = require("express");
const db = require("../config/database");

const router = express.Router();

// LISTAR DOCUMENTOS
router.get("/", async (req, res) => {
    try {
        const [documentos] = await db.query(`
            SELECT
                d.*,
                t.nome AS trabalhador,
                CASE
                    WHEN d.data_validade < CURDATE() THEN 'Vencido'
                    WHEN d.data_validade <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                        THEN 'Vence em até 7 dias'
                    WHEN d.data_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                        THEN 'Vence em até 30 dias'
                    ELSE 'Válido'
                END AS situacao
            FROM documentos d
            INNER JOIN trabalhadores t ON d.trabalhador_id = t.id
            ORDER BY d.data_validade ASC
        `);

        return res.json(documentos);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar documentos"
        });
    }
});

// CADASTRAR DOCUMENTO
router.post("/", async (req, res) => {
    try {
        const {
            trabalhador_id,
            tipo,
            numero,
            data_emissao,
            data_validade,
            arquivo
        } = req.body;

        if (!trabalhador_id || !tipo || !data_validade) {
            return res.status(400).json({
                mensagem: "Trabalhador, tipo e validade são obrigatórios"
            });
        }

        const [trabalhador] = await db.query(
            "SELECT id FROM trabalhadores WHERE id = ?",
            [trabalhador_id]
        );

        if (trabalhador.length === 0) {
            return res.status(404).json({
                mensagem: "Trabalhador não encontrado"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO documentos
            (trabalhador_id, tipo, numero, data_emissao,
            data_validade, arquivo)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                trabalhador_id,
                tipo,
                numero || null,
                data_emissao || null,
                data_validade,
                arquivo || null
            ]
        );

        return res.status(201).json({
            mensagem: "Documento cadastrado com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao cadastrar documento"
        });
    }
});

// ATUALIZAR DOCUMENTO
router.put("/:id", async (req, res) => {
    try {
        const {
            tipo,
            numero,
            data_emissao,
            data_validade,
            arquivo
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE documentos
            SET tipo = ?, numero = ?, data_emissao = ?,
            data_validade = ?, arquivo = ?
            WHERE id = ?`,
            [
                tipo,
                numero || null,
                data_emissao || null,
                data_validade,
                arquivo || null,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Documento não encontrado"
            });
        }

        return res.json({
            mensagem: "Documento atualizado com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao atualizar documento"
        });
    }
});

// EXCLUIR DOCUMENTO
router.delete("/:id", async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM documentos WHERE id = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Documento não encontrado"
            });
        }

        return res.json({
            mensagem: "Documento excluído com sucesso"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao excluir documento"
        });
    }
});

module.exports = router;
