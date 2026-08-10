/**
 * ReportGenerator - Sistema de geração de relatórios
 * Suporta múltiplos formatos: PDF, Excel, CSV
 */

export class ReportGenerator {
  constructor(config = {}) {
    this.config = {
      title: config.title || 'Relatório',
      orientation: config.orientation || 'portrait', // portrait ou landscape
      pageSize: config.pageSize || 'A4',
      ...config
    };
  }

  /**
   * Gera relatório em PDF
   */
  async generatePDF(data, columns, options = {}) {
    const { title, subtitle, footer } = options;
    
    // Criar documento HTML para impressão
    const html = this._createPDFHTML(data, columns, { title, subtitle, footer });
    
    // Abrir em nova janela para impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
    };
    
    return true;
  }

  /**
   * Gera relatório em Excel (CSV)
   */
  generateExcel(data, columns, filename = 'relatorio.csv') {
    const csv = this._convertToCSV(data, columns);
    this._downloadFile(csv, filename, 'text/csv;charset=utf-8;');
    return true;
  }

  /**
   * Gera relatório em CSV
   */
  generateCSV(data, columns, filename = 'relatorio.csv') {
    return this.generateExcel(data, columns, filename);
  }

  /**
   * Gera relatório em JSON
   */
  generateJSON(data, filename = 'relatorio.json') {
    const json = JSON.stringify(data, null, 2);
    this._downloadFile(json, filename, 'application/json');
    return true;
  }

  /**
   * Cria HTML para PDF
   */
  _createPDFHTML(data, columns, options) {
    const { title, subtitle, footer } = options;
    const now = new Date().toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title || this.config.title}</title>
        <style>
          @page {
            size: ${this.config.pageSize} ${this.config.orientation};
            margin: 2cm;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
          }
          
          .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #333;
          }
          
          .header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 24px;
            color: #111;
          }
          
          .header .subtitle {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
          
          .header .date {
            margin: 0.5rem 0 0 0;
            font-size: 11px;
            color: #999;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
          }
          
          th {
            background: #f3f4f6;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #d1d5db;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          tr:hover {
            background: #f9fafb;
          }
          
          .footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          
          .summary {
            margin-top: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 4px;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .summary-item:last-child {
            border-bottom: none;
            font-weight: 600;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title || this.config.title}</h1>
          ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
          <p class="date">Gerado em: ${now}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => `<td>${this._formatValue(row[col.key], col.format)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${footer ? `<div class="footer">${footer}</div>` : ''}
        
        <div class="footer">
          <p>Total de registros: ${data.length}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Converte dados para CSV
   */
  _convertToCSV(data, columns) {
    // Cabeçalho
    const header = columns.map(col => col.label).join(',');
    
    // Linhas
    const rows = data.map(row => {
      return columns.map(col => {
        const value = this._formatValue(row[col.key], col.format);
        // Escapar vírgulas e aspas
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  }

  /**
   * Formata valor baseado no tipo
   */
  _formatValue(value, format) {
    if (value === null || value === undefined) return '';
    
    if (format === 'currency') {
      return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }
    
    if (format === 'number') {
      return Number(value).toLocaleString('pt-BR');
    }
    
    if (format === 'date') {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    
    if (format === 'datetime') {
      return new Date(value).toLocaleString('pt-BR');
    }
    
    if (format === 'percentage') {
      return `${Number(value).toFixed(2)}%`;
    }
    
    return value;
  }

  /**
   * Download de arquivo
   */
  _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Helper para criar gerador de relatórios
 */
export function createReportGenerator(config) {
  return new ReportGenerator(config);
}
