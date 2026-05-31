import { jsPDF } from 'jspdf';
import type { AnalysisResult } from './types';

const STATUS_LABEL: Record<string, string> = {
  abnormal: 'ABNORMAL',
  borderline: 'BORDERLINE',
  normal: 'NORMAL',
};

export function generateExportPdf(result: AnalysisResult): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const addText = (text: string, fontSize = 11, style: 'normal' | 'bold' = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.45;
    }
    y += 3;
  };

  const addDivider = () => {
    y += 2;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  addText('LabLens Summary', 20, 'bold');
  addText(`Generated: ${new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}`, 10);
  addDivider();

  addText('OVERVIEW', 13, 'bold');
  addText(result.summary);
  addDivider();

  const flagged = result.values.filter((v) => v.status !== 'normal');
  if (flagged.length > 0) {
    addText('FLAGGED VALUES', 13, 'bold');
    for (const v of flagged) {
      const status = STATUS_LABEL[v.status] || v.status.toUpperCase();
      addText(`${status}: ${v.name} — ${v.originalValue} (normal: ${v.referenceRange})`, 11, 'bold');
      addText(v.explanation, 10);
      if (v.analogy) addText(`"${v.analogy}"`, 10);
      y += 2;
    }
    addDivider();
  }

  addText('QUESTIONS FOR YOUR DOCTOR', 13, 'bold');
  result.questions.forEach((q, i) => {
    addText(`${i + 1}. [ ] ${q.question}`, 11);
  });
  addDivider();

  addText(
    'This is not medical advice. Consult your healthcare provider for interpretation of your results.',
    10
  );
  addText('Powered by LabLens | lablens.app', 9);

  return doc;
}
