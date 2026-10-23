/**
 * Shared React components that page templates (src/pages/**\/*.html) may use as
 * capitalised tags, e.g. <PageHeader …/>. Page-local components are imported per
 * template through its data-imports attribute instead.
 */
export { Link } from '../lib/router'
export { PageHeader, EmptyState, StatStrip } from '../components/ui/Page'
export { Field, SearchInput, Toggle, ChipGroup } from '../components/ui/Form'
export { AppSelect } from '../components/ui/select/AppSelect'
export { SearchableCombobox } from '../components/ui/select/SearchableCombobox'
export { PrimaryButton } from '../components/ui/Button'
export { TextField, PasswordField } from '../components/ui/TextField'
export { Modal, ModalCancelButton, ConfirmDialog } from '../components/ui/Modal'
export { StatusBadge, PriorityBadge, Avatar } from '../components/ui/Badges'
export { AppLogo } from '../components/ui/Logo'
export { ProfileAccordion, ProfileAccordionSection } from '../components/ui/ProfileAccordion'
export { CampusMap, MapLegend } from '../components/map/CampusMap'
export { ReportCard } from '../components/reports/ReportCard'
export { PhotoPicker, PhotoEvidence } from '../components/reports/Photo'
export { ReportHeading, DetailSection, ReportFacts, ReportLocation, ReportFlags, InternalNotes } from '../components/reports/ReportSections'
export { MilestoneTracker, ReportTimeline } from '../components/reports/ReportTimeline'
export { ChartPanel, BarList, StatusBar, ColumnChart } from '../components/charts/Charts'
export { LogoutButton } from '../components/layout/LogoutButton'
export { ProfileMenuItems } from '../components/layout/ProfileMenu'
