import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Icon } from './icons.jsx';

const SEV_COLORS = {
  CRITICAL: [248, 81, 73],
  HIGH:     [210, 153, 34],
  MEDIUM:   [47, 129, 247],
  LOW:      [125, 133, 144],
};

export function ExportButton({ result, target }) {
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      generatePdf(result, target);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={onClick} disabled={busy} className="gh-btn-primary disabled:opacity-60">
      <Icon.Download className="w-3.5 h-3.5" />
      {busy ? 'Generating…' : 'Export report'}
    </button>
  );
}

function generatePdf(result, target) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const newPageIfNeeded = (needed = 80) => {
    if (y + needed > H - M) { doc.addPage(); y = M; }
  };

  const wrap = (text, width, fontSize = 10) => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text ?? '', width);
  };

  // Cover header — GitHub-ish dark
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, W, 120, 'F');
  doc.setTextColor(230, 237, 243);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Compliance Ghost — Audit Report', M, 56);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(125, 133, 144);
  doc.text(`Target: ${target ?? 'repository'}`, M, 78);
  doc.text(`Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`, M, 94);
  doc.text('Analyzed by Bob — semantic data-flow analysis', W - M, 94, { align: 'right' });

  y = 150;
  doc.setTextColor(13, 17, 23);

  // Scores
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Compliance scores', M, y);
  y += 16;

  const scoreEntries = Object.entries(result.scores ?? {});
  const boxW = (W - 2 * M - 16) / scoreEntries.length;
  scoreEntries.forEach(([reg, score], i) => {
    const x = M + i * (boxW + 8);
    doc.setDrawColor(220);
    doc.setFillColor(247, 248, 250);
    doc.roundedRect(x, y, boxW, 70, 6, 6, 'FD');
    doc.setTextColor(125, 133, 144);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(reg, x + 12, y + 18);
    const colour = score >= 75 ? [63, 185, 80] : score >= 50 ? [210, 153, 34] : [248, 81, 73];
    doc.setTextColor(...colour);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(`${Math.round(score)}`, x + 12, y + 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text('/ 100', x + 60, y + 50);
  });
  y += 90;

  // Summary
  doc.setTextColor(13, 17, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Summary', M, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60);
  const summaryLines = wrap(result.summary?.headline ?? '', W - 2 * M);
  doc.text(summaryLines, M, y);
  y += summaryLines.length * 14 + 6;

  doc.setTextColor(120);
  doc.text(
    `Files analyzed: ${result.summary?.filesAnalyzed ?? '—'}   ·   Personal-data fields: ${result.summary?.personalDataFieldsFound ?? '—'}   ·   Violations: ${result.summary?.totalViolations ?? result.violations.length}`,
    M, y,
  );
  y += 22;

  // Personal data
  if (result.personalData?.length) {
    newPageIfNeeded(120);
    doc.setTextColor(13, 17, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Personal data fields detected', M, y);
    y += 16;
    for (const p of result.personalData) {
      newPageIfNeeded(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30);
      doc.text(`• ${p.label}`, M, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(`(${p.category})`, M + doc.getTextWidth(`• ${p.label}`) + 6, y);
      y += 14;
      const locs = (p.locations ?? []).slice(0, 3).map((l) => `${l.file}:${l.line}`).join('   ·   ');
      if (locs) {
        const lines = wrap(locs, W - 2 * M - 12, 9);
        doc.setTextColor(110);
        doc.setFontSize(9);
        doc.text(lines, M + 12, y);
        y += lines.length * 12;
      }
    }
    y += 8;
  }

  // Violations
  newPageIfNeeded(80);
  doc.setTextColor(13, 17, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Violations', M, y);
  y += 18;

  const sorted = [...(result.violations ?? [])].sort(
    (a, b) =>
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(a.severity) -
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(b.severity),
  );

  for (const v of sorted) {
    newPageIfNeeded(160);
    const [r, g, b] = SEV_COLORS[v.severity] ?? SEV_COLORS.LOW;
    doc.setFillColor(r, g, b);
    doc.roundedRect(M, y - 12, doc.getTextWidth(v.severity) + 16, 18, 4, 4, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(v.severity, M + 8, y + 1);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70);
    doc.text(`${v.regulation} · ${v.article}`, M + doc.getTextWidth(v.severity) + 30, y + 1);
    doc.setTextColor(120);
    doc.text(`${v.file}:${v.line}`, W - M, y + 1, { align: 'right' });

    y += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(13, 17, 23);
    const titleLines = wrap(v.title, W - 2 * M, 12);
    doc.text(titleLines, M, y);
    y += titleLines.length * 14 + 4;

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60);
    doc.setFillColor(247, 248, 250);
    const snippetLines = wrap(v.snippet ?? '', W - 2 * M - 16, 9);
    const snippetH = snippetLines.length * 11 + 12;
    doc.roundedRect(M, y, W - 2 * M, snippetH, 4, 4, 'F');
    doc.text(snippetLines, M + 8, y + 14);
    y += snippetH + 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70);
    const expLines = wrap(v.explanation ?? '', W - 2 * M);
    newPageIfNeeded(expLines.length * 14 + 60);
    doc.text(expLines, M, y);
    y += expLines.length * 14 + 8;

    if (v.remediation?.code) {
      newPageIfNeeded(80);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 90);
      doc.setFontSize(10);
      doc.text('Remediation', M, y);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(70);
      const sumLines = wrap(v.remediation.summary ?? '', W - 2 * M);
      doc.text(sumLines, M, y);
      y += sumLines.length * 14 + 4;

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40);
      doc.setFillColor(232, 246, 236);
      const fixLines = wrap(v.remediation.code, W - 2 * M - 16, 9);
      const fixH = fixLines.length * 11 + 12;
      newPageIfNeeded(fixH);
      doc.roundedRect(M, y, W - 2 * M, fixH, 4, 4, 'F');
      doc.text(fixLines, M + 8, y + 14);
      y += fixH + 18;
    }

    doc.setDrawColor(225);
    doc.line(M, y, W - M, y);
    y += 14;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Compliance Ghost · audit report · page ${i} of ${pages}`, W / 2, H - 20, { align: 'center' });
  }

  const safeTarget = (target ?? 'repository').replace(/[^a-z0-9_-]+/gi, '_').toLowerCase();
  doc.save(`compliance-ghost_${safeTarget}_${Date.now()}.pdf`);
}
