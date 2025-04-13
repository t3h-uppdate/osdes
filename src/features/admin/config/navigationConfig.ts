// Define the structure for a navigation item used in the Admin Sidebar
export interface AdminNavItem {
  iconName: string;
  label: string;
  tab: string;
}

// Navigation items for the Admin Dashboard Sidebar
export const adminNavItems: AdminNavItem[] = [
  { iconName: 'LayoutDashboard', label: 'Dashboard', tab: 'dashboard' },
  { iconName: 'FileText', label: 'Pages', tab: 'pages' },
  { iconName: 'FileEdit', label: 'Projects', tab: 'projects' },
  { iconName: 'Briefcase', label: 'Services', tab: 'services' },
  { iconName: 'Image', label: 'Media', tab: 'media' },
  { iconName: 'Image', label: 'Hero Images', tab: 'heroImages' },
  { iconName: 'Link2', label: 'Social Links', tab: 'socialLinks' },
  { iconName: 'Link', label: 'Link Management', tab: 'linkManagement' },
  { iconName: 'Settings', label: 'Settings', tab: 'generalInfo' },
];
