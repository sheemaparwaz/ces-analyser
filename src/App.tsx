import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Analysis from "./pages/Analysis";
import Predictions from "./pages/Predictions";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";
import { suppressDeprecationWarnings } from "./lib/suppressWarnings";

const queryClient = new QueryClient();

const App = () => {
  // Suppress deprecated warnings from third-party libraries in development
  useEffect(() => {
    const cleanup = suppressDeprecationWarnings();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
