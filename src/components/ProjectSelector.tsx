import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
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

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectKey.trim()) return;

    const newProject = await createProject(newProjectName, newProjectKey, newProjectDescription);
    if (newProject) {
      setCurrentProject(newProject);
      setNewProjectName('');
      setNewProjectKey('');
      setNewProjectDescription('');
      setIsCreateModalOpen(false);
    }
  };

  const handleEditProject = async () => {
    if (!currentProject || !newProjectName.trim()) return;

    const success = await updateProject(currentProject.id, {
      name: newProjectName,
      description: newProjectDescription
    });

    if (success) {
      setNewProjectName('');
      setNewProjectDescription('');
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;

    if (window.confirm(`Are you sure you want to delete ${currentProject.name}? This action cannot be undone.`)) {
      await deleteProject(currentProject.id);
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="input w-full" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My New Project"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Key <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="input w-full uppercase" 
                value={newProjectKey}
                onChange={(e) => setNewProjectKey(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
                placeholder="PRJ"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">2-10 characters, letters and numbers only</p>
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
                disabled={!newProjectName.trim() || !newProjectKey.trim() || newProjectKey.length < 2}
              >
                Create Project
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="input w-full" 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
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
                disabled={!newProjectName.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;