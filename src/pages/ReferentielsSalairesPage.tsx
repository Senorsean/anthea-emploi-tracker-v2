import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReferentielsSalairesPage = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: '',
    teamSize: '',
    scope: '',
    industry: '',
    country: 'France',
    city: '',
    workMode: '',
    language: 'French'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const teamSizeOptions = [
    { value: 'no', label: 'No' },
    { value: '1-4', label: '1-4' },
    { value: '5-10', label: '5-10' },
    { value: '10+', label: '10+' },
  ];

  const scopeOptions = [
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Régional' },
    { value: 'global', label: 'Global' },
  ];

  const workModeOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Full Remote' },
  ];

  const RadioGroup = ({ 
    options, 
    value, 
    onChange, 
    name 
  }: { 
    options: { value: string; label: string }[]; 
    value: string; 
    onChange: (value: string) => void; 
    name: string;
  }) => (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-colors ${
            value === option.value
              ? 'bg-[#e91e63] text-white border-[#e91e63]'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="text-sm font-medium">{option.label}</span>
        </label>
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Référentiels de Salaires
            </h1>
            <p className="text-gray-600">
              Entrez vos informations pour voir les fourchettes salariales et la croissance salariale projetée.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
            {/* Job Title */}
            <div className="space-y-3">
              <Label htmlFor="jobTitle" className="text-base font-medium text-gray-900">
                Titre de poste:
              </Label>
              <Input
                id="jobTitle"
                placeholder="p. ex. Responsable Marketing Digital"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <Label htmlFor="experience" className="text-base font-medium text-gray-900">
                Années d'expérience:
              </Label>
              <Input
                id="experience"
                placeholder="p. ex. 5"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="h-12"
              />
            </div>

            {/* Team Management */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Gestion des membres de l'équipe:
              </Label>
              <RadioGroup
                options={teamSizeOptions}
                value={formData.teamSize}
                onChange={(value) => handleInputChange('teamSize', value)}
                name="teamSize"
              />
            </div>

            {/* Scope */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Portée:
              </Label>
              <RadioGroup
                options={scopeOptions}
                value={formData.scope}
                onChange={(value) => handleInputChange('scope', value)}
                name="scope"
              />
            </div>

            {/* Industry */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Industrie / Secteur:
              </Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Tapez ou sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="services-professionnels">Services professionnels</SelectItem>
                  <SelectItem value="technologie">Technologie</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="sante">Santé</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                  <SelectItem value="retail">Commerce de détail</SelectItem>
                  <SelectItem value="manufacturing">Fabrication</SelectItem>
                  <SelectItem value="consulting">Conseil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Localisation:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="text-sm text-gray-600 mb-2 block">
                    Pays
                  </Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Belgium">Belgique</SelectItem>
                      <SelectItem value="Switzerland">Suisse</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="city" className="text-sm text-gray-600 mb-2 block">
                    Ville
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="p. ex. Los Angeles, Californie"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="h-12 pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Mode */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Disposition de travail:
              </Label>
              <RadioGroup
                options={workModeOptions}
                value={formData.workMode}
                onChange={(value) => handleInputChange('workMode', value)}
                name="workMode"
              />
            </div>

            {/* Language */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-900">
                Langue à utiliser
              </Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="pt-6">
              <Button 
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-full"
                onClick={() => {
                  // Handle form submission
                  console.log('Generating salary report...', formData);
                }}
              >
                Générer le rapport salarial →
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferentielsSalairesPage;