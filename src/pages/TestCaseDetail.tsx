import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabase/SupabaseProvider';
import { FiChevronDown, FiPlus, FiUpload } from 'react-icons/fi';

interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expected_results: string;
  state: string;
  owner_id: string;
  priority: string;
  type: string;
  automation_status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const TestCaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [isEditing, setIsEditing] = useState(id === 'new');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [steps, setSteps] = useState('');
  const [expectedResults, setExpectedResults] = useState('');
  const [state, setState] = useState('Active');
  const [owner, setOwner] = useState('Myself (Someet Shende)');
  const [priority, setPriority] = useState('Medium');
  const [type, setType] = useState('Other');
  const [automationStatus, setAutomationStatus] = useState('Not Automated');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Fetch test case data
  useEffect(() => {
    if (id === 'new') {
      setIsLoading(false);
      return;
    }
    
    const fetchTestCase = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would fetch this data from Supabase
        // For now, we're using mock data
        
        // Example of how to fetch data from Supabase:
        // const { data, error } = await supabase
        //   .from('test_cases')
        //   .select('*')
        //   .eq('id', id)
        //   .single();
        
        // if (error) throw error;
        // if (!data) throw new Error('Test case not found');
        
        // Mock data for demonstration
        const mockTestCase: TestCase = {
          id: id || 'new',
          title: 'Verify user login with valid credentials',
          description: 'Test the login functionality with valid username and password',
          preconditions: 'User account exists in the system',
          steps: '1. Navigate to login page\n2. Enter valid username\n3. Enter valid password\n4. Click login button',
          expected_results: 'User should be successfully logged in and redirected to the dashboard',
          state: 'Active',
          owner_id: 'current-user-id',
          priority: 'Medium',
          type: 'Functional',
          automation_status: 'Automated',
          tags: ['login', 'authentication', 'smoke-test'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setTestCase(mockTestCase);
        
        // Populate form fields
        setTitle(mockTestCase.title);
        setDescription(mockTestCase.description);
        setPreconditions(mockTestCase.preconditions);
        setSteps(mockTestCase.steps);
        setExpectedResults(mockTestCase.expected_results);
        setState(mockTestCase.state);
        setPriority(mockTestCase.priority);
        setType(mockTestCase.type);
        setAutomationStatus(mockTestCase.automation_status);
        setTags(mockTestCase.tags);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching test case:', error);
        setIsLoading(false);
      }
    };

    fetchTestCase();
  }, [supabase, id]);

  const handleSave = async () => {
    try {
      const testCaseData = {
        title,
        description,
        preconditions,
        steps,
        expected_results: expectedResults,
        state,
        priority,
        type,
        automation_status: automationStatus,
        tags,
        updated_at: new Date().toISOString()
      };
      
      if (id === 'new') {
        // Create new test case
        // const { data, error } = await supabase
        //   .from('test_cases')
        //   .insert([{
        //     ...testCaseData,
        //     project_id: 'current-project-id', // This would come from context or state
        //     owner_id: 'current-user-id', // This would come from auth context
        //     created_at: new Date().toISOString()
        //   }])
        //   .select();
        
        // if (error) throw error;
        // navigate(`/test-cases/${data[0].id}`);
        
        // For demo, just navigate back to test cases list
        navigate('/test-cases');
      } else {
        // Update existing test case
        // const { error } = await supabase
        //   .from('test_cases')
        //   .update(testCaseData)
        //   .eq('id', id);
        
        // if (error) throw error;
        
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving test case:', error);
    }
  };

  const handleCancel = () => {
    if (id === 'new') {
      navigate('/test-cases');
    } else {
      setIsEditing(false);
      
      // Reset form fields to original values
      if (testCase) {
        setTitle(testCase.title);
        setDescription(testCase.description);
        setPreconditions(testCase.preconditions);
        setSteps(testCase.steps);
        setExpectedResults(testCase.expected_results);
        setState(testCase.state);
        setPriority(testCase.priority);
        setType(testCase.type);
        setAutomationStatus(testCase.automation_status);
        setTags(testCase.tags);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
        <h1 className="text-2xl font-bold text-gray-900">
          {id === 'new' ? 'Create Test Case' : (isEditing ? 'Edit Test Case' : testCase?.title)}
        </h1>
        {!isEditing && id !== 'new' && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="card p-6">
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="preconditions" className="block text-sm font-medium text-gray-700 mb-1">
                  Preconditions
                </label>
                <textarea
                  id="preconditions"
                  rows={3}
                  value={preconditions}
                  onChange={(e) => setPreconditions(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full"
                  placeholder="Define any preconditions about the test"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-1">
                  Steps
                </label>
                <textarea
                  id="steps"
                  rows={5}
                  value={steps}
                  onChange={(e) => setSteps(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full"
                  placeholder="Steps of the test"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="expectedResults" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Results
                </label>
                <textarea
                  id="expectedResults"
                  rows={5}
                  value={expectedResults}
                  onChange={(e) => setExpectedResults(e.target.value)}
                  disabled={!isEditing}
                  className="input w-full"
                  placeholder="Expected result of the test"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                  <button
                    type="button"
                    disabled={!isEditing}
                    className="btn btn-outline flex items-center space-x-2 mx-auto"
                  >
                    <FiUpload size={16} />
                    <span>Upload Files</span>
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Max. file size: 50 MB | Max. files: 10 (per upload)
                  </p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              <div className="mb-6">
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!isEditing}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Deprecated">Deprecated</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                  Owner <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    disabled={!isEditing}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="Myself (Someet Shende)">Myself (Someet Shende)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={!isEditing}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Test Case <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={!isEditing}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Performance">Performance</option>
                    <option value="Security">Security</option>
                    <option value="Usability">Usability</option>
                    <option value="Accessibility">Accessibility</option>
                    <option value="Smoke & Sanity">Smoke & Sanity</option>
                    <option value="Acceptance">Acceptance</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="automationStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Automation Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="automationStatus"
                    value={automationStatus}
                    onChange={(e) => setAutomationStatus(e.target.value)}
                    disabled={!isEditing}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="Not Automated">Not Automated</option>
                    <option value="Automated">Automated</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FiChevronDown size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                {isEditing ? (
                  <div>
                    <div className="flex">
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="input rounded-r-none w-full"
                        placeholder="Add tags and hit enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary rounded-l-none"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddTag();
                        }}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value="Add tags and hit enter"
                    disabled
                    className="input w-full text-gray-400"
                  />
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div 
                      key={tag} 
                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {tag}
                      {isEditing && (
                        <button
                          type="button"
                          className="ml-1 text-blue-500 hover:text-blue-700"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Setup your requirement management tool
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    disabled={!isEditing}
                    className="btn btn-outline flex items-center space-x-1 text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Jira</span>
                  </button>
                  <button
                    type="button"
                    disabled={!isEditing}
                    className="btn btn-outline flex items-center space-x-1 text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Azure</span>
                  </button>
                  <button
                    type="button"
                    disabled={!isEditing}
                    className="btn btn-outline flex items-center space-x-1 text-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Asana</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
              >
                {id === 'new' ? 'Create' : 'Save'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TestCaseDetail;