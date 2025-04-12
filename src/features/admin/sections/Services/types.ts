// Define the structure for the 'services' list items, matching the DB table
export interface ServiceItem {
    id?: string; // Optional ID, useful when passing around but not required for creation
    title: string;
    description: string;
    icon?: string; // Optional: Identifier for an icon (e.g., class name, image path)
    sort_order?: number; // Optional: For controlling the display order
    is_published?: boolean; // Optional: To control visibility (true = published, false = draft)
}
