import React from 'react';

// --- Lucide Icons (Sorted Alphabetically) ---
import {
  Activity, AlertTriangle, Archive, ArrowDown, ArrowRight, ArrowUp, Award,
  Banknote, BarChart, Barcode, Battery, BatteryCharging, Bell, Book, Bookmark, Box, Briefcase,
  Calendar, CalendarDays, Camera, Check, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, Clipboard, Clock, Cloud, Code, Code2, Coins, Compass, Copy, Copyright, Cpu, CreditCard,
  Database, DollarSign, Download,
  Edit, ExternalLink, Eye, EyeOff,
  Facebook, FileEdit, FilePen, FileText, Filter, Flag, Folder,
  Gift, Github, Globe, GripVertical,
  HardDrive, Heart, HelpCircle, Home,
  Image, Info, Instagram,
  Keyboard,
  Laptop, LayoutDashboard, Lightbulb, Link, Link2, Linkedin, Loader2, Lock, LogOut,
  Mail, Map, MapPin, Maximize2, Menu, MessageSquare, Mic, MicOff, Minimize2, Monitor, Moon, MoreHorizontal, MoreVertical, Mouse, Move,
  Navigation as NavigationIcon, Network,
  Package, Paperclip, Pause, Pencil, Phone, PieChart, Play, Plus, PlusCircle, PlusSquare, Printer,
  Receipt, RefreshCw, Repeat, RotateCcw,
  Save, Search, Send, Server, Settings, Settings2, Share2, Shield, ShoppingBag, ShoppingCart, Shuffle, SkipBack, SkipForward, SlidersHorizontal, Smartphone, Sparkles, Star, Store, Sun,
  Tag, Target, Terminal, Timer, Trash, Trash2, TrendingUp, Trophy, Truck, Twitter,
  Unlock, Upload, UploadCloud, User, Users, UsersRound,
  Video, VideoOff, Volume2, VolumeX,
  Wallet, Wrench, Wifi, WifiOff,
  X, XCircle,
  ZoomIn, ZoomOut
  // Note: Renamed 'Navigation' to 'NavigationIcon' to avoid conflict with the component name
  // Note: Renamed Lucide 'X' to 'CloseX' in the map below to avoid naming conflicts
} from 'lucide-react';

// --- React Icons (Font Awesome) ---
import {
  FaBolt, FaBlog, FaCode, FaConciergeBell, FaEnvelope, FaGlobe, FaHome, FaProjectDiagram, FaReact, FaStar,
  FaUser as FaUserIcon // Renamed 'FaUser' to 'FaUserIcon' to avoid conflict with Lucide's 'User'
} from 'react-icons/fa';

// --- React Icons (Simple Icons) ---
import {
  SiDiscord, SiLinktree, SiPatreon, SiPinterest, SiReddit, SiSnapchat, SiSoundcloud, SiSpotify,
  SiTelegram, SiTiktok, SiTwitch, SiVite, SiWhatsapp, SiX, // Added SiX for the X/Twitter icon
  SiYoutube
} from 'react-icons/si';

// --- React Icons (Ionicons 5) ---
import { IoLogoIonic } from 'react-icons/io5';

// --- React Icons (Material Design) ---
import { MdOutlineDesignServices } from 'react-icons/md';


