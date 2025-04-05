import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiInfo, FiMoreVertical, FiDownload, FiFilter, FiChevronRight } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { supabase } = useSupabase();
  const [activeTimeFilter, setActiveTimeFilter] = useState('7D');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeTestRuns: {
      total: 980,
      blocked: 15,
      failed: 198,
      untested: 220,
      skipped: 70,
      passed: 458,
      retest: 19
    },
    automationCoverage: 68.9,
    automatedTests: 135,
    manualTests: 61,
    totalTestCases: 196,
    testCaseTypes: {
      acceptance: 13,
      accessibility: 15,
      functional: 15,
      other: 98,
      performance: 16,
      security: 22,
      smokeAndSanity: 7,
      usability: 10
    }
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using the mock data initialized in state
        
        // Example of how to fetch data from Supabase:
        // const { data: testRunsData, error: testRunsError } = await supabase
        //   .from('test_runs')
        //   .select('*')
        //   .eq('status', 'active');
        
        // if (testRunsError) throw testRunsError;
        
        // Process the data and update state
        // setDashboardData(...);
        
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [supabase, activeTimeFilter]);

  // Prepare chart data for active test runs
  const activeTestRunsData = {
    labels: ['Blocked', 'Failed', 'Untested', 'Skipped', 'Passed', 'Retest'],
    datasets: [
      {
        data: [
          dashboardData.activeTestRuns.blocked,
          dashboardData.activeTestRuns.failed,
          dashboardData.activeTestRuns.untested,
          dashboardData.activeTestRuns.skipped,
          dashboardData.activeTestRuns.passed,
          dashboardData.activeTestRuns.retest
        ],
        backgroundColor: [
          '#9333ea', // Blocked - Purple
          '#ef4444', // Failed - Red
          '#d1d5db', // Untested - Gray
          '#f59e0b', // Skipped - Amber
          '#10b981', // Passed - Green
          '#3b82f6'  // Retest - Blue
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for test case types
  const testCaseTypesData = {
    labels: ['Acceptance', 'Accessibility', 'Functional', 'Other', 'Performance', 'Security', 'Smoke & Sanity', 'Usability'],
    datasets: [
      {
        data: [
          dashboardData.testCaseTypes.acceptance,
          dashboardData.testCaseTypes.accessibility,
          dashboardData.testCaseTypes.functional,
          dashboardData.testCaseTypes.other,
          dashboardData.testCaseTypes.performance,
          dashboardData.testCaseTypes.security,
          dashboardData.testCaseTypes.smokeAndSanity,
          dashboardData.testCaseTypes.usability
        ],
        backgroundColor: [
          '#06b6d4', // Acceptance - Cyan
          '#8b5cf6', // Accessibility - Purple
          '#22c55e', // Functional - Green
          '#f97316', // Other - Orange
          '#eab308', // Performance - Yellow
          '#ef4444', // Security - Red
          '#3b82f6', // Smoke & Sanity - Blue
          '#ec4899'  // Usability - Pink
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for closed test runs trend
  const closedTestRunsTrendData = {
    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Closed Test Runs',
        data: [1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 4],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiDownload size={16} />
            <span>Share</span>
          </button>
          <button className="btn btn-outline p-2">
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Time filters */}
      <div className="flex items-center mb-6 space-x-2">
        {['7D', '30D', '3M', '6M', '1Y', 'All Time', 'Custom'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 text-sm rounded-md ${activeTimeFilter === filter ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setActiveTimeFilter(filter)}
          >
            {filter}
          </button>
        ))}
        <div className="ml-auto">
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiFilter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Automation Coverage</h3>
            <FiInfo className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{dashboardData.automationCoverage}%</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Automated Test Cases</h3>
            <FiInfo className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{dashboardData.automatedTests}</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Manual Test Cases</h3>
            <FiInfo className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{dashboardData.manualTests}</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Test Cases</h3>
            <FiInfo className="text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{dashboardData.totalTestCases}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Test Runs */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Active Test Runs</h3>
              <FiInfo className="ml-2 text-gray-400" />
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <FiMoreVertical size={20} />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-64 relative">
              <Doughnut data={activeTestRunsData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{dashboardData.activeTestRuns.total}</span>
                <span className="text-sm text-gray-500">Total Test Cases</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <div className="space-y-2">
                {[
                  { label: 'Blocked', value: dashboardData.activeTestRuns.blocked, percent: Math.round((dashboardData.activeTestRuns.blocked / dashboardData.activeTestRuns.total) * 100), color: '#9333ea' },
                  { label: 'Failed', value: dashboardData.activeTestRuns.failed, percent: Math.round((dashboardData.activeTestRuns.failed / dashboardData.activeTestRuns.total) * 100), color: '#ef4444' },
                  { label: 'Untested', value: dashboardData.activeTestRuns.untested, percent: Math.round((dashboardData.activeTestRuns.untested / dashboardData.activeTestRuns.total) * 100), color: '#d1d5db' },
                  { label: 'Skipped', value: dashboardData.activeTestRuns.skipped, percent: Math.round((dashboardData.activeTestRuns.skipped / dashboardData.activeTestRuns.total) * 100), color: '#f59e0b' },
                  { label: 'Passed', value: dashboardData.activeTestRuns.passed, percent: Math.round((dashboardData.activeTestRuns.passed / dashboardData.activeTestRuns.total) * 100), color: '#10b981' },
                  { label: 'Retest', value: dashboardData.activeTestRuns.retest, percent: Math.round((dashboardData.activeTestRuns.retest / dashboardData.activeTestRuns.total) * 100), color: '#3b82f6' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span className="ml-auto text-sm font-medium">{item.value}</span>
                    <span className="ml-2 text-xs text-gray-500">({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <a href="/test-runs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center">
              View All Active Runs <FiChevronRight size={16} className="ml-1" />
            </a>
          </div>
        </div>

        {/* Closed Test Runs */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Closed Test Runs</h3>
              <FiInfo className="ml-2 text-gray-400" />
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <FiMoreVertical size={20} />
            </button>
          </div>
          
          <div className="h-64">
            <Line data={closedTestRunsTrendData} options={lineOptions} />
          </div>
          
          <div className="mt-4 text-center">
            <a href="/test-runs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center">
              View All Closed Runs <FiChevronRight size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Test Case Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Type of Test Cases</h3>
              <FiInfo className="ml-2 text-gray-400" />
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <FiMoreVertical size={20} />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-64 relative">
              <Doughnut data={testCaseTypesData} options={doughnutOptions} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold">{dashboardData.totalTestCases}</span>
                <span className="text-sm text-gray-500">Total Test Cases</span>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 mt-4 md:mt-0">
              <div className="space-y-2">
                {[
                  { label: 'Acceptance', value: dashboardData.testCaseTypes.acceptance, percent: Math.round((dashboardData.testCaseTypes.acceptance / dashboardData.totalTestCases) * 100), color: '#06b6d4' },
                  { label: 'Accessibility', value: dashboardData.testCaseTypes.accessibility, percent: Math.round((dashboardData.testCaseTypes.accessibility / dashboardData.totalTestCases) * 100), color: '#8b5cf6' },
                  { label: 'Functional', value: dashboardData.testCaseTypes.functional, percent: Math.round((dashboardData.testCaseTypes.functional / dashboardData.totalTestCases) * 100), color: '#22c55e' },
                  { label: 'Other', value: dashboardData.testCaseTypes.other, percent: Math.round((dashboardData.testCaseTypes.other / dashboardData.totalTestCases) * 100), color: '#f97316' },
                  { label: 'Performance', value: dashboardData.testCaseTypes.performance, percent: Math.round((dashboardData.testCaseTypes.performance / dashboardData.totalTestCases) * 100), color: '#eab308' },
                  { label: 'Security', value: dashboardData.testCaseTypes.security, percent: Math.round((dashboardData.testCaseTypes.security / dashboardData.totalTestCases) * 100), color: '#ef4444' },
                  { label: 'Smoke & Sanity', value: dashboardData.testCaseTypes.smokeAndSanity, percent: Math.round((dashboardData.testCaseTypes.smokeAndSanity / dashboardData.totalTestCases) * 100), color: '#3b82f6' },
                  { label: 'Usability', value: dashboardData.testCaseTypes.usability, percent: Math.round((dashboardData.testCaseTypes.usability / dashboardData.totalTestCases) * 100), color: '#ec4899' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <span className="ml-auto text-sm font-medium">{item.value}</span>
                    <span className="ml-2 text-xs text-gray-500">({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">Trend of Test Cases</h3>
              <FiInfo className="ml-2 text-gray-400" />
            </div>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <FiMoreVertical size={20} />
            </button>
          </div>
          
          <div className="h-64">
            {/* Placeholder for trend chart - would be implemented with real data */}
            <div className="flex items-center justify-center h-full text-gray-500">
              Test case trend chart would be displayed here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;