import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import jsPDF from "https://esm.sh/jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const addAntheaHeader = (pdf: jsPDF, title: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Créer le bandeau dégradé bleu à violet
  const bannerHeight = 40;
  const gradientSteps = 50;
  const stepWidth = pageWidth / gradientSteps;
  
  for (let i = 0; i < gradientSteps; i++) {
    const ratio = i / (gradientSteps - 1);
    const r = Math.round(79 + (147 - 79) * ratio);
    const g = Math.round(70 + (51 - 70) * ratio);
    const b = Math.round(229 + (234 - 229) * ratio);
    
    pdf.setFillColor(r, g, b);
    pdf.rect(i * stepWidth, 0, stepWidth, bannerHeight, 'F');
  }
  
  // Ajouter le logo ANTHEA
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ANTHEA', 20, 20);
  
  // Ajouter la date
  const currentDate = new Date().toLocaleDateString('fr-FR');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${currentDate}`, 20, 32);
  
  // Ajouter le titre
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, pageWidth - titleWidth - 20, 25);
  
  // Réinitialiser la couleur du texte
  pdf.setTextColor(0, 0, 0);
  
  return bannerHeight + 20;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, sections, responses } = await req.json();

    const pdf = new jsPDF();
    let yPosition = addAntheaHeader(pdf, 'CAP - Cartographie des Atouts Professionnels');
    
    // Titre principal
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Cartographie des Atouts Professionnels (CAP)', 20, yPosition);
    yPosition += 20;

    // Résumé des scores par section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Résumé de votre profil :', 20, yPosition);
    yPosition += 15;

    sections.forEach((section: any, sectionIndex: number) => {
      const sectionResponses = section.questions.map((_: any, questionIndex: number) => {
        const responseKey = `${sectionIndex}-${questionIndex}`;
        return responses[responseKey] || 0;
      });
      
      const average = sectionResponses.reduce((sum: number, score: number) => sum + score, 0) / sectionResponses.length;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`• ${section.title}: ${average.toFixed(1)}/5`, 20, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Analyse détaillée
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Analyse détaillée :', 20, yPosition);
    yPosition += 15;

    // Diviser l'analyse en paragraphes et gérer les sauts de page
    const analysisText = analysis.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    const lines = pdf.splitTextToSize(analysisText, 170);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    for (let i = 0; i < lines.length; i++) {
      if (yPosition > 280) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(lines[i], 20, yPosition);
      yPosition += 6;
    }

    // Générer le PDF en base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    return new Response(JSON.stringify({ pdf: pdfBase64 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-cap-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de la génération du PDF',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});