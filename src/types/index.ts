export interface ZendeskTicket {
  id: string;
  subject: string;
  description: string;
  status: "new" | "open" | "pending" | "hold" | "solved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
  ces_score?: number; // 0-7 scale
  tags: string[];
  channel: "web" | "email" | "chat" | "phone" | "api";
}

export interface CESPrediction {
  ticket_id: string;
  predicted_score: number;
  confidence: number;
  factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
}

export interface CESAnalytics {
  total_tickets: number;
  tickets_with_ces: number;
  average_ces: number;
  ces_distribution: {
    score: number;
    count: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    average_ces: number;
    ticket_count: number;
  }[];
  by_channel: {
    channel: string;
    average_ces: number;
    count: number;
  }[];
  by_priority: {
    priority: string;
    average_ces: number;
    count: number;
  }[];
}

export interface ImprovementRecommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: "process" | "training" | "technology" | "communication";
  estimated_ces_improvement: number;
  affected_tickets: number;
}

export interface DashboardStats {
  total_tickets: number;
  pending_predictions: number;
  average_ces: number;
  ces_trend: "up" | "down" | "stable";
  high_risk_tickets: number;
  improvement_opportunities: number;
}
