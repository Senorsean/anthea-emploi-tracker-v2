import React, { useState } from 'react';
import { ArrowLeft, Check, Star, Users, TrendingUp, Camera, Edit3, Search, MessageCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const OptimiserProfilLinkedinPage = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [profileScore, setProfileScore] = useState(0);
  
  // États pour le générateur de compétences
  const [jobTitle, setJobTitle] = useState('');
  const [missions, setMissions] = useState('');
  const [tools, setTools] = useState('');
  const [generatedSkills, setGeneratedSkills] = useState<{
    technical: string[];
    methodological: string[];
    relational: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChecklistToggle = (item: string) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter(i => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
    
    // Calculate profile score based on checked items
    const newScore = Math.round((checkedItems.length / checklistItems.length) * 100);
    setProfileScore(newScore);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const generateSkills = async () => {
    if (!jobTitle.trim() || !missions.trim() || !tools.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsGenerating(true);
    try {
      // Simuler un appel API pour générer les compétences
      // En production, cela ferait appel à une fonction edge avec OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Exemple de compétences générées (à remplacer par un vrai appel API)
      const mockSkills = {
        technical: [
          'Google Ads', 'Meta Business Manager', 'Google Analytics',
          'SEO/SEM', 'HubSpot'
        ],
        methodological: [
          'Gestion de projet digital', 'Analyse de données marketing',
          'A/B Testing', 'Optimisation de conversion', 'Marketing automation'
        ],
        relational: [
          'Communication digitale', 'Collaboration équipe', 'Présentation client',
          'Leadership d\'équipe', 'Négociation commerciale'
        ]
      };
      
      setGeneratedSkills(mockSkills);
    } catch (error) {
      alert('Erreur lors de la génération des compétences');
    } finally {
      setIsGenerating(false);
    }
  };

  const checklistItems = [
    'Photo de profil professionnelle et souriante',
    'Bannière personnalisée reflétant votre secteur',
    'Titre professionnel accrocheur avec mots-clés',
    'Résumé "À propos" structuré et convaincant',
    'Expériences détaillées avec résultats chiffrés',
    'Formations et certifications à jour',
    'Compétences stratégiques validées',
    'Au moins 3 recommandations récentes',
    'Contact personnalisé avec tous vos collègues',
    'Publications régulières sur votre expertise'
  ];

  const linkedinStats = [
    { label: 'Utilisateurs actifs', value: '900M+', icon: Users },
    { label: 'Recruteurs utilisent LinkedIn', value: '98%', icon: TrendingUp },
    { label: 'Candidatures via LinkedIn', value: '3x plus', icon: Star }
  ];

  const resumeStructure = {
    introduction: "🎯 [Votre métier] passionné(e) par [votre domaine d'expertise]",
    expertise: "💼 Spécialisé(e) dans [vos compétences clés] avec [X années] d'expérience",
    objectif: "🚀 Actuellement à la recherche de [type de poste] pour [vos objectifs]"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au tableau de bord
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Optimiser son profil LinkedIn
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Améliorer votre visibilité et votre attractivité professionnelle sur LinkedIn
            </p>
            
            {/* Score du profil */}
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="font-semibold">Score d'optimisation de votre profil</p>
                  <div className="text-3xl font-bold text-primary">{profileScore}%</div>
                  <Progress value={profileScore} className="w-full" />
                  <p className="text-sm text-gray-600">
                    {profileScore < 30 ? "Profil à optimiser" : 
                     profileScore < 70 ? "Bon profil, améliorations possibles" : 
                     "Excellent profil !"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Objectifs pédagogiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Objectifs pédagogiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-medium">À la fin de ce module, vous serez capable de :</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Comprendre les éléments clés d\'un profil LinkedIn optimisé',
                  'Mettre à jour chaque section avec des contenus impactants',
                  'Utiliser les bons mots-clés pour ressortir dans les recherches',
                  'Développer une stratégie de visibilité efficace'
                ].map((objective, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques LinkedIn */}
          <Card>
            <CardHeader>
              <CardTitle>Pourquoi LinkedIn est essentiel aujourd'hui ?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {linkedinStats.map((stat, idx) => (
                  <div key={idx} className="text-center space-y-2">
                    <stat.icon className="h-12 w-12 text-primary mx-auto" />
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="checklist" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="resume">Résumé</TabsTrigger>
              <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
              <TabsTrigger value="skills">Compétences</TabsTrigger>
              <TabsTrigger value="strategy">Stratégie</TabsTrigger>
            </TabsList>

            {/* Checklist interactive */}
            <TabsContent value="checklist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Checklist d'optimisation de profil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {checklistItems.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`checklist-${idx}`}
                          checked={checkedItems.includes(item)}
                          onChange={() => handleChecklistToggle(item)}
                          className="w-4 h-4 text-primary"
                        />
                        <label
                          htmlFor={`checklist-${idx}`}
                          className={`flex-1 cursor-pointer ${
                            checkedItems.includes(item) ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conseils par section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Photo & Bannière
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-semibold">Photo de profil :</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Souriante et professionnelle</li>
                      <li>• Fond neutre ou bureautique</li>
                      <li>• Haute résolution (400x400 min)</li>
                      <li>• Vous seul(e) sur la photo</li>
                    </ul>
                    <h4 className="font-semibold mt-4">Bannière :</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Refléter votre secteur d'activité</li>
                      <li>• Inclure votre domaine d'expertise</li>
                      <li>• Dimensions : 1584 x 396 pixels</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Titre professionnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h4 className="font-semibold">Formules efficaces :</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">[Métier] | [Expertise] | [Secteur]</p>
                        <p className="text-gray-600">Ex: "Développeur Full-Stack | React & Node.js | FinTech"</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">[Action] + [Valeur] + [Pour qui]</p>
                        <p className="text-gray-600">Ex: "J'aide les startups à digitaliser leurs processus métier"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Atelier résumé */}
            <TabsContent value="resume" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>✍️ Atelier rédaction de résumé LinkedIn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Structure recommandée :</h3>
                    {Object.entries(resumeStructure).map(([key, template], idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium mb-2 capitalize">{key} :</p>
                        <p className="text-sm text-gray-700">{template}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Rédigez votre résumé :</h3>
                    <Textarea
                      placeholder="Rédigez votre résumé LinkedIn en suivant la structure ci-dessus..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{resumeText.length} / 2600 caractères</span>
                      <Button
                        onClick={() => {
                          // Analyser le résumé et donner des conseils
                          alert('Fonction d\'analyse du résumé à implémenter avec IA');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Analyser mon résumé
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exercice mots-clés */}
            <TabsContent value="keywords" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    🔍 Exercice : identification de mots-clés métiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Identifiez les mots-clés stratégiques pour votre secteur. Ces mots-clés doivent apparaître dans votre titre, résumé et expériences.
                    </p>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ajoutez un mot-clé (ex: JavaScript, Management, Marketing Digital...)"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button onClick={addKeyword}>Ajouter</Button>
                    </div>

                    {keywords.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Vos mots-clés :</h4>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeKeyword(keyword)}
                            >
                              {keyword} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">💡 Conseils pour les mots-clés :</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Analysez les offres d'emploi de votre secteur</li>
                      <li>• Regardez les profils de personnes aux postes similaires</li>
                      <li>• Utilisez des synonymes et variations</li>
                      <li>• Incluez compétences techniques ET soft skills</li>
                      <li>• Pensez aux certifications et outils métiers</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Générateur de compétences */}
            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 Générateur de compétences stratégiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Générez une liste de 15 compétences stratégiques personnalisées pour votre profil LinkedIn, 
                      classées en 3 catégories.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="font-semibold text-sm mb-2 block">
                          Voici mon métier :
                        </label>
                        <Input
                          placeholder="ex. Responsable Marketing Digital"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="font-semibold text-sm mb-2 block">
                          Voici mes missions :
                        </label>
                        <Textarea
                          placeholder="ex. gestion de campagnes SEA/SEO, analyse de données, animation réseaux sociaux"
                          value={missions}
                          onChange={(e) => setMissions(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <label className="font-semibold text-sm mb-2 block">
                          Voici les outils que j'utilise :
                        </label>
                        <Input
                          placeholder="ex. Google Ads, Meta Business, HubSpot, Semrush"
                          value={tools}
                          onChange={(e) => setTools(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={generateSkills}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? 'Génération en cours...' : 'Générer mes compétences stratégiques'}
                    </Button>
                  </div>

                  {generatedSkills && (
                    <>
                      <Separator />
                      
                      <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Vos 15 compétences stratégiques :</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-primary">💻 Techniques (Hard Skills)</h4>
                            <div className="space-y-2">
                              {generatedSkills.technical.map((skill, idx) => (
                                <Badge key={idx} variant="default" className="block text-center py-2">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-blue-600">⚙️ Méthodologiques</h4>
                            <div className="space-y-2">
                              {generatedSkills.methodological.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="block text-center py-2">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-green-600">👥 Relationnelles (Soft Skills)</h4>
                            <div className="space-y-2">
                              {generatedSkills.relational.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="block text-center py-2">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stratégie de visibilité */}
            <TabsContent value="strategy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    🚀 Stratégie de visibilité et réseautage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Publications efficaces :</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Partagez vos réflexions sur votre secteur</li>
                        <li>• Commentez les actualités de votre domaine</li>
                        <li>• Publiez 2-3 fois par semaine</li>
                        <li>• Utilisez des visuels attrayants</li>
                        <li>• Posez des questions pour engager</li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Techniques de réseautage :</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Personnalisez vos invitations</li>
                        <li>• Connectez-vous avec vos collègues</li>
                        <li>• Participez aux groupes de votre secteur</li>
                        <li>• Félicitez les promotions/anniversaires</li>
                        <li>• Partagez le contenu de votre réseau</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">🎓 Résultat attendu</h3>
                    <p className="text-gray-700 mb-4">
                      À la fin de ce module, vous pourrez générer une version optimisée de votre profil LinkedIn 
                      et recevrez un score d'attractivité calculé par IA, avec recommandations personnalisées.
                    </p>
                    <Button className="w-full" size="lg">
                      Générer mon rapport d'optimisation IA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default OptimiserProfilLinkedinPage;