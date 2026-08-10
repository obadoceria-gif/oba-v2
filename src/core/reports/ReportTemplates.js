/**
 * ReportTemplates - Templates prontos de relatórios
 * Facilita a criação de relatórios comuns
 */

import { createReportBuilder } from './ReportBuilder.js';
import { createReportGenerator } from './ReportGenerator.js';

/**
 * Relatório de Insumos
 */
export function createInsumosReport(insumos, options = {}) {
  const builder = createReportBuilder()
    .setData(insumos)
    .setTitle('Relatório de Insumos')
    .setSubtitle(options.subtitle || 'Lista completa de insumos cadastrados')
    .addColumn('nome', 'Nome')
    .addColumn('categoria', 'Categoria')
    .addColumn('unidade', 'Unidade')
    .addColumn('estoqueMinimo', 'Estoque Mínimo', 'number')
    .addColumn('preco', 'Preço', 'currency');

  if (options.categoria) {
    builder.addFilter('categoria', 'equals', options.categoria);
  }

  builder.addSort('nome', 'asc');

  return builder.build();
}

/**
 * Relatório de Estoque
 */
export function createEstoqueReport(estoque, options = {}) {
  const builder = createReportBuilder()
    .setData(estoque)
    .setTitle('Relatório de Estoque')
    .setSubtitle(options.subtitle || 'Situação atual do estoque')
    .addColumn('insumo', 'Insumo')
    .addColumn('quantidade', 'Quantidade', 'number')
    .addColumn('unidade', 'Unidade')
    .addColumn('valorUnitario', 'Valor Unit.', 'currency')
    .addColumn('valorTotal', 'Valor Total', 'currency')
    .addColumn('ultimaMovimentacao', 'Última Movimentação', 'date');

  if (options.baixoEstoque) {
    builder.addFilter('quantidade', 'lessThan', options.estoqueMinimo || 10);
  }

  builder
    .addSort('insumo', 'asc')
    .addSummary('valorTotal', 'sum', 'Valor Total em Estoque');

  return builder.build();
}

/**
 * Relatório de Compras
 */
export function createComprasReport(compras, options = {}) {
  const builder = createReportBuilder()
    .setData(compras)
    .setTitle('Relatório de Compras')
    .setSubtitle(options.subtitle || 'Histórico de compras realizadas')
    .addColumn('data', 'Data', 'date')
    .addColumn('fornecedor', 'Fornecedor')
    .addColumn('insumo', 'Insumo')
    .addColumn('quantidade', 'Quantidade', 'number')
    .addColumn('valorUnitario', 'Valor Unit.', 'currency')
    .addColumn('valorTotal', 'Valor Total', 'currency')
    .addColumn('formaPagamento', 'Forma Pagamento');

  if (options.dataInicio) {
    builder.addFilter('data', 'greaterOrEqual', options.dataInicio);
  }

  if (options.dataFim) {
    builder.addFilter('data', 'lessOrEqual', options.dataFim);
  }

  if (options.fornecedor) {
    builder.addFilter('fornecedor', 'equals', options.fornecedor);
  }

  builder
    .addSort('data', 'desc')
    .addSummary('valorTotal', 'sum', 'Total Gasto')
    .addSummary('quantidade', 'count', 'Total de Compras');

  return builder.build();
}

/**
 * Relatório de Fichas Técnicas
 */
export function createFichasTecnicasReport(fichas, options = {}) {
  const builder = createReportBuilder()
    .setData(fichas)
    .setTitle('Relatório de Fichas Técnicas')
    .setSubtitle(options.subtitle || 'Receitas e custos de produção')
    .addColumn('nome', 'Receita')
    .addColumn('categoria', 'Categoria')
    .addColumn('rendimento', 'Rendimento', 'number')
    .addColumn('unidadeRendimento', 'Unidade')
    .addColumn('custoTotal', 'Custo Total', 'currency')
    .addColumn('custoUnitario', 'Custo Unit.', 'currency')
    .addColumn('margemLucro', 'Margem', 'percentage')
    .addColumn('precoVenda', 'Preço Venda', 'currency');

  if (options.categoria) {
    builder.addFilter('categoria', 'equals', options.categoria);
  }

  builder
    .addSort('nome', 'asc')
    .addSummary('custoTotal', 'avg', 'Custo Médio')
    .addSummary('precoVenda', 'avg', 'Preço Médio');

  return builder.build();
}

/**
 * Relatório de Produção
 */
export function createProducaoReport(producoes, options = {}) {
  const builder = createReportBuilder()
    .setData(producoes)
    .setTitle('Relatório de Produção')
    .setSubtitle(options.subtitle || 'Histórico de produções realizadas')
    .addColumn('data', 'Data', 'date')
    .addColumn('receita', 'Receita')
    .addColumn('quantidade', 'Quantidade', 'number')
    .addColumn('unidade', 'Unidade')
    .addColumn('custoProducao', 'Custo', 'currency')
    .addColumn('status', 'Status')
    .addColumn('responsavel', 'Responsável');

  if (options.dataInicio) {
    builder.addFilter('data', 'greaterOrEqual', options.dataInicio);
  }

  if (options.dataFim) {
    builder.addFilter('data', 'lessOrEqual', options.dataFim);
  }

  if (options.status) {
    builder.addFilter('status', 'equals', options.status);
  }

  builder
    .addSort('data', 'desc')
    .addSummary('custoProducao', 'sum', 'Custo Total')
    .addSummary('quantidade', 'sum', 'Quantidade Total');

  return builder.build();
}

/**
 * Exporta relatório para PDF
 */
export async function exportToPDF(report, filename = 'relatorio.pdf') {
  const generator = createReportGenerator({
    title: report.config.title,
    orientation: 'portrait'
  });

  return generator.generatePDF(
    report.data,
    report.columns,
    {
      title: report.config.title,
      subtitle: report.config.subtitle,
      footer: report.config.footer
    }
  );
}

/**
 * Exporta relatório para Excel
 */
export function exportToExcel(report, filename = 'relatorio.csv') {
  const generator = createReportGenerator();
  return generator.generateExcel(report.data, report.columns, filename);
}

/**
 * Exporta relatório para CSV
 */
export function exportToCSV(report, filename = 'relatorio.csv') {
  return exportToExcel(report, filename);
}

/**
 * Exporta relatório para JSON
 */
export function exportToJSON(report, filename = 'relatorio.json') {
  const generator = createReportGenerator();
  return generator.generateJSON(report.data, filename);
}
