import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zendeskApi } from "@/lib/zendeskApi";
import { ZendeskTicket, CESAnalytics, DashboardStats } from "@/types";
import { toast } from "sonner";

export function useZendeskConnection() {
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: connectionTest, isLoading: isTestingConnection } = useQuery({
    queryKey: ["zendesk-connection"],
    queryFn: () => zendeskApi.testConnection(),
    retry: false,
    throwOnError: false, // Don't throw errors for CORS issues
    staleTime: 30000, // Cache result for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
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
    isConnected: connectionTest?.success || false,
    isInitialized,
    isTestingConnection,
    connectionMessage: connectionTest?.message,
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
  return useQuery({
    queryKey: ["zendesk-tickets", params],
    queryFn: () => zendeskApi.fetchTickets(params),
    enabled: true, // Will be enabled when connection is established
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
  return useQuery({
    queryKey: ["zendesk-analytics", dateRange],
    queryFn: () => zendeskApi.getAnalytics(dateRange),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useZendeskDashboard() {
  return useQuery({
    queryKey: ["zendesk-dashboard"],
    queryFn: () => zendeskApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

export function useUpdateTicketCES() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      cesScore,
    }: {
      ticketId: string;
      cesScore: number;
    }) => zendeskApi.updateTicketCES(ticketId, cesScore),
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
