import type { AnalysisResult } from '../utils/types';
import { generateExportPdf } from '../utils/export-pdf';

export function useExportPDF() {
  const exportPDF = async (result: AnalysisResult) => {
    const doc = generateExportPdf(result);
    const date = new Date().toISOString().split('T')[0];
    doc.save(`LabLens_Summary_${date}.pdf`);
  };

  return { exportPDF };
}
