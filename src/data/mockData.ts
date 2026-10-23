import type { Personnel, Team, UserAccount } from '../types'

/**
 * Prototype accounts and team structure for CSU-One. There is no backend, so these
 * three accounts are the only way to sign in as each role. The app ships with no
 * sample reports, notifications, or staff: everything else is created by users.
 */

export const TEST_ACCOUNTS: UserAccount[] = [
  {
    id: 'u-stu-mark', role: 'student', name: 'Mark John Esteban', initials: 'ME',
    email: 'mark.esteban@csu.edu.ph', idNumber: '23-01234', password: 'Student@2026',
    phone: '0917 555 0123', program: 'BS Computer Science', yearLevel: '3rd Year',
  },
  {
    id: 'u-admin-andrea', role: 'admin', name: 'LeBron James', initials: 'LJ',
    email: 'lebron.james@csu.edu.ph', idNumber: 'ADM-0001', password: 'Admin@2026',
    phone: '0917 555 0188', position: 'Facilities Coordinator', office: 'Campus Facilities Office',
  },
  {
    id: 'u-maint-joel', role: 'maintenance', name: 'Michael Jordan', initials: 'MJ',
    email: 'michael.jordan@csu.edu.ph', idNumber: 'MNT-0107', password: 'Maint@2026',
    phone: '0917 555 0145', position: 'Electrician', office: 'Physical Plant and Facilities', teamId: 'team-electrical',
  },
]

export const ADMIN_ID = 'u-admin-andrea'

/** How report categories are routed to maintenance teams. */
export const TEAMS: Team[] = [
  { id: 'team-electrical', name: 'Electrical Team', focus: ['Lighting', 'Electrical'] },
  { id: 'team-plumbing', name: 'Plumbing Team', focus: ['Plumbing'] },
  { id: 'team-carpentry', name: 'Carpentry and Furniture', focus: ['Furniture', 'Doors & Windows'] },
  { id: 'team-civil', name: 'Grounds and Civil Works', focus: ['Pathways', 'Facilities'] },
  { id: 'team-janitorial', name: 'Janitorial Services', focus: ['Cleanliness', 'Other'] },
]

/** Maintenance staff are the maintenance accounts; availability is the only editable field. */
export function maintenanceStaff(accounts: UserAccount[], availability: Record<string, Personnel['availability']> = {}): Personnel[] {
  return accounts
    .filter((a) => a.role === 'maintenance')
    .map((a) => ({
      id: a.id,
      name: a.name,
      initials: a.initials,
      teamId: a.teamId ?? TEAMS[0].id,
      position: a.position ?? 'Maintenance',
      phone: a.phone,
      availability: availability[a.id] ?? 'Available',
    }))
}

/**
 * Earlier versions seeded these sample records into localStorage. They are removed
 * once on load so only real, user-created data remains.
 */
export const LEGACY_SAMPLE_REPORT_IDS = new Set(Array.from({ length: 14 }, (_, i) => `CSU-${1016 + i}`))
