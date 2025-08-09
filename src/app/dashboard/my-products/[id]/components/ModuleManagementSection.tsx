'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Video, FileText, Edit2, Trash2, Download, Eye, Filter, ChevronDown } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { DASHBOARD_COLORS } from '../../../constants';
import ModuleEditModal from './ModuleEditModal';
import ConfirmDialog from './ConfirmDialog';

interface ModuleManagementSectionProps {
  courseId: string;
  chapters: any[];
  canEdit: boolean;
}

interface ModuleFilters {
  status?: 'draft' | 'published';
  type?: 'video' | 'document';
  includeUnpublished?: boolean;
  sortBy?: 'order' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeStats?: boolean;
}

/**
 * Module Management Section
 * Handles module viewing, creation, editing, and deletion
 * Integrated with backend API following the controller specifications
 */
const ModuleManagementSection: React.FC<ModuleManagementSectionProps> = ({
  courseId,
  chapters,
  canEdit
}) => {
  const [modules, setModules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [filters, setFilters] = useState<ModuleFilters>({
    includeStats: true,
    sortBy: 'order',
    sortOrder: 'asc',
    page: 1,
    limit: 20
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingModule, setDeletingModule] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Set first chapter as default when chapters load
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(chapters[0].id);
    }
  }, [chapters, selectedChapter]);  

  useEffect(() => {
    if (selectedChapter) {
      loadModules();
    }
  }, [selectedChapter, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadModules = async () => {
    if (!selectedChapter) {
      setModules([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // If "All Chapters" selected, aggregate from all chapters
      if (selectedChapter === 'all') {
        await loadAllChaptersModules();
        return;
      }

      // Load modules for specific chapter using backend API
      const params: any = {
        includeStats: filters.includeStats,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit
      };

      // Add optional filters
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.includeUnpublished !== undefined) params.includeUnpublished = filters.includeUnpublished;

      console.log('🔄 Loading modules for chapter:', selectedChapter, 'with params:', params);
      
      const response = await CourseAPI.getModulesForChapter(selectedChapter, params);
      
      if (response.success && response.data) {
        // Find the current chapter info
        const currentChapter = chapters.find(ch => ch.id === selectedChapter);
        
        // Add chapter info to each module for consistency
        const modulesWithChapter = (response.data.modules || []).map((module: any) => ({
          ...module,
          chapterId: selectedChapter, // Add chapterId for API calls
          chapter: currentChapter ? {
            id: currentChapter.id,
            title: currentChapter.title,
            order: currentChapter.order
          } : null
        }));
        
        setModules(modulesWithChapter);
        setStats(response.data.stats || null);
        console.log('✅ Modules loaded:', modulesWithChapter.length);
      } else {
        console.error('❌ Failed to load modules:', response.message);
        setModules([]);
        setStats(null);
      }
    } catch (error: any) {
      console.error('💥 Error loading modules:', error);
      setModules([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAllChaptersModules = async () => {
    try {
      let allModules: any[] = [];
      const aggregatedStats = {
        totalModules: 0,
        videoModules: 0,
        documentModules: 0,
        previewModules: 0,
        totalDuration: 0
      };

      for (const chapter of chapters) {
        try {
          const params: any = {
            includeStats: true,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            limit: 1000 // Get all modules for aggregation
          };

          if (filters.status) params.status = filters.status;
          if (filters.type) params.type = filters.type;
          if (filters.includeUnpublished !== undefined) params.includeUnpublished = filters.includeUnpublished;

          const response = await CourseAPI.getModulesForChapter(chapter.id, params);
          
          if (response.success && response.data) {
            const chapterModules = response.data.modules || [];
            // Add chapter info to each module for display
            const modulesWithChapter = chapterModules.map((module: any) => ({
              ...module,
              chapterId: chapter.id, // Add chapterId for API calls
              chapter: {
                id: chapter.id,
                title: chapter.title,
                order: chapter.order
              }
            }));
            
            allModules = [...allModules, ...modulesWithChapter];

            // Aggregate stats
            if (response.data.stats) {
              const chapterStats = response.data.stats;
              aggregatedStats.totalModules += chapterStats.totalModules || 0;
              aggregatedStats.videoModules += chapterStats.videoModules || 0;
              aggregatedStats.documentModules += chapterStats.documentModules || 0;
              aggregatedStats.previewModules += chapterStats.previewModules || 0;
              aggregatedStats.totalDuration += chapterStats.totalDuration || 0;
            }
          }
        } catch (error) {
          console.error(`Failed to load modules for chapter ${chapter.title}:`, error);
        }
      }

      // Sort aggregated modules
      if (filters.sortBy === 'order') {
        allModules.sort((a, b) => {
          const chapterOrderA = a.chapter?.order || 0;
          const chapterOrderB = b.chapter?.order || 0;
          if (chapterOrderA !== chapterOrderB) {
            return filters.sortOrder === 'asc' ? chapterOrderA - chapterOrderB : chapterOrderB - chapterOrderA;
          }
          return filters.sortOrder === 'asc' ? a.order - b.order : b.order - a.order;
        });
      } else if (filters.sortBy === 'title') {
        allModules.sort((a, b) => {
          const comparison = a.title.localeCompare(b.title);
          return filters.sortOrder === 'asc' ? comparison : -comparison;
        });
      } else if (filters.sortBy === 'createdAt') {
        allModules.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
      }

      // Apply pagination
      const startIndex = ((filters.page || 1) - 1) * (filters.limit || 20);
      const endIndex = startIndex + (filters.limit || 20);
      const paginatedModules = allModules.slice(startIndex, endIndex);

      setModules(paginatedModules);
      setStats(aggregatedStats);
      console.log('✅ All chapters modules loaded:', allModules.length, 'displayed:', paginatedModules.length);
    } catch (error) {
      console.error('Error loading all chapters modules:', error);
      setModules([]);
      setStats(null);
    }
  };

  const handleFilterChange = (key: keyof ModuleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when other filters change
    }));
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setFilters(prev => ({ ...prev, page: 1 })); // Reset pagination
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteModule = async (module: any) => {
    try {
      const chapterId = module.chapterId || module.chapter?.id;
      if (!chapterId) {
        console.error('No chapterId found for module:', module);
        return;
      }
      
      const response = await CourseAPI.deleteModule(courseId, chapterId, module.id);
      if (response.success) {
        // Reload modules to get updated list
        loadModules();
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const handleDeleteRequest = (module: any) => {
    setDeletingModule(module);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingModule) {
      handleDeleteModule(deletingModule);
    }
    setDeletingModule(null);
  };

  const handleCancelDelete = () => {
    setDeletingModule(null);
    setIsDeleteDialogOpen(false);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
    setIsEditModalOpen(true);
  };

  const handleModuleUpdated = () => {
    // Reload modules to get updated list
    loadModules();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingModule(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} 
            className="rounded-xl p-6 animate-pulse"
            style={{ background: DASHBOARD_COLORS.CARD_BG }}
          >
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Course Modules</h2>
          {stats && (
            <p className="text-gray-400 text-sm mt-1">
              {stats.totalModules} modules • {stats.videoModules} videos • {stats.documentModules} documents
              {stats.totalDuration > 0 && ` • ${formatDuration(stats.totalDuration)} total`}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <Filter size={16} />
          Filters
          <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Chapter Selection - Always Visible */}
      <div 
        className="rounded-xl p-[1px]"
        style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
      >
        <div 
          className="rounded-xl p-4"
          style={{ background: DASHBOARD_COLORS.CARD_BG }}
        >
          <label className="block text-white font-medium mb-2">Select Chapter</label>
          <select
            value={selectedChapter}
            onChange={(e) => handleChapterChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select a chapter...</option>
            <option value="all">All Chapters</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title} ({chapter.moduleCount || 0} modules)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div 
          className="rounded-xl p-[1px]"
          style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
        >
          <div 
            className="rounded-xl p-4 space-y-4"
            style={{ background: DASHBOARD_COLORS.CARD_BG }}
          >
            <h3 className="text-white font-medium">Filter & Sort Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All Types</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="order">Order</option>
                  <option value="title">Title</option>
                  <option value="createdAt">Created Date</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">Sort Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Include Unpublished */}
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.includeUnpublished || false}
                  onChange={(e) => handleFilterChange('includeUnpublished', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600"
                />
                Include Unpublished
              </label>

              {/* Page Size */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm">Per Page:</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Chapter Selected */}
      {!selectedChapter && (
        <div 
          className="rounded-xl p-[1px]"
          style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
        >
          <div 
            className="rounded-xl p-8 text-center"
            style={{ background: DASHBOARD_COLORS.CARD_BG }}
          >
            <Video className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">Select a Chapter</h3>
            <p className="text-gray-400">
              Choose a chapter from the dropdown above to view its modules, or select "All Chapters" to see everything.
            </p>
          </div>
        </div>
      )}

      {/* No Modules Found */}
      {selectedChapter && modules.length === 0 && !loading && (
        <div 
          className="rounded-xl p-[1px]"
          style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
        >
          <div 
            className="rounded-xl p-8 text-center"
            style={{ background: DASHBOARD_COLORS.CARD_BG }}
          >
            <Video className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">No modules found</h3>
            <p className="text-gray-400">
              {selectedChapter === 'all' 
                ? 'No modules match the current filters across all chapters.'
                : 'No modules found in the selected chapter with current filters.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Modules List */}
      {modules.length > 0 && (
        <div className="space-y-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              courseId={courseId}
              canEdit={canEdit}
              onDelete={() => handleDeleteRequest(module)}
              onEdit={() => handleEditModule(module)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {modules.length > 0 && stats && stats.totalModules > (filters.limit || 20) && (
        <div 
          className="rounded-xl p-[1px]"
          style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
        >
          <div 
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ background: DASHBOARD_COLORS.CARD_BG }}
          >
            <div className="text-gray-400 text-sm">
              Showing {((filters.page || 1) - 1) * (filters.limit || 20) + 1} to {Math.min((filters.page || 1) * (filters.limit || 20), stats.totalModules)} of {stats.totalModules} modules
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) <= 1}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Previous
              </button>
              <span className="text-gray-300 text-sm px-3">
                Page {filters.page || 1} of {Math.ceil(stats.totalModules / (filters.limit || 20))}
              </span>
              <button
                onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                disabled={(filters.page || 1) >= Math.ceil(stats.totalModules / (filters.limit || 20))}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingModule && (
        <ModuleEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          module={editingModule}
          courseId={courseId}
          onModuleUpdated={handleModuleUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete "${deletingModule?.title}"? This action cannot be undone and will permanently remove all module content.`}
        type="danger"
        confirmText="Delete Module"
        cancelText="Cancel"
      />
    </div>
  );
};

// Module Card Component
const ModuleCard: React.FC<{
  module: any;
  courseId: string;
  canEdit: boolean;
  onDelete: () => void;
  onEdit: () => void;
}> = ({ module, courseId, canEdit, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const [moduleContent, setModuleContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const loadModuleContent = async () => {
    if (moduleContent) return;
    
    try {
      setLoadingContent(true);
      console.log('🔍 Loading module content for:', { courseId, moduleId: module.id });
      
      // Updated to use new API endpoint format
      const response = await CourseAPI.getModuleContent(courseId, module.id);
      
      console.log('📥 Module content response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Module content loaded successfully:', response.data);
        setModuleContent(response.data);
      } else {
        console.error('❌ Failed to load module content:', response.message);
        // Show error toast
        if (typeof window !== 'undefined') {
          const { useUIStore } = await import('@/store/useUIStore');
          useUIStore.getState().addToast({
            type: 'error',
            message: response.message || 'Failed to load module content'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading module content:', error);
      // Show error toast
      if (typeof window !== 'undefined') {
        const { useUIStore } = await import('@/store/useUIStore');
        useUIStore.getState().addToast({
          type: 'error',
          message: 'Failed to load module content. Please try again.'
        });
      }
    } finally {
      setLoadingContent(false);
    }
  };

  const handleExpand = () => {
    setExpanded(!expanded);
    if (!expanded) {
      loadModuleContent();
    }
  };

  return (
    <div 
      className="rounded-xl p-[1px] overflow-hidden"
      style={{ background: DASHBOARD_COLORS.PRIMARY_BORDER }}
    >
      <div 
        className="rounded-xl p-6"
        style={{ background: DASHBOARD_COLORS.CARD_BG }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {/* Chapter Badge - Show for "All Chapters" view */}
              {module.chapter && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded border border-gray-600">
                  {module.chapter.title}
                </span>
              )}
              
              {/* Module Type Icon */}
              {module.type === 'video' ? 
                <Video size={16} className="text-purple-400" /> : 
                <FileText size={16} className="text-blue-400" />
              }
              
              {/* Module Title */}
              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
              
              {/* Preview Badge */}
              {module.isPreview && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                  Preview
                </span>
              )}
              
              {/* Published Status */}
              <span className={`px-2 py-1 rounded text-xs border ${
                module.status === 'published' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {module.status}
              </span>
            </div>
            
            {/* Description */}
            {module.description && (
              <p className="text-gray-400 mb-3 text-sm">{module.description}</p>
            )}
            
            {/* Module Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Order: {module.order}
              </span>
              
              {module.duration && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  {formatDuration(module.duration)}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${module.hasContent ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {module.hasContent ? 'Has Content' : 'No Content'}
              </span>
              
              {module.isPublished && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Published
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpand}
              className={`p-2 rounded transition-colors ${
                expanded 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
              }`}
              title={expanded ? "Hide Content" : "View Content"}
            >
              <Eye size={16} />
            </button>
            
            {canEdit && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  title="Edit Module"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  title="Delete Module"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded Content Section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            {loadingContent ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading module content...</p>
              </div>
            ) : moduleContent ? (
              <div className="space-y-4">
                {/* Content Preview */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Order:</span>
                    <span className="ml-2 text-gray-300">{module.order}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Chapter:</span>
                    <span className="ml-2 text-gray-300">{module.chapter?.title || 'No chapter'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Has Content:</span>
                    <span className="ml-2 text-gray-300">{module.hasContent ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Published:</span>
                    <span className="ml-2 text-gray-300">{module.isPublished ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="mx-auto mb-2 text-gray-500" size={24} />
                <p className="text-gray-400 text-sm">Failed to load module content</p>
                <button
                  onClick={loadModuleContent}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default ModuleManagementSection;