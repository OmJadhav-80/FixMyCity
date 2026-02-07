
export enum AppRole {
  CITIZEN = 'CITIZEN',
  AUTHORITY = 'AUTHORITY'
}

export enum IssueStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum IssueCategory {
  ROAD = 'ROAD',
  WATER = 'WATER',
  GARBAGE = 'GARBAGE',
  LIGHTS = 'LIGHTS'
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: AppRole;
  reputation: number;
  avatar: string;
  followers?: number;
  following?: number;
}

export interface Issue {
  id: string;
  reporterId: string;
  reporterName?: string;
  reporterAvatar?: string;
  category: IssueCategory;
  department: string;
  title: string;
  description: string;
  status: IssueStatus;
  location: Location;
  imageUrl: string;
  mediaType?: 'image' | 'video' | 'live';
  resolvedImageUrl?: string;
  upvotes: number;
  comments: number;
  timestamp: Date;
  severity?: number; // 1-10
  priority?: number; // Calculated score
  trafficImpact?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

export interface AnalyticsData {
  label: string;
  value: number;
}
