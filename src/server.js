
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const auth = require("./middleware/auth");

const usuariosRoutes = require("./routes/usuarios");
const trabalhadoresRoutes = require("./routes/trabalhadores");
const episRoutes = require("./routes/epis");
const fichasEpiRoutes = require("./routes/fichasEpi");
const documentosRoutes = require("./routes/documentos");
const riscosRoutes = require("./routes/riscos");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        mensagem: "API ZeroTech funcionando!"
    });
});

// Rotas públicas
app.use("/usuarios", usuariosRoutes);

// Rotas protegidas
app.use("/trabalhadores", auth, trabalhadoresRoutes);
app.use("/epis", auth, episRoutes);
app.use("/fichas-epi", auth, fichasEpiRoutes);
app.use("/documentos", auth, documentosRoutes);
app.use("/riscos", auth, riscosRoutes);

// Inicialização e teste do banco
async function iniciarServidor() {
    try {
        const conexao = await db.getConnection();

        console.log("MySQL conectado com sucesso!");

        conexao.release();

        app.listen(PORT, () => {
            console.log(`Servidor ZeroTech rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error("Erro ao conectar com MySQL:", error.message);
    }
}

iniciarServidor();
