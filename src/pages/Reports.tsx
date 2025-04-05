import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiDownload, FiFilter, FiCalendar, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeFilter, setActiveTimeFilter] = useState('30D');
  const [activeReportType, setActiveReportType] = useState('test-execution');
  
  // Mock data for reports
  const [reportData, setReportData] = useState({
    testExecution: {
      total: 980,
      passed: 458,
      failed: 198,
      blocked: 15,
      untested: 220,
      skipped: 70,
      retest: 19,
      dailyStats: [
        { date: '2023-03-01', passed: 12, failed: 5, blocked: 1, untested: 8 },
        { date: '2023-03-02', passed: 15, failed: 3, blocked: 0, untested: 7 },
        { date: '2023-03-03', passed: 18, failed: 4, blocked: 2, untested: 6 },
        { date: '2023-03-04', passed: 20, failed: 6, blocked: 1, untested: 5 },
        { date: '2023-03-05', passed: 22, failed: 4, blocked: 0, untested: 4 },
        { date: '2023-03-06', passed: 25, failed: 3, blocked: 1, untested: 3 },
        { date: '2023-03-07', passed: 28, failed: 2, blocked: 0, untested: 2 },
      ]
    },
    testCoverage: {
      total: 196,
      automated: 135,
      manual: 61,
      coverage: 68.9,
      byType: {
        functional: 15,
        acceptance: 13,
        accessibility: 15,
        performance: 16,
        security: 22,
        usability: 10,
        smokeAndSanity: 7,
        other: 98
      }
    },
    defects: {
      total: 87,
      open: 32,
      closed: 55,
      bySeverity: {
        critical: 5,
        high: 12,
        medium: 28,
        low: 42
      },
      byComponent: {
        frontend: 34,
        backend: 29,
        database: 15,
        api: 9
      },
      trend: [
        { date: '2023-03-01', opened: 5, closed: 3 },
        { date: '2023-03-02', opened: 4, closed: 5 },
        { date: '2023-03-03', opened: 6, closed: 4 },
        { date: '2023-03-04', opened: 3, closed: 6 },
        { date: '2023-03-05', opened: 2, closed: 7 },
        { date: '2023-03-06', opened: 4, closed: 5 },
        { date: '2023-03-07', opened: 3, closed: 4 },
      ]
    }
  });

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using the mock data initialized in state
        
        // Example of how to fetch data from Supabase:
        // const { data: testRunsData, error: testRunsError } = await supabase
        //   .from('test_runs')
        //   .select('*')
        //   .gte('created_at', getDateRangeStart(activeTimeFilter));
        
        // if (testRunsError) throw testRunsError;
        
        // Process the data and update state
        // setReportData(...)
        
        // Simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [supabase, activeTimeFilter, activeReportType]);

  // Helper function to get date range start based on filter
  const getDateRangeStart = (filter: string) => {
    const now = new Date();
    switch (filter) {
      case '7D':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '30D':
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
      case '90D':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      default:
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
    }
  };

  // Prepare chart data for test execution status
  const testExecutionData = {
    labels: ['Passed', 'Failed', 'Blocked', 'Untested', 'Skipped', 'Retest'],
    datasets: [
      {
        data: [
          reportData.testExecution.passed,
          reportData.testExecution.failed,
          reportData.testExecution.blocked,
          reportData.testExecution.untested,
          reportData.testExecution.skipped,
          reportData.testExecution.retest
        ],
        backgroundColor: [
          '#10b981', // Passed - Green
          '#ef4444', // Failed - Red
          '#9333ea', // Blocked - Purple
          '#d1d5db', // Untested - Gray
          '#f59e0b', // Skipped - Amber
          '#3b82f6'  // Retest - Blue
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for test execution trend
  const testExecutionTrendData = {
    labels: reportData.testExecution.dailyStats.map(stat => {
      const date = new Date(stat.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Passed',
        data: reportData.testExecution.dailyStats.map(stat => stat.passed),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Failed',
        data: reportData.testExecution.dailyStats.map(stat => stat.failed),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Blocked',
        data: reportData.testExecution.dailyStats.map(stat => stat.blocked),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Untested',
        data: reportData.testExecution.dailyStats.map(stat => stat.untested),
        borderColor: '#d1d5db',
        backgroundColor: 'rgba(209, 213, 219, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare chart data for test coverage by type
  const testCoverageByTypeData = {
    labels: ['Functional', 'Acceptance', 'Accessibility', 'Performance', 'Security', 'Usability', 'Smoke & Sanity', 'Other'],
    datasets: [
      {
        data: [
          reportData.testCoverage.byType.functional,
          reportData.testCoverage.byType.acceptance,
          reportData.testCoverage.byType.accessibility,
          reportData.testCoverage.byType.performance,
          reportData.testCoverage.byType.security,
          reportData.testCoverage.byType.usability,
          reportData.testCoverage.byType.smokeAndSanity,
          reportData.testCoverage.byType.other,
        ],
        backgroundColor: [
          '#3b82f6', // Functional - Blue
          '#10b981', // Acceptance - Green
          '#f59e0b', // Accessibility - Amber
          '#8b5cf6', // Performance - Purple
          '#ef4444', // Security - Red
          '#06b6d4', // Usability - Cyan
          '#14b8a6', // Smoke & Sanity - Teal
          '#d1d5db', // Other - Gray
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for defects by severity
  const defectsBySeverityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          reportData.defects.bySeverity.critical,
          reportData.defects.bySeverity.high,
          reportData.defects.bySeverity.medium,
          reportData.defects.bySeverity.low,
        ],
        backgroundColor: [
          '#ef4444', // Critical - Red
          '#f59e0b', // High - Amber
          '#3b82f6', // Medium - Blue
          '#10b981', // Low - Green
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare chart data for defects trend
  const defectsTrendData = {
    labels: reportData.defects.trend.map(stat => {
      const date = new Date(stat.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Opened',
        data: reportData.defects.trend.map(stat => stat.opened),
        backgroundColor: '#ef4444',
      },
      {
        label: 'Closed',
        data: reportData.defects.trend.map(stat => stat.closed),
        backgroundColor: '#10b981',
      },
    ],
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
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex items-center space-x-2">
          <button className="btn btn-outline flex items-center space-x-1 text-sm">
            <FiDownload size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`btn ${activeReportType === 'test-execution' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReportType('test-execution')}
        >
          Test Execution
        </button>
        <button
          className={`btn ${activeReportType === 'test-coverage' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReportType('test-coverage')}
        >
          Test Coverage
        </button>
        <button
          className={`btn ${activeReportType === 'defects' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveReportType('defects')}
        >
          Defects
        </button>
      </div>

      {/* Time Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiCalendar size={16} className="text-gray-500 mr-2" />
          <span className="text-sm text-gray-500">Time Range:</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${activeTimeFilter === '7D' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTimeFilter('7D')}
          >
            7D
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${activeTimeFilter === '30D' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTimeFilter('30D')}
          >
            30D
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${activeTimeFilter === '90D' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTimeFilter('90D')}
          >
            90D
          </button>
        </div>
      </div>

      {/* Test Execution Report */}
      {activeReportType === 'test-execution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Execution Status</h3>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut data={testExecutionData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{reportData.testExecution.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Passed</p>
                  <p className="text-xl font-semibold text-green-500">{reportData.testExecution.passed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-xl font-semibold text-red-500">{reportData.testExecution.failed}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Execution Trend</h3>
              <Line data={testExecutionTrendData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      )}

      {/* Test Coverage Report */}
      {activeReportType === 'test-coverage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Coverage</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{reportData.testCoverage.coverage}%</span>
                  </div>
                  <Doughnut 
                    data={{
                      labels: ['Automated', 'Manual'],
                      datasets: [{
                        data: [reportData.testCoverage.automated, reportData.testCoverage.manual],
                        backgroundColor: ['#10b981', '#d1d5db'],
                        borderWidth: 0,
                      }]
                    }} 
                    options={{ cutout: '80%', plugins: { legend: { display: false } } }} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{reportData.testCoverage.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Automated</p>
                  <p className="text-xl font-semibold text-green-500">{reportData.testCoverage.automated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manual</p>
                  <p className="text-xl font-semibold text-gray-500">{reportData.testCoverage.manual}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Cases by Type</h3>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut data={testCoverageByTypeData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Defects Report */}
      {activeReportType === 'defects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Defects by Severity</h3>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut data={defectsBySeverityData} options={{ plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold">{reportData.defects.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-xl font-semibold text-red-500">{reportData.defects.open}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Closed</p>
                  <p className="text-xl font-semibold text-green-500">{reportData.defects.closed}</p>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Defects Trend</h3>
              <Bar data={defectsTrendData} options={{ plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;