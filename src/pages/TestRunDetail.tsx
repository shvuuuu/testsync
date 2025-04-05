import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiChevronDown, FiChevronRight, FiCheck, FiX, FiAlertTriangle, FiClock, FiSkipForward, FiRefreshCw, FiEdit, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';

interface TestRun {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    untested: number;
    skipped: number;
    retest: number;
  };
  created_at: string;
  updated_at: string;
  owner_id: string;
  assignee_id: string | null;
}

interface TestCase {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'blocked' | 'untested' | 'skipped' | 'retest';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
  automation_status: string;
  executed_by: string | null;
  executed_at: string | null;
  notes: string | null;
}

const TestRunDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed' | 'blocked' | 'untested' | 'skipped' | 'retest'>('all');
  
  // Fetch test run data
  useEffect(() => {
    const fetchTestRun = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using mock data
        
        // Example of how to fetch data from Supabase:
        // const { data, error } = await supabase
        //   .from('test_runs')
        //   .select('*')
        //   .eq('id', id)
        //   .single();
        
        // if (error) throw error;
        // if (!data) throw new Error('Test run not found');
        
        // Mock data for demonstration
        const mockTestRun: TestRun = {
          id: id || '1',
          title: 'Sprint 23 Regression',
          description: 'Regression testing for Sprint 23 release',
          status: 'active',
          progress: {
            total: 120,
            passed: 78,
            failed: 12,
            blocked: 5,
            untested: 20,
            skipped: 3,
            retest: 2
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: 'current-user-id',
          assignee_id: 'current-user-id'
        };
        
        setTestRun(mockTestRun);
        
        // Mock test cases for this run
        const mockTestCases: TestCase[] = Array.from({ length: 20 }, (_, i) => {
          const statuses: TestCase['status'][] = ['passed', 'failed', 'blocked', 'untested', 'skipped', 'retest'];
          const priorities: TestCase['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
          const types = ['Functional', 'Performance', 'Security', 'Usability', 'Accessibility', 'Smoke & Sanity'];
          const automationStatuses = ['Automated', 'Not Automated', 'In Progress', 'Blocked'];
          
          // Distribute statuses to match the progress counts
          let status: TestCase['status'];
          if (i < 78) status = 'passed';
          else if (i < 90) status = 'failed';
          else if (i < 95) status = 'blocked';
          else if (i < 115) status = 'untested';
          else if (i < 118) status = 'skipped';
          else status = 'retest';
          
          return {
            id: `TC-${1000 + i}`,
            title: `Test Case ${i + 1}: ${['Login functionality', 'User registration', 'Password reset', 'Profile update', 'Search functionality'][i % 5]}`,
            status,
            priority: priorities[i % 4],
            type: types[i % 6],
            automation_status: automationStatuses[i % 4],
            executed_by: status !== 'untested' ? 'John Doe' : null,
            executed_at: status !== 'untested' ? new Date(Date.now() - Math.random() * 86400000 * 5).toISOString() : null,
            notes: status === 'failed' ? 'Failed due to unexpected error message' : 
                  status === 'blocked' ? 'Blocked by issue #123' : 
                  status === 'retest' ? 'Need to retest after fix' : null
          };
        });
        
        setTestCases(mockTestCases);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching test run:', error);
        setIsLoading(false);
      }
    };

    fetchTestRun();
  }, [supabase, id]);

  const handleStatusChange = (testCaseId: string, newStatus: TestCase['status']) => {
    // Update the status of a test case
    setTestCases(prevTestCases => 
      prevTestCases.map(tc => 
        tc.id === testCaseId ? {
          ...tc,
          status: newStatus,
          executed_by: 'John Doe',
          executed_at: new Date().toISOString()
        } : tc
      )
    );
    
    // Update the progress counts
    if (testRun) {
      const updatedTestCase = testCases.find(tc => tc.id === testCaseId);
      if (updatedTestCase) {
        const oldStatus = updatedTestCase.status;
        setTestRun(prev => {
          if (!prev) return null;
          
          const progress = {...prev.progress};
          progress[oldStatus] -= 1;
          progress[newStatus] += 1;
          
          return {
            ...prev,
            progress,
            updated_at: new Date().toISOString()
          };
        });
      }
    }
  };

  const filteredTestCases = testCases.filter(tc => {
    // Apply search filter
    const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tc.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="p-6">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Test Run Not Found</h2>
          <p className="text-gray-500 mb-4">The test run you're looking for doesn't exist or has been deleted.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/test-runs')}
          >
            Back to Test Runs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{testRun.title}</h1>
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiEdit size={16} />
            <span>Edit</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {testRun.description && (
        <div className="mb-6">
          <p className="text-gray-600">{testRun.description}</p>
        </div>
      )}

      {/* Progress summary */}
      <div className="card p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{testRun.progress.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{testRun.progress.passed}</div>
            <div className="text-sm text-gray-500">Passed</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-red-600">{testRun.progress.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">{testRun.progress.blocked}</div>
            <div className="text-sm text-gray-500">Blocked</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-gray-400">{testRun.progress.untested}</div>
            <div className="text-sm text-gray-500">Untested</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-amber-500">{testRun.progress.skipped}</div>
            <div className="text-sm text-gray-500">Skipped</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500" 
              style={{ width: `${(testRun.progress.passed / testRun.progress.total) * 100}%` }}
            ></div>
            <div 
              className="bg-red-500" 
              style={{ width: `${(testRun.progress.failed / testRun.progress.total) * 100}%` }}
            ></div>
            <div 
              className="bg-purple-500" 
              style={{ width: `${(testRun.progress.blocked / testRun.progress.total) * 100}%` }}
            ></div>
            <div 
              className="bg-amber-500" 
              style={{ width: `${(testRun.progress.skipped / testRun.progress.total) * 100}%` }}
            ></div>
            <div 
              className="bg-blue-500" 
              style={{ width: `${(testRun.progress.retest / testRun.progress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Test cases */}
      <div className="card">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
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
            <div className="flex items-center space-x-2">
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Statuses</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
                <option value="untested">Untested</option>
                <option value="skipped">Skipped</option>
                <option value="retest">Retest</option>
              </select>
              <button className="btn btn-outline flex items-center space-x-1 text-sm">
                <FiFilter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Test cases table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-500">ID</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Automation</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTestCases.map((testCase) => (
                <tr key={testCase.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{testCase.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center">
                      <span>{testCase.title}</span>
                      {testCase.notes && (
                        <div className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" title={testCase.notes}>
                          <FiAlertTriangle size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${testCase.priority === 'Critical' ? 'bg-red-100 text-red-800' : testCase.priority === 'High' ? 'bg-orange-100 text-orange-800' : testCase.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {testCase.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{testCase.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{testCase.automation_status}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${testCase.status === 'passed' ? 'bg-green-100 text-green-800' : testCase.status === 'failed' ? 'bg-red-100 text-red-800' : testCase.status === 'blocked' ? 'bg-purple-100 text-purple-800' : testCase.status === 'untested' ? 'bg-gray-100 text-gray-800' : testCase.status === 'skipped' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {testCase.status.charAt(0).toUpperCase() + testCase.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        onClick={() => handleStatusChange(testCase.id, 'passed')}
                        title="Mark as Passed"
                      >
                        <FiCheck size={16} />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        onClick={() => handleStatusChange(testCase.id, 'failed')}
                        title="Mark as Failed"
                      >
                        <FiX size={16} />
                      </button>
                      <button 
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                        onClick={() => handleStatusChange(testCase.id, 'blocked')}
                        title="Mark as Blocked"
                      >
                        <FiAlertTriangle size={16} />
                      </button>
                      <button 
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        onClick={() => handleStatusChange(testCase.id, 'skipped')}
                        title="Mark as Skipped"
                      >
                        <FiSkipForward size={16} />
                      </button>
                      <button 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        onClick={() => handleStatusChange(testCase.id, 'retest')}
                        title="Mark for Retest"
                      >
                        <FiRefreshCw size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTestCases.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500">No test cases found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunDetail;