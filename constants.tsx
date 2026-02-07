
import { AppRole, IssueCategory, IssueStatus, Issue, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr_sol_001',
    name: 'Rahul Sharma',
    email: 'rahul@solapur.in',
    password: 'password123',
    role: AppRole.CITIZEN,
    reputation: 450,
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    followers: 128,
    following: 45
  },
  {
    id: 'usr_sol_002',
    name: 'Priya Mehta',
    email: 'priya@solapur.in',
    password: 'securepass789',
    role: AppRole.CITIZEN,
    reputation: 1200,
    avatar: 'https://i.pravatar.cc/150?u=priya',
    followers: 892,
    following: 120
  },
  {
    id: 'adm_sol_001',
    name: 'Inspector Kulkarni',
    email: 'admin@solapur.gov',
    password: 'admin_password',
    role: AppRole.AUTHORITY,
    reputation: 9999,
    avatar: 'https://i.pravatar.cc/150?u=inspector',
    followers: 5420,
    following: 12
  }
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'iss_1',
    reporterId: 'usr_sol_001',
    category: IssueCategory.ROAD,
    department: 'ROAD_MAINTENANCE',
    title: 'Severe Pothole near Siddheshwar Temple',
    description: 'Deep pothole causing traffic slowdowns and vehicle damage near the temple entrance.',
    status: IssueStatus.OPEN,
    location: { lat: 17.6715, lng: 75.9100, address: 'Temple Rd, Solapur' },
    // Image: Broken asphalt / Pothole (Reliable)
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    upvotes: 42,
    comments: 12,
    timestamp: new Date(Date.now() - 3600000 * 2),
    severity: 8,
    priority: 85,
    trafficImpact: 'HIGH'
  },
  {
    id: 'iss_6',
    reporterId: 'usr_sol_002',
    category: IssueCategory.ROAD,
    department: 'TOWN_PLANNING',
    title: 'New Jogging Track at Siddheshwar Lake',
    description: 'The beautification project is finally complete. A great spot for morning walks! #SolapurSmartCity',
    status: IssueStatus.RESOLVED,
    location: { lat: 17.6650, lng: 75.9040, address: 'Siddheshwar Lake Area' },
    // Image: Park / Lake path
    imageUrl: 'https://images.unsplash.com/photo-1496347315686-5f274d018500?auto=format&fit=crop&w=800&q=80',
    upvotes: 156,
    comments: 24,
    timestamp: new Date(Date.now() - 3600000 * 3),
    severity: 1,
    priority: 10,
    trafficImpact: 'LOW'
  },
  {
    id: 'iss_2',
    reporterId: 'usr_sol_002',
    category: IssueCategory.GARBAGE,
    department: 'WASTE_MGMT',
    title: 'Overflowing Bins in Navi Peth',
    description: 'Commercial waste accumulation on the main market road. Needs immediate clearance.',
    status: IssueStatus.ASSIGNED,
    location: { lat: 17.6780, lng: 75.9080, address: 'Navi Peth Market' },
    // Image: Garbage / Waste (KEPT AS REQUESTED)
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=800&auto=format&fit=crop',
    upvotes: 18,
    comments: 5,
    timestamp: new Date(Date.now() - 3600000 * 5),
    severity: 4,
    priority: 40,
    trafficImpact: 'LOW'
  },
  {
    id: 'iss_7',
    reporterId: 'usr_sol_001',
    category: IssueCategory.WATER,
    department: 'WATER_DEPT',
    title: 'Pipeline Burst near Kumbar Ves',
    description: 'Major drinking water leak flooding the street. Thousands of liters being wasted.',
    status: IssueStatus.OPEN,
    location: { lat: 17.6620, lng: 75.9120, address: 'Kumbar Ves, Solapur' },
    // Image: Water puddle / leak
    imageUrl: 'https://images.unsplash.com/photo-1584463635766-3195204487b3?auto=format&fit=crop&w=800&q=80',
    upvotes: 89,
    comments: 32,
    timestamp: new Date(Date.now() - 3600000 * 8),
    severity: 9,
    priority: 95,
    trafficImpact: 'MEDIUM'
  },
  {
    id: 'iss_3',
    reporterId: 'usr_sol_001',
    category: IssueCategory.LIGHTS,
    department: 'ELECTRICAL',
    title: 'Streetlight Outage near Solapur Junction',
    description: 'Dark patches on the station approach road. Safety concern for commuters.',
    status: IssueStatus.RESOLVED,
    location: { lat: 17.6880, lng: 75.9150, address: 'Station Rd, Solapur' },
    // Image: Street light night
    imageUrl: 'https://images.unsplash.com/photo-1618423719018-77292215c2d3?auto=format&fit=crop&w=800&q=80',
    resolvedImageUrl: 'https://images.unsplash.com/photo-1563280036-e8a21eb19965?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    upvotes: 35,
    comments: 8,
    timestamp: new Date(Date.now() - 86400000),
    severity: 6,
    priority: 70,
    trafficImpact: 'MEDIUM'
  },
  {
    id: 'iss_8',
    reporterId: 'usr_sol_002',
    category: IssueCategory.ROAD,
    department: 'TRAFFIC_POLICE',
    title: 'Traffic Chaos at Saat Rasta Chowk',
    description: 'Traffic signals malfunctioning during peak hours causing heavy congestion.',
    status: IssueStatus.IN_PROGRESS,
    location: { lat: 17.6580, lng: 75.9020, address: 'Saat Rasta Chowk' },
    // Image: Indian Traffic / Rickshaw
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    upvotes: 67,
    comments: 15,
    timestamp: new Date(Date.now() - 86400000 * 1.2),
    severity: 7,
    priority: 75,
    trafficImpact: 'HIGH'
  },
  {
    id: 'iss_4',
    reporterId: 'usr_sol_001',
    category: IssueCategory.ROAD,
    department: 'ROAD_MAINTENANCE',
    title: 'Cracked Pavement in Jule Solapur',
    description: 'Surface erosion due to recent heavy rains near the residential complex.',
    status: IssueStatus.IN_PROGRESS,
    location: { lat: 17.6480, lng: 75.9220, address: 'Jule Solapur Sector 2' },
    // Image: Cracked Road
    imageUrl: 'https://images.unsplash.com/photo-1519253429384-f25b1275988e?auto=format&fit=crop&w=800&q=80',
    upvotes: 24,
    comments: 6,
    timestamp: new Date(Date.now() - 43200000),
    severity: 5,
    priority: 60,
    trafficImpact: 'MEDIUM'
  },
  {
    id: 'iss_9',
    reporterId: 'usr_sol_001',
    category: IssueCategory.LIGHTS,
    department: 'ELECTRICAL',
    title: 'Solar Lights Installed at Bhuikot Fort',
    description: 'The historical fort looks majestic at night with the new eco-friendly lighting.',
    status: IssueStatus.RESOLVED,
    location: { lat: 17.6740, lng: 75.9070, address: 'Bhuikot Fort' },
    // Image: Fort / Architecture
    imageUrl: 'https://images.unsplash.com/photo-1594132849880-6c9124b8956e?auto=format&fit=crop&w=800&q=80',
    upvotes: 210,
    comments: 45,
    timestamp: new Date(Date.now() - 86400000 * 2),
    severity: 1,
    priority: 5,
    trafficImpact: 'LOW'
  },
  {
    id: 'iss_10',
    reporterId: 'usr_sol_002',
    category: IssueCategory.ROAD,
    department: 'ANIMAL_CTRL',
    title: 'Stray Cattle Hazard on Hotgi Road',
    description: 'Herd of cattle sitting in the middle of the fast lane creating accident risks.',
    status: IssueStatus.OPEN,
    location: { lat: 17.6350, lng: 75.9300, address: 'Hotgi Road' },
    // Image: Cow on road
    imageUrl: 'https://images.unsplash.com/photo-1558238260-6c58474f63c8?auto=format&fit=crop&w=800&q=80',
    upvotes: 55,
    comments: 18,
    timestamp: new Date(Date.now() - 3600000 * 5),
    severity: 6,
    priority: 65,
    trafficImpact: 'HIGH'
  }
];
