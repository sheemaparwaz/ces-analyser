import {
  ZendeskTicket,
  CESPrediction,
  CESAnalytics,
  ImprovementRecommendation,
  DashboardStats,
} from "@/types";

export const mockTickets: ZendeskTicket[] = [
  {
    id: "1001",
    subject: "Unable to login to account",
    description: "Customer cannot access their account after password reset",
    status: "solved",
    priority: "high",
    created_at: "2024-01-15T09:30:00Z",
    updated_at: "2024-01-15T14:20:00Z",
    requester: {
      id: "user_101",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
    },
    assignee: {
      id: "agent_01",
      name: "Mike Chen",
    },
    ces_score: 6,
    tags: ["login", "password", "account"],
    channel: "email",
  },
  {
    id: "1002",
    subject: "Product return request",
    description: "Customer wants to return a defective product",
    status: "closed",
    priority: "normal",
    created_at: "2024-01-14T11:15:00Z",
    updated_at: "2024-01-16T10:30:00Z",
    requester: {
      id: "user_102",
      name: "David Wilson",
      email: "david.wilson@example.com",
    },
    assignee: {
      id: "agent_02",
      name: "Lisa Martinez",
    },
    ces_score: 2,
    tags: ["return", "defective", "product"],
    channel: "web",
  },
  {
    id: "1003",
    subject: "Billing inquiry about charges",
    description: "Customer questions unexpected charges on their account",
    status: "open",
    priority: "normal",
    created_at: "2024-01-16T16:45:00Z",
    updated_at: "2024-01-16T17:00:00Z",
    requester: {
      id: "user_103",
      name: "Emily Brown",
      email: "emily.brown@example.com",
    },
    assignee: {
      id: "agent_01",
      name: "Mike Chen",
    },
    ces_score: 4,
    tags: ["billing", "charges", "inquiry"],
    channel: "chat",
  },
  {
    id: "1004",
    subject: "Feature request for mobile app",
    description: "Customer suggests adding dark mode to mobile app",
    status: "new",
    priority: "low",
    created_at: "2024-01-17T08:20:00Z",
    updated_at: "2024-01-17T08:20:00Z",
    requester: {
      id: "user_104",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
    },
    tags: ["feature", "mobile", "enhancement"],
    channel: "web",
  },
  {
    id: "1005",
    subject: "Service outage report",
    description: "Customer experiencing service interruptions",
    status: "pending",
    priority: "urgent",
    created_at: "2024-01-17T12:10:00Z",
    updated_at: "2024-01-17T13:45:00Z",
    requester: {
      id: "user_105",
      name: "Jennifer Kim",
      email: "jennifer.kim@example.com",
    },
    assignee: {
      id: "agent_03",
      name: "Robert Taylor",
    },
    ces_score: 7,
    tags: ["outage", "service", "urgent"],
    channel: "phone",
  },
  {
    id: "1006",
    subject: "Account upgrade assistance",
    description: "Customer needs help upgrading to premium plan",
    status: "solved",
    priority: "normal",
    created_at: "2024-01-13T14:30:00Z",
    updated_at: "2024-01-14T09:15:00Z",
    requester: {
      id: "user_106",
      name: "Mark Thompson",
      email: "mark.thompson@example.com",
    },
    assignee: {
      id: "agent_02",
      name: "Lisa Martinez",
    },
    ces_score: 1,
    tags: ["upgrade", "premium", "assistance"],
    channel: "email",
  },
];

export const mockPredictions: CESPrediction[] = [
  {
    ticket_id: "1004",
    predicted_score: 3,
    confidence: 0.85,
    factors: [
      {
        factor: "Request Type",
        impact: 0.3,
        description: "Feature requests typically have moderate CES scores",
      },
      {
        factor: "Priority Level",
        impact: -0.2,
        description: "Low priority tickets tend to have lower effort scores",
      },
      {
        factor: "Channel",
        impact: 0.1,
        description: "Web submissions show average effort patterns",
      },
    ],
  },
  {
    ticket_id: "1005",
    predicted_score: 6,
    confidence: 0.92,
    factors: [
      {
        factor: "Priority Level",
        impact: 0.4,
        description: "Urgent tickets typically require high customer effort",
      },
      {
        factor: "Service Outage",
        impact: 0.3,
        description: "Outage-related issues historically score high on effort",
      },
      {
        factor: "Response Time",
        impact: 0.2,
        description: "Quick response can reduce perceived effort",
      },
    ],
  },
];

