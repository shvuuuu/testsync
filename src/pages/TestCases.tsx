import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { useProject } from '../lib/context/ProjectContext';
import { useTestCase } from '../lib/context/TestCaseContext';
import { FiDownload, FiFilter, FiChevronRight, FiFolder, FiPlus, FiSearch } from 'react-icons/fi';
import { Folder as FolderType, TestCase as TestCaseType } from '../lib/services/testCaseService';

// Using the types from our service
interface TestCaseDisplay extends TestCaseType {
  owner_name?: string;
}

const TestCases = () => {
  const { } = useSupabase(); // Not using supabase directly in this component
  const { currentProject } = useProject();
  const { 
    testCases, 
    folders, 
    isLoading, 
    totalTestCases, 
    selectedFolder, 
    setSelectedFolder,
    createTestCase,
    refreshFolders,
    createFolder
  } = useTestCase();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newTestCaseName, setNewTestCaseName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTestCases, setFilteredTestCases] = useState<TestCaseDisplay[]>([]);
  
  // Add state for folder modal
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Add state for filter modal and filter options
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    automation: 'all'
  });
  
  // Check if we should show the empty state
  const showEmptyState = testCases.length === 0 && !isLoading;

  // Handle folder selection from URL params
  useEffect(() => {
    const folderIdFromUrl = searchParams.get('folder');
    if (folderIdFromUrl && folders.length > 0) {
      const folder = folders.find(f => f.id === folderIdFromUrl);
      if (folder) {
        setSelectedFolder(folder);
      }
    }
  }, [searchParams, folders, setSelectedFolder]);

  // Process test cases for display
  useEffect(() => {
    // Apply search filter if needed
    let filtered = [...testCases];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tc => 
        tc.id.toLowerCase().includes(query) || 
        tc.title.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(tc => tc.state === filters.status);
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(tc => tc.priority === filters.priority);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(tc => tc.type === filters.type);
    }
    
    if (filters.automation !== 'all') {
      filtered = filtered.filter(tc => tc.automation_status === filters.automation);
    }

    // Map to display format
    const displayTestCases: TestCaseDisplay[] = filtered.map(tc => ({
      ...tc,
      owner_name: 'Assigned User' // In a real app, you'd fetch user names
    }));

    setFilteredTestCases(displayTestCases);
  }, [testCases, searchQuery, filters]);

  // Create a new test case with basic info
  const handleCreateTestCase = async () => {
    if (!newTestCaseName.trim() || !currentProject) return;
    
    try {
      await createTestCase({
        title: newTestCaseName,
        description: '',
        preconditions: '',
        steps: '',
        expected_results: '',
        state: 'Active',
        priority: 'Medium',
        type: 'Functional',
        automation_status: 'Not Automated',
        tags: [],
        project_id: currentProject.id,
        folder_id: selectedFolder?.id || null,
        owner_id: null // This would be set to the current user in a real app
      });
      
      setNewTestCaseName('');
      navigate('/test-cases/new');
    } catch (err) {
      console.error('Error creating test case:', err);
    }
  };

  // Handle folder selection
  const handleFolderClick = (folder: FolderType) => {
    setSelectedFolder(folder);
    setSearchParams({ folder: folder.id });
  };

  // Clear folder selection
  const handleAllTestCasesClick = () => {
    setSelectedFolder(null);
    setSearchParams({});
  };

  // Add folder creation function
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentProject) return;
    
    try {
      await createFolder({
        name: newFolderName,
        project_id: currentProject.id,
        parent_id: null
      });
      
      setNewFolderName('');
      setShowFolderModal(false);
      await refreshFolders();
    } catch (err) {
      console.error('Error creating folder:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      type: 'all',
      automation: 'all'
    });
  };

  // Handle AI generation
  const handleGenerateWithAI = () => {
    // In a real implementation, this would open an AI generation modal or page
    alert('AI generation would be implemented here');
  };

  // Import/export handlers are defined but not currently used in the UI
  // Keeping them commented for future implementation
  /*
  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  const handleQuickImport = () => {
    alert('Quick import functionality would be implemented here');
  };

  const handleCsvImport = () => {
    alert('CSV import functionality would be implemented here');
  };
  */

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
              <button 
                className="p-1 rounded-md hover:bg-gray-100"
                onClick={() => setShowFolderModal(true)}
              >
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
              <div 
                className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer ${!selectedFolder ? 'bg-blue-50 text-blue-700' : ''}`}
                onClick={handleAllTestCasesClick}
              >
                <div className="flex items-center">
                  <FiChevronRight size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm font-medium">All Test Cases</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span>{totalTestCases}</span>
                </div>
              </div>
              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="flex items-center">
                    <FiChevronRight size={16} className="text-gray-400 mr-2" />
                    <FiFolder size={16} className="text-blue-400 mr-2" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {folder.test_count && folder.test_count > 0 ? (
                      <span>
                        {folder.automation_count ?? 0}({folder.test_count})
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-outline flex items-center space-x-1 text-sm ml-2"
              onClick={() => setShowFilterModal(true)}
            >
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Automation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTestCases.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                          No test cases found. Try adjusting your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTestCases.map((testCase) => (
                        <tr key={testCase.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/test-cases/${testCase.id}`)}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {testCase.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {testCase.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testCase.state === 'Active' ? 'bg-green-100 text-green-800' : testCase.state === 'Draft' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                              {testCase.state}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testCase.priority === 'Critical' ? 'bg-red-100 text-red-800' : testCase.priority === 'High' ? 'bg-orange-100 text-orange-800' : testCase.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {testCase.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {testCase.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testCase.automation_status === 'Automated' ? 'bg-green-100 text-green-800' : testCase.automation_status === 'Partially Automated' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                              {testCase.automation_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {testCase.owner_name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/test-cases/${testCase.id}`);
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Folder creation modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
              <input
                type="text"
                className="input w-full"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setNewFolderName('');
                  setShowFolderModal(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Test Cases</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="input w-full"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="input w-full"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  className="input w-full"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Functional">Functional</option>
                  <option value="Performance">Performance</option>
                  <option value="Security">Security</option>
                  <option value="Usability">Usability</option>
                  <option value="Acceptance">Acceptance</option>
                  <option value="Accessibility">Accessibility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Automation Status</label>
                <select 
                  className="input w-full"
                  value={filters.automation}
                  onChange={(e) => handleFilterChange('automation', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Automated">Automated</option>
                  <option value="Partially Automated">Partially Automated</option>
                  <option value="Not Automated">Not Automated</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                className="btn btn-outline"
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowFilterModal(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCases;