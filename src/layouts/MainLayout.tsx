import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiBarChart2, FiFileText, FiList, FiPlay, FiCalendar, FiPieChart, FiSettings, FiExternalLink, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import ProjectSelector from '../components/ProjectSelector';

const MainLayout = () => {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen ? (
            <h1 className="text-xl font-semibold text-gray-800">TestSync</h1>
          ) : (
            <span className="text-xl font-semibold text-gray-800">TS</span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <ProjectSelector isSidebarOpen={isSidebarOpen} />

          <nav className="px-2">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiBarChart2 size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Project Insights</span>}
            </NavLink>

            <NavLink 
              to="/test-cases" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiFileText size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Test Cases</span>}
            </NavLink>

            <NavLink 
              to="/shared-steps" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiList size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Shared Steps</span>}
            </NavLink>

            <NavLink 
              to="/test-runs" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiPlay size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Test Runs</span>}
            </NavLink>

            <NavLink 
              to="/test-plans" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiCalendar size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Test Plans</span>}
            </NavLink>

            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiPieChart size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Reports</span>}
            </NavLink>
          </nav>

          {isSidebarOpen && (
            <div className="mt-8 mx-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Have questions?</h3>
              <p className="text-sm text-gray-600 mb-3">Unlock the full potential of Test Management</p>
              <button className="text-sm text-blue-600 font-medium flex items-center">
                Contact Sales
              </button>
            </div>
          )}

          <div className="mt-4 px-2">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex items-center px-2 py-2 rounded-md ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${!isSidebarOpen && 'justify-center'}`
              }
            >
              <FiSettings size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">Settings</span>}
            </NavLink>

            <a 
              href="#" 
              className={`flex items-center px-2 py-2 rounded-md text-gray-700 hover:bg-gray-100 ${!isSidebarOpen && 'justify-center'}`}
            >
              <FiExternalLink size={20} className="min-w-[20px]" />
              {isSidebarOpen && <span className="ml-3">View Documentation</span>}
            </a>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className={`flex items-center text-gray-700 hover:text-red-600 ${!isSidebarOpen && 'justify-center'}`}
          >
            <FiLogOut size={20} />
            {isSidebarOpen && <span className="ml-2">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;