import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface Dimension {
  name: string;
  description: string;
  value: number;
}

const RoueVieProfessionnellePage = () => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState<Dimension[]>([
    { name: 'Salaire et rémunération', description: 'Satisfaction vis-à-vis de votre rémunération globale', value: 5 },
    { name: 'Sens et valeurs', description: 'Alignement entre votre travail et vos valeurs personnelles', value: 5 },
    { name: 'Relations et ambiance', description: 'Qualité des relations avec collègues et managers', value: 5 },
    { name: 'Développement et apprentissage', description: 'Opportunités d\'apprendre et de développer vos compétences', value: 5 },
    { name: 'Équilibre vie pro/perso', description: 'Équilibre entre votre vie professionnelle et personnelle', value: 5 },
    { name: 'Reconnaissance', description: 'Reconnaissance de votre travail et de vos contributions', value: 5 },
    { name: 'Autonomie', description: 'Liberté et autonomie dans votre travail', value: 5 },
    { name: 'Perspectives d\'évolution', description: 'Possibilités de progression et d\'évolution de carrière', value: 5 },
  ]);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateDimension = (index: number, value: number) => {
    const newDimensions = [...dimensions];
    newDimensions[index].value = value;
    setDimensions(newDimensions);
  };

  const getChartData = () => {
    return dimensions.map(d => ({
      dimension: d.name.split(' ')[0], // Abbreviate for readability
      value: d.value,
      fullName: d.name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-life-wheel-analysis', {
        body: { dimensions }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success('Analyse de votre roue de vie générée avec succès !');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Erreur lors de la génération de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-start">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Retour accueil
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Roue de la vie professionnelle ⭕
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Évaluez visuellement les différentes dimensions de votre vie professionnelle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Évaluation des dimensions */}
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-indigo-600" />
                Évaluez chaque dimension
              </CardTitle>
              <CardDescription>
                Notez chaque dimension de 1 (très insatisfait) à 10 (très satisfait)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {dimensions.map((dimension, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Label className="font-semibold text-gray-900">
                          {dimension.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {dimension.description}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-indigo-600 ml-4">
                        {dimension.value}
                      </span>
                    </div>
                    <Slider
                      value={[dimension.value]}
                      onValueChange={(value) => updateDimension(index, value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Générer l'analyse
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Visualisation de la roue */}
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle>Visualisation de votre roue</CardTitle>
              <CardDescription>
                Représentation graphique de votre équilibre professionnel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={getChartData()}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis 
                    dataKey="dimension" 
                    tick={{ fill: '#475569', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]} 
                    tick={{ fill: '#64748b' }}
                  />
                  <Radar
                    name="Niveau de satisfaction"
                    dataKey="value"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.6}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Moyenne :</strong> {(dimensions.reduce((sum, d) => sum + d.value, 0) / dimensions.length).toFixed(1)} / 10
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {analysis && (
          <Card className="border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-indigo-600">Analyse de votre roue de vie professionnelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-indigo max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RoueVieProfessionnellePage;