export const mockAnalytics: CESAnalytics = {
  total_tickets: 1250,
  tickets_with_ces: 892,
  average_ces: 4.6,
  ces_distribution: [
    { score: 0, count: 24, percentage: 2.7 },
    { score: 1, count: 45, percentage: 5.0 },
    { score: 2, count: 67, percentage: 7.5 },
    { score: 3, count: 98, percentage: 11.0 },
    { score: 4, count: 156, percentage: 17.5 },
    { score: 5, count: 178, percentage: 19.9 },
    { score: 6, count: 201, percentage: 22.5 },
    { score: 7, count: 123, percentage: 13.8 },
  ],
  trends: [
    { date: "2024-01-01", average_ces: 3.8, ticket_count: 42 },
    { date: "2024-01-02", average_ces: 4.1, ticket_count: 38 },
    { date: "2024-01-03", average_ces: 4.3, ticket_count: 45 },
    { date: "2024-01-04", average_ces: 4.2, ticket_count: 41 },
    { date: "2024-01-05", average_ces: 4.5, ticket_count: 47 },
    { date: "2024-01-06", average_ces: 4.7, ticket_count: 52 },
    { date: "2024-01-07", average_ces: 4.6, ticket_count: 48 },
    { date: "2024-01-08", average_ces: 4.4, ticket_count: 44 },
    { date: "2024-01-09", average_ces: 4.8, ticket_count: 46 },
    { date: "2024-01-10", average_ces: 5.0, ticket_count: 51 },
    { date: "2024-01-11", average_ces: 4.9, ticket_count: 49 },
    { date: "2024-01-12", average_ces: 4.7, ticket_count: 43 },
    { date: "2024-01-13", average_ces: 4.8, ticket_count: 47 },
    { date: "2024-01-14", average_ces: 5.1, ticket_count: 50 },
    { date: "2024-01-15", average_ces: 4.9, ticket_count: 45 },
    { date: "2024-01-16", average_ces: 5.0, ticket_count: 48 },
    { date: "2024-01-17", average_ces: 4.6, ticket_count: 44 },
  ],
  by_channel: [
    { channel: "email", average_ces: 4.8, count: 356 },
    { channel: "web", average_ces: 5.1, count: 298 },
    { channel: "chat", average_ces: 5.4, count: 145 },
    { channel: "phone", average_ces: 3.2, count: 78 },
    { channel: "api", average_ces: 5.0, count: 15 },
  ],
  by_priority: [
    { priority: "low", average_ces: 5.8, count: 234 },
    { priority: "normal", average_ces: 4.9, count: 445 },
    { priority: "high", average_ces: 4.1, count: 167 },
  ],
};

export const mockRecommendations: ImprovementRecommendation[] = [
  {
    id: "rec_001",
    title: "Implement Self-Service Password Reset",
    description:
      "Add automated password reset functionality to reduce customer effort for login issues",
    impact: "high",
    effort: "medium",
    category: "technology",
    estimated_ces_improvement: -1.2,
    affected_tickets: 156,
  },
  {
    id: "rec_002",
    title: "Enhance Phone Support Training",
    description:
      "Provide additional training for phone support agents to reduce resolution time",
    impact: "medium",
    effort: "low",
    category: "training",
    estimated_ces_improvement: -0.8,
    affected_tickets: 78,
  },
  {
    id: "rec_003",
    title: "Proactive Outage Communication",
    description:
      "Implement automated status page updates during service outages",
    impact: "high",
    effort: "high",
    category: "communication",
    estimated_ces_improvement: -1.5,
    affected_tickets: 34,
  },
  {
    id: "rec_004",
    title: "Streamline Return Process",
    description:
      "Simplify the product return workflow to reduce customer steps",
    impact: "medium",
    effort: "medium",
    category: "process",
    estimated_ces_improvement: -0.9,
    affected_tickets: 89,
  },
];

export const mockDashboardStats: DashboardStats = {
  total_tickets: 1250,
  pending_predictions: 358,
  average_ces: 4.6,
  ces_trend: "up",
  high_risk_tickets: 91,
  improvement_opportunities: 4,
};
