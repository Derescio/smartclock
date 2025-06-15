// Centralized Actions Hub for SmartClock SaaS Platform
// This file provides a single import point for all server actions

// Authentication & User Management
export {
  getCurrentUser,
  requireAuth,
  requireRole,
  createUser,
  updateUserProfile,
  deactivateUser
} from './auth'

// Clock & Time Tracking
export {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getCurrentStatus,
  getTodaysClockEvents
} from './clock'

// Team Management (Manager Dashboard)
export {
  getTeamStatus,
  getTeamStats,
  getTeamActivity,
  getAllTeamMembers,
  updateTeamMemberRole,
  refreshManagerDashboard
} from './team'

// Location Management
export {
  getOrganizationLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  validateLocationCoordinates,
  generateLocationQRCode,
  getLocationAnalytics
} from './locations'

// Organization Management
export {
  getOrganizationDetails,
  updateOrganizationSettings,
  getOrganizationStats,
  lookupOrganizationBySlug,
  createOrganization,
  getOrganizationUsage
} from './organizations'

// Action Categories for easier troubleshooting
export const ActionCategories = {
  AUTH: ['getCurrentUser', 'requireAuth', 'requireRole', 'createUser', 'updateUserProfile', 'deactivateUser'],
  CLOCK: ['clockIn', 'clockOut', 'startBreak', 'endBreak', 'getCurrentStatus', 'getTodaysClockEvents'],
  TEAM: ['getTeamStatus', 'getTeamStats', 'getTeamActivity', 'getAllTeamMembers', 'updateTeamMemberRole', 'refreshManagerDashboard'],
  LOCATIONS: ['getOrganizationLocations', 'createLocation', 'updateLocation', 'deleteLocation', 'validateLocationCoordinates', 'generateLocationQRCode', 'getLocationAnalytics'],
  ORGANIZATIONS: ['getOrganizationDetails', 'updateOrganizationSettings', 'getOrganizationStats', 'lookupOrganizationBySlug', 'createOrganization', 'getOrganizationUsage']
} as const

// Helper function for debugging - shows which actions are available
export function getAvailableActions() {
  return {
    total: Object.values(ActionCategories).flat().length,
    categories: ActionCategories,
    byCategory: Object.entries(ActionCategories).map(([category, actions]) => ({
      category,
      count: actions.length,
      actions
    }))
  }
} 