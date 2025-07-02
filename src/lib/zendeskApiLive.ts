import { ZendeskTicket, CESAnalytics, DashboardStats } from "@/types";

// Configuration for live Zendesk integration via Vercel proxy
const VERCEL_API_BASE =
  import.meta.env.VITE_VERCEL_API_BASE || window.location.origin;
const CES_FIELD_ID = 31797439524887;

// Helper function to make API calls through Vercel proxy
async function proxyFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${VERCEL_API_BASE}/api/zendesk/${endpoint.replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      `API Error: ${response.status} - ${errorData.error || response.statusText}`,
    );
  }

  return response.json();
}

// Raw Zendesk ticket interface
interface ZendeskApiTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  requester_id: number;
  assignee_id?: number;
  tags: string[];
  via?: {
    channel: string;
  };
  custom_fields: Array<{
    id: number;
    value: any;
  }>;
}

interface ZendeskApiUser {
  id: number;
  name: string;
  email: string;
}

// Transform Zendesk API ticket to our format
const transformZendeskTicket = (
  apiTicket: ZendeskApiTicket,
  users: Map<number, ZendeskApiUser>,
): ZendeskTicket => {
  const requester = users.get(apiTicket.requester_id);
  const assignee = apiTicket.assignee_id
    ? users.get(apiTicket.assignee_id)
    : undefined;

  // Extract CES score from custom fields
  let cesScore: number | undefined;
  const cesField = apiTicket.custom_fields.find(
    (field) => field.id === CES_FIELD_ID,
  );
  if (cesField && cesField.value !== null && cesField.value !== "") {
    const score = Number(cesField.value);
    if (!isNaN(score) && score >= 0 && score <= 7) {
      cesScore = score;
    }
  }

  return {
    id: apiTicket.id.toString(),
    subject: apiTicket.subject,
    description: apiTicket.description,
    status: apiTicket.status as any,
    priority: apiTicket.priority as any,
    created_at: apiTicket.created_at,
    updated_at: apiTicket.updated_at,
    requester: {
      id: apiTicket.requester_id.toString(),
      name: requester?.name || "Unknown User",
      email: requester?.email || "unknown@example.com",
    },
    assignee: assignee
      ? {
          id: assignee.id.toString(),
          name: assignee.name,
        }
      : undefined,
    ces_score: cesScore,
    tags: apiTicket.tags,
    channel: (apiTicket.via?.channel as any) || "web",
  };
};

export class ZendeskApiLiveService {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await proxyFetch("tickets.json?per_page=1");

      if (data.tickets) {
        return {
          success: true,
          message: "Successfully connected to Zendesk via Vercel proxy!",
        };
      }

