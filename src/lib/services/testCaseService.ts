import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';

export interface TestCase {
  id: string;
  title: string;
  description: string | null;
  preconditions: string | null;
  steps: string | null;
  expected_results: string | null;
  state: string;
  priority: string;
  type: string;
  automation_status: string;
  tags: string[] | null;
  project_id: string;
  folder_id: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  project_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  test_count?: number;
  automation_count?: number;
}

export class TestCaseService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  /**
   * Get all test cases for a project
   */
  async getTestCases(projectId: string): Promise<TestCase[]> {
    const { data, error } = await this.supabase
      .from('test_cases')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test cases:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get test cases by folder
   */
  async getTestCasesByFolder(folderId: string): Promise<TestCase[]> {
    const { data, error } = await this.supabase
      .from('test_cases')
      .select('*')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test cases by folder:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single test case by ID
   */
  async getTestCase(id: string): Promise<TestCase | null> {
    const { data, error } = await this.supabase
      .from('test_cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching test case:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new test case
   */
  async createTestCase(testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at'>): Promise<TestCase> {
    const { data, error } = await this.supabase
      .from('test_cases')
      .insert(testCase)
      .select()
      .single();

    if (error) {
      console.error('Error creating test case:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing test case
   */
  async updateTestCase(id: string, updates: Partial<TestCase>): Promise<TestCase> {
    const { data, error } = await this.supabase
      .from('test_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating test case:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a test case
   */
  async deleteTestCase(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('test_cases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  }

  /**
   * Get all folders for a project
   */
  async getFolders(projectId: string): Promise<Folder[]> {
    const { data, error } = await this.supabase
      .from('folders')
      .select('*')
      .eq('project_id', projectId)
      .order('name');

    if (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new folder
   */
  async createFolder(folder: Omit<Folder, 'id' | 'created_at' | 'updated_at'>): Promise<Folder> {
    const { data, error } = await this.supabase
      .from('folders')
      .insert(folder)
      .select()
      .single();

    if (error) {
      console.error('Error creating folder:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get folder statistics (test count and automation count)
   */
  async getFolderStats(folderId: string): Promise<{ test_count: number; automation_count: number }> {
    // Get total test cases in folder
    const { data: testCases, error: testCasesError } = await this.supabase
      .from('test_cases')
      .select('automation_status')
      .eq('folder_id', folderId);

    if (testCasesError) {
      console.error('Error fetching folder stats:', testCasesError);
      throw testCasesError;
    }

    const test_count = testCases.length;
    const automation_count = testCases.filter(tc => 
      tc.automation_status === 'Automated' || tc.automation_status === 'Partially Automated'
    ).length;

    return { test_count, automation_count };
  }

  /**
   * Get total test case count for a project
   */
  async getTotalTestCaseCount(projectId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('test_cases')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching total test case count:', error);
      throw error;
    }

    return count || 0;
  }
}

// Create a singleton instance
export const createTestCaseService = (supabase: SupabaseClient<Database>) => {
  return new TestCaseService(supabase);
};