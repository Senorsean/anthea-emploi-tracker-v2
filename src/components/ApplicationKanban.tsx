

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ExternalLink, Calendar, Building, Upload, Info, Lightbulb, Trash } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { AddJobModal } from './AddJobModal';
import { Job } from '@/data/jobs';
import { useJobs } from '@/hooks/useJobs';
import { uploadJson } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';
import { useInterviews } from '@/hooks/useInterviews';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface ApplicationKanbanProps {
  preview?: boolean;
  onPreviewClick?: () => void;
}

const SortableJobCard: React.FC<{
  job: Job;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onDelete?: () => void;
  onDoubleClick?: () => void;
}> = ({ job, selected = false, onSelectChange, onDelete, onDoubleClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'En attente de réponse';
      case 'follow_up_pending': return 'Relance en attente';
      case 'filled': return 'Offre pourvue';
      case 'suspended': return 'Offre suspendue';
      case 'first_interview': return '1er entretien';
      case 'second_interview': return '2ème entretien';
      default: return 'En attente de réponse';
    }
  };

  const getOfferTypeLabel = (type?: string) => {
    switch (type) {
      case 'job_offer': return 'Offre d\'emploi';
      case 'spontaneous_application': return 'Candidature spontanée';
      case 'network': return 'Réseau';
      default: return 'Offre d\'emploi';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick}
      className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {onSelectChange && (
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => onSelectChange(!!checked)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <h4 className="font-medium text-sm leading-tight">{job.title}</h4>
          </div>
          <div className="flex items-center gap-1">
            {job.url && (
              <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
            )}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer ce poste&nbsp;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 mb-2">
          <Building className="h-3 w-3 text-gray-500" />
          <p className="text-xs text-gray-600 truncate">{job.company}</p>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">{job.location}</p>
        
        <div className="flex items-center justify-between mb-2">
          <Badge className={`text-xs ${getPriorityColor(job.priority)}`}>
            {job.priority}
          </Badge>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(job.dateAdded).toLocaleDateString('fr-FR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {job.label}
          </Badge>
          
          {job.offerStatus && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {getOfferStatusLabel(job.offerStatus)}
            </Badge>
          )}
          
          {job.offerType && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {getOfferTypeLabel(job.offerType)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DroppableColumn: React.FC<{
  column: { id: string; title: string; color: string; count: number };
  jobs: Job[];
  children: React.ReactNode;
}> = ({ column, jobs, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={`${column.color} rounded-lg p-4 min-h-[600px] ${isOver ? 'ring-2 ring-[#a4007c]' : ''}`}
        data-column-id={column.id}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <Badge variant="secondary">{column.count}</Badge>
        </div>

        <div className="space-y-3 min-h-[500px]">
          {children}
        </div>
      </div>
    </SortableContext>
  );
};

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({ preview = false, onPreviewClick }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<{ data: Job; columnId: string } | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const { jobs, setJobs } = useJobs();
  const { setInterviews } = useInterviews();

  // Updated columns with new structure: Offre, Candidature, Relances, Entretien, Finale
  const columns = [
    { id: 'offer', title: 'Offre', color: 'bg-green-100', count: jobs.offer?.length || 0 },
    { id: 'applied', title: 'Candidature', color: 'bg-blue-100', count: jobs.applied?.length || 0 },
    { id: 'screening', title: 'Relances', color: 'bg-yellow-100', count: jobs.screening?.length || 0 },
    { id: 'interview', title: 'Entretien', color: 'bg-orange-100', count: jobs.interview?.length || 0 },
    { id: 'final', title: 'Finale', color: 'bg-purple-100', count: jobs.final?.length || 0 },
  ];

  const validColumnIds = columns.map(col => col.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedJobIds(prev => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter(j => j !== id);
    });
  };

  const deleteJobs = (ids: string[]) => {
    setJobs(prev => {
      const newJobs: Record<string, Job[]> = {};
      for (const [colId, colJobs] of Object.entries(prev)) {
        newJobs[colId] = colJobs.filter(job => !ids.includes(job.id));
      }
      return newJobs;
    });
    setSelectedJobIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const findJobAndColumn = (jobId: string) => {
    for (const [columnId, columnJobs] of Object.entries(jobs)) {
      const job = columnJobs.find(job => job.id === jobId);
      if (job) {
        return { job, columnId };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findJobAndColumn(active.id as string);
    if (result) {
      setActiveJob(result.job);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveJob(null);
      return;
    }

    const jobId = active.id as string;
    let targetColumnId = over.id as string;
    
    // Si on drop sur une carte, on trouve la colonne parente
    const result = findJobAndColumn(jobId);
    if (!result) {
      setActiveJob(null);
      return;
    }

    // Vérifier si on drop sur une colonne valide
    if (!validColumnIds.includes(targetColumnId)) {
      // Si on drop sur une carte, trouver la colonne qui contient cette carte
      const overResult = findJobAndColumn(targetColumnId);
      if (overResult) {
        targetColumnId = overResult.columnId;
      } else {
        setActiveJob(null);
        return;
      }
    }

    // Si c'est la même colonne, ne rien faire
    if (result.columnId === targetColumnId) {
      setActiveJob(null);
      return;
    }

    console.log(`Moving job ${jobId} from ${result.columnId} to ${targetColumnId}`);

    // Déplacer le job vers la nouvelle colonne
    setJobs(prev => {
      const newJobs = { ...prev };
      
      // Vérifier que les colonnes existent
      if (!newJobs[result.columnId] || !newJobs[targetColumnId]) {
        console.error('Invalid column:', result.columnId, targetColumnId);
        return prev;
      }
      
      // Retirer le job de la colonne source
      newJobs[result.columnId] = newJobs[result.columnId].filter(job => job.id !== jobId);
      
      // Ajouter le job à la colonne de destination
      newJobs[targetColumnId] = [...newJobs[targetColumnId], result.job];

      if (targetColumnId === 'interview' && result.columnId !== 'interview') {
        setInterviews(prev => [
          ...prev,
          { id: Date.now().toString(), date: new Date().toISOString().split('T')[0] }
        ]);
      }
      
      return newJobs;
    });

    setActiveJob(null);
  };

  const addJob = (jobData: Omit<Job, 'id' | 'dateAdded'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setJobs(prev => ({
      ...prev,
      offer: [...prev.offer, newJob]
    }));
  };

  const updateJob = (jobData: Job) => {
    setJobs(prev => {
      const newJobs = { ...prev };
      const columnJobs = newJobs[editJob!.columnId];
      newJobs[editJob!.columnId] = columnJobs.map(j => j.id === jobData.id ? { ...j, ...jobData } : j);
      return newJobs;
    });
  };

  const exportJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await uploadJson('data-emploi-tracker', `${user.id}/jobs.json`, jobs);
  };

  // Calculate total jobs for preview
  const totalJobs = Object.values(jobs).flat().length;

  if (preview) {
    return (
      <Card role="button" className="h-96 cursor-pointer" onClick={onPreviewClick}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Entonnoir de Candidatures</span>
            <Badge variant="secondary">{totalJobs} postes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 h-full">
            {columns.map(column => {
              const columnJobs = jobs[column.id] || [];
              return (
                <div key={column.id} className={`${column.color} rounded-lg p-3`}>
                  <h4 className="font-medium text-sm mb-2">{column.title}</h4>
                  <div className="space-y-2">
                    {columnJobs.slice(0, 2).map(job => (
                      <div key={job.id} className="bg-white p-2 rounded shadow-sm">
                        <p className="font-medium text-xs truncate">{job.title}</p>
                        <p className="text-xs text-gray-600 truncate">{job.company}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Entonnoir de Candidatures</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddModal(true)} className="bg-[#a4007c] hover:bg-[#a4007c]/90">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Poste
            </Button>
            {selectedJobIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-1">
                    <Trash className="h-4 w-4" />
                    Supprimer ({selectedJobIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer les postes sélectionnés&nbsp;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteJobs(selectedJobIds)}>
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" onClick={exportJobs} className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              Sauvegarder
            </Button>
            <Link to="/methode-star" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
              <Info className="h-4 w-4" />
            </Link>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lightbulb className="h-4 w-4 text-[#b3d800]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 text-sm">
                <p className="mb-2">
                  Utilisez les données pour plus de contrôle et de prévisibilité. La plupart des chercheurs d'emploi suivent leur recherche d'une manière ou d'une autre. Ils n'utilisent pas ces données pour comprendre ce qui fonctionne et ce qui ne fonctionne pas.
                </p>
                <p>
                  Emploi Tracker se distingue des autres outils de suivi des candidatures car il utilise les données de votre recherche pour identifier les points faibles et déterminer les actions à entreprendre pour obtenir les résultats escomptés !
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map(column => {
            const columnJobs = jobs[column.id] || [];
            return (
              <DroppableColumn key={column.id} column={column} jobs={columnJobs}>
                {columnJobs.map(job => (
                  <SortableJobCard
                    key={job.id}
                    job={job}
                    selected={selectedJobIds.includes(job.id)}
                    onSelectChange={(checked) => handleSelect(job.id, checked)}
                    onDelete={() => deleteJobs([job.id])}
                    onDoubleClick={() => setEditJob({ data: job, columnId: column.id })}
                  />
                ))}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeJob ? <SortableJobCard job={activeJob} /> : null}
        </DragOverlay>
      </div>

      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addJob}
      />

      <AddJobModal
        isOpen={!!editJob}
        onClose={() => setEditJob(null)}
        onSubmit={(data) => {
          updateJob({ ...(editJob!.data), ...data });
          setEditJob(null);
        }}
        initialData={editJob ? editJob.data : undefined}
      />
    </DndContext>
  );
};
