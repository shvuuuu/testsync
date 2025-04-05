import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiMoreVertical } from 'react-icons/fi';

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
  owner_name: string;
  assignee_id: string | null;
  assignee_name: string | null;
}

const TestRuns = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  
  // Fetch test runs data
  useEffect(() => {
    const fetchTestRuns = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using mock data
        
        // Example of how to fetch data from Supabase:
        // const { data, error } = await supabase
        //   .from('test_runs')
        //   .select('*, profiles(full_name)')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // Mock data for demonstration
        const mockTestRuns: TestRun[] = [
          {
            id: '1',
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
            created_at: '2023-04-15T10:30:00Z',
            updated_at: '2023-04-18T14:45:00Z',
            owner_id: 'user-1',
            owner_name: 'John Doe',
            assignee_id: 'user-2',
            assignee_name: 'Jane Smith'
          },
          {
            id: '2',
            title: 'Authentication Flow Tests',
            description: 'Testing the new authentication flow',
            status: 'completed',
            progress: {
              total: 45,
              passed: 42,
              failed: 3,
              blocked: 0,
              untested: 0,
              skipped: 0,
              retest: 0
            },
            created_at: '2023-04-10T09:15:00Z',
            updated_at: '2023-04-12T16:30:00Z',
            owner_id: 'user-2',
            owner_name: 'Jane Smith',
            assignee_id: 'user-1',
            assignee_name: 'John Doe'
          },
          {
            id: '3',
            title: 'Payment Gateway Integration',
            description: 'Testing the integration with new payment gateway',
            status: 'active',
            progress: {
              total: 35,
              passed: 15,
              failed: 8,
              blocked: 2,
              untested: 10,
              skipped: 0,
              retest: 0
            },
            created_at: '2023-04-05T11:00:00Z',
            updated_at: '2023-04-08T13:20:00Z',
            owner_id: 'user-1',
            owner_name: 'John Doe',
            assignee_id: null,
            assignee_name: null
          },
          {
            id: '4',
            title: 'Mobile Responsive UI',
            description: 'Testing the responsive UI on mobile devices',
            status: 'archived',
            progress: {
              total: 60,
              passed: 55,
              failed: 5,
              blocked: 0,
              untested: 0,
              skipped: 0,
              retest: 0
            },
            created_at: '2023-03-20T10:00:00Z',
            updated_at: '2023-03-25T15:45:00Z',
            owner_id: 'user-3',
            owner_name: 'Robert Johnson',
            assignee_id: 'user-2',
            assignee_name: 'Jane Smith'
          },
          {
            id: '5',
            title: 'Performance Testing',
            description: 'Load and stress testing for the application',
            status: 'completed',
            progress: {
              total: 25,
              passed: 20,
              failed: 5,
              blocked: 0,
              untested: 0,
              skipped: 0,
              retest: 0
            },
            created_at: '2023-03-15T09:30:00Z',
            updated_at: '2023-03-18T14:15:00Z',
            owner_id: 'user-2',
            owner_name: 'Jane Smith',
            assignee_id: 'user-3',
            assignee_name: 'Robert Johnson'
          }
        ];
        
        setTestRuns(mockTestRuns);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching test runs:', error);
        setIsLoading(false);
      }
    };

    fetchTestRuns();
  }, [supabase]);

  // Filter test runs based on search query and status filter
  const filteredTestRuns = testRuns.filter(run => {
    const matchesSearch = run.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         run.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate progress percentage for a test run
  const calculateProgress = (run: TestRun) => {
    if (run.progress.total === 0) return 0;
    return Math.round((run.progress.passed / run.progress.total) * 100);
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Test Runs</h1>
        <button 
          className="btn btn-primary flex items-center space-x-1 text-sm"
          onClick={() => navigate('/test-runs/new')}
        >
          <FiPlus size={16} />
          <span>Create Test Run</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search test runs"
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiFilter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Test runs list */}
      <div className="space-y-4">
        {filteredTestRuns.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-500">No test runs found matching your filters.</p>
          </div>
        ) : (
          filteredTestRuns.map(run => (
            <div 
              key={run.id} 
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/test-runs/${run.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{run.title}</h3>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${run.status === 'active' ? 'bg-blue-100 text-blue-800' : run.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{run.description}</p>
                  <div className="flex flex-wrap items-center mt-2 text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <FiCalendar size={14} className="mr-1" />
                      <span>Created: {formatDate(run.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiUser size={14} className="mr-1" />
                      <span>Owner: {run.owner_name}</span>
                    </div>
                    {run.assignee_name && (
                      <div className="flex items-center">
                        <FiUser size={14} className="mr-1" />
                        <span>Assignee: {run.assignee_name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      <FiCheckCircle size={16} className="text-green-500 mr-1" />
                      <span className="text-sm">{run.progress.passed}</span>
                    </div>
                    <div className="flex items-center">
                      <FiXCircle size={16} className="text-red-500 mr-1" />
                      <span className="text-sm">{run.progress.failed}</span>
                    </div>
                    <div className="flex items-center">
                      <FiAlertCircle size={16} className="text-purple-500 mr-1" />
                      <span className="text-sm">{run.progress.blocked}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock size={16} className="text-gray-400 mr-1" />
                      <span className="text-sm">{run.progress.untested}</span>
                    </div>
                    <button 
                      className="p-1 rounded-md hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show more options
                      }}
                    >
                      <FiMoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{calculateProgress(run)}% Complete</span>
                      <span>{run.progress.passed}/{run.progress.total}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500" 
                        style={{ width: `${calculateProgress(run)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestRuns;