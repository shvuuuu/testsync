import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiPlus, FiSearch, FiFilter, FiFolder, FiMoreVertical } from 'react-icons/fi';

interface SharedStep {
  id: string;
  title: string;
  description: string;
  steps: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

const SharedSteps = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [sharedSteps, setSharedSteps] = useState<SharedStep[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch shared steps data
  useEffect(() => {
    const fetchSharedSteps = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using mock data
        
        // Example of how to fetch data from Supabase:
        // const { data, error } = await supabase
        //   .from('shared_steps')
        //   .select('*')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // Mock data for demonstration
        const mockSharedSteps: SharedStep[] = [
          {
            id: '1',
            title: 'User Login',
            description: 'Steps to login to the application',
            steps: [
              'Navigate to login page',
              'Enter valid username and password',
              'Click on Login button',
              'Verify user is redirected to dashboard'
            ],
            created_at: '2023-04-15T10:30:00Z',
            updated_at: '2023-04-18T14:45:00Z',
            created_by: 'John Doe'
          },
          {
            id: '2',
            title: 'Create New Project',
            description: 'Steps to create a new project',
            steps: [
              'Navigate to Projects page',
              'Click on New Project button',
              'Fill in project details',
              'Click on Save button',
              'Verify project is created successfully'
            ],
            created_at: '2023-04-10T09:15:00Z',
            updated_at: '2023-04-12T16:30:00Z',
            created_by: 'Jane Smith'
          },
          {
            id: '3',
            title: 'Logout Process',
            description: 'Steps to logout from the application',
            steps: [
              'Click on user profile icon',
              'Select Logout option',
              'Confirm logout if prompted',
              'Verify user is redirected to login page'
            ],
            created_at: '2023-04-05T11:00:00Z',
            updated_at: '2023-04-08T13:20:00Z',
            created_by: 'Robert Johnson'
          }
        ];
        
        setSharedSteps(mockSharedSteps);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching shared steps:', error);
        setIsLoading(false);
      }
    };

    fetchSharedSteps();
  }, [supabase]);

  // Filter shared steps based on search query
  const filteredSharedSteps = sharedSteps.filter(step =>
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shared Steps</h1>
        <button 
          className="btn btn-primary flex items-center space-x-1 text-sm"
        >
          <FiPlus size={16} />
          <span>Create Shared Step</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search shared steps"
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-outline flex items-center space-x-1 text-sm ml-2">
          <FiFilter size={16} />
          <span>Filter</span>
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSharedSteps.length > 0 ? (
                filteredSharedSteps.map((step) => (
                  <tr key={step.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">{step.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{step.created_by}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(step.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-500">
                        <FiMoreVertical />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No shared steps found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SharedSteps;