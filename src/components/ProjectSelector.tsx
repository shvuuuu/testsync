import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { useProject } from '../lib/context/ProjectContext';

interface ProjectSelectorProps {
  isSidebarOpen: boolean;
}

const ProjectSelector = ({ isSidebarOpen }: ProjectSelectorProps) => {
  const { currentProject, projects, setCurrentProject, createProject, updateProject, deleteProject } = useProject();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{name?: string; key?: string; general?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const validateProjectForm = () => {
    const errors: {name?: string; key?: string} = {};
    
    if (!newProjectName.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (!newProjectKey.trim()) {
      errors.key = 'Project key is required';
    } else if (newProjectKey.length < 2) {
      errors.key = 'Project key must be at least 2 characters';
    } else if (newProjectKey.length > 10) {
      errors.key = 'Project key must be at most 10 characters';
    }
    
    return errors;
  };

  const handleCreateProject = async () => {
    // Reset errors
    setFormErrors({});
    
    // Validate form
    const errors = validateProjectForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      const newProject = await createProject(newProjectName, newProjectKey, newProjectDescription);
      
      if (newProject) {
        setCurrentProject(newProject);
        setNewProjectName('');
        setNewProjectKey('');
        setNewProjectDescription('');
        setIsCreateModalOpen(false);
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.message?.includes('duplicate key')) {
        setFormErrors({ key: 'This project key is already in use' });
      } else {
        setFormErrors({ general: error.message || 'Failed to create project' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProject = async () => {
    // Reset errors
    setFormErrors({});
    
    if (!currentProject || !newProjectName.trim()) {
      setFormErrors({ name: 'Project name is required' });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await updateProject(currentProject.id, {
        name: newProjectName,
        description: newProjectDescription
      });

      if (success) {
        setNewProjectName('');
        setNewProjectDescription('');
        setIsEditModalOpen(false);
      }
    } catch (error: any) {
      setFormErrors({ general: error.message || 'Failed to update project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;

    if (window.confirm(`Are you sure you want to delete ${currentProject.name}? This action cannot be undone.`)) {
      try {
        setIsSubmitting(true);
        await deleteProject(currentProject.id);
      } catch (error: any) {
        alert(`Failed to delete project: ${error.message || 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openEditModal = () => {
    if (!currentProject) return;

    setNewProjectName(currentProject.name);
    setNewProjectDescription(currentProject.description || '');
    setIsEditModalOpen(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className="px-4 mb-4 relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-between w-full text-left text-gray-700 font-medium"
      >
        <span>Projects</span>
        <FiChevronDown size={16} />
      </button>
      
      {isSidebarOpen && (
        <div className="mt-2">
          {currentProject ? (
            <div 
              className="flex items-center p-2 rounded-md bg-blue-50 text-blue-700 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 mr-2">
                <span className="text-xs font-medium">{currentProject.key.substring(0, 1)}</span>
              </div>
              <span className="font-medium truncate">{currentProject.name}</span>
            </div>
          ) : (
            <div className="p-2 text-sm text-gray-500">
              No project selected
            </div>
          )}
        </div>
      )}

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 py-1">
          <div className="max-h-64 overflow-y-auto">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center ${project.id === currentProject?.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                onClick={() => {
                  setCurrentProject(project);
                  setIsDropdownOpen(false);
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-white rounded border border-gray-200 mr-2">
                  <span className="text-xs font-medium">{project.key.substring(0, 1)}</span>
                </div>
                <span className="truncate">{project.name}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button 
              className="px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left flex items-center"
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsDropdownOpen(false);
              }}
            >
              <FiPlus size={16} className="mr-2" />
              Create New Project
            </button>
            
            {currentProject && (
              <>
                <button 
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={openEditModal}
                >
                  <FiEdit2 size={16} className="mr-2" />
                  Edit Project
                </button>
                <button 
                  className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={handleDeleteProject}
                >
                  <FiTrash2 size={16} className="mr-2" />
                  Delete Project
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My New Project"
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Key <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className={`input w-full uppercase ${formErrors.key ? 'border-red-500' : ''}`}
                value={newProjectKey}
                onChange={(e) => setNewProjectKey(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                placeholder="PRJ"
                maxLength={10}
              />
              {formErrors.key ? (
                <p className="mt-1 text-xs text-red-500">{formErrors.key}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">2-10 characters, letters and numbers only</p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="input w-full" 
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Project description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateProject}
                disabled={isSubmitting || !newProjectName.trim() || !newProjectKey.trim() || newProjectKey.length < 2}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className={`input w-full ${formErrors.name ? 'border-red-500' : ''}`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Key</label>
              <input 
                type="text" 
                className="input w-full bg-gray-100" 
                value={currentProject.key}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Project key cannot be changed</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="input w-full" 
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                className="btn btn-outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEditProject}
                disabled={isSubmitting || !newProjectName.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;