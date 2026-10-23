export type Role = 'student' | 'admin' | 'maintenance'
export type Status = 'Open' | 'Assigned' | 'In Progress' | 'Resolved'
export type Priority = 'Urgent' | 'Normal' | 'Low'

export type Category =
  | 'Furniture'
  | 'Lighting'
  | 'Electrical'
  | 'Plumbing'
  | 'Doors & Windows'
  | 'Pathways'
  | 'Facilities'
  | 'Cleanliness'
  | 'Other'

export type LatLng = { lat: number; lng: number }

export interface UserAccount {
  id: string
  role: Role
  name: string
  initials: string
  email: string
  idNumber: string
  password: string
  phone: string
  /** Student only */
  program?: string
  yearLevel?: string
  /** Admin and maintenance */
  position?: string
  office?: string
  teamId?: string
}

export type Session = { userId: string; remember: boolean }

export interface Building {
  id: string
  name: string
  /** Centroid taken from the OpenStreetMap feature referenced by osmId */
  lat: number
  lng: number
  osmId: string
  /** Short description shown under the name in search suggestions */
  kind: string
  /** Abbreviations and keywords people may type when searching */
  aliases: string[]
  /** Map label; buildings without one (open grounds) are not labelled */
  short?: string
}

export type Availability = 'Available' | 'On site' | 'Busy' | 'Off duty'

export interface Team {
  id: string
  name: string
  focus: Category[]
}

export interface Personnel {
  id: string
  name: string
  initials: string
  teamId: string
  position: string
  phone: string
  availability: Availability
}

export type TimelineType =
  | 'submitted'
  | 'assigned'
  | 'reassigned'
  | 'accepted'
  | 'started'
  | 'progress'
  | 'materials'
  | 'completion_photo'
  | 'resolved'
  | 'reopened'
  | 'info_requested'
  | 'info_provided'

export interface TimelineEvent {
  id: string
  type: TimelineType
  label: string
  detail?: string
  at: string
  by: string
}

export interface InternalNote {
  id: string
  authorName: string
  authorRole: Role
  text: string
  at: string
}

export type LocationSource = 'pin' | 'building'

export interface Report {
  id: string
  title: string
  category: Category
  description: string
  priority: Priority
  status: Status
  buildingId: string
  locationDetail: string
  lat: number
  lng: number
  locationSource: LocationSource
  photo?: string
  completionPhoto?: string
  reporterId: string
  reporterName: string
  reporterIdNumber: string
  assigneeId?: string
  accepted: boolean
  createdAt: string
  updatedAt: string
  assignedAt?: string
  startedAt?: string
  resolvedAt?: string
  materialsNeeded?: string
  pendingInfoRequest?: string
  timeline: TimelineEvent[]
  notes: InternalNote[]
}

export type NotificationType =
  | 'received'
  | 'new_report'
  | 'assigned'
  | 'task_assigned'
  | 'accepted'
  | 'started'
  | 'resolved'
  | 'reopened'
  | 'info_requested'
  | 'info_provided'
  | 'materials'

export interface AppNotification {
  id: string
  recipientId: string
  reportId?: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
}

export interface NotificationPrefs {
  statusUpdates: boolean
  assignments: boolean
  email: boolean
  sms: boolean
}

export interface NewReportInput {
  title: string
  category: Category
  description: string
  priority: Priority
  buildingId: string
  locationDetail: string
  lat: number
  lng: number
  locationSource: LocationSource
  photo?: string
}