      return {
        success: false,
        message: "Connected but received unexpected response format",
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async fetchTickets(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      created_after?: string;
    } = {},
  ): Promise<{ tickets: ZendeskTicket[]; hasMore: boolean }> {
    try {
      const searchParams = new URLSearchParams({
        per_page: (params.per_page || 100).toString(),
        page: (params.page || 1).toString(),
        include: "users",
        sort_by: "created_at",
        sort_order: "desc",
      });

      // Add optional filters
      if (params.status) {
        searchParams.append("status", params.status);
      }
      if (params.created_after) {
        searchParams.append("created_after", params.created_after);
      }

      const data = await proxyFetch(`tickets.json?${searchParams}`);

      // Create user map for efficient lookup
      const userMap = new Map<number, ZendeskApiUser>();
      if (data.users) {
        data.users.forEach((user: ZendeskApiUser) => {
          userMap.set(user.id, user);
        });
      }

      const tickets = data.tickets.map((ticket: ZendeskApiTicket) =>
        transformZendeskTicket(ticket, userMap),
      );

      return {
        tickets,
        hasMore: data.next_page !== null,
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  async updateTicketCES(ticketId: string, cesScore: number): Promise<boolean> {
    try {
      await proxyFetch(`tickets/${ticketId}.json`, {
        method: "PUT",
        body: JSON.stringify({
          ticket: {
            custom_fields: [
              {
                id: CES_FIELD_ID,
                value: cesScore,
              },
            ],
          },
        }),
      });
      return true;
    } catch (error) {
      console.error("Error updating ticket CES:", error);
      return false;
    }
  }

  async getAnalytics(dateRange?: {
    start: string;
    end: string;
  }): Promise<CESAnalytics> {
    try {
      // Fetch tickets with CES scores
      const tickets = await this.getAllTicketsWithCES(dateRange);
      return this.calculateAnalytics(tickets);
    } catch (error) {
      console.error("Error calculating analytics:", error);
      throw error;
    }
  }

  private async getAllTicketsWithCES(dateRange?: {
    start: string;
    end: string;
  }): Promise<ZendeskTicket[]> {
    const allTickets: ZendeskTicket[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      // Limit to 10 pages to avoid rate limits
      const params: any = { page, per_page: 100 };
      if (dateRange?.start) {
        params.created_after = dateRange.start;
      }

      const result = await this.fetchTickets(params);
      allTickets.push(...result.tickets);

      hasMore = result.hasMore;
      page++;
    }

    return allTickets.filter((ticket) => ticket.ces_score !== undefined);
  }

  private calculateAnalytics(tickets: ZendeskTicket[]): CESAnalytics {
    const ticketsWithCES = tickets.filter((t) => t.ces_score !== undefined);
    const totalTickets = tickets.length;
    const cesScores = ticketsWithCES.map((t) => t.ces_score!);

    const averageCES =
      cesScores.length > 0
        ? cesScores.reduce((sum, score) => sum + score, 0) / cesScores.length
        : 0;

    // Calculate distribution
    const distribution = Array.from({ length: 8 }, (_, i) => ({
      score: i,
      count: cesScores.filter((score) => score === i).length,
      percentage: 0,
    }));

    distribution.forEach((item) => {
      item.percentage =
        cesScores.length > 0 ? (item.count / cesScores.length) * 100 : 0;
    });

    // Calculate trends (last 30 days)
    const trends = this.calculateTrends(ticketsWithCES);

    // Calculate by channel
    const byChannel = this.calculateByChannel(ticketsWithCES);

    // Calculate by priority
    const byPriority = this.calculateByPriority(ticketsWithCES);

    return {
      total_tickets: totalTickets,
      tickets_with_ces: ticketsWithCES.length,
      average_ces: Number(averageCES.toFixed(1)),
      ces_distribution: distribution,
      trends,
      by_channel: byChannel,
      by_priority: byPriority,
    };
  }

  private calculateTrends(tickets: ZendeskTicket[]) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });

    return last30Days.map((date) => {
      const dayTickets = tickets.filter(
        (t) => t.created_at.startsWith(date) && t.ces_score !== undefined,
      );

      const averageCES =
        dayTickets.length > 0
          ? dayTickets.reduce((sum, t) => sum + t.ces_score!, 0) /
            dayTickets.length
          : 0;

      return {
        date,
        average_ces: Number(averageCES.toFixed(1)),
        ticket_count: dayTickets.length,
      };
    });
  }

  private calculateByChannel(tickets: ZendeskTicket[]) {
    const channels = ["email", "web", "chat", "phone", "api"];

    return channels
      .map((channel) => {
        const channelTickets = tickets.filter((t) => t.channel === channel);
        const averageCES =
          channelTickets.length > 0
            ? channelTickets.reduce((sum, t) => sum + t.ces_score!, 0) /
              channelTickets.length
            : 0;

        return {
          channel,
          average_ces: Number(averageCES.toFixed(1)),
          count: channelTickets.length,
        };
      })
      .filter((item) => item.count > 0);
  }

  private calculateByPriority(tickets: ZendeskTicket[]) {
    const priorities = ["low", "normal", "high"];

    return priorities
      .map((priority) => {
        const priorityTickets = tickets.filter((t) => t.priority === priority);
        const averageCES =
          priorityTickets.length > 0
            ? priorityTickets.reduce((sum, t) => sum + t.ces_score!, 0) /
              priorityTickets.length
            : 0;

        return {
          priority,
          average_ces: Number(averageCES.toFixed(1)),
          count: priorityTickets.length,
        };
      })
      .filter((item) => item.count > 0);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const analytics = await this.getAnalytics();
      const recentTickets = await this.fetchTickets({ per_page: 100 });

      const ticketsWithoutCES = recentTickets.tickets.filter(
        (t) => t.ces_score === undefined,
      );
      const highRiskTickets = recentTickets.tickets.filter(
        (t) => t.ces_score !== undefined && t.ces_score <= 3,
      );

      // Calculate trend direction
      const trends = analytics.trends.slice(-7); // Last 7 days
      const earliestAvg = trends[0]?.average_ces || 0;
      const latestAvg = trends[trends.length - 1]?.average_ces || 0;
      const cessTrend =
        latestAvg > earliestAvg
          ? "up"
          : latestAvg < earliestAvg
            ? "down"
            : "stable";

      return {
        total_tickets: analytics.total_tickets,
        pending_predictions: ticketsWithoutCES.length,
        average_ces: analytics.average_ces,
        ces_trend: cessTrend as any,
        high_risk_tickets: highRiskTickets.length,
        improvement_opportunities: 4,
      };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const zendeskApiLive = new ZendeskApiLiveService();
