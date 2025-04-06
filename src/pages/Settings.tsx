import { useState, useEffect } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiSave, FiUser, FiLock, FiBell, FiUsers, FiTag } from 'react-icons/fi';

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
  const [teamMembers, setTeamMembers] = useState<Array<{id: string, name: string, email: string, role: string}>>([]);
  const [newTeamMember, setNewTeamMember] = useState({ name: '', email: '', role: 'Tester' });
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<string | null>(null);
  const [editTeamMemberData, setEditTeamMemberData] = useState({ name: '', email: '', role: '' });
  const [teamMemberErrors, setTeamMemberErrors] = useState({ name: '', email: '' });
  const [isProcessingTeamMember, setIsProcessingTeamMember] = useState(false);

  // Custom fields settings
  const [customFields, setCustomFields] = useState<Array<{id: string, name: string, type: string, options: string[] | any[]}>>([]); 
  const [newCustomField, setNewCustomField] = useState<{ name: string, type: string, options: string[] }>({ name: '', type: 'text', options: [] });
  const [isAddingCustomField, setIsAddingCustomField] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<string | null>(null);
  const [editCustomFieldData, setEditCustomFieldData] = useState<{ name: string, type: string, options: string[] }>({ name: '', type: '', options: [] });
  const [customFieldErrors, setCustomFieldErrors] = useState({ name: '' });
  const [isProcessingCustomField, setIsProcessingCustomField] = useState(false);
  const [newOption, setNewOption] = useState('');
  
  // Security settings
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Team member management functions
  const validateTeamMember = (member: { name: string; email: string }) => {
    const errors = { name: '', email: '' };
    if (!member.name.trim()) errors.name = 'Name is required';
    if (!member.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  const handleAddTeamMember = async () => {
    setTeamMemberErrors(validateTeamMember(newTeamMember));
    if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newTeamMember.email)) return;
    
    setIsProcessingTeamMember(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          name: newTeamMember.name,
          email: newTeamMember.email,
          role: newTeamMember.role
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTeamMembers([...teamMembers, {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          role: data[0].role
        }]);
        setNewTeamMember({ name: '', email: '', role: 'Tester' });
        setIsAddingTeamMember(false);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    } finally {
      setIsProcessingTeamMember(false);
    }
  };

  const handleEditTeamMember = async (id: string) => {
    setTeamMemberErrors(validateTeamMember(editTeamMemberData));
    if (!editTeamMemberData.name.trim() || !editTeamMemberData.email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editTeamMemberData.email)) return;
    
    setIsProcessingTeamMember(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: editTeamMemberData.name,
          email: editTeamMemberData.email,
          role: editTeamMemberData.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setTeamMembers(teamMembers.map(member => 
        member.id === id ? {
          ...member,
          name: editTeamMemberData.name,
          email: editTeamMemberData.email,
          role: editTeamMemberData.role
        } : member
      ));
      setEditingTeamMember(null);
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member. Please try again.');
    } finally {
      setIsProcessingTeamMember(false);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member. Please try again.');
    }
  };

  // Custom field management functions
  const validateCustomField = (field: { name: string }) => {
    const errors = { name: '' };
    if (!field.name.trim()) errors.name = 'Name is required';
    return errors;
  };

  const handleAddCustomField = async () => {
    setCustomFieldErrors(validateCustomField(newCustomField));
    if (!newCustomField.name.trim()) return;
    
    setIsProcessingCustomField(true);
    try {
      const { data, error } = await supabase
        .from('custom_fields')
        .insert({
          name: newCustomField.name,
          type: newCustomField.type,
          options: newCustomField.type === 'dropdown' ? newCustomField.options : null
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCustomFields([...customFields, {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type,
          options: data[0].options || []
        }]);
        setNewCustomField({ name: '', type: 'text', options: [] });
        setIsAddingCustomField(false);
      }
    } catch (error) {
      console.error('Error adding custom field:', error);
      alert('Failed to add custom field. Please try again.');
    } finally {
      setIsProcessingCustomField(false);
    }
  };

  const handleEditCustomField = async (id: string) => {
    setCustomFieldErrors(validateCustomField(editCustomFieldData));
    if (!editCustomFieldData.name.trim()) return;
    
    setIsProcessingCustomField(true);
    try {
      const { error } = await supabase
        .from('custom_fields')
        .update({
          name: editCustomFieldData.name,
          type: editCustomFieldData.type,
          options: editCustomFieldData.type === 'dropdown' ? editCustomFieldData.options : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomFields(customFields.map(field => 
        field.id === id ? {
          ...field,
          name: editCustomFieldData.name,
          type: editCustomFieldData.type,
          options: editCustomFieldData.options
        } : field
      ));
      setEditingCustomField(null);
    } catch (error) {
      console.error('Error updating custom field:', error);
      alert('Failed to update custom field. Please try again.');
    } finally {
      setIsProcessingCustomField(false);
    }
  };

  const handleRemoveCustomField = async (id: string) => {
    if (!confirm('Are you sure you want to remove this custom field?')) return;
    
    try {
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCustomFields(customFields.filter(field => field.id !== id));
    } catch (error) {
      console.error('Error removing custom field:', error);
      alert('Failed to remove custom field. Please try again.');
    }
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    if (editingCustomField) {
      setEditCustomFieldData({
        ...editCustomFieldData,
        options: [...editCustomFieldData.options, newOption.trim()]
      });
    } else {
      setNewCustomField({
        ...newCustomField,
        options: [...newCustomField.options, newOption.trim()]
      });
    }
    
    setNewOption('');
  };

  const handleRemoveOption = (option: string, isEditing: boolean) => {
    if (isEditing) {
      setEditCustomFieldData({
        ...editCustomFieldData,
        options: editCustomFieldData.options.filter(opt => opt !== option)
      });
    } else {
      setNewCustomField({
        ...newCustomField,
        options: newCustomField.options.filter(opt => opt !== option)
      });
    }
  };

  // Password change function
  const handleChangePassword = async () => {
    // Reset errors
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Validate
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!securityData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!securityData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (securityData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session?.user?.email || '',
        password: securityData.currentPassword
      });
      
      if (signInError) {
        setPasswordErrors({
          ...passwordErrors,
          currentPassword: 'Current password is incorrect'
        });
        throw signInError;
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      });
      
      if (error) throw error;
      
      // Clear the form and show success message
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordChangeSuccess(true);
      setTimeout(() => setPasswordChangeSuccess(false), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (!passwordErrors.currentPassword) {
        alert('Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      setIsLoading(true);
      try {
        if (session?.user) {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) throw profileError;
          
          setProfile({
            fullName: profileData.full_name || '',
            email: profileData.email || session.user.email || '',
            jobTitle: profileData.job_title || '',
            department: profileData.department || '',
            avatar: profileData.avatar_url || ''
          });
          
          // Fetch notification preferences
          const { data: notificationData, error: notificationError } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (notificationError && notificationError.code !== 'PGRST116') {
            // PGRST116 is the error code for no rows returned
            throw notificationError;
          }
          
          if (notificationData) {
            setNotifications({
              emailNotifications: notificationData.email_notifications,
              testRunUpdates: notificationData.test_run_updates,
              testCaseAssignments: notificationData.test_case_assignments,
              dailyDigest: notificationData.daily_digest,
              weeklyReport: notificationData.weekly_report
            });
          }
          
          // Fetch team members
          const { data: teamData, error: teamError } = await supabase
            .from('team_members')
            .select('*');
          
          if (teamError) throw teamError;
          
          if (teamData && teamData.length > 0) {
            setTeamMembers(teamData.map(member => ({
              id: member.id,
              name: member.name,
              email: member.email,
              role: member.role
            })));
          }
          
          // Fetch custom fields
          const { data: fieldsData, error: fieldsError } = await supabase
            .from('custom_fields')
            .select('*');
          
          if (fieldsError) throw fieldsError;
          
          if (fieldsData && fieldsData.length > 0) {
            setCustomFields(fieldsData.map(field => ({
              id: field.id,
              name: field.name,
              type: field.type,
              options: field.options ? field.options : []
            })));
          }
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
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.fullName,
          job_title: profile.jobTitle,
          department: profile.department,
          avatar_url: profile.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Check if notification preferences exist for this user
      const { data, error: checkError } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      let error;
      
      if (checkError && checkError.code === 'PGRST116') {
        // No preferences exist yet, create new record
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: session.user.id,
            email_notifications: notifications.emailNotifications,
            test_run_updates: notifications.testRunUpdates,
            test_case_assignments: notifications.testCaseAssignments,
            daily_digest: notifications.dailyDigest,
            weekly_report: notifications.weeklyReport
          });
        
        error = insertError;
      } else {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from('notification_preferences')
          .update({
            email_notifications: notifications.emailNotifications,
            test_run_updates: notifications.testRunUpdates,
            test_case_assignments: notifications.testCaseAssignments,
            daily_digest: notifications.dailyDigest,
            weekly_report: notifications.weeklyReport,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
        
        error = updateError;
      }
      
      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save notification settings. Please try again.');
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
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Team members updated successfully!
                  </div>
                )}
                
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
                      {teamMembers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            No team members found. Add your first team member below.
                          </td>
                        </tr>
                      )}
                      {teamMembers.map((member) => (
                        <tr key={member.id}>
                          {editingTeamMember === member.id ? (
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className={`input w-full ${teamMemberErrors.name ? 'border-red-500' : ''}`}
                                  value={editTeamMemberData.name}
                                  onChange={(e) => setEditTeamMemberData({...editTeamMemberData, name: e.target.value})}
                                />
                                {teamMemberErrors.name && <p className="mt-1 text-xs text-red-500">{teamMemberErrors.name}</p>}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="email"
                                  className={`input w-full ${teamMemberErrors.email ? 'border-red-500' : ''}`}
                                  value={editTeamMemberData.email}
                                  onChange={(e) => setEditTeamMemberData({...editTeamMemberData, email: e.target.value})}
                                />
                                {teamMemberErrors.email && <p className="mt-1 text-xs text-red-500">{teamMemberErrors.email}</p>}
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  className="input w-full"
                                  value={editTeamMemberData.role}
                                  onChange={(e) => setEditTeamMemberData({...editTeamMemberData, role: e.target.value})}
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Manager">Manager</option>
                                  <option value="Developer">Developer</option>
                                  <option value="Tester">Tester</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="text-green-600 hover:text-green-900 mr-2"
                                  onClick={() => handleEditTeamMember(member.id)}
                                  disabled={isProcessingTeamMember}
                                >
                                  {isProcessingTeamMember ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                  className="text-gray-600 hover:text-gray-900"
                                  onClick={() => setEditingTeamMember(null)}
                                  disabled={isProcessingTeamMember}
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
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
                                <button 
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                  onClick={() => {
                                    setEditingTeamMember(member.id);
                                    setEditTeamMemberData({
                                      name: member.name,
                                      email: member.email,
                                      role: member.role
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleRemoveTeamMember(member.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {isAddingTeamMember ? (
                  <div className="mt-6 p-4 border border-gray-200 rounded-md">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Add Team Member</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          className={`input w-full ${teamMemberErrors.name ? 'border-red-500' : ''}`}
                          value={newTeamMember.name}
                          onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                        />
                        {teamMemberErrors.name && <p className="mt-1 text-xs text-red-500">{teamMemberErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          className={`input w-full ${teamMemberErrors.email ? 'border-red-500' : ''}`}
                          value={newTeamMember.email}
                          onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
                        />
                        {teamMemberErrors.email && <p className="mt-1 text-xs text-red-500">{teamMemberErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          className="input w-full"
                          value={newTeamMember.role}
                          onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Developer">Developer</option>
                          <option value="Tester">Tester</option>
                        </select>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          className="btn btn-primary"
                          onClick={handleAddTeamMember}
                          disabled={isProcessingTeamMember}
                        >
                          {isProcessingTeamMember ? 'Adding...' : 'Add Team Member'}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            setIsAddingTeamMember(false);
                            setNewTeamMember({ name: '', email: '', role: 'Tester' });
                            setTeamMemberErrors({ name: '', email: '' });
                          }}
                          disabled={isProcessingTeamMember}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsAddingTeamMember(true)}
                    >
                      Add Team Member
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Custom Fields Settings */}
            {activeTab === 'customFields' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h2>
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Custom fields updated successfully!
                  </div>
                )}
                
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
                      {customFields.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            No custom fields found. Add your first custom field below.
                          </td>
                        </tr>
                      )}
                      {customFields.map((field) => (
                        <tr key={field.id}>
                          {editingCustomField === field.id ? (
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  className={`input w-full ${customFieldErrors.name ? 'border-red-500' : ''}`}
                                  value={editCustomFieldData.name}
                                  onChange={(e) => setEditCustomFieldData({...editCustomFieldData, name: e.target.value})}
                                />
                                {customFieldErrors.name && <p className="mt-1 text-xs text-red-500">{customFieldErrors.name}</p>}
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  className="input w-full"
                                  value={editCustomFieldData.type}
                                  onChange={(e) => setEditCustomFieldData({...editCustomFieldData, type: e.target.value})}
                                >
                                  <option value="text">Text</option>
                                  <option value="dropdown">Dropdown</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                {editCustomFieldData.type === 'dropdown' ? (
                                  <div>
                                    <div className="flex mb-2">
                                      <input
                                        type="text"
                                        className="input w-full mr-2"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="Add option"
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline"
                                        onClick={handleAddOption}
                                      >
                                        Add
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {editCustomFieldData.options.map((option, index) => (
                                        <div key={index} className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                                          <span className="text-sm">{option}</span>
                                          <button
                                            type="button"
                                            className="ml-1 text-gray-500 hover:text-red-500"
                                            onClick={() => handleRemoveOption(option, true)}
                                          >
                                            &times;
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">-</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="text-green-600 hover:text-green-900 mr-2"
                                  onClick={() => handleEditCustomField(field.id)}
                                  disabled={isProcessingCustomField}
                                >
                                  {isProcessingCustomField ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                  className="text-gray-600 hover:text-gray-900"
                                  onClick={() => setEditingCustomField(null)}
                                  disabled={isProcessingCustomField}
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{field.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">
                                  {field.options && field.options.length > 0 ? field.options.join(', ') : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                  onClick={() => {
                                    setEditingCustomField(field.id);
                                    setEditCustomFieldData({
                                      name: field.name,
                                      type: field.type,
                                      options: field.options || []
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleRemoveCustomField(field.id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {isAddingCustomField ? (
                  <div className="mt-6 p-4 border border-gray-200 rounded-md">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Add Custom Field</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                        <input
                          type="text"
                          className={`input w-full ${customFieldErrors.name ? 'border-red-500' : ''}`}
                          value={newCustomField.name}
                          onChange={(e) => setNewCustomField({...newCustomField, name: e.target.value})}
                        />
                        {customFieldErrors.name && <p className="mt-1 text-xs text-red-500">{customFieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                        <select
                          className="input w-full"
                          value={newCustomField.type}
                          onChange={(e) => setNewCustomField({...newCustomField, type: e.target.value})}
                        >
                          <option value="text">Text</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      
                      {newCustomField.type === 'dropdown' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                          <div className="flex mb-2">
                            <input
                              type="text"
                              className="input w-full mr-2"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              placeholder="Add option"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={handleAddOption}
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {newCustomField.options.map((option, index) => (
                              <div key={index} className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                                <span className="text-sm">{option}</span>
                                <button
                                  type="button"
                                  className="ml-1 text-gray-500 hover:text-red-500"
                                  onClick={() => handleRemoveOption(option, false)}
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <button
                          className="btn btn-primary"
                          onClick={handleAddCustomField}
                          disabled={isProcessingCustomField}
                        >
                          {isProcessingCustomField ? 'Adding...' : 'Add Custom Field'}
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => {
                            setIsAddingCustomField(false);
                            setNewCustomField({ name: '', type: 'text', options: [] });
                            setCustomFieldErrors({ name: '' });
                          }}
                          disabled={isProcessingCustomField}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setIsAddingCustomField(true)}
                    >
                      Add Custom Field
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                
                {passwordChangeSuccess && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Password updated successfully!
                  </div>
                )}
                
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
                          className={`input w-full ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          className={`input w-full ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                        />
                        {passwordErrors.newPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className={`input w-full ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>
                        )}
                      </div>
                      
                      <div>
                        <button 
                          className="btn btn-primary flex items-center space-x-2"
                          onClick={handleChangePassword}
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? (
                            <>
                              <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <span>Update Password</span>
                          )}
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
                    
                    <button 
                      className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (confirm('Are you sure you want to sign out from all devices?')) {
                          await supabase.auth.signOut({ scope: 'global' });
                          alert('You have been signed out from all devices.');
                        }
                      }}
                    >
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