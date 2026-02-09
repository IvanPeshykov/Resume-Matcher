/**
 * API Module Exports
 *
 * Centralized exports for all API-related functionality.
 */

// Client utilities
export {
  API_URL,
  API_BASE,
  apiFetch,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  getUploadUrl,
} from './client';

// Resume operations
export {
  uploadJobDescriptions,
  improveResume,
  previewImproveResume,
  confirmImproveResume,
  fetchResume,
  fetchResumeList,
  updateResume,
  downloadResumePdf,
  deleteResume,
  type ResumeListItem,
} from './resume';

// Config operations
export {
  type LLMProvider,
  type LLMConfig,
  type LLMConfigUpdate,
  type DatabaseStats,
  type SystemStatus,
  type LLMHealthCheck,
} from './config';
