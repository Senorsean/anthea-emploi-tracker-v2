import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Users, Settings, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
}

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'consultant' | 'candidat'>('candidat');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        // Get roles for each user
        const usersWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: roleData } = await supabase.rpc('get_user_role', {
              _user_id: profile.id
            });
            return {
              ...profile,
              role: roleData
            };
          })
        );
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'consultant' | 'candidat') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check if user already has a role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role, is_active: true })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role,
            assigned_by: user.id
          });

        if (error) throw error;
      }

      toast.success('Rôle assigné avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Erreur lors de l\'assignation du rôle');
    }
  };

  const sendPasswordReset = async (email: string, userName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: email,
          senderRole: 'admin',
          senderName: 'Administrateur'
        }
      });

      if (error) {
        console.error('Error sending password reset:', error);
        toast.error('Impossible d\'envoyer l\'email de réinitialisation');
        return;
      }

      toast.success(`Email de réinitialisation envoyé à ${userName}`);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Une erreur s\'est produite');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'consultant': return 'bg-blue-100 text-blue-800';
      case 'candidat': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Panneau d'Administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et leurs rôles dans le système Anthea.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle Actuel</TableHead>
                  <TableHead>Assigner Rôle</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name || 'Non renseigné'}</TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Aucun rôle</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        onValueChange={(role) => assignRole(user.id, role as any)}
                        defaultValue={user.role || undefined}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assigner rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="candidat">Candidat</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendPasswordReset(user.email, user.full_name || user.email)}
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Réinitialiser MDP
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};