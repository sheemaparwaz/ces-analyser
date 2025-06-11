import { ZendeskTicket, CESAnalytics, DashboardStats } from "@/types";

// Zendesk API configuration
const ZENDESK_CONFIG = {
  subdomain: process.env.VITE_ZENDESK_SUBDOMAIN || "", // e.g., 'yourcompany'
  email: process.env.VITE_ZENDESK_EMAIL || "",
  token:
    process.env.VITE_ZENDESK_TOKEN ||
    "rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA",
};

const getZendeskBaseUrl = () => {
  if (!ZENDESK_CONFIG.subdomain) {
    throw new Error("Zendesk subdomain not configured");
  }
  return `https://${ZENDESK_CONFIG.subdomain}.zendesk.com/api/v2`;
};

const getAuthHeaders = () => {
  if (!ZENDESK_CONFIG.email || !ZENDESK_CONFIG.token) {
    throw new Error("Zendesk credentials not configured");
  }

  const credentials = btoa(
    `${ZENDESK_CONFIG.email}/token:${ZENDESK_CONFIG.token}`,
  );
  return {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
};

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
  channel?: string;
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
  cesFieldId?: number,
): ZendeskTicket => {
  const requester = users.get(apiTicket.requester_id);
  const assignee = apiTicket.assignee_id
    ? users.get(apiTicket.assignee_id)
    : undefined;

  // Extract CES score from custom fields
  let cesScore: number | undefined;
  if (cesFieldId) {
    const cesField = apiTicket.custom_fields.find(
      (field) => field.id === cesFieldId,
    );
    if (cesField && cesField.value !== null) {
      cesScore = Number(cesField.value);
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
    channel: (apiTicket.channel as any) || "web",
  };
};

export class ZendeskApiService {
  private cesFieldId?: number;

  async initialize() {
    // Find the CES score custom field
    try {
      const response = await fetch(
        `${getZendeskBaseUrl()}/ticket_fields.json`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ticket fields: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const cesField = data.ticket_fields.find(
        (field: any) =>
          field.title.toLowerCase().includes("ces") ||
          field.title.toLowerCase().includes("customer effort") ||
          field.title.toLowerCase().includes("effort score"),
      );

      if (cesField) {
        this.cesFieldId = cesField.id;
        console.log(`Found CES field: ${cesField.title} (ID: ${cesField.id})`);
      } else {
        console.warn(
          "CES score field not found. Please ensure you have a custom field for CES scores.",
        );
      }
    } catch (error) {
      console.error("Error finding CES field:", error);
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

      const response = await fetch(
        `${getZendeskBaseUrl()}/tickets.json?${searchParams}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.statusText}`);
      }

      const data = await response.json();

      // Create user map for efficient lookup
      const userMap = new Map<number, ZendeskApiUser>();
      if (data.users) {
        data.users.forEach((user: ZendeskApiUser) => {
          userMap.set(user.id, user);
        });
      }

      const tickets = data.tickets.map((ticket: ZendeskApiTicket) =>
        transformZendeskTicket(ticket, userMap, this.cesFieldId),
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

  async searchTickets(query: string): Promise<ZendeskTicket[]> {
    try {
      const response = await fetch(
        `${getZendeskBaseUrl()}/search.json?query=${encodeURIComponent(query)}`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to search tickets: ${response.statusText}`);
      }

      const data = await response.json();

      // Fetch user details for the search results
      const userIds = [
        ...new Set([
          ...data.results.map((t: any) => t.requester_id).filter(Boolean),
          ...data.results.map((t: any) => t.assignee_id).filter(Boolean),
        ]),
      ];

      const userMap = new Map<number, ZendeskApiUser>();
      if (userIds.length > 0) {
        const usersResponse = await fetch(
          `${getZendeskBaseUrl()}/users/show_many.json?ids=${userIds.join(",")}`,
          {
            headers: getAuthHeaders(),
          },
        );

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          usersData.users.forEach((user: ZendeskApiUser) => {
            userMap.set(user.id, user);
          });
        }
      }

      return data.results
        .filter((result: any) => result.result_type === "ticket")
        .map((ticket: ZendeskApiTicket) =>
          transformZendeskTicket(ticket, userMap, this.cesFieldId),
        );
    } catch (error) {
      console.error("Error searching tickets:", error);
      throw error;
    }
  }

  async getTicketById(ticketId: string): Promise<ZendeskTicket | null> {
    try {
      const response = await fetch(
        `${getZendeskBaseUrl()}/tickets/${ticketId}.json?include=users`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch ticket: ${response.statusText}`);
      }

      const data = await response.json();

      const userMap = new Map<number, ZendeskApiUser>();
      if (data.users) {
        data.users.forEach((user: ZendeskApiUser) => {
          userMap.set(user.id, user);
        });
      }

      return transformZendeskTicket(data.ticket, userMap, this.cesFieldId);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      throw error;
    }
  }

  async updateTicketCES(ticketId: string, cesScore: number): Promise<boolean> {
    if (!this.cesFieldId) {
      throw new Error("CES field not found. Cannot update CES score.");
    }

    try {
      const response = await fetch(
        `${getZendeskBaseUrl()}/tickets/${ticketId}.json`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ticket: {
              custom_fields: [
                {
                  id: this.cesFieldId,
                  value: cesScore,
                },
              ],
            },
          }),
        },
      );

      return response.ok;
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

    while (hasMore) {
      const params: any = { page, per_page: 100 };
      if (dateRange?.start) {
        params.created_after = dateRange.start;
      }

      const result = await this.fetchTickets(params);
      allTickets.push(...result.tickets);

      hasMore = result.hasMore && page < 50; // Limit to prevent excessive API calls
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
    const priorities = ["low", "normal", "high", "urgent"];

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
        improvement_opportunities: 4, // This would be calculated based on recommendation logic
      };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      throw error;
    }
  }

  // Test connection to Zendesk
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(
        `${getZendeskBaseUrl()}/tickets.json?per_page=1`,
        {
          headers: getAuthHeaders(),
        },
      );

      if (response.ok) {
        return {
          success: true,
          message: "Successfully connected to Zendesk API",
        };
      } else {
        return {
          success: false,
          message: `Failed to connect: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton instance
export const zendeskApi = new ZendeskApiService();
