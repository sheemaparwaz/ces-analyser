import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from "recharts";
import { mockTickets, mockAnalytics } from "@/lib/mockData";
import { ZendeskTicket } from "@/types";

export default function Analysis() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesChannel =
      channelFilter === "all" || ticket.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === "ces_score") {
      return (b.ces_score || 0) - (a.ces_score || 0);
    }
    if (sortBy === "created_at") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return 0;
  });

  const getCESColor = (score?: number) => {
    if (!score) return "text-slate-400";
    if (score >= 6) return "text-success-600";
    if (score >= 4) return "text-warning-600";
    return "text-danger-600";
  };

  const getCESBadgeVariant = (score?: number) => {
    if (!score) return "outline";
    if (score >= 6) return "default";
    if (score >= 4) return "secondary";
    return "destructive";
  };

  // Prepare correlation data
  const correlationData = mockTickets
    .filter((t) => t.ces_score !== undefined)
    .map((ticket) => ({
      priority:
        ticket.priority === "low"
          ? 1
          : ticket.priority === "normal"
            ? 2
            : ticket.priority === "high"
              ? 3
              : 4,
      ces_score: ticket.ces_score,
      channel: ticket.channel,
      status: ticket.status,
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Ticket Analysis
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Detailed analysis of tickets and their CES scores
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-ces-500 to-ces-600 hover:from-ces-600 hover:to-ces-700"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="ces_score">CES Score</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <span>{sortedTickets.length} tickets found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Ticket List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>
                Comprehensive view of all tickets with CES scores and metadata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex flex-col space-y-3 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{ticket.id}</Badge>
                          <h3 className="font-semibold text-lg">
                            {ticket.subject}
                          </h3>
                          {ticket.ces_score !== undefined && (
                            <Badge
                              variant={getCESBadgeVariant(ticket.ces_score)}
                            >
                              CES: {ticket.ces_score}/7
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{ticket.requester.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="capitalize">{ticket.channel}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {ticket.assignee && (
                            <div>
                              <span>Assigned to: {ticket.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={
                            ticket.status === "solved"
                              ? "default"
                              : ticket.status === "open"
                                ? "secondary"
                                : ticket.status === "pending"
                                  ? "outline"
                                  : ticket.status === "new"
                                    ? "destructive"
                                    : "default"
                          }
                          className="capitalize"
                        >
                          {ticket.status}
                        </Badge>
                        <Badge
                          variant={
                            ticket.priority === "urgent"
                              ? "destructive"
                              : ticket.priority === "high"
                                ? "default"
                                : ticket.priority === "normal"
                                  ? "secondary"
                                  : "outline"
                          }
                          className="capitalize"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    {ticket.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        {ticket.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>CES Trends Over Time</CardTitle>
                <CardDescription>
                  Daily average CES scores showing patterns and improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockAnalytics.trends}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        className="text-xs"
                      />
                      <YAxis domain={[0, 7]} className="text-xs" />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString()
                        }
                        formatter={(value: any) => [value, "Average CES"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="average_ces"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>
                  Average CES scores by support channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAnalytics.by_channel}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis dataKey="channel" className="text-xs" />
                      <YAxis domain={[0, 7]} className="text-xs" />
                      <Tooltip
                        formatter={(value: any) => [value, "Average CES"]}
                      />
                      <Bar
                        dataKey="average_ces"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="correlations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority vs CES Score Correlation</CardTitle>
                <CardDescription>
                  Relationship between ticket priority and customer effort
                  scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={correlationData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        type="number"
                        dataKey="priority"
                        domain={[0.5, 4.5]}
                        tickFormatter={(value) =>
                          value === 1
                            ? "Low"
                            : value === 2
                              ? "Normal"
                              : value === 3
                                ? "High"
                                : "Urgent"
                        }
                        className="text-xs"
                      />
                      <YAxis
                        type="number"
                        dataKey="ces_score"
                        domain={[0, 7]}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          name === "ces_score" ? `${value}/7` : value,
                          name === "ces_score" ? "CES Score" : "Priority",
                        ]}
                      />
                      <Scatter fill="#0ea5e9" fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-success-50 dark:bg-success-900/20">
                      <TrendingDown className="h-5 w-5 text-success-600" />
                      <div>
                        <p className="font-medium text-success-800 dark:text-success-200">
                          CES Improvement
                        </p>
                        <p className="text-sm text-success-600 dark:text-success-400">
                          15% decrease in average CES over last month
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                      <TrendingUp className="h-5 w-5 text-warning-600" />
                      <div>
                        <p className="font-medium text-warning-800 dark:text-warning-200">
                          Phone Channel Alert
                        </p>
                        <p className="text-sm text-warning-600 dark:text-warning-400">
                          Highest CES scores observed in phone support
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-ces-50 dark:bg-ces-900/20">
                      <BarChart3 className="h-5 w-5 text-ces-600" />
                      <div>
                        <p className="font-medium text-ces-800 dark:text-ces-200">
                          Strong Correlation
                        </p>
                        <p className="text-sm text-ces-600 dark:text-ces-400">
                          Higher priority tickets show increased effort scores
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium">Focus on Phone Support</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Implement additional training for phone agents to reduce
                        CES scores
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium">Urgent Ticket Workflow</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Streamline processes for urgent tickets to minimize
                        customer effort
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium">Self-Service Options</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Expand knowledge base to reduce ticket volume for common
                        issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
