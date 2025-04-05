import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiUser, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

interface TestPlan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'draft';
  testCaseCount: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  owner_name: string;
}

const TestPlans = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  
  // Fetch test plans data
  useEffect(() => {
    const fetchTestPlans = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using mock data
        
        // Example of how to fetch data from Supabase:
        // const { data, error } = await supabase
        //   .from('test_plans')
        //   .select('*, profiles(full_name)')
        //   .order('created_at', { ascending: false });
        
        // if (error) throw error;
        
        // Mock data for demonstration
        const mockTestPlans: TestPlan[] = [
          {
            id: '1',
            title: 'Q2 Release Test Plan',
            description: 'Comprehensive test plan for Q2 product release',
            status: 'active',
            testCaseCount: 45,
            created_at: '2023-04-15T10:30:00Z',
            updated_at: '2023-04-18T14:45:00Z',
            owner_id: 'user-1',
            owner_name: 'John Doe'
          },
          {
            id: '2',
            title: 'Mobile App Test Plan',
            description: 'Test plan for the new mobile application',
            status: 'draft',
            testCaseCount: 32,
            created_at: '2023-04-10T09:15:00Z',
            updated_at: '2023-04-12T16:30:00Z',
            owner_id: 'user-2',
            owner_name: 'Jane Smith'
          },
          {
            id: '3',
            title: 'API Integration Tests',
            description: 'Test plan for third-party API integrations',
            status: 'completed',
            testCaseCount: 28,
            created_at: '2023-04-05T11:00:00Z',
            updated_at: '2023-04-08T13:20:00Z',
            owner_id: 'user-1',
            owner_name: 'John Doe'
          },
          {
            id: '4',
            title: 'Security Compliance Test Plan',
            description: 'Test plan for security compliance requirements',
            status: 'active',
            testCaseCount: 50,
            created_at: '2023-03-20T10:00:00Z',
            updated_at: '2023-03-25T15:45:00Z',
            owner_id: 'user-3',
            owner_name: 'Robert Johnson'
          },
          {
            id: '5',
            title: 'Performance Test Plan',
            description: 'Test plan for performance and load testing',
            status: 'completed',
            testCaseCount: 15,
            created_at: '2023-03-15T09:30:00Z',
            updated_at: '2023-03-18T14:15:00Z',
            owner_id: 'user-2',
            owner_name: 'Jane Smith'
          }
        ];
        
        setTestPlans(mockTestPlans);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching test plans:', error);
        setIsLoading(false);
      }
    };

    fetchTestPlans();
  }, [supabase]);

  // Filter test plans based on search query and status filter
  const filteredTestPlans = testPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Test Plans</h1>
        <button 
          className="btn btn-primary flex items-center space-x-1 text-sm"
          onClick={() => navigate('/test-plans/new')}
        >
          <FiPlus size={16} />
          <span>Create Test Plan</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search test plans"
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiFilter size={16} />
            <span>More Filters</span>
          </button>
        </div>
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
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Cases
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTestPlans.length > 0 ? (
                filteredTestPlans.map((plan) => (
                  <tr 
                    key={plan.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/test-plans/${plan.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.status === 'active' ? 'bg-green-100 text-green-800' : plan.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.testCaseCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{plan.owner_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(plan.updated_at)}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No test plans found
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

export default TestPlans;