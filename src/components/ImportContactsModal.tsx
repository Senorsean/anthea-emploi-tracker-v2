import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Contact } from '@/data/contacts';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: Omit<Contact, 'id' | 'dateAdded'>[]) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = [
      ['nom', 'entreprise', 'poste', 'email', 'linkedin', 'statut', 'notes'],
      ['John Doe', 'Tech Corp', 'Développeur Senior', 'john@techcorp.com', 'in/john-doe', 'pending', 'Rencontré à la conférence'],
      ['Jane Smith', 'StartupXYZ', 'Product Manager', 'jane@startupxyz.com', 'in/jane-smith', 'contacted', '']
    ];

    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.trim().split('\n');
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données');
      }

      const headers = rows[0].map(h => h.toLowerCase().replace(/"/g, ''));
      const dataRows = rows.slice(1);

      // Vérifier les colonnes requises
      const requiredColumns = ['nom', 'entreprise', 'poste', 'email'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`Colonnes manquantes: ${missingColumns.join(', ')}`);
      }

      const contacts: Omit<Contact, 'id' | 'dateAdded'>[] = dataRows.map((row, index) => {
        const contact: any = {};
        
        headers.forEach((header, i) => {
          const value = row[i]?.replace(/"/g, '') || '';
          switch (header) {
            case 'nom':
              contact.name = value;
              break;
            case 'entreprise':
              contact.company = value;
              break;
            case 'poste':
              contact.position = value;
              break;
            case 'email':
              contact.email = value;
              break;
            case 'linkedin':
              contact.linkedin = value;
              break;
            case 'statut':
              const status = value.toLowerCase();
              if (['pending', 'contacted', 'replied', 'referred'].includes(status)) {
                contact.status = status;
              } else {
                contact.status = 'pending';
              }
              break;
            case 'notes':
              contact.notes = value;
              break;
          }
        });

        // Validation des champs requis
        if (!contact.name || !contact.company || !contact.position || !contact.email) {
          throw new Error(`Ligne ${index + 2}: tous les champs requis doivent être remplis`);
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.email)) {
          throw new Error(`Ligne ${index + 2}: format d'email invalide`);
        }

        return contact;
      });

      onImport(contacts);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import du fichier');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des contacts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>1. Télécharger le template</Label>
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger le template CSV
            </Button>
            <p className="text-sm text-muted-foreground">
              Utilisez ce template pour formater vos contacts correctement.
            </p>
          </div>

          <div className="space-y-2">
            <Label>2. Importer votre fichier</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Accepte uniquement les fichiers CSV.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <strong>Format requis :</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Colonnes obligatoires : nom, entreprise, poste, email</li>
                  <li>• Colonnes optionnelles : linkedin, statut, notes</li>
                  <li>• Statuts valides : pending, contacted, replied, referred</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};