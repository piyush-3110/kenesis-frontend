'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Video, FileText, Edit2, Trash2, Download, Eye, Filter, ChevronDown } from 'lucide-react';
import { CourseAPI } from '@/lib/api';
import { Module } from '@/types/Product';

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
  }, [selectedChapter, filters]);

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
        setModules(response.data.modules || []);
        setStats(response.data.stats || null);
        console.log('✅ Modules loaded:', response.data.modules?.length || 0);
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
      let aggregatedStats = {
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

  const handleDeleteModule = async (module: Module) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await CourseAPI.deleteModule(courseId, module.chapterId, module.id);
      if (response.success) {
        // Reload modules to get updated list
        loadModules();
      }
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
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
      <div className="bg-gray-800 rounded-lg p-4">
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

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
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
      )}

      {/* No Chapter Selected */}
      {!selectedChapter && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Video className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">Select a Chapter</h3>
          <p className="text-gray-400">
            Choose a chapter from the dropdown above to view its modules, or select "All Chapters" to see everything.
          </p>
        </div>
      )}

      {/* No Modules Found */}
      {selectedChapter && modules.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Video className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-white mb-2">No modules found</h3>
          <p className="text-gray-400">
            {selectedChapter === 'all' 
              ? 'No modules match the current filters across all chapters.'
              : 'No modules found in the selected chapter with current filters.'
            }
          </p>
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
              onDelete={() => handleDeleteModule(module)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {modules.length > 0 && stats && stats.totalModules > (filters.limit || 20) && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
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
      )}
    </div>
  );
};

// Module Card Component
const ModuleCard: React.FC<{
  module: any;
  courseId: string;
  canEdit: boolean;
  onDelete: () => void;
}> = ({ module, courseId, canEdit, onDelete }) => {
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
      const response = await CourseAPI.getModuleContent(courseId, module.chapterId, module.id);
      if (response.success && response.data) {
        setModuleContent(response.data.module);
      }
    } catch (error) {
      console.error('Failed to load module content:', error);
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
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      <div className="p-6">
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
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  title="Edit Module"
                  onClick={() => console.log('Edit module:', module.id)}
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
      </div>

      {/* Expanded Content Section */}
      {expanded && (
        <div className="border-t border-gray-700 bg-gray-900/50">
          {loadingContent ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 text-sm mt-2">Loading module content...</p>
            </div>
          ) : moduleContent ? (
            <div className="p-6 space-y-4">
              {/* Content Header */}
              <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                <h4 className="text-white font-medium">Module Content</h4>
                <span className="text-xs text-gray-400">
                  Last updated: {moduleContent.updatedAt ? new Date(moduleContent.updatedAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>

              {/* Main File */}
              {moduleContent.content?.mainFile && (
                <div className="space-y-2">
                  <h5 className="text-white font-medium text-sm">Main Content</h5>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {module.type === 'video' ? 
                          <Video size={20} className="text-purple-400" /> : 
                          <FileText size={20} className="text-blue-400" />
                        }
                        <div>
                          <p className="text-white font-medium">
                            {module.type === 'video' ? 'Video File' : 'Document'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{moduleContent.content.mainFile.type}</span>
                            <span>•</span>
                            <span>{formatFileSize(moduleContent.content.mainFile.size)}</span>
                            {moduleContent.content.mainFile.duration && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(moduleContent.content.mainFile.duration)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={moduleContent.content.mainFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                        title="Open Content"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {moduleContent.content?.attachments && moduleContent.content.attachments.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-white font-medium text-sm">
                    Attachments ({moduleContent.content.attachments.length})
                  </h5>
                  <div className="space-y-2">
                    {moduleContent.content.attachments.map((attachment: any, index: number) => (
                      <div key={attachment.id || index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText size={16} className="text-gray-400" />
                            <div>
                              <p className="text-white text-sm font-medium">{attachment.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{attachment.type}</span>
                                <span>•</span>
                                <span>{formatFileSize(attachment.size)}</span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                            title="Download Attachment"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Statistics */}
              {moduleContent.stats && (
                <div className="space-y-2">
                  <h5 className="text-white font-medium text-sm">Statistics</h5>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {moduleContent.stats.viewCount !== undefined && (
                        <div>
                          <p className="text-gray-400">Views</p>
                          <p className="text-white font-medium">{moduleContent.stats.viewCount}</p>
                        </div>
                      )}
                      {moduleContent.stats.completionRate !== undefined && (
                        <div>
                          <p className="text-gray-400">Completion Rate</p>
                          <p className="text-white font-medium">{(moduleContent.stats.completionRate * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {moduleContent.stats.avgWatchTime !== undefined && (
                        <div>
                          <p className="text-gray-400">Avg Watch Time</p>
                          <p className="text-white font-medium">{formatDuration(moduleContent.stats.avgWatchTime)}</p>
                        </div>
                      )}
                      {moduleContent.stats.downloadCount !== undefined && (
                        <div>
                          <p className="text-gray-400">Downloads</p>
                          <p className="text-white font-medium">{moduleContent.stats.downloadCount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* No Content Available */}
              {!moduleContent.content?.mainFile && (!moduleContent.content?.attachments || moduleContent.content.attachments.length === 0) && (
                <div className="text-center py-4">
                  <FileText className="mx-auto mb-2 text-gray-500" size={24} />
                  <p className="text-gray-400 text-sm">No content files available for this module</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
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
  );
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default ModuleManagementSection;
