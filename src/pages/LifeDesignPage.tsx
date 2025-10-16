import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, Lightbulb } from 'lucide-react';

interface LifePrototype {
  id: string;
  title: string;
  description: string;
  experiments: string;
}

const LifeDesignPage = () => {
  const [prototypes, setPrototypes] = useState<LifePrototype[]>([
    { id: '1', title: '', description: '', experiments: '' }
  ]);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addPrototype = () => {
    setPrototypes([
      ...prototypes,
      { id: Date.now().toString(), title: '', description: '', experiments: '' }
    ]);
  };

  const removePrototype = (id: string) => {
    if (prototypes.length > 1) {
      setPrototypes(prototypes.filter(p => p.id !== id));
    }
  };

  const updatePrototype = (id: string, field: keyof LifePrototype, value: string) => {
    setPrototypes(prototypes.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validPrototypes = prototypes.filter(p => p.title.trim() && p.description.trim());
    
    if (validPrototypes.length === 0) {
      toast.error('Veuillez définir au moins un prototype de vie avec un titre et une description');
      return;
    }

    setIsLoading(true);
    setAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-life-design-analysis', {
        body: { prototypes: validPrototypes }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success('Analyse Life Design générée avec succès !');
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Erreur lors de la génération de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Life Design 🎨
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Design Thinking appliqué à la carrière - Approche Stanford
          </p>
        </div>

        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-purple-600" />
              Prototypez vos vies possibles
            </CardTitle>
            <CardDescription>
              Imaginez 2 à 5 vies professionnelles différentes que vous pourriez mener. 
              Pour chacune, définissez des petites expériences concrètes à tester avant de vous engager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {prototypes.map((prototype, index) => (
                <Card key={prototype.id} className="border-purple-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Prototype #{index + 1}</CardTitle>
                      {prototypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePrototype(prototype.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`title-${prototype.id}`}>
                        Titre de cette vie possible *
                      </Label>
                      <Input
                        id={`title-${prototype.id}`}
                        placeholder="Ex: Entrepreneur dans la tech, Consultant freelance, Formateur..."
                        value={prototype.title}
                        onChange={(e) => updatePrototype(prototype.id, 'title', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`description-${prototype.id}`}>
                        Description de cette vie *
                      </Label>
                      <Textarea
                        id={`description-${prototype.id}`}
                        placeholder="Décrivez cette vie : à quoi ressemblerait votre quotidien ? Quelles activités ? Quel environnement ? Quelles valeurs ?"
                        value={prototype.description}
                        onChange={(e) => updatePrototype(prototype.id, 'description', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`experiments-${prototype.id}`}>
                        Expériences à tester
                      </Label>
                      <Textarea
                        id={`experiments-${prototype.id}`}
                        placeholder="Quelles petites actions pourriez-vous faire pour tester cette vie ? (ex: mission freelance, bénévolat, side project, rencontres...)"
                        value={prototype.experiments}
                        onChange={(e) => updatePrototype(prototype.id, 'experiments', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addPrototype}
                className="w-full border-dashed border-purple-300 hover:border-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un prototype de vie
              </Button>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Générer l'analyse Life Design
              </Button>
            </form>
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-purple-600">Votre Plan d'Action Life Design</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-purple max-w-none">
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

export default LifeDesignPage;
