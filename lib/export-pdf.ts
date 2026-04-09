import { ChatMessage } from './types'

const PDF_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 0; }

  .pdf-header {
    text-align: center;
    padding: 24px 0 20px;
    border-bottom: 2px solid #E8392A;
    margin-bottom: 28px;
  }
  .pdf-header .logo { font-size: 32px; font-weight: 700; color: #E8392A; letter-spacing: 2px; }
  .pdf-header .subtitle { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px; }
  .pdf-header .title { font-size: 16px; color: #333; margin-top: 12px; font-weight: 600; }
  .pdf-header .date { font-size: 10px; color: #999; margin-top: 4px; }

  .quadro { margin: 16px 0; page-break-inside: avoid; }
  .q-label {
    font-size: 10px;
    font-weight: 700;
    color: #E8392A;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
  }
  .q-sep { height: 1px; background: #e0e0e0; margin: 20px 0; }
  .tw { width: 100%; overflow: visible; }

  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th {
    background: #f5f5f5;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
    padding: 8px 10px;
    border-bottom: 2px solid #ddd;
    text-align: left;
  }
  th.tr { text-align: right; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; color: #333; }
  td.lc { color: #666; font-size: 11px; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; font-family: 'Courier New', monospace; font-weight: 500; }
  tr.produto { background: #fef2f1; }
  tr.produto td { color: #E8392A; font-weight: 600; }

  .pdf-footer {
    text-align: center;
    font-size: 9px;
    color: #bbb;
    padding-top: 16px;
    border-top: 1px solid #eee;
    margin-top: 28px;
  }

  .assistant-text { font-size: 12px; color: #444; line-height: 1.6; margin: 8px 0; }
`

export async function exportToPDF(messages: ChatMessage[], title?: string) {
  const html2pdf = (await import('html2pdf.js')).default

  const assistantMessages = messages.filter(m => m.role === 'assistant')
  if (!assistantMessages.length) return

  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const fileName = (title || 'Tese de Investimento').replace(/[^a-zA-Z0-9À-ú\s-]/g, '').trim()

  const htmlContent = `
    <div>
      <style>${PDF_CSS}</style>
      <div class="pdf-header">
        <div class="logo">DWV</div>
        <div class="subtitle">Teses de Investimento</div>
        ${title ? `<div class="title">${title}</div>` : ''}
        <div class="date">${dateStr}</div>
      </div>
      ${assistantMessages.map(m => `<div class="assistant-text">${m.content}</div>`).join('<div class="q-sep"></div>')}
      <div class="pdf-footer">
        DWV · Teses de Investimento Imobiliário · Gerado em ${dateStr}
      </div>
    </div>
  `

  const container = document.createElement('div')
  container.innerHTML = htmlContent
  document.body.appendChild(container)

  await html2pdf()
    .set({
      margin: [12, 14, 12, 14],
      filename: `${fileName} - ${now.toLocaleDateString('pt-BR')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    } as any)
    .from(container)
    .save()

  document.body.removeChild(container)
}
