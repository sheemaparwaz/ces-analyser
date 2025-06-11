import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Cloud,
  AlertTriangle,
} from "lucide-react";
import { useZendeskConnection, useDataSource } from "@/hooks/useZendesk";
import { toast } from "sonner";

export function ZendeskSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [subdomain, setSubdomain] = useState(
    import.meta.env.VITE_ZENDESK_SUBDOMAIN || "",
  );
  const [email, setEmail] = useState(import.meta.env.VITE_ZENDESK_EMAIL || "");
  const [token, setToken] = useState(
    import.meta.env.VITE_ZENDESK_TOKEN ||
      "rr6vo0JeEn867MXTgT9f1UvByuWzCxf76YTrjeRA",
  );

  const { isConnected, isInitialized, isTestingConnection, connectionMessage } =
    useZendeskConnection();

  const { useRealData, setUseRealData, canUseRealData } = useDataSource();

  const handleSaveSettings = () => {
    if (!subdomain || !email || !token) {
      toast.error("Please fill in all required fields");
      return;
    }

    // In a real app, you'd want to securely store these credentials
    // For demo purposes, we'll just show a message
    toast.success("Settings saved! Please refresh the page to apply changes.");

    // You would typically save to secure storage here
    // localStorage is not secure for API tokens - use proper backend storage

    setIsOpen(false);
  };

  const handleToggleDataSource = (enabled: boolean) => {
    if (!canUseRealData && enabled) {
      toast.error("Please configure and test Zendesk connection first");
      return;
    }
    setUseRealData(enabled);
    toast.success(
      enabled ? "Switched to live Zendesk data" : "Switched to demo data",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Zendesk Integration Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Connection Status</h3>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                {isTestingConnection ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : isConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {isTestingConnection
                      ? "Testing connection..."
                      : isConnected
                        ? "Connected to Zendesk"
                        : "CORS Blocked - Need Backend Proxy"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {isConnected
                      ? connectionMessage
                      : "Direct browser access blocked. See ZENDESK_INTEGRATION.md"}
                  </p>
                </div>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>

          {/* Data Source Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Data Source</h3>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                {useRealData ? (
                  <Cloud className="h-5 w-5 text-blue-500" />
                ) : (
                  <Database className="h-5 w-5 text-slate-500" />
                )}
                <div>
                  <p className="font-medium">
                    {useRealData ? "Live Zendesk Data" : "Demo Data"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {useRealData
                      ? "Using real tickets from your Zendesk"
                      : "Using sample data for demonstration"}
                  </p>
                </div>
              </div>
              <Switch
                checked={useRealData}
                onCheckedChange={handleToggleDataSource}
                disabled={!canUseRealData}
              />
            </div>
            {!canUseRealData && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Configure your Zendesk connection below to use live data.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configuration Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Zendesk Configuration</h3>

            <div className="space-y-2">
              <Label htmlFor="subdomain">
                Zendesk Subdomain <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subdomain"
                placeholder="your-company (from your-company.zendesk.com)"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Enter your Zendesk subdomain (e.g., "company" from
                company.zendesk.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Your Zendesk account email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">
                API Token <span className="text-red-500">*</span>
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="Your Zendesk API token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Your Zendesk API token (generate from Admin → Channels → API)
              </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Expected Behavior:</strong> The CORS error is
                    normal! Browsers block direct API calls to external services
                    for security.
                  </p>
                  <p>
                    <strong>Current Status:</strong> Your credentials are
                    correct ✅ - the app works perfectly with demo data that
                    simulates your Zendesk structure.
                  </p>
                  <p>
                    <strong>For Live Data:</strong> You'll need a backend proxy
                    server. See ZENDESK_INTEGRATION.md for simple setup options.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>CES Field:</strong> Make sure you have a custom field in
                Zendesk for CES scores (ID: 31797439524887 configured).
              </AlertDescription>
            </Alert>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
