'use server'

// This file is deprecated - use centralized actions from /actions instead
// Keeping for backward compatibility during migration

import { 
  getTeamStatus as getTeamStatusCentralized, 
  getTeamStats as getTeamStatsCentralized, 
  getTeamActivity as getTeamActivityCentralized, 
  refreshManagerDashboard as refreshManagerDashboardCentralized 
} from "@/actions"

export async function getTeamStatus() {
  return await getTeamStatusCentralized()
}

export async function getTeamStats() {
  return await getTeamStatsCentralized()
}

export async function getTeamActivity() {
  return await getTeamActivityCentralized()
}

export async function refreshManagerDashboard() {
  return await refreshManagerDashboardCentralized()
} 