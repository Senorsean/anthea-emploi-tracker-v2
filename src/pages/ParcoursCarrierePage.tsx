import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParcoursCarrierePage = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: '',
    teamSize: '',
    scope: '',
    industry: '',
    country: '',
    city: '',
    workArrangement: '',
    language: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Handle form submission
  };

  const teamSizeOptions = [
    { value: 'no', label: 'No' },
    { value: '1-4', label: '1-4' },
    { value: '5-10', label: '5-10' },
    { value: '10+', label: '10+' }
  ];

  const scopeOptions = [
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Regional' },
    { value: 'global', label: 'Global' }
  ];

  const workArrangementOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Full Remote' }
  ];

  const industries = [
    'Technologie & IT',
    'Finance & Banque',
    'Consulting',
    'Santé & Pharmaceutique',
    'Éducation',
    'Marketing & Communication',
    'Vente & Commerce',
    'Ressources Humaines',
    'Ingénierie',
    'Design & Créatif'
  ];

  const countries = [
    'France',
    'Belgique',
    'Suisse',
    'Canada',
    'États-Unis',
    'Royaume-Uni',
    'Allemagne',
    'Espagne',
    'Italie'
  ];

  const languages = [
    'Français',
    'English',
    'Español',
    'Deutsch',
    'Italiano'
  ];

  const RadioGroup = ({ 
    name, 
    options, 
    value, 
    onChange 
  }: { 
    name: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-full border text-sm transition-all ${
            value === option.value
              ? 'bg-[#a4007c] text-white border-[#a4007c]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#a4007c] hover:text-[#a4007c]'
          }`}
        >
          {value === option.value && <CheckCircle className="w-4 h-4 inline mr-2" />}
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/progression-carriere"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Progression de Carrière
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Parcours de Carrière
            </h1>
            <p className="text-lg text-gray-600">
              Entrez vos informations pour voir vos informations personnalisées sur le Parcours de Carrière.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-base font-medium text-gray-900">
                    Titre de poste:
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="p. ex. Responsable Marketing Digital"
                    className="text-base"
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-base font-medium text-gray-900">
                    Années d'expérience:
                  </Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="p. ex. 5"
                    type="number"
                    className="text-base"
                  />
                </div>

                {/* Team Management */}
                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-900">
                    Gestion des membres de l'équipe:
                  </Label>
                  <RadioGroup
                    name="teamSize"
                    options={teamSizeOptions}
                    value={formData.teamSize}
                    onChange={(value) => handleInputChange('teamSize', value)}
                  />
                </div>

                {/* Scope */}
                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-900">
                    Portée:
                  </Label>
                  <RadioGroup
                    name="scope"
                    options={scopeOptions}
                    value={formData.scope}
                    onChange={(value) => handleInputChange('scope', value)}
                  />
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-900">
                    Industrie / Secteur:
                  </Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Tapez ou sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-900">
                    Localisation:
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm text-gray-600">
                        Pays
                      </Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tapez ou sélectionnez" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm text-gray-600">
                        Ville
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="p. ex. Los Angeles, Californie"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Arrangement */}
                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-900">
                    Disposition de travail:
                  </Label>
                  <RadioGroup
                    name="workArrangement"
                    options={workArrangementOptions}
                    value={formData.workArrangement}
                    onChange={(value) => handleInputChange('workArrangement', value)}
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-900">
                    Langue à utiliser
                  </Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-[#1a365d] hover:bg-[#2d4a6b] text-white py-4 text-lg font-medium"
                  >
                    Générer le rapport Parcours de Carrière
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ParcoursCarrierePage;