// --- Combine all icons into a single map ---
// Use unique string keys for lookup
const IconMap: Record<string, React.ComponentType<any>> = {
  // === Navigation & Layout ===
  Home, // Lucide
  FaHome, // Font Awesome
  Menu, // Lucide
  Navigation: NavigationIcon, // Lucide (Renamed)
  Map, // Lucide
  MapPin, // Lucide
  Compass, // Lucide
  Globe, // Lucide
  FaGlobe, // Font Awesome
  ArrowRight, // Lucide
  ArrowLeft: ChevronLeft, // Lucide (Alias for ChevronLeft)
  ArrowUp, // Lucide
  ArrowDown, // Lucide
  ChevronLeft, // Lucide
  ChevronRight, // Lucide
  ChevronUp, // Lucide
  ChevronDown, // Lucide
  ChevronsLeft, // Lucide
  ChevronsRight, // Lucide
  Maximize2, // Lucide
  Minimize2, // Lucide
  Move, // Lucide
  GripVertical, // Lucide
  LayoutDashboard, // Lucide

  // === Actions ===
  Plus, // Lucide
  PlusCircle, // Lucide
  PlusSquare, // Lucide
  Edit, // Lucide
  FileEdit, // Lucide
  FilePen, // Lucide
  Pencil, // Lucide
  Trash, // Lucide
  Trash2, // Lucide
  Copy, // Lucide
  Save, // Lucide
  Download, // Lucide
  Upload, // Lucide
  UploadCloud, // Lucide
  Search, // Lucide
  Filter, // Lucide
  RefreshCw, // Lucide
  RotateCcw, // Lucide
  Send, // Lucide
  Share2, // Lucide
  ExternalLink, // Lucide
  Link, // Lucide
  Link2, // Lucide
  Paperclip, // Lucide
  Check, // Lucide
  CheckCircle, // Lucide
  CloseX: X, // Lucide (Renamed)
  XCircle, // Lucide
  LogOut, // Lucide
  Bookmark, // Lucide
  Flag, // Lucide
  Tag, // Lucide

  // === Status & Information ===
  Info, // Lucide
  HelpCircle, // Lucide
  AlertTriangle, // Lucide
  Loader2, // Lucide (Spinner)
  Activity, // Lucide
  Eye, // Lucide
  EyeOff, // Lucide
  Bell, // Lucide
  Star, // Lucide
  FaStar, // Font Awesome
  Heart, // Lucide
  Lightbulb, // Lucide
  Sparkles, // Lucide
  Award, // Lucide
  Trophy, // Lucide
  Gift, // Lucide
  Target, // Lucide

  // === Files & Data ===
  FileText, // Lucide
  Folder, // Lucide
  Archive, // Lucide
  Clipboard, // Lucide
  Database, // Lucide
  Server, // Lucide
  HardDrive, // Lucide
  Code, // Lucide
  Code2, // Lucide
  FaCode, // Font Awesome
  Terminal, // Lucide
  Book, // Lucide
  FaBlog, // Font Awesome

  // === Users & Social ===
  User, // Lucide
  FaUser: FaUserIcon, // Font Awesome (Renamed)
  Users, // Lucide
  UsersRound, // Lucide
  MessageSquare, // Lucide
  Mail, // Lucide
  FaEnvelope, // Font Awesome
  Phone, // Lucide
  // Social Media (Lucide)
  Github, // Lucide
  Facebook, // Lucide
  Instagram, // Lucide
  Linkedin, // Lucide
  Twitter, // Lucide
  // Social Media (Simple Icons)
  Discord: SiDiscord,
  Linktree: SiLinktree,
  Patreon: SiPatreon,
  Pinterest: SiPinterest,
  Reddit: SiReddit,
  Snapchat: SiSnapchat,
  Soundcloud: SiSoundcloud,
  Spotify: SiSpotify,
  Telegram: SiTelegram,
  TikTok: SiTiktok,
  Twitch: SiTwitch,
  WhatsApp: SiWhatsapp,
  X: SiX, // Simple Icons (X/Twitter)
  YouTube: SiYoutube,
  // Aliases
  GitHub: Github, // Lucide Alias

  // === E-commerce & Finance ===
  ShoppingCart, // Lucide
  ShoppingBag, // Lucide
  Store, // Lucide
  Package, // Lucide
  Box, // Lucide
  Truck, // Lucide
  CreditCard, // Lucide
  DollarSign, // Lucide
  Banknote, // Lucide
  Coins, // Lucide
  Wallet, // Lucide
  Receipt, // Lucide
  Barcode, // Lucide
  TrendingUp, // Lucide
  BarChart, // Lucide
  PieChart, // Lucide

  // === Media & Devices ===
  Image, // Lucide
  Camera, // Lucide
  Video, // Lucide
  VideoOff, // Lucide
  Mic, // Lucide
  MicOff, // Lucide
  Volume2, // Lucide
  VolumeX, // Lucide
  Play, // Lucide
  Pause, // Lucide
  SkipForward, // Lucide
  SkipBack, // Lucide
  Shuffle, // Lucide
  Repeat, // Lucide
  Monitor, // Lucide
  Laptop, // Lucide
  Smartphone, // Lucide
  Keyboard, // Lucide
  Mouse, // Lucide
  Printer, // Lucide
  Cpu, // Lucide
  Cloud, // Lucide
  Wifi, // Lucide
  WifiOff, // Lucide
  Battery, // Lucide
  BatteryCharging, // Lucide

  // === Settings & Security ===
  Settings, // Lucide
  Settings2, // Lucide
  SlidersHorizontal, // Lucide
  Wrench, // Lucide
  Shield, // Lucide
  Lock, // Lucide
  Unlock, // Lucide

  // === Time & Date ===
  Calendar, // Lucide
  CalendarDays, // Lucide
  Clock, // Lucide
  Timer, // Lucide

  // === Miscellaneous/Domain Specific ===
  Briefcase, // Lucide
  Network, // Lucide
  Copyright, // Lucide
  Sun, // Lucide
  Moon, // Lucide
  FaBolt, // Font Awesome
  FaProjectDiagram, // Font Awesome
  FaConciergeBell, // Font Awesome
  FaReact, // Font Awesome
  SiVite, // Simple Icons
  IoLogoIonic, // Ionicons 5
  MdOutlineDesignServices, // Material Design
};

// --- Icon Renderer Component ---
interface IconRendererProps {
  iconName: string; // The key used in IconMap (e.g., "Mail", "FaHome", "GitHub")
  className?: string;
  size?: number; // Optional size prop
  'aria-label'?: string;
  // Allow any other props to be passed down
  [key: string]: any;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, ...props }) => {
  const IconComponent = IconMap[iconName];

  if (!IconComponent) {
    // Keep the warning specific
    console.warn(`Icon "${iconName}" not found in IconRenderer's IconMap.`);
    // Return a fallback (e.g., a question mark or null)
    return <span title={`Icon not found: ${iconName}`}>❓</span>;
  }

  // Render the found icon component with passed props
  return <IconComponent {...props} />;
};

export default IconRenderer;
