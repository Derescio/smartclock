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

// Employee Management
export {
  createEmployee,
  updateEmployee,
  getEmployee,
  toggleEmployeeStatus,
  getDepartments,
  createDepartment,
  updateDepartment,
  bulkUpdateEmployees
} from './employees'

// Schedule Management
export {
  getOrganizationSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  approveSchedule,
  rejectSchedule,
  getSchedulesByEmployee,
  getScheduleStats,
  getTodaysSchedule
} from './schedules'

// Timesheet Management
export {
  getEmployeeTimesheets,
  generateTimesheetFromClockEvents,
  getTimesheetById,
  getWeeklyTimesheet
} from './timesheets'

// Team Management (Teams Feature)
export {
  getOrganizationTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStats
} from './teams'

// Action Categories for easier troubleshooting
export const ActionCategories = {
  AUTH: ['getCurrentUser', 'requireAuth', 'requireRole', 'createUser', 'updateUserProfile', 'deactivateUser'],
  CLOCK: ['clockIn', 'clockOut', 'startBreak', 'endBreak', 'getCurrentStatus', 'getTodaysClockEvents'],
  TEAM: ['getTeamStatus', 'getTeamStats', 'getTeamActivity', 'getAllTeamMembers', 'updateTeamMemberRole', 'refreshManagerDashboard'],
  LOCATIONS: ['getOrganizationLocations', 'createLocation', 'updateLocation', 'deleteLocation', 'validateLocationCoordinates', 'generateLocationQRCode', 'getLocationAnalytics'],
  ORGANIZATIONS: ['getOrganizationDetails', 'updateOrganizationSettings', 'getOrganizationStats', 'lookupOrganizationBySlug', 'createOrganization', 'getOrganizationUsage'],
  EMPLOYEES: ['createEmployee', 'updateEmployee', 'getEmployee', 'toggleEmployeeStatus', 'getDepartments', 'createDepartment', 'updateDepartment', 'bulkUpdateEmployees'],
  SCHEDULES: ['getOrganizationSchedules', 'createSchedule', 'updateSchedule', 'deleteSchedule', 'approveSchedule', 'rejectSchedule', 'getSchedulesByEmployee', 'getScheduleStats', 'getTodaysSchedule'],
  TIMESHEETS: ['getEmployeeTimesheets', 'generateTimesheetFromClockEvents', 'getTimesheetById', 'getWeeklyTimesheet'],
  TEAMS: ['getOrganizationTeams', 'createTeam', 'updateTeam', 'deleteTeam', 'getTeamStats']
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

// Define role-based access control
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions
  ADMIN: ['getTeamStatus', 'getTeamStats', 'getTeamActivity', 'getAllTeamMembers', 'updateTeamMemberRole', 'refreshManagerDashboard', 'createOrganization', 'getOrganizationStats', 'createLocation', 'updateLocation', 'deleteLocation', 'createEmployee', 'updateEmployee', 'deleteEmployee', 'createDepartment', 'updateDepartment'],
  MANAGER: ['getTeamStatus', 'getTeamStats', 'getTeamActivity', 'getAllTeamMembers', 'updateTeamMemberRole', 'refreshManagerDashboard'],
  EMPLOYEE: ['clockIn', 'clockOut', 'startBreak', 'endBreak', 'getCurrentStatus', 'getTodaysClockEvents', 'getEmployeeTimesheets', 'generateTimesheetFromClockEvents', 'getTimesheetById', 'getWeeklyTimesheet', 'getTodaysSchedule']
} 