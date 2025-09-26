import express from "express";
import { generatePdf } from "./pdfGenerator.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração CORS - Liberado para todas as origens
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.post("/api/gerar-pdf", async (req, res) => {
  try {
    const { produtos } = req.body;
    if (!Array.isArray(produtos) || !produtos.length) {
      return res.status(400).json({ error: "Produtos são obrigatórios" });
    }
    const pdfBuffer = await generatePdf(produtos);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=etiquetas-gondola.pdf"
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});