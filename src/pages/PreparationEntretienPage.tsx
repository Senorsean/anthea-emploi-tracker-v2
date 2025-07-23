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
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("anthéa", margin, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("emploi Tracker", margin, 32);
      
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
      
      // Titre avec meilleure typographie (sans emoji)
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55); // text-gray-800
      doc.text("Resultats de votre preparation", margin + 10, currentY + 8);
      
      // Badge niveau avec design amélioré
      let badgeBgColor, badgeTextColor;
      if (readiness.level === "Excellent") {
        badgeBgColor = [34, 197, 94]; // bg-green-500
        badgeTextColor = [255, 255, 255]; // text-white
      } else if (readiness.level === "Très bien") {
        badgeBgColor = [59, 130, 246]; // bg-blue-500
        badgeTextColor = [255, 255, 255]; // text-white
      } else if (readiness.level === "Bien") {
        badgeBgColor = [249, 115, 22]; // bg-orange-500
        badgeTextColor = [255, 255, 255]; // text-white
      } else if (readiness.level === "Correct") {
        badgeBgColor = [251, 191, 36]; // bg-yellow-400
        badgeTextColor = [31, 41, 55]; // text-gray-800
      } else {
        badgeBgColor = [239, 68, 68]; // bg-red-500
        badgeTextColor = [255, 255, 255]; // text-white
      }
      
      // Badge avec design moderne centré
      const badgeText = `Niveau : ${readiness.level} (${readiness.score}/100)`;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const badgeWidth = doc.getTextWidth(badgeText) + 20;
      const badgeX = (pageWidth - badgeWidth) / 2; // Centrer le badge
      
      // Ombre du badge
      doc.setFillColor(0, 0, 0, 0.15);
      doc.roundedRect(badgeX + 1, currentY + 19 + 1, badgeWidth, 14, 7, 7, 'F');
      
      // Badge principal centré
      doc.setFillColor(badgeBgColor[0], badgeBgColor[1], badgeBgColor[2]);
      doc.roundedRect(badgeX, currentY + 19, badgeWidth, 14, 7, 7, 'F');
      
      doc.setTextColor(badgeTextColor[0], badgeTextColor[1], badgeTextColor[2]);
      doc.text(badgeText, badgeX + 10, currentY + 28);
      
      // Message avec meilleure typographie
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128); // text-gray-500
      doc.text(readiness.message, margin + 10, currentY + 42);
      
      // Texte de progression dans le cadre (sans barre)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(156, 163, 175); // text-gray-400
      const progressText = `${completedQuestions.size}/${interviewQuestions.length} questions completees`;
      const progressTextWidth = doc.getTextWidth(progressText);
      doc.text(progressText, (pageWidth - progressTextWidth) / 2, currentY + 52);
      
      currentY += 70;
      
      // Section Mes Réponses
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Mes Reponses", margin, currentY);
      currentY += 15;
      
      interviewQuestions.forEach((question, index) => {
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 25;
        }
        
        // Analyser la sévérité pour cette question spécifique
        const response = responses[question.id];
        let badgeSeverity = "low"; // Par défaut vert
        
        if (question.category === "Présentation" || question.category === "Travail d'équipe") {
          badgeSeverity = "medium"; // Orange pour ces catégories
        }
        
        if (!response || response.trim().length < 50) {
          badgeSeverity = "high"; // Rouge si pas de réponse
        } else if (response) {
          const responseText = response.toLowerCase();
          
          // Vérifications spécifiques selon la catégorie
          if (question.category === "Présentation" && !responseText.includes("expérience") && !responseText.includes("parcours")) {
            badgeSeverity = "medium"; // Orange
          } else if (question.category === "Travail d'équipe" && !responseText.includes("écoute") && !responseText.includes("communication")) {
            badgeSeverity = "medium"; // Orange
          } else if (question.category === "Motivation" && !responseText.includes("entreprise") && !responseText.includes("mission")) {
            badgeSeverity = "high"; // Rouge
          }
        }
        
        // Encadré pour chaque question
        doc.setFillColor(249, 250, 251); // bg-gray-50
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        const questionText = doc.splitTextToSize(`${index + 1}. ${question.question}`, maxWidth - 10);
        doc.text(questionText, margin + 5, currentY + 8);
        
        // Badge de catégorie avec couleur selon la sévérité
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        // Couleurs selon la sévérité
        if (badgeSeverity === "high") {
          doc.setFillColor(254, 226, 226); // bg-red-100
          doc.setTextColor(153, 27, 27); // text-red-800
        } else if (badgeSeverity === "medium") {
          doc.setFillColor(254, 243, 199); // bg-orange-100
          doc.setTextColor(154, 52, 18); // text-orange-800
        } else {
          doc.setFillColor(220, 252, 231); // bg-green-100
          doc.setTextColor(21, 128, 61); // text-green-800
        }
        
        const badgeWidth = Math.min(doc.getTextWidth(question.category) + 8, maxWidth - 10);
        doc.rect(margin + 5, currentY + 12, badgeWidth, 8, 'F');
        doc.text(question.category, margin + 9, currentY + 17);
        
        currentY += 25;
        
        const questionResponse = responses[question.id];
        if (questionResponse) {
          // Nettoyer le texte de la réponse pour éviter les problèmes d'affichage
          const cleanResponse = questionResponse.replace(/\s+/g, ' ').trim();
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81); // text-gray-700
          const splitResponse = doc.splitTextToSize(cleanResponse, maxWidth - 40);
          doc.text(splitResponse, margin + 10, currentY);
          currentY += splitResponse.length * 5 + 15;
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(156, 163, 175); // text-gray-400
          doc.text("Pas de reponse fournie", margin + 10, currentY);
          currentY += 20;
        }
        
        // Ligne de séparation
        doc.setDrawColor(229, 231, 235); // border-gray-200
        doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
      });
      
      // Section Conseils personnalisés
      const advice = analyzeResponses();
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 25;
      }
      
      currentY += 15;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Conseils Personnalises", margin, currentY);
      currentY += 15;
      
      if (advice.length === 0) {
        doc.setFillColor(240, 253, 244); // bg-green-50
        doc.rect(margin, currentY - 5, maxWidth, 25, 'F');
        doc.setDrawColor(34, 197, 94); // border-green-500
        doc.rect(margin, currentY - 5, maxWidth, 25, 'S');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(21, 128, 61); // text-green-700
        doc.text("Excellente preparation !", margin + 5, currentY + 5);
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(21, 128, 61);
        doc.text("Vos reponses sont bien structurees et completes.", margin + 5, currentY + 15);
        currentY += 35;
      } else {
        advice.slice(0, 8).forEach((item, index) => {
          if (currentY > pageHeight - 50) {
            doc.addPage();
            currentY = 25;
          }
          
          // Couleurs selon la gravité
          let bgColor, borderColor, textColor;
          if (item.severity === "high") {
            // Rouge pour les problèmes graves
            bgColor = [254, 226, 226]; // bg-red-100
            borderColor = [239, 68, 68]; // border-red-500
            textColor = [153, 27, 27]; // text-red-800
          } else if (item.severity === "medium") {
            // Orange pour les problèmes moyens
            bgColor = [254, 243, 199]; // bg-orange-100
            borderColor = [249, 115, 22]; // border-orange-500
            textColor = [154, 52, 18]; // text-orange-800
          } else {
            // Vert pour les bonnes pratiques
            bgColor = [220, 252, 231]; // bg-green-100
            borderColor = [34, 197, 94]; // border-green-500
            textColor = [21, 128, 61]; // text-green-800
          }
          
          // Encadré conseil avec couleur appropriée
          const estimatedHeight = 40;
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          doc.rect(margin, currentY - 3, maxWidth, estimatedHeight, 'F');
          doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.rect(margin, currentY - 3, maxWidth, estimatedHeight, 'S');
          
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.text(`${index + 1}. ${item.category}`, margin + 5, currentY + 5);
          
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          const issueText = doc.splitTextToSize(`Probleme : ${item.issue}`, maxWidth - 15);
          doc.text(issueText, margin + 10, currentY + 13);
          
          const recoText = doc.splitTextToSize(`Conseil : ${item.recommendation}`, maxWidth - 15);
          doc.text(recoText, margin + 10, currentY + 23);
          currentY += 45;
        });
      }
      
      // Pied de page avec conseils généraux
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 25;
      }
      
      currentY += 15;
      doc.setFillColor(239, 246, 255); // bg-blue-50
      doc.rect(margin, currentY - 5, maxWidth, 50, 'F');
      doc.setDrawColor(147, 197, 253); // border-blue-300
      doc.rect(margin, currentY - 5, maxWidth, 50, 'S');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175); // text-blue-800
      doc.text("Conseils generaux pour reussir", margin + 5, currentY + 8);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 58, 138); // text-blue-900
      const generalTips = [
        "• Entrainez-vous a voix haute devant un miroir",
        "• Preparez des questions a poser au recruteur", 
        "• Recherchez l'entreprise et ses valeurs",
        "• Arrivez 10 minutes en avance le jour J"
      ];
      
      generalTips.forEach((tip, index) => {
        const tipText = doc.splitTextToSize(tip, maxWidth - 15);
        doc.text(tipText, margin + 10, currentY + 18 + (index * 8));
      });
      
      doc.save('preparation-entretien.pdf');
    };
    
    // Générer directement le PDF
    generatePDFContent();
  };

  const resetTraining = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setCompletedQuestions(new Set());
    setShowResults(false);
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