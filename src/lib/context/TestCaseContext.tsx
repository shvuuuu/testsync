import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabase } from '../supabase/SupabaseProvider';
import { useProject } from './ProjectContext';
import { TestCase, Folder, createTestCaseService } from '../services/testCaseService';

interface TestCaseContextType {
  testCases: TestCase[];
  folders: Folder[];
  isLoading: boolean;
  error: string | null;
  totalTestCases: number;
  selectedFolder: Folder | null;
  getTestCase: (id: string) => Promise<TestCase | null>;
  createTestCase: (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>) => Promise<TestCase>;
  updateTestCase: (id: string, updates: Partial<TestCase>) => Promise<TestCase>;
  deleteTestCase: (id: string) => Promise<void>;
  createFolder: (folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) => Promise<Folder>;
  refreshTestCases: () => Promise<void>;
  refreshFolders: () => Promise<void>;
  setSelectedFolder: (folder: Folder | null) => void;
  getTestCasesByFolder: (folderId: string) => Promise<TestCase[]>;
}

const TestCaseContext = createContext<TestCaseContextType | undefined>(undefined);

export function TestCaseProvider({ children }: { children: ReactNode }) {
  const { supabase } = useSupabase();
  const { currentProject } = useProject();
  const [testCaseService] = useState(() => createTestCaseService(supabase));
  
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTestCases, setTotalTestCases] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Fetch test cases and folders when project changes
  useEffect(() => {
    if (currentProject) {
      refreshTestCases();
      refreshFolders();
    }
  }, [currentProject]);

  // Subscribe to test_cases table changes
  useEffect(() => {
    if (!currentProject) return;

    const channel = supabase
      .channel('test-cases-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'test_cases',
        filter: `project_id=eq.${currentProject.id}`
      }, () => {
        refreshTestCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject, supabase]);

  // Subscribe to folders table changes
  useEffect(() => {
    if (!currentProject) return;

    const channel = supabase
      .channel('folders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'folders',
        filter: `project_id=eq.${currentProject.id}`
      }, () => {
        refreshFolders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject, supabase]);

  const refreshTestCases = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // If a folder is selected, get test cases for that folder
      // Otherwise, get all test cases for the project
      let data: TestCase[];
      if (selectedFolder) {
        data = await testCaseService.getTestCasesByFolder(selectedFolder.id);
      } else {
        data = await testCaseService.getTestCases(currentProject.id);
      }

      setTestCases(data);

      // Get total test case count
      const count = await testCaseService.getTotalTestCaseCount(currentProject.id);
      setTotalTestCases(count);

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching test cases:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const refreshFolders = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const data = await testCaseService.getFolders(currentProject.id);

      // Fetch stats for each folder
      const foldersWithStats = await Promise.all(
        data.map(async (folder) => {
          try {
            const stats = await testCaseService.getFolderStats(folder.id);
            return {
              ...folder,
              test_count: stats.test_count,
              automation_count: stats.automation_count
            };
          } catch (err) {
            console.error(`Error fetching stats for folder ${folder.id}:`, err);
            return {
              ...folder,
              test_count: 0,
              automation_count: 0
            };
          }
        })
      );

      setFolders(foldersWithStats);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching folders:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const getTestCase = async (id: string) => {
    return testCaseService.getTestCase(id);
  };

  const createTestCase = async (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>) => {
    const newTestCase = await testCaseService.createTestCase(testCase);
    await refreshTestCases();
    return newTestCase;
  };

  const updateTestCase = async (id: string, updates: Partial<TestCase>) => {
    const updatedTestCase = await testCaseService.updateTestCase(id, updates);
    await refreshTestCases();
    return updatedTestCase;
  };

  const deleteTestCase = async (id: string) => {
    await testCaseService.deleteTestCase(id);
    await refreshTestCases();
  };

  const createFolder = async (folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>) => {
    const newFolder = await testCaseService.createFolder(folder);
    await refreshFolders();
    return newFolder;
  };

  const getTestCasesByFolder = async (folderId: string) => {
    return testCaseService.getTestCasesByFolder(folderId);
  };

  return (
    <TestCaseContext.Provider
      value={{
        testCases,
        folders,
        isLoading,
        error,
        totalTestCases,
        selectedFolder,
        getTestCase,
        createTestCase,
        updateTestCase,
        deleteTestCase,
        createFolder,
        refreshTestCases,
        refreshFolders,
        setSelectedFolder,
        getTestCasesByFolder
      }}
    >
      {children}
    </TestCaseContext.Provider>
  );
}

export function useTestCase() {
  const context = useContext(TestCaseContext);
  if (context === undefined) {
    throw new Error('useTestCase must be used within a TestCaseProvider');
  }
  return context;
}