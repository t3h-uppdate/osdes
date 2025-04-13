import React from 'react';

// --- Lucide Icons ---
import {
  Mail, ArrowRight, Phone, MapPin, Github, Facebook, Instagram, Linkedin, Twitter,
  PlusCircle, Trash2, Edit, ArrowUp, ArrowDown, HelpCircle, Save, XCircle, PlusSquare,
  ChevronDown, ChevronUp, Loader2, Eye, EyeOff, Info, Image, User, Copyright,
  MessageSquare, Pencil, Plus, GripVertical, Server, Database, Code, Cloud, Terminal,
  Settings, Wrench, Shield, Network, Cpu, HardDrive, Smartphone, Monitor, Laptop,
  Keyboard, Mouse, Printer, Camera, Video, Mic, Users, Briefcase, Book, FileText,
  Folder, Link, Globe, Navigation as NavigationIcon, Package, Truck, ShoppingCart, CreditCard, DollarSign,
  TrendingUp, BarChart, PieChart, Activity, Menu, LogOut, Maximize2, Minimize2, Copy,
  Star, AlertTriangle, Tag, ExternalLink, Code2, X, Sun, Moon, Home, Upload, CheckCircle, Navigation,
  // Icons added from AdminDashboard
  LayoutDashboard, FileEdit, Link2
  // Note: Renamed 'Navigation' to 'NavigationIcon' to avoid conflict with the component name
} from 'lucide-react';

// --- React Icons (Font Awesome) ---
import {
  FaHome, FaProjectDiagram, FaBlog, FaUser as FaUserIcon, FaConciergeBell, FaEnvelope,
  FaBolt, // Added FaBolt
  FaReact, FaCode, FaGlobe, FaStar // Added from GeneralInfoSection
  // Note: Renamed 'FaUser' to 'FaUserIcon' to avoid conflict with Lucide's 'User'
} from 'react-icons/fa';

// --- React Icons (Simple Icons) ---
import {
  SiYoutube, SiTiktok, SiWhatsapp, SiTelegram, SiDiscord, SiTwitch,
  SiPinterest, SiReddit, SiSpotify, SiSoundcloud, SiPatreon, SiSnapchat, SiX, // Added SiX for the X/Twitter icon
  SiLinktree, // Added Linktree itself if needed
  SiVite // Added from GeneralInfoSection
} from 'react-icons/si';

// --- React Icons (Ionicons 5) ---
import { IoLogoIonic } from 'react-icons/io5'; // Added from GeneralInfoSection

// --- React Icons (Material Design) ---
import { MdOutlineDesignServices } from 'react-icons/md'; // Added from GeneralInfoSection


// --- Combine all icons into a single map ---
// Use unique string keys for lookup
const IconMap: Record<string, React.ComponentType<any>> = {
  // Lucide
  Mail, ArrowRight, Phone, MapPin, Github, Facebook, Instagram, Linkedin, Twitter,
  PlusCircle, Trash2, Edit, ArrowUp, ArrowDown, HelpCircle, Save, XCircle, PlusSquare,
  ChevronDown, ChevronUp, Loader2, Eye, EyeOff, Info, Image, User, Copyright,
  MessageSquare, Pencil, Plus, GripVertical, Server, Database, Code, Cloud, Terminal,
  Settings, Wrench, Shield, Network, Cpu, HardDrive, Smartphone, Monitor, Laptop,
  Keyboard, Mouse, Printer, Camera, Video, Mic, Users, Briefcase, Book, FileText,
  Folder, Link, Globe, NavigationIcon, Package, Truck, ShoppingCart, CreditCard, DollarSign,
  TrendingUp, BarChart, PieChart, Activity, Menu, LogOut, Maximize2, Minimize2, Copy,
  Star, AlertTriangle, Tag, ExternalLink, Code2, CloseX: X, Sun, Moon, Home, Navigation, Upload, CheckCircle, // Renamed Lucide X to CloseX
  // Icons added from AdminDashboard
  LayoutDashboard, FileEdit, Link2,
  // Font Awesome (using original names as keys for consistency)
  FaHome, FaProjectDiagram, FaBlog, FaUser: FaUserIcon, FaConciergeBell, FaEnvelope, FaBolt, // Added FaBolt
  FaReact, FaCode, FaGlobe, FaStar, // Added from GeneralInfoSection
  // Lucide Aliases (to handle potential case mismatches or alternative names)
  GitHub: Github, // Alias for Github
  // Simple Icons (using common names as keys)
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  WhatsApp: SiWhatsapp,
  Telegram: SiTelegram,
  Discord: SiDiscord,
  Twitch: SiTwitch,
  Pinterest: SiPinterest,
  Reddit: SiReddit,
  Spotify: SiSpotify,
  Soundcloud: SiSoundcloud,
  Patreon: SiPatreon,
  Snapchat: SiSnapchat,
  X: SiX, // Key for the X/Twitter icon
  Linktree: SiLinktree,
  SiVite, // Added from GeneralInfoSection
  // Ionicons 5
  IoLogoIonic, // Added from GeneralInfoSection
  // Material Design
  MdOutlineDesignServices, // Added from GeneralInfoSection
};

// --- Icon Renderer Component ---
interface IconRendererProps {
  iconName: string; // The key used in IconMap (e.g., "Mail", "FaHome")
  className?: string;
  size?: number; // Optional size prop
  'aria-label'?: string;
  // Allow any other props to be passed down
  [key: string]: any;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, ...props }) => {
  const IconComponent = IconMap[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in IconRenderer.tsx.`);
    // Return a fallback (e.g., a question mark or null)
    return <span title={`Icon not found: ${iconName}`}>❓</span>;
  }

  // Render the found icon component with passed props
  return <IconComponent {...props} />;
};

export default IconRenderer;
