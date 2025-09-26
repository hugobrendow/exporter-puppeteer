import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generatePdf(produtos) {
  console.log("Iniciando geração de PDF para", produtos.length, "produto(s)");
  
  // Carrega logo como base64
  const logoPath = path.join(__dirname, "../public/logo.png");
  const logoBase64 = await fs.readFile(logoPath, { encoding: "base64" });
  console.log("Logo carregado:", logoBase64.length, "bytes");

  // Carrega fontes principais
  let fontBase64 = "";
  let boldFontBase64 = "";
  
  try {
    const montserratPath = path.join(__dirname, "../public/fonts/Montserrat-ExtraBold.ttf");
    fontBase64 = await fs.readFile(montserratPath, { encoding: "base64" });
    console.log("Fonte Montserrat carregada:", fontBase64.length, "bytes");
  } catch (err) {
    console.warn("Fonte Montserrat não encontrada:", err.message);
  }
  
  try {
    const robotoBoldPath = path.join(__dirname, "../public/fonts/Roboto-Bold.ttf");
    boldFontBase64 = await fs.readFile(robotoBoldPath, { encoding: "base64" });
    console.log("Fonte Roboto Bold carregada:", boldFontBase64.length, "bytes");
  } catch (err) {
    console.warn("Fonte Roboto Bold não encontrada:", err.message);
  }

  // Expande a lista de produtos de acordo com a quantidade
  let etiquetas = [];
  for (const prod of produtos) {
    const qtd = Number(prod.quantidade) || 1;
    for (let i = 0; i < qtd; i++) etiquetas.push(prod);
  }

  const html = await renderHtml(etiquetas, logoBase64, fontBase64, boldFontBase64);
  console.log("HTML gerado:", html.length, "caracteres");

  console.log("Iniciando Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote", 
      "--disable-gpu",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  
  // Aguarda um pouco mais para garantir que as fontes carreguem
  await page.waitForTimeout(1000);
  
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "2px", bottom: "2px", left: "2px", right: "2px" },
    printBackground: true,
    preferCSSPageSize: false,
  });

  console.log("PDF gerado:", pdfBuffer.length, "bytes");
  await browser.close();
  console.log("Navegador fechado, retornando PDF");
  return pdfBuffer;
}

async function renderHtml(etiquetas, logoBase64, fontBase64, boldFontBase64) {
  // Etiquetas por linha/coluna (ajuste para sua impressora)
  const etiquetasPorLinha = 3;
  const etiquetasPorColuna = 4;
  const etiquetasPorPagina = etiquetasPorLinha * etiquetasPorColuna;

  // Divide em páginas
  let paginas = [];
  for (let i = 0; i < etiquetas.length; i += etiquetasPorPagina) {
    paginas.push(etiquetas.slice(i, i + etiquetasPorPagina));
  }

  // Monta HTML
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Etiquetas para Gôndola</title>
  <style>
    ${fontBase64 ? `@font-face {
      font-family: 'MontserratExtraBold';
      src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
      font-weight: 800;
      font-style: normal;
    }` : ''}
    ${boldFontBase64 ? `@font-face {
      font-family: 'RobotoBold';
      src: url(data:font/ttf;base64,${boldFontBase64}) format('truetype');
      font-weight: bold;
      font-style: normal;
    }` : ''}
    body { font-family: Arial, sans-serif; background: #fff; }
    .pagina {
      width: 100%;
      page-break-after: always;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: flex-start;
      box-sizing: border-box;
    }
    .etiqueta {
      width: 250px;
      height: 200px;
      border-radius: 24px;
      border: 3px solid #111;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      margin: 5px 5px 0 0;
      padding: 8px 6px 4px 6px;
      box-sizing: border-box;
      position: relative;
      background: #fff;
    }
    .logo {
      width: 140px;
      height: auto;
      margin-bottom: 4px;
      margin-top: 2px;
      object-fit: contain;
    }
    .nome {
      font-size: 1.13em;
      font-weight: 700;
      margin-bottom: 8px;
      color: #222;
      text-align: center;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preco-area {
      display: flex;
      align-items: flex-end;
      width: 100%;
      justify-content: center;
      margin-bottom: 5px;
    }
    .preco {
      font-family: ${fontBase64 ? "'MontserratExtraBold'," : ''} ${boldFontBase64 ? "'RobotoBold'," : ''} Arial, sans-serif;
      font-size: 2.7em;
      font-weight: 800;
      color: #111;
      margin-right: 10px;
      margin-left: 6px;
      line-height: 1;
      letter-spacing: 1px;
    }
    .cada {
      font-size: 0.6em;
      font-weight: 600;
      color: #222;
      margin-left: 2px;
      margin-bottom: 8px;
    }
    .codigo {
      font-size: 1.11em;
      font-weight: bold;
      color: #222;
      margin-top: 5px;
    }
    .codigo-label {
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${paginas
    .map(
      (etiquetasPag) => `
      <div class="pagina">
        ${etiquetasPag
          .map(
            (prod) => `
            <div class="etiqueta">
              <img class="logo" src="data:image/png;base64,${logoBase64}" />
              <div class="nome">${prod.nome}</div>
              <div class="preco-area">
                <span class="preco">R$ ${Number(prod.preco)
                  .toFixed(2)
                  .replace(".", ",")}</span>
                  <span class="cada">CADA</span>
              </div>
              <div class="codigo">
                <span class="codigo-label">COD: </span>${prod.codigo}
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    `
    )
    .join("")}
</body>
</html>
`;
}
