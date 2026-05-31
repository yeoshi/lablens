import { jsPDF } from 'jspdf';
import type { AnalysisResult } from './types';

const STATUS_LABEL: Record<string, string> = {
  abnormal: 'NEEDS ATTENTION',
  borderline: 'WORTH MONITORING',
  normal: 'LOOKING GOOD',
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
  addText(
    `Generated: ${new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    10
  );
  addDivider();

  addText('OVERVIEW', 13, 'bold');
  addText(result.summary);
  addDivider();

  const flaggedGroups = result.groups.filter((g) => g.status !== 'normal');

  if (flaggedGroups.length > 0) {
    addText('BODY SYSTEMS TO DISCUSS', 13, 'bold');
    for (const group of flaggedGroups) {
      const status = STATUS_LABEL[group.status] || group.status.toUpperCase();
      addText(`${group.icon} ${group.system} — ${status}`, 11, 'bold');
      addText(group.topline, 10);
      if (group.analogy) addText(`💡 ${group.analogy}`, 9);
      for (const v of group.values.filter((val) => val.status !== 'normal')) {
        const display = v.unit ? `${v.value} ${v.unit}` : v.value;
        addText(`  • ${v.name}: ${display} (ref ${v.referenceRange})`, 10);
      }
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
