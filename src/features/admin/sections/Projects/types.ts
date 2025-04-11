// Define the structure for a single project, matching the DB table
export interface Project {
  id?: string; // Optional ID, useful when passing around but not required for creation
  title: string;
  description?: string; // Make optional if allowed by DB
  image_url?: string; // Optional URL for the project's main image
  tags?: string[]; // Optional array of text tags
  live_url?: string; // Optional URL to the live project
  repo_url?: string; // Optional URL to the code repository
  sort_order?: number; // Optional: For controlling display order
}

// ProjectsSection interface removed as it represented the old JSONB structure
