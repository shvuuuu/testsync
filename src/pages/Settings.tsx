import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiSave, FiUser, FiLock, FiMail, FiGlobe, FiSliders, FiBell, FiUsers, FiTag } from 'react-icons/fi';

const Settings = () => {
  const { supabase, session } = useSupabase();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile settings
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    department: '',
    avatar: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    testRunUpdates: true,
    testCaseAssignments: true,
    dailyDigest: false,
    weeklyReport: true
  });

  // Team settings
  const [teamMembers, setTeamMembers] = useState([
    { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Tester' },
    { id: 'user-3', name: 'Robert Johnson', email: 'robert.johnson@example.com', role: 'Developer' },
    { id: 'user-4', name: 'Emily Davis', email: 'emily.davis@example.com', role: 'Tester' },
    { id: 'user-5', name: 'Michael Wilson', email: 'michael.wilson@example.com', role: 'Manager' }
  ]);

  // Custom fields settings
  const [customFields, setCustomFields] = useState([
    { id: 'field-1', name: 'Environment', type: 'dropdown', options: ['Development', 'Staging', 'Production'] },
    { id: 'field-2', name: 'Browser', type: 'dropdown', options: ['Chrome', 'Firefox', 'Safari', 'Edge'] },
    { id: 'field-3', name: 'Device', type: 'dropdown', options: ['Desktop', 'Mobile', 'Tablet'] },
    { id: 'field-4', name: 'Version', type: 'text', options: [] },
    { id: 'field-5', name: 'Build Number', type: 'text', options: [] }
  ]);

  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      setIsLoading(true);
      try {
        if (session?.user) {
          // In a real implementation, we would fetch this data from Supabase
          // For now, we're using mock data
          
          // Example of how to fetch data from Supabase:
          // const { data, error } = await supabase
          //   .from('profiles')
          //   .select('*')
          //   .eq('id', session.user.id)
          //   .single();
          
          // if (error) throw error;
          
          // Mock data for demonstration
          setProfile({
            fullName: 'John Doe',
            email: session.user.email || '',
            jobTitle: 'QA Engineer',
            department: 'Quality Assurance',
            avatar: ''
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setIsLoading(false);
      }
    };

    fetchUserSettings();
  }, [supabase, session]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, we would update this data in Supabase
      // For now, we're just simulating the save
      
      // Example of how to update data in Supabase:
      // const { error } = await supabase
      //   .from('profiles')
      //   .update({
      //     full_name: profile.fullName,
      //     job_title: profile.jobTitle,
      //     department: profile.department
      //   })
      //   .eq('id', session?.user?.id);
      
      // if (error) throw error;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, we would update this data in Supabase
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    } finally {
      setIsSaving(false);
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-1/4">
          <div className="card p-4">
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FiBell className="mr-3 h-5 w-5" />
                <span>Notifications</span>
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeTab === 'team' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('team')}
              >
                <FiUsers className="mr-3 h-5 w-5" />
                <span>Team</span>
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeTab === 'customFields' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('customFields')}
              >
                <FiTag className="mr-3 h-5 w-5" />
                <span>Custom Fields</span>
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('security')}
              >
                <FiLock className="mr-3 h-5 w-5" />
                <span>Security</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="w-full md:w-3/4">
          <div className="card p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Profile updated successfully!
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="input w-full bg-gray-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact administrator for assistance.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      id="department"
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Notification settings updated successfully!
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                      <p className="text-xs text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.emailNotifications}
                        onChange={() => setNotifications({...notifications, emailNotifications: !notifications.emailNotifications})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Test Run Updates</h3>
                      <p className="text-xs text-gray-500">Receive updates when test runs are modified</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.testRunUpdates}
                        onChange={() => setNotifications({...notifications, testRunUpdates: !notifications.testRunUpdates})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Test Case Assignments</h3>
                      <p className="text-xs text-gray-500">Receive notifications when you are assigned to a test case</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.testCaseAssignments}
                        onChange={() => setNotifications({...notifications, testCaseAssignments: !notifications.testCaseAssignments})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Daily Digest</h3>
                      <p className="text-xs text-gray-500">Receive a daily summary of all activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.dailyDigest}
                        onChange={() => setNotifications({...notifications, dailyDigest: !notifications.dailyDigest})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Weekly Report</h3>
                      <p className="text-xs text-gray-500">Receive a weekly summary report</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={notifications.weeklyReport}
                        onChange={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isSaving}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Team Settings */}
            {activeTab === 'team' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Team Members</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button className="btn btn-primary">
                    Invite Team Member
                  </button>
                </div>
              </div>
            )}
            
            {/* Custom Fields Settings */}
            {activeTab === 'customFields' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Field Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Options
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customFields.map((field) => (
                        <tr key={field.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{field.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {field.options.length > 0 ? field.options.join(', ') : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-2">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button className="btn btn-primary">
                    Add Custom Field
                  </button>
                </div>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="input w-full"
                        />
                      </div>
                      
                      <div>
                        <button className="btn btn-primary">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                    
                    <button className="btn btn-outline">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Sessions</h3>
                    <p className="text-sm text-gray-500 mb-4">Manage your active sessions</p>
                    
                    <button className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                      Sign Out All Devices
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;