import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabase } from '../supabase/SupabaseProvider';

interface Project {
  id: string;
  name: string;
  description: string | null;
  key: string;
  owner_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: Project) => void;
  createProject: (name: string, key: string, description?: string) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { supabase, session } = useSupabase();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on initial load
  useEffect(() => {
    if (session) {
      refreshProjects();
    }
  }, [session]);

  // Subscribe to projects table changes
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, () => {
        refreshProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;

      setProjects(data || []);

      // If we have projects but no current project is selected, select the first one
      if (data && data.length > 0 && !currentProject) {
        setCurrentProject(data[0]);
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, key: string, description?: string) => {
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name,
          key: key.toUpperCase(),
          description,
          owner_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;

      await refreshProjects();
      return data;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await refreshProjects();
      return true;
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If the deleted project was the current project, select another one
      if (currentProject?.id === id) {
        const remainingProjects = projects.filter(p => p.id !== id);
        if (remainingProjects.length > 0) {
          setCurrentProject(remainingProjects[0]);
        } else {
          setCurrentProject(null);
        }
      }

      await refreshProjects();
      return true;
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message);
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        isLoading,
        error,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}