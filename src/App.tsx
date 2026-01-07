import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StateProvider } from "@/hooks/useStateSelection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import States from "./pages/States";
import Planner from "./pages/Planner";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import LocationDetail from "./pages/LocationDetail";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessOnboarding from "./pages/BusinessOnboarding";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import BusinessPromotions from "./pages/BusinessPromotions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component that initializes service worker
function ServiceWorkerInit() {
  useServiceWorker();
  return null;
}

const App = () => (
  <ThemeProvider>
    <StateProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ServiceWorkerInit />
              <div className="min-h-screen pb-20">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/states" element={<States />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/location/:id" element={<LocationDetail />} />
                  <Route path="/business" element={<BusinessDashboard />} />
                  <Route path="/business/onboarding" element={<BusinessOnboarding />} />
                  <Route path="/business/analytics" element={<BusinessAnalytics />} />
                  <Route path="/business/promotions" element={<BusinessPromotions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BottomNavigation />
                <VoiceAssistant />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StateProvider>
  </ThemeProvider>
);

export default App;
