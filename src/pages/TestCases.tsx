import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiDownload, FiFilter, FiChevronRight, FiFolder, FiPlus, FiSearch } from 'react-icons/fi';

interface Folder {
  id: string;
  name: string;
  testCount: number;
  automationCount: number;
}

interface TestCase {
  id: string;
  title: string;
  type: string;
  automationStatus: string;
  state: string;
  priority: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

const TestCases = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'automation', name: 'Automation', testCount: 10, automationCount: 8 },
    { id: 'authentication', name: 'Authentication', testCount: 21, automationCount: 10 },
    { id: 'administration', name: 'Administration', testCount: 0, automationCount: 0 },
    { id: 'configuration', name: 'Configuration', testCount: 11, automationCount: 2 },
    { id: 'users', name: 'Users', testCount: 13, automationCount: 1 },
    { id: 'usability', name: 'Usability', testCount: 17, automationCount: 7 },
    { id: 'performance', name: 'Performance', testCount: 14, automationCount: 4 },
    { id: 'security', name: 'Security', testCount: 6, automationCount: 0 },
  ]);
  const [totalTestCases, setTotalTestCases] = useState(196);
  const [newTestCaseName, setNewTestCaseName] = useState('');
  const [showEmptyState, setShowEmptyState] = useState(true);

  // Fetch test cases data
  useEffect(() => {
    const fetchTestCasesData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using the mock data initialized in state
        
        // Example of how to fetch data from Supabase:
        // const { data: foldersData, error: foldersError } = await supabase
        //   .from('folders')
        //   .select('id, name, project_id');
        
        // if (foldersError) throw foldersError;
        
        // Process the data and update state
        // setFolders(...);
        
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching test cases data:', error);
        setIsLoading(false);
      }
    };

    fetchTestCasesData();
  }, [supabase]);

  const handleCreateTestCase = () => {
    if (newTestCaseName.trim()) {
      // In a real implementation, we would create a new test case in Supabase
      // For now, we're just updating the UI
      setShowEmptyState(false);
      setNewTestCaseName('');
      
      // Navigate to test case creation form
      navigate('/test-cases/new');
    }
  };

  const handleGenerateWithAI = () => {
    // Navigate to AI generation page or open modal
    navigate('/test-cases/generate-ai');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Cases</h1>
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
          <button 
            className="btn btn-primary flex items-center space-x-1 text-sm"
            onClick={() => navigate('/test-cases/new')}
          >
            <FiPlus size={16} />
            <span>Create Test Case</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Folders sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Folders</h3>
              <button className="p-1 rounded-md hover:bg-gray-100">
                <FiFolder size={16} />
              </button>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 px-2 py-1">
                <span>Total Test Cases</span>
                <span>{totalTestCases}</span>
              </div>
            </div>

            <div className="space-y-1">
              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/test-cases?folder=${folder.id}`)}
                >
                  <div className="flex items-center">
                    <FiChevronRight size={16} className="text-gray-400 mr-2" />
                    <FiFolder size={16} className="text-blue-400 mr-2" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {folder.testCount > 0 ? (
                      <span>
                        {folder.automationCount}({folder.testCount})
                      </span>
                    ) : (
                      <span>0</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Automation</h3>
            <div className="flex items-center justify-between p-2 rounded-md bg-blue-50 text-blue-700">
              <div className="flex items-center">
                <FiFolder size={16} className="mr-2" />
                <span className="text-sm font-medium">Automation</span>
              </div>
              <div className="text-xs">
                <span>8(10)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Test Case ID or Title"
                className="input pl-10 w-full"
              />
            </div>
            <button className="btn btn-outline flex items-center space-x-1 text-sm ml-2">
              <FiFilter size={16} />
              <span>Filter</span>
            </button>
          </div>

          {showEmptyState ? (
            <div className="card p-8 flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <FiFolder size={48} className="text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Test Cases</h3>
              <p className="text-gray-500 mb-6">You can create test cases by entering details below</p>
              
              <div className="w-full max-w-md mb-4">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add new test case"
                    className="input rounded-r-none w-full"
                    value={newTestCaseName}
                    onChange={(e) => setNewTestCaseName(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary rounded-l-none"
                    onClick={handleCreateTestCase}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="btn btn-outline flex items-center space-x-2 py-2 px-4"
                  onClick={handleGenerateWithAI}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Generate with AI</span>
                </button>
                
                <button className="btn btn-outline flex items-center space-x-2 py-2 px-4">
                  <FiDownload size={20} />
                  <span>Quick Import</span>
                </button>
                
                <button className="btn btn-outline flex items-center space-x-2 py-2 px-4">
                  <FiDownload size={20} />
                  <span>Import via CSV</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              {/* Test cases table would go here */}
              <div className="p-4 text-center text-gray-500">
                Test cases table would be displayed here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCases;