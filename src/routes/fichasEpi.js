
const express = require("express");
const db = require("../config/database");

const router = express.Router();

// LISTAR ENTREGAS
router.get("/", async (req, res) => {
    try {
        const [fichas] = await db.query(`
            SELECT
                f.*,
                t.nome AS trabalhador,
                e.nome AS epi
            FROM fichas_epi f
            INNER JOIN trabalhadores t ON f.trabalhador_id = t.id
            INNER JOIN epis e ON f.epi_id = e.id
            ORDER BY f.id DESC
        `);

        return res.json(fichas);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao buscar entregas"
        });
    }
});

// REGISTRAR ENTREGA
router.post("/", async (req, res) => {
    try {
        const {
            trabalhador_id,
            epi_id,
            quantidade,
            ca,
            lote,
            data_entrega,
            assinatura
        } = req.body;

        if (
            !trabalhador_id ||
            !epi_id ||
            !quantidade ||
            !data_entrega
        ) {
            return res.status(400).json({
                mensagem: "Preencha os dados obrigatórios da entrega"
            });
        }

        const [trabalhador] = await db.query(
            "SELECT id FROM trabalhadores WHERE id = ?",
            [trabalhador_id]
        );

        const [epi] = await db.query(
            "SELECT id FROM epis WHERE id = ?",
            [epi_id]
        );

        if (trabalhador.length === 0 || epi.length === 0) {
            return res.status(404).json({
                mensagem: "Trabalhador ou EPI não encontrado"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO fichas_epi
            (trabalhador_id, epi_id, quantidade, ca, lote,
            data_entrega, assinatura)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                trabalhador_id,
                epi_id,
                quantidade,
                ca || null,
                lote || null,
                data_entrega,
                assinatura || null
            ]
        );

        return res.status(201).json({
            mensagem: "Entrega registrada com sucesso",
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao registrar entrega"
        });
    }
});

// CONSULTAR ENTREGAS DE UM TRABALHADOR
router.get("/trabalhador/:id", async (req, res) => {
    try {
        const [fichas] = await db.query(`
            SELECT
                f.*,
                e.nome AS epi
            FROM fichas_epi f
            INNER JOIN epis e ON f.epi_id = e.id
            WHERE f.trabalhador_id = ?
            ORDER BY f.data_entrega DESC
        `, [req.params.id]);

        return res.json(fichas);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensagem: "Erro ao consultar entregas"
        });
    }
});

module.exports = router;
