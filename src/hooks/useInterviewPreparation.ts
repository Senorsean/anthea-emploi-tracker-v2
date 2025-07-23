import { useState, useEffect } from "react";

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

export const useInterviewPreparation = () => {
  const [responses, setResponses] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('interview-responses');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('interview-completed');
    if (saved) {
      const parsed = JSON.parse(saved);
      return new Set(parsed);
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('interview-responses', JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem('interview-completed', JSON.stringify(Array.from(completedQuestions)));
  }, [completedQuestions]);

  const checkRelevance = (responseText: string, category: string): boolean => {
    // Mots-clés requis pour chaque catégorie
    const requiredKeywords: Record<string, string[]> = {
      "Présentation": ["parcours", "expérience", "formation", "compétence", "diplôme", "travail", "poste", "carrière"],
      "Motivation": ["entreprise", "poste", "mission", "valeurs", "projet", "équipe", "développer", "contribuer"],
      "Compétences": ["situation", "défi", "problème", "solution", "action", "résultat", "exemple", "projet"],
      "Faiblesses": ["faiblesse", "défaut", "améliorer", "développer", "travailler", "point", "difficulté", "progrès"],
      "Ambition": ["objectif", "avenir", "développement", "évolution", "carrière", "apprendre", "grandir", "projets"],
      "Gestion du stress": ["stress", "pression", "gestion", "technique", "calme", "organisation", "priorité", "méthode"],
      "Travail d'équipe": ["équipe", "collègue", "conflit", "communication", "collaboration", "résolution", "écoute", "groupe"],
      "Leadership": ["initiative", "direction", "équipe", "projet", "décision", "responsabilité", "encadrer", "motiver"]
    };

    const keywords = requiredKeywords[category] || [];
    return keywords.some(keyword => responseText.includes(keyword));
  };

  const analyzeResponses = () => {
    const advice = [];
    
    interviewQuestions.forEach((question) => {
      const response = responses[question.id];
      
      // Validation par nombre de mots
      if (!response || response.trim().length === 0) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: "Réponse manquante",
          recommendation: "Veuillez répondre à cette question.",
          severity: "high" // Rouge
        });
        return;
      }

      const wordCount = response.trim().split(/\s+/).length;
      
      if (wordCount <= 20) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: `Réponse trop courte (${wordCount} mots)`,
          recommendation: "Développez davantage votre réponse en donnant des exemples concrets.",
          severity: "high" // Rouge
        });
        return;
      }
      
      if (wordCount <= 50) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: `Réponse courte (${wordCount} mots)`,
          recommendation: "Ajoutez plus de détails et d'exemples pour enrichir votre réponse.",
          severity: "medium" // Orange
        });
      }

      const responseText = response.toLowerCase();
      
      // Vérification de la pertinence de la réponse
      const isRelevantResponse = checkRelevance(responseText, question.category);
      if (!isRelevantResponse) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: "Réponse non pertinente",
          recommendation: `Votre réponse ne semble pas être en rapport avec la question "${question.question}". Répondez spécifiquement à ce qui est demandé.`,
          severity: "high" // Rouge
        });
        return;
      }
      
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
      
      // Vérification pour les réponses trop longues
      if (wordCount > 150) {
        advice.push({
          category: question.category,
          question: question.question,
          issue: `Réponse trop longue (${wordCount} mots)`,
          recommendation: "Soyez plus concis, l'idéal est entre 50-100 mots.",
          severity: "medium" // Orange
        });
      }
    });
    
    return advice;
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

  const progress = (completedQuestions.size / interviewQuestions.length) * 100;

  return {
    responses,
    setResponses,
    completedQuestions,
    setCompletedQuestions,
    interviewQuestions,
    analyzeResponses,
    getReadinessScore,
    progress
  };
};