
import React from 'react';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, CheckCircle, NotebookPen } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { Button } from '@/components/ui/button';

function generateInsights(stats: ReturnType<typeof useStats>) {
  const insights: string[] = [];
  const { conversionRates, jobs, timeframes } = stats;

  if (conversionRates.appliedToScreening < 0.2 && jobs.applied > 5) {
    insights.push(
      `Taux de screening faible : seulement ${Math.round(
        conversionRates.appliedToScreening * 100,
      )}% de vos candidatures passent au screening.`,
    );
  }

  if (conversionRates.screeningToInterview > 0.5) {
    insights.push(
      `Excellent taux d'entretien : ${Math.round(
        conversionRates.screeningToInterview * 100,
      )}% de vos screenings se transforment en entretiens.`,
    );
  }

  if (timeframes.week.applications < 3) {
    insights.push(
      `Augmentez votre rythme : seulement ${timeframes.week.applications} candidatures cette semaine.`,
    );
  }

  if (jobs.interview > 0 && conversionRates.interviewToFinal < 0.3) {
    insights.push(
      `Améliorez vos entretiens : ${Math.round(
        conversionRates.interviewToFinal * 100,
      )}% de vos entretiens passent en finale.`,
    );
  }

  if (insights.length === 0) {
    insights.push(
      "Continuez vos efforts : votre recherche d'emploi progresse bien.",
    );
  }

  return insights;
}

function generateRecommendations(stats: ReturnType<typeof useStats>) {
  const recommendations: string[] = [];
  const { conversionRates, jobs, timeframes } = stats;

  if (conversionRates.appliedToScreening < 0.2) {
    recommendations.push("Optimisez votre CV et lettre de motivation pour améliorer le taux de réponse");
    recommendations.push("Personnalisez davantage vos candidatures selon l'entreprise ciblée");
  }

  if (timeframes.week.applications < 5) {
    recommendations.push("Augmentez votre nombre de candidatures à 5-7 par semaine minimum");
    recommendations.push("Utilisez les plateformes LinkedIn, Indeed et sites d'entreprises");
  }

  if (conversionRates.interviewToFinal < 0.5 && jobs.interview > 0) {
    recommendations.push("Préparez mieux vos entretiens avec la méthode STAR");
    recommendations.push("Renseignez-vous sur l'entreprise et ses valeurs avant l'entretien");
  }

  if (jobs.offer > jobs.applied * 2) {
    recommendations.push("Priorisez vos candidatures sur les postes les plus alignés");
    recommendations.push("Concentrez-vous sur la qualité plutôt que la quantité");
  }

  return recommendations;
}

function generateTodoList(stats: ReturnType<typeof useStats>) {
  const todos: string[] = [];
  const { conversionRates, jobs, timeframes } = stats;

  todos.push("Planifier 3-5 nouvelles candidatures pour cette semaine");
  
  if (jobs.interview > 0) {
    todos.push("Préparer les prochains entretiens programmés");
  }

  if (timeframes.week.responses === 0) {
    todos.push("Faire un suivi des candidatures envoyées il y a 1-2 semaines");
  }

  todos.push("Mettre à jour le profil LinkedIn");
  todos.push("Identifier 2-3 nouvelles entreprises cibles");
  
  if (conversionRates.appliedToScreening < 0.3) {
    todos.push("Réviser et optimiser le CV principal");
  }

  todos.push("Programmer du temps de networking cette semaine");

  return todos;
}

export const StatsOverview = () => {
  const stats = useStats();

  const handleExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Colors
    const primaryColor = '#a4007c';
    const secondaryColor = '#e3007b';
    const accentColor = '#b3d800';
    const grayColor = '#6b7280';
    const lightGray = '#f3f4f6';

    // Helper functions
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, style: string) => {
      doc.roundedRect(x, y, width, height, radius, radius, style);
    };

    const drawCapsule = (x: number, y: number, width: number, height: number, style: string) => {
      const radius = height / 2;
      doc.roundedRect(x, y, width, height, radius, radius, style);
    };

    // Page 1 - Cover and Overview
    doc.setFillColor(primaryColor);
    drawRoundedRect(0, 0, pageWidth, 80, 0, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DE RECHERCHE D\'EMPLOI', pageWidth / 2, 35, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Généré le ${currentDate}`, pageWidth / 2, 55, { align: 'center' });

    // Stats cards
    doc.setTextColor(0, 0, 0);
    const cardHeight = 35;
    const cardWidth = (contentWidth - 30) / 4;
    const startY = 100;

    const statsCards = [
      { title: 'Candidatures\nTotales', value: stats.jobs?.total || 0, color: primaryColor },
      { title: 'Entretiens\nce Mois', value: stats.timeframes?.month?.interviews || 0, color: secondaryColor },
      { title: 'Offres\nObtenues', value: stats.jobs?.offer || 0, color: accentColor },
      { title: 'Réponses\nReçues', value: stats.timeframes?.month?.responses || 0, color: grayColor }
    ];

    statsCards.forEach((card, index) => {
      const x = margin + index * (cardWidth + 10);
      
      doc.setFillColor(lightGray);
      drawRoundedRect(x, startY, cardWidth, cardHeight, 8, 'F');
      
      doc.setFillColor(card.color);
      drawCapsule(x + 5, startY + 5, cardWidth - 10, 6, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value.toString(), x + cardWidth / 2, startY + 18, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(card.title, x + cardWidth / 2, startY + 28, { align: 'center' });
    });

    // Funnel visualization
    const funnelY = 160;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ENTONNOIR DE CANDIDATURES', margin, funnelY);

    const stages = ['Offre', 'Candidature', 'Relances', 'Entretien', 'Finale'];
    const values = [
      stats.jobs.offer,
      stats.jobs.applied,
      stats.jobs.screening,
      stats.jobs.interview,
      stats.jobs.final,
    ];

    const maxValue = Math.max(...values, 1);
    const funnelStartY = funnelY + 20;
    const maxWidth = contentWidth - 40;

    values.forEach((value, index) => {
      const width = (value / maxValue) * maxWidth;
      const x = margin + 20 + (maxWidth - width) / 2;
      const y = funnelStartY + index * 12;
      
      // Draw funnel bar
      doc.setFillColor(primaryColor);
      const opacity = 1 - (index * 0.1);
      drawCapsule(x, y, width, 8, 'F');
      
      // Stage label
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(stages[index], margin, y + 6);
      
      // Value
      doc.text(value.toString(), x + width + 5, y + 6);
      
      // Percentage
      const percentage = stats.jobs.total ? Math.round((value / stats.jobs.total) * 100) : 0;
      doc.text(`${percentage}%`, x + width + 20, y + 6);
    });

    // Page 2 - AI Insights
    doc.addPage();
    
    // Header
    doc.setFillColor(primaryColor);
    drawRoundedRect(0, 0, pageWidth, 40, 0, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INSIGHTS IA', pageWidth / 2, 25, { align: 'center' });

    // AI Insights section
    const insights = generateInsights(stats);
    doc.setTextColor(0, 0, 0);
    let currentY = 70;

    insights.forEach((insight, index) => {
      doc.setFillColor(lightGray);
      drawRoundedRect(margin, currentY, contentWidth, 25, 8, 'F');
      
      doc.setFillColor(accentColor);
      doc.circle(margin + 10, currentY + 12, 4, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(insight, contentWidth - 40);
      doc.text(lines, margin + 25, currentY + 10);
      
      currentY += 35;
    });

    // Conversion rates chart
    currentY += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAUX DE CONVERSION', margin, currentY);

    const conversionData = [
      { label: 'Offre → Candidature', rate: stats.conversionRates.offerToApplied },
      { label: 'Candidature → Relances', rate: stats.conversionRates.appliedToScreening },
      { label: 'Relances → Entretien', rate: stats.conversionRates.screeningToInterview },
      { label: 'Entretien → Finale', rate: stats.conversionRates.interviewToFinal }
    ];

    currentY += 15;
    conversionData.forEach((item, index) => {
      const rate = Math.round(item.rate * 100);
      const barWidth = (rate / 100) * (contentWidth - 100);
      
      doc.setFontSize(9);
      doc.text(item.label, margin, currentY + index * 15 + 5);
      
      doc.setFillColor(lightGray);
      drawCapsule(margin + 80, currentY + index * 15, contentWidth - 180, 8, 'F');
      
      doc.setFillColor(rate > 50 ? accentColor : rate > 25 ? secondaryColor : primaryColor);
      drawCapsule(margin + 80, currentY + index * 15, barWidth, 8, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.text(`${rate}%`, margin + 80 + barWidth + 10, currentY + index * 15 + 6);
    });

    // Page 3 - Recommendations and Todo
    doc.addPage();
    
    // Header
    doc.setFillColor(secondaryColor);
    drawRoundedRect(0, 0, pageWidth, 40, 0, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMANDATIONS & ACTIONS', pageWidth / 2, 25, { align: 'center' });

    // Recommendations
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMANDATIONS', margin, 70);

    const recommendations = generateRecommendations(stats);
    currentY = 90;

    recommendations.forEach((rec, index) => {
      doc.setFillColor('#fef3c7');
      drawRoundedRect(margin, currentY, contentWidth, 20, 8, 'F');
      
      doc.setFillColor('#f59e0b');
      doc.circle(margin + 10, currentY + 10, 3, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(rec, contentWidth - 30);
      doc.text(lines, margin + 20, currentY + 8);
      
      currentY += 30;
    });

    // Todo list
    currentY += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTIONS À RÉALISER', margin, currentY);

    const todos = generateTodoList(stats);
    currentY += 20;

    todos.forEach((todo, index) => {
      doc.setFillColor('#dcfce7');
      drawRoundedRect(margin, currentY, contentWidth, 18, 8, 'F');
      
      // Checkbox
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor('#22c55e');
      doc.rect(margin + 8, currentY + 6, 6, 6, 'FD');
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(todo, contentWidth - 30);
      doc.text(lines, margin + 20, currentY + 8);
      
      currentY += 25;
    });

    // Footer on each page
    for (let i = 1; i <= doc.getNumberOfPages(); i++) {
      doc.setPage(i);
      doc.setFillColor(lightGray);
      drawRoundedRect(0, pageHeight - 20, pageWidth, 20, 0, 'F');
      
      doc.setTextColor(grayColor);
      doc.setFontSize(8);
      doc.text('Emploi Tracker - Rapport Personnalisé', margin, pageHeight - 8);
      doc.text(`Page ${i}/${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save('rapport-emploi-tracker.pdf');
  };

  const cards = [
    {
      title: 'Candidatures Totales',
      value: stats.jobs?.total || 0,
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Entretiens ce Mois',
      value: stats.timeframes?.month?.interviews || 0,
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Offres Obtenues',
      value: stats.jobs?.offer || 0,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Réponses Reçues',
      value: stats.timeframes?.month?.responses || 0,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Link to="/ameliorer-entretiens#notes">
          <Button variant="outline" className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            Notes
          </Button>
        </Link>
        <Button onClick={handleExport} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
          Exporter
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              {card.title === 'Entretiens ce Mois' && (
                <div className="mt-2">
                  <Badge
                    variant={stats.goals?.interviewsProgress >= 100 ? 'default' : 'secondary'}
                    className={stats.goals?.interviewsProgress >= 100 ? 'bg-green-100 text-green-800' : ''}
                  >
                    {stats.goals?.interviewsProgress || 0}% de l'objectif
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
