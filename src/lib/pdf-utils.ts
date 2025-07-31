import jsPDF from 'jspdf';

export const addAntheaHeader = (pdf: jsPDF, title: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Créer le bandeau dégradé bleu à violet
  // Simuler un dégradé avec plusieurs rectangles de couleurs progressives
  const bannerHeight = 40;
  const gradientSteps = 50;
  const stepWidth = pageWidth / gradientSteps;
  
  for (let i = 0; i < gradientSteps; i++) {
    // Interpolation entre bleu (#4F46E5) et violet (#9333EA)
    const ratio = i / (gradientSteps - 1);
    const r = Math.round(79 + (147 - 79) * ratio);
    const g = Math.round(70 + (51 - 70) * ratio);
    const b = Math.round(229 + (234 - 229) * ratio);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(i * stepWidth, 0, stepWidth, bannerHeight, 'F');
  }
  
  // Ajouter le logo ANTHEA en blanc
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANTHEA', 20, 20);
  
  // Ajouter la date du rapport en blanc
  const currentDate = new Date().toLocaleDateString('fr-FR');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${currentDate}`, 20, 32);
  
  // Ajouter le titre du rapport en blanc
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, pageWidth - titleWidth - 20, 25);
  
  // Réinitialiser la couleur du texte pour le reste du document
  pdf.setTextColor(0, 0, 0);
  
  // Retourner la position Y après le header
  return bannerHeight + 20;
};