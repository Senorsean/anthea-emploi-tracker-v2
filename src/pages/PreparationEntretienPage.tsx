import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Star, ArrowRight, Download } from "lucide-react";
import jsPDF from 'jspdf';

const interviewQuestions = [
  {
    id: 1,
    category: "Présentation",
    question: "Parlez-moi de vous",
    tips: "Structure : parcours, compétences, motivations pour le poste",
    difficulty: "Facile"
  },
  {
    id: 2,
    category: "Motivation",
    question: "Pourquoi voulez-vous travailler dans notre entreprise ?",
    tips: "Recherchez l'entreprise, ses valeurs, ses projets",
    difficulty: "Moyen"
  },
  {
    id: 3,
    category: "Compétences",
    question: "Décrivez-moi une situation où vous avez surmonté un défi professionnel",
    tips: "Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)",
    difficulty: "Moyen"
  },
  {
    id: 4,
    category: "Faiblesses",
    question: "Quels sont vos points faibles ?",
    tips: "Choisissez une vraie faiblesse avec un plan d'amélioration",
    difficulty: "Difficile"
  },
  {
    id: 5,
    category: "Ambition",
    question: "Où vous voyez-vous dans 5 ans ?",
    tips: "Montrez de l'ambition alignée avec le poste proposé",
    difficulty: "Moyen"
  },
  {
    id: 6,
    category: "Gestion du stress",
    question: "Comment gérez-vous la pression et le stress au travail ?",
    tips: "Donnez des exemples concrets de techniques utilisées",
    difficulty: "Moyen"
  },
  {
    id: 7,
    category: "Travail d'équipe",
    question: "Racontez-moi une situation où vous avez eu un conflit avec un collègue",
    tips: "Focalisez sur la résolution et les leçons apprises",
    difficulty: "Difficile"
  },
  {
    id: 8,
    category: "Leadership",
    question: "Décrivez une situation où vous avez dû prendre des initiatives",
    tips: "Montrez votre proactivité et l'impact de vos actions",
    difficulty: "Difficile"
  }
];

export default function PreparationEntretienPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [notes, setNotes] = useState<string>('');

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = (completedQuestions.size / interviewQuestions.length) * 100;

  const handleResponseChange = (questionId: number, response: string) => {
    setResponses(prev => ({ ...prev, [questionId]: response }));
  };

  const markQuestionComplete = () => {
    const response = responses[currentQuestion.id];
    if (response && response.trim().length > 50) {
      setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }
  };

  const getReadinessScore = () => {
    const totalQuestions = interviewQuestions.length;
    const completedCount = completedQuestions.size;
    const completionRate = (completedCount / totalQuestions) * 100;
    
    // Analyser la qualité des réponses
    const advice = analyzeResponses();
    const highSeverityIssues = advice.filter(item => item.severity === "high").length;
    const mediumSeverityIssues = advice.filter(item => item.severity === "medium").length;
    
    // Calcul du score de qualité (sur 100)
    let qualityScore = 100;
    qualityScore -= highSeverityIssues * 15; // -15 points par problème grave
    qualityScore -= mediumSeverityIssues * 8; // -8 points par problème moyen
    qualityScore = Math.max(0, qualityScore);
    
    // Score global (moyenne entre taux de completion et qualité)
    const globalScore = (completionRate + qualityScore) / 2;
    
    if (globalScore >= 85) return { 
      level: "Excellent", 
      color: "bg-green-500", 
      message: "Vous êtes parfaitement prêt pour l'entretien !",
      score: Math.round(globalScore)
    };
    if (globalScore >= 70) return { 
      level: "Très bien", 
      color: "bg-blue-500", 
      message: "Très bonne préparation, quelques ajustements mineurs !",
      score: Math.round(globalScore)
    };
    if (globalScore >= 55) return { 
      level: "Bien", 
      color: "bg-orange-500", 
      message: "Bonne base, continuez à améliorer vos réponses !",
      score: Math.round(globalScore)
    };
    if (globalScore >= 40) return { 
      level: "Correct", 
      color: "bg-yellow-500", 
      message: "Préparation correcte, plusieurs points à améliorer",
      score: Math.round(globalScore)
    };
    return { 
      level: "À améliorer", 
      color: "bg-red-500", 
      message: "Continuez à vous entraîner, beaucoup de travail reste à faire",
      score: Math.round(globalScore)
    };
  };

  const analyzeResponses = () => {
    const advice = [];
    
    interviewQuestions.forEach((question) => {
      const response = responses[question.id];
      if (!response || response.trim().length < 50) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: "Réponse trop courte ou manquante",
          recommendation: "Développez davantage votre réponse en donnant des exemples concrets.",
          severity: "high" // Rouge
        });
        return;
      }

      const responseText = response.toLowerCase();
      
      // Analyse spécifique par catégorie
      switch(question.category) {
        case "Présentation":
          if (!responseText.includes("expérience") && !responseText.includes("parcours")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Manque de structure dans la présentation",
              recommendation: "Structurez votre présentation : parcours, expériences clés, compétences, motivations.",
              severity: "medium" // Orange pour Présentation
            });
          } else {
            // Si tout va bien pour Présentation, on l'affiche quand même en orange
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Présentation correcte",
              recommendation: "Continuez à structurer votre présentation de manière claire.",
              severity: "medium" // Orange
            });
          }
          break;
          
        case "Travail d'équipe":
          if (!responseText.includes("écoute") && !responseText.includes("communication") && !responseText.includes("solution")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Manque d'accent sur la résolution",
              recommendation: "Mettez l'accent sur l'écoute, la communication et la résolution du conflit.",
              severity: "medium" // Orange pour Travail d'équipe
            });
          } else {
            // Si tout va bien pour Travail d'équipe, on l'affiche quand même en orange
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Approche collaborative correcte",
              recommendation: "Continuez à mettre l'accent sur la communication et la résolution.",
              severity: "medium" // Orange
            });
          }
          break;
          
        case "Motivation":
          if (!responseText.includes("entreprise") && !responseText.includes("mission") && !responseText.includes("valeurs")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Manque de recherche sur l'entreprise",
              recommendation: "Montrez que vous connaissez l'entreprise, ses valeurs et ses projets.",
              severity: "high" // Rouge
            });
          } else {
            // Si tout va bien pour les autres catégories, vert
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Motivation bien exprimée",
              recommendation: "Excellente connaissance de l'entreprise et motivation claire.",
              severity: "low" // Vert
            });
          }
          break;
          
        case "Compétences":
          if (!responseText.includes("résultat") && !responseText.includes("solution") && !responseText.includes("action")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Méthode STAR incomplète",
              recommendation: "Utilisez la méthode STAR : Situation, Tâche, Action, Résultat.",
              severity: "medium" // Orange
            });
          } else {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Compétences bien démontrées",
              recommendation: "Excellente utilisation d'exemples concrets et de résultats.",
              severity: "low" // Vert
            });
          }
          break;
          
        case "Faiblesses":
          if (responseText.includes("perfectionniste") || responseText.includes("travailleur")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Cliché dans la réponse",
              recommendation: "Évitez les clichés. Choisissez une vraie faiblesse avec un plan d'amélioration concret.",
              severity: "medium" // Orange
            });
          } else {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Approche authentique des faiblesses",
              recommendation: "Bonne présentation d'une faiblesse réelle avec plan d'amélioration.",
              severity: "low" // Vert
            });
          }
          break;
          
        case "Leadership":
          if (!responseText.includes("initiative") && !responseText.includes("équipe") && !responseText.includes("impact")) {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Manque d'exemples de leadership",
              recommendation: "Donnez des exemples concrets d'initiatives prises et de leur impact.",
              severity: "medium" // Orange
            });
          } else {
            advice.push({
              category: question.category,
              question: question.question,
              issue: "Leadership bien démontré",
              recommendation: "Excellents exemples d'initiatives et d'impact positif.",
              severity: "low" // Vert
            });
          }
          break;

        default:
          // Pour les autres catégories, si tout va bien, vert
          advice.push({
            category: question.category,
            question: question.question,
            issue: "Réponse appropriée",
            recommendation: "Réponse bien structurée et complète.",
            severity: "low" // Vert
          });
          break;
      }
      
      // Vérifications générales pour la longueur
      if (response.length < 100) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: "Réponse trop courte",
          recommendation: "Développez votre réponse avec plus de détails et d'exemples.",
          severity: "medium" // Orange
        });
      }
      
      if (response.length > 500) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: "Réponse trop longue",
          recommendation: "Soyez plus concis, l'idéal est entre 100-300 mots.",
          severity: "medium" // Orange
        });
      }
    });
    
    return advice;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (2 * margin);
    let currentY = 25;
    
    // En-tête avec dégradé bleu-violet
    for (let i = 0; i < pageWidth; i += 2) {
      const ratio = i / pageWidth;
      const r = Math.round(96 + (138 - 96) * ratio);   // De bleu (96) vers violet (138)
      const g = Math.round(165 + (43 - 165) * ratio);  // De bleu (165) vers violet (43)  
      const b = Math.round(250 + (226 - 250) * ratio); // De bleu (250) vers violet (226)
      doc.setFillColor(r, g, b);
      doc.rect(i, 0, 2, 45, 'F');
    }
    
    
    const generatePDFContent = () => {
      // Logo texte en haut à gauche
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Anthea", margin, 20);
      
      // Titre du rapport centré
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const titleWidth = doc.getTextWidth("Rapport de Preparation d'Entretien");
      doc.text("Rapport de Preparation d'Entretien", (pageWidth - titleWidth) / 2, 28);
      
      // Date de génération
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const today = new Date().toLocaleDateString('fr-FR');
      doc.text(`Genere le ${today}`, pageWidth - 45, 38);
      
      currentY = 55;
      doc.setTextColor(0, 0, 0);
      
      // Section Score avec design professionnel et moderne
      const readiness = getReadinessScore();
      
      // Ombre portée légère pour l'encadré
      doc.setFillColor(0, 0, 0, 0.1); // Ombre
      doc.rect(margin + 2, currentY - 3, maxWidth, 60, 'F');
      
      // Encadré principal avec fond blanc et bordure subtile
      doc.setFillColor(255, 255, 255); // bg-white
      doc.rect(margin, currentY - 5, maxWidth, 60, 'F');
      doc.setDrawColor(229, 231, 235); // border-gray-200
      doc.setLineWidth(0.5);
      doc.rect(margin, currentY - 5, maxWidth, 60, 'S');
      
      // Titre de la section avec design moderne
      doc.setTextColor(71, 85, 105); // text-slate-600
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Score de Preparation", margin + 10, currentY + 8);
      
      // Score principal avec couleur gradient
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      if (readiness.score >= 80) {
        doc.setTextColor(34, 197, 94); // text-green-500 (vert)
      } else if (readiness.score >= 60) {
        doc.setTextColor(249, 115, 22); // text-orange-500 (orange)
      } else {
        doc.setTextColor(239, 68, 68); // text-red-500 (rouge)
      }
      doc.text(`${readiness.score}%`, margin + 10, currentY + 35);
      
      // Description du niveau
      doc.setTextColor(100, 116, 139); // text-slate-500
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      let levelText = "";
      if (readiness.score >= 80) {
        levelText = "Excellent niveau de preparation";
      } else if (readiness.score >= 60) {
        levelText = "Bonne preparation, quelques ameliorations possibles";
      } else {
        levelText = "Preparation insuffisante, travail necessaire";
      }
      doc.text(levelText, margin + 80, currentY + 20);
      
      // Détails de la préparation
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Questions completees: ${completedQuestions.size}/${interviewQuestions.length}`, margin + 80, currentY + 35);
      doc.text(`Score qualite: ${readiness.score}/100`, margin + 80, currentY + 45);
      
      currentY += 85;
      
      // Section Réponses aux questions avec un design plus moderne
      doc.setFillColor(248, 250, 252); // bg-slate-50
      doc.rect(margin, currentY - 5, maxWidth, 25, 'F');
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setLineWidth(0.5);
      doc.rect(margin, currentY - 5, maxWidth, 25, 'S');
      
      doc.setTextColor(30, 41, 59); // text-slate-800
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Reponses aux Questions d'Entretien", margin + 10, currentY + 10);
      
      currentY += 35;
      
      interviewQuestions.forEach((question, index) => {
        const response = responses[question.id] || "";
        
        // Vérifier si on a besoin d'une nouvelle page
        if (currentY + 60 > pageHeight - 30) {
          doc.addPage();
          currentY = 30;
        }
        
        // En-tête de question avec couleur selon la difficulté
        let difficultyColor;
        switch(question.difficulty) {
          case "Facile":
            difficultyColor = [34, 197, 94]; // green
            break;
          case "Moyen":
            difficultyColor = [249, 115, 22]; // orange
            break;
          case "Difficile":
            difficultyColor = [239, 68, 68]; // red
            break;
          default:
            difficultyColor = [100, 116, 139]; // slate
        }
        
        // Encadré pour la question
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY - 5, maxWidth, 15, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY - 5, maxWidth, 15, 'S');
        
        // Numéro et titre de la question
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Question ${index + 1}: ${question.category}`, margin + 5, currentY + 5);
        
        // Badge difficulté
        doc.setFillColor(difficultyColor[0], difficultyColor[1], difficultyColor[2]);
        doc.rect(pageWidth - 60, currentY - 3, 35, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const difficultyWidth = doc.getTextWidth(question.difficulty);
        doc.text(question.difficulty, pageWidth - 60 + (35 - difficultyWidth) / 2, currentY + 3);
        
        currentY += 20;
        
        // Question
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        const questionLines = doc.splitTextToSize(question.question, maxWidth - 10);
        doc.text(questionLines, margin + 5, currentY);
        currentY += questionLines.length * 5 + 5;
        
        // Conseils
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        const tipsLines = doc.splitTextToSize(`Conseil: ${question.tips}`, maxWidth - 10);
        doc.text(tipsLines, margin + 5, currentY);
        currentY += tipsLines.length * 4 + 8;
        
        // Réponse avec encadré
        doc.setFillColor(249, 250, 251); // bg-gray-50
        const responseHeight = response ? Math.max(30, Math.ceil(response.length / 80) * 5) : 20;
        doc.rect(margin, currentY - 5, maxWidth, responseHeight, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY - 5, maxWidth, responseHeight, 'S');
        
        doc.setTextColor(response ? 30 : 156, response ? 41 : 163, response ? 59 : 175);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (response) {
          const responseLines = doc.splitTextToSize(response, maxWidth - 15);
          doc.text(responseLines, margin + 7, currentY + 5);
        } else {
          doc.text("Aucune reponse fournie", margin + 7, currentY + 8);
        }
        
        currentY += responseHeight + 15;
      });
      
      // Section Notes personnelles
      if (notes && notes.trim()) {
        if (currentY + 40 > pageHeight - 30) {
          doc.addPage();
          currentY = 30;
        }
        
        doc.setFillColor(240, 249, 255); // bg-blue-50
        doc.rect(margin, currentY - 5, maxWidth, 25, 'F');
        doc.setDrawColor(191, 219, 254); // border-blue-200
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY - 5, maxWidth, 25, 'S');
        
        doc.setTextColor(30, 58, 138); // text-blue-800
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Notes Personnelles", margin + 10, currentY + 10);
        
        currentY += 35;
        
        // Encadré pour les notes
        const notesHeight = Math.max(30, Math.ceil(notes.length / 80) * 5);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, currentY - 5, maxWidth, notesHeight, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY - 5, maxWidth, notesHeight, 'S');
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(notes, maxWidth - 15);
        doc.text(notesLines, margin + 7, currentY + 5);
        
        currentY += notesHeight + 20;
      }
      
      // Section Conseils d'amélioration
      if (currentY + 40 > pageHeight - 30) {
        doc.addPage();
        currentY = 30;
      }
      
      const advice = analyzeResponses();
      
      if (advice.length > 0) {
        doc.setFillColor(254, 242, 242); // bg-red-50
        doc.rect(margin, currentY - 5, maxWidth, 25, 'F');
        doc.setDrawColor(254, 202, 202); // border-red-200
        doc.setLineWidth(0.5);
        doc.rect(margin, currentY - 5, maxWidth, 25, 'S');
        
        doc.setTextColor(153, 27, 27); // text-red-800
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Conseils d'Amelioration", margin + 10, currentY + 10);
        
        currentY += 35;
        
        advice.forEach((item, index) => {
          if (currentY + 40 > pageHeight - 30) {
            doc.addPage();
            currentY = 30;
          }
          
          // Couleur selon la sévérité
          let severityColor;
          switch(item.severity) {
            case "high":
              severityColor = [239, 68, 68]; // red
              break;
            case "medium":
              severityColor = [249, 115, 22]; // orange
              break;
            case "low":
              severityColor = [34, 197, 94]; // green
              break;
            default:
              severityColor = [100, 116, 139]; // slate
          }
          
          // Encadré pour le conseil
          doc.setFillColor(255, 255, 255);
          doc.rect(margin, currentY - 5, maxWidth, 35, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.rect(margin, currentY - 5, maxWidth, 35, 'S');
          
          // Badge sévérité
          doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
          doc.rect(margin + 5, currentY - 2, 8, 8, 'F');
          
          // Catégorie et problème
          doc.setTextColor(30, 41, 59);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`${item.category} - ${item.issue}`, margin + 18, currentY + 3);
          
          // Recommandation
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          const recommendationLines = doc.splitTextToSize(item.recommendation, maxWidth - 25);
          doc.text(recommendationLines, margin + 18, currentY + 12);
          
          currentY += 45;
        });
      }
      
      // Pied de page avec design moderne
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252); // bg-slate-50
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        doc.setTextColor(100, 116, 139); // text-slate-500
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} sur ${totalPages}`, pageWidth / 2 - 15, pageHeight - 8);
        doc.text("Genere par Anthea Emploi Tracker", margin, pageHeight - 8);
      }
      
      doc.save('preparation-entretien.pdf');
    };
    
    // Générer directement le PDF sans attendre le logo
    generatePDFContent();
  };

  const resetTraining = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setCompletedQuestions(new Set());
    setShowResults(false);
    setNotes('');
  };

  if (showResults) {
    const readiness = getReadinessScore();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">🎯 Résultats de votre préparation</h1>
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-white ${readiness.color} mb-4`}>
                <Star className="mr-2 h-5 w-5" />
                Niveau : {readiness.level} ({readiness.score}/100)
              </div>
              <p className="text-lg text-gray-600">{readiness.message}</p>
            </div>
            <Progress value={progress} className="w-full max-w-md mx-auto mb-6" />
            <p className="text-sm text-gray-500">{completedQuestions.size}/{interviewQuestions.length} questions complétées</p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>📝 Vos réponses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewQuestions.map((q) => (
                    <div key={q.id} className={`p-4 rounded-lg border ${completedQuestions.has(q.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{q.question}</h4>
                        {completedQuestions.has(q.id) && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </div>
                      {responses[q.id] && (
                        <p className="text-sm text-gray-600 mt-2">{responses[q.id].substring(0, 100)}...</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📝 Mes notes personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Ajoutez ici vos remarques personnelles, constats, points à retenir, questions spécifiques à l'entreprise..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="text-xs text-gray-500">
                    💡 Utilisez cette section pour noter vos observations, questions à poser, informations sur l'entreprise, ou tout autre point important pour votre entretien.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Conseils personnalisés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyzeResponses().length === 0 ? (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Excellente préparation !</p>
                      <p className="text-green-600 text-sm mt-1">Vos réponses sont bien structurées et complètes.</p>
                    </div>
                  ) : (
                    analyzeResponses().slice(0, 5).map((advice, index) => {
                      let bgColor, borderColor, textColor;
                      if (advice.severity === "high") {
                        bgColor = "bg-red-50";
                        borderColor = "border-red-400";
                        textColor = "text-red-800";
                      } else if (advice.severity === "medium") {
                        bgColor = "bg-orange-50";
                        borderColor = "border-orange-400";
                        textColor = "text-orange-800";
                      } else if (advice.severity === "low") {
                        bgColor = "bg-green-50";
                        borderColor = "border-green-400";
                        textColor = "text-green-800";
                      }
                      
                      return (
                        <div key={index} className={`${bgColor} p-4 rounded-lg border-l-4 ${borderColor}`}>
                          <p className={`font-medium ${textColor}`}>{advice.category}</p>
                          <p className={`text-sm ${textColor} mt-1`}>
                            <span className="font-medium">Problème :</span> {advice.issue}
                          </p>
                          <p className={`text-sm ${textColor} mt-1`}>
                            <span className="font-medium">Conseil :</span> {advice.recommendation}
                          </p>
                        </div>
                      );
                    })
                  )}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Conseils généraux :</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {progress < 100 && (
                        <p>• Complétez toutes les questions pour une préparation optimale</p>
                      )}
                      <p>• Relisez la <Link to="/methode-star" className="text-blue-600 hover:underline">méthode STAR</Link> pour structurer vos réponses</p>
                      <p>• Entraînez-vous à voix haute devant un miroir</p>
                      <p>• Préparez des questions à poser au recruteur</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={generatePDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            <Button onClick={resetTraining} variant="outline">
              Recommencer l'entraînement
            </Button>
            <Link to="/ameliorer-entretiens">
              <Button>
                Voir les conseils d'entretien
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🎯 Préparation entretien</h1>
          <p className="text-gray-600 mb-6">
            Entraînez-vous sur les questions d'entretien les plus courantes et évaluez votre niveau de préparation.
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-gray-500">{completedQuestions.size}/{interviewQuestions.length}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-2">
                    Question {currentQuestionIndex + 1}/{interviewQuestions.length}
                  </CardTitle>
                  <div className="flex gap-2 mb-3">
                    <Badge variant="secondary">{currentQuestion.category}</Badge>
                    <Badge variant={currentQuestion.difficulty === 'Facile' ? 'default' : currentQuestion.difficulty === 'Moyen' ? 'secondary' : 'destructive'}>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                </div>
                {completedQuestions.has(currentQuestion.id) && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Conseil</p>
                    <p className="text-sm text-blue-600">{currentQuestion.tips}</p>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Écrivez votre réponse ici... (minimum 50 caractères)"
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                className="min-h-[150px] mb-4"
              />

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(Math.min(interviewQuestions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === interviewQuestions.length - 1}
                  >
                    Suivant
                  </Button>
                </div>
                
                <Button
                  onClick={markQuestionComplete}
                  disabled={!responses[currentQuestion.id] || responses[currentQuestion.id].trim().length < 50}
                >
                  {completedQuestions.has(currentQuestion.id) ? 'Modifiée' : 'Valider'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Toutes les questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interviewQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentQuestionIndex 
                        ? 'bg-blue-50 border-blue-200' 
                        : completedQuestions.has(q.id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{q.question}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline">{q.category}</Badge>
                        </div>
                      </div>
                      {completedQuestions.has(q.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {completedQuestions.size > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => setShowResults(true)}
                    className="w-full"
                  >
                    Voir mes résultats
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link to="/ameliorer-entretiens" className="text-sm text-gray-600 hover:underline">
            ← Retour aux conseils d'entretien
          </Link>
        </div>
      </main>
    </div>
  );
}