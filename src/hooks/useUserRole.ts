import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'consultant' | 'candidat' | null;

export interface Module {
  id: string;
  name: string;
  category: 'recherche_emploi' | 'definition_projet_pro' | 'progression_carriere';
  description: string;
  route: string;
  assigned_at?: string;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [candidateModules, setCandidateModules] = useState<Module[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Get user role
        const { data: roleData } = await supabase.rpc('get_user_role', {
          _user_id: user.id
        });

        setUserRole(roleData);

        // If user is a candidate, get their assigned modules
        if (roleData === 'candidat') {
          const { data: modulesData } = await supabase.rpc('get_candidate_modules', {
            _candidate_id: user.id
          });

          if (modulesData) {
            setCandidateModules(modulesData.map((module: any) => ({
              id: module.module_id,
              name: module.module_name,
              category: module.category,
              description: module.description,
              route: module.route,
              assigned_at: module.assigned_at
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  const hasModuleAccess = (route: string): boolean => {
    // Admins and consultants have access to all modules
    if (userRole === 'admin' || userRole === 'consultant') {
      return true;
    }

    // Candidates only have access to assigned modules
    if (userRole === 'candidat') {
      return candidateModules.some(module => module.route === route);
    }

    return false;
  };

  const getAccessibleModulesByCategory = (category: string) => {
    if (userRole === 'admin' || userRole === 'consultant') {
      // Return all modules for this category (would need to fetch from modules table)
      return [];
    }

    return candidateModules.filter(module => module.category === category);
  };

  return {
    userRole,
    loading,
    candidateModules,
    hasModuleAccess,
    getAccessibleModulesByCategory,
    isAdmin: userRole === 'admin',
    isConsultant: userRole === 'consultant',
    isCandidat: userRole === 'candidat'
  };
};