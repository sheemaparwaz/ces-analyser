import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zendeskApi } from "@/lib/zendeskApi";
import { zendeskApiLive } from "@/lib/zendeskApiLive";
import { ZendeskTicket, CESAnalytics, DashboardStats } from "@/types";
import { toast } from "sonner";

export function useZendeskConnection() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLiveConnection, setIsLiveConnection] = useState(false);

  // Test live connection via Vercel proxy first
  const { data: liveConnectionTest, isLoading: isTestingLive } = useQuery({
    queryKey: ["zendesk-live-connection"],
    queryFn: () => zendeskApiLive.testConnection(),
    retry: 1,
    throwOnError: false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fallback to direct connection test (will fail due to CORS)
  const { data: connectionTest, isLoading: isTestingConnection } = useQuery({
    queryKey: ["zendesk-connection"],
    queryFn: () => zendeskApi.testConnection(),
    retry: false,
    throwOnError: false,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !liveConnectionTest?.success, // Only run if live connection failed
  });

  useEffect(() => {
    const initializeApi = async () => {
      if (connectionTest?.success && !isInitialized) {
        try {
          await zendeskApi.initialize();
          setIsInitialized(true);
          toast.success("Connected to Zendesk successfully!");
        } catch (error) {
          console.error("Zendesk initialization error:", error);
          // Don't show toast error for initialization failures
        }
      } else if (
        connectionTest?.success === false &&
        !connectionTest.message.includes("CORS")
      ) {
        // Only show error toasts for non-CORS issues
        console.log("Zendesk connection status:", connectionTest.message);
      }
    };

    initializeApi();
  }, [connectionTest?.success, isInitialized]);

  return {
    isConnected:
      liveConnectionTest?.success || connectionTest?.success || false,
    isInitialized,
    isLiveConnection,
    isTestingConnection: isTestingLive || isTestingConnection,
    connectionMessage: liveConnectionTest?.message || connectionTest?.message,
  };
}

export function useZendeskTickets(
  params: {
    page?: number;
    per_page?: number;
    status?: string;
    created_after?: string;
  } = {},
) {
  const { isLiveConnection } = useZendeskConnection();

  return useQuery({
    queryKey: ["zendesk-tickets", params, isLiveConnection],
    queryFn: () =>
      isLiveConnection
        ? zendeskApiLive.fetchTickets(params)
        : zendeskApi.fetchTickets(params),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useZendeskTicket(ticketId: string) {
  return useQuery({
    queryKey: ["zendesk-ticket", ticketId],
    queryFn: () => zendeskApi.getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useZendeskSearch(query: string) {
  return useQuery({
    queryKey: ["zendesk-search", query],
    queryFn: () => zendeskApi.searchTickets(query),
    enabled: query.length > 2, // Only search if query is meaningful
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useZendeskAnalytics(dateRange?: {
  start: string;
  end: string;
}) {
  const { isLiveConnection } = useZendeskConnection();

  return useQuery({
    queryKey: ["zendesk-analytics", dateRange, isLiveConnection],
    queryFn: () =>
      isLiveConnection
        ? zendeskApiLive.getAnalytics(dateRange)
        : zendeskApi.getAnalytics(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useZendeskDashboard() {
  const { isLiveConnection } = useZendeskConnection();

  return useQuery({
    queryKey: ["zendesk-dashboard", isLiveConnection],
    queryFn: () =>
      isLiveConnection
        ? zendeskApiLive.getDashboardStats()
        : zendeskApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

export function useUpdateTicketCES() {
  const queryClient = useQueryClient();
  const { isLiveConnection } = useZendeskConnection();

  return useMutation({
    mutationFn: ({
      ticketId,
      cesScore,
    }: {
      ticketId: string;
      cesScore: number;
    }) =>
      isLiveConnection
        ? zendeskApiLive.updateTicketCES(ticketId, cesScore)
        : zendeskApi.updateTicketCES(ticketId, cesScore),
    onSuccess: (success, { ticketId, cesScore }) => {
      if (success) {
        toast.success(`CES score ${cesScore} updated for ticket #${ticketId}`);

        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["zendesk-tickets"] });
        queryClient.invalidateQueries({
          queryKey: ["zendesk-ticket", ticketId],
        });
        queryClient.invalidateQueries({ queryKey: ["zendesk-analytics"] });
        queryClient.invalidateQueries({ queryKey: ["zendesk-dashboard"] });
      } else {
        toast.error(`Failed to update CES score for ticket #${ticketId}`);
      }
    },
    onError: (error) => {
      toast.error(
        `Error updating CES score: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });
}

// Custom hook for handling live/mock data switching
export function useDataSource() {
  const [useRealData, setUseRealData] = useState(false);
  const { isConnected, isInitialized } = useZendeskConnection();

  // Automatically switch to real data when connected
  useEffect(() => {
    if (isConnected && isInitialized) {
      setUseRealData(true);
    }
  }, [isConnected, isInitialized]);

  return {
    useRealData: useRealData && isConnected && isInitialized,
    setUseRealData,
    canUseRealData: isConnected && isInitialized,
  };
}
