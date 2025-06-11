import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Users,
  Brain,
  AlertTriangle,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { mockAnalytics, mockDashboardStats, mockTickets } from "@/lib/mockData";
import { Link } from "react-router-dom";

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export default function Index() {
  const stats = mockDashboardStats;
  const analytics = mockAnalytics;

  const recentTickets = mockTickets.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            CES Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Real-time insights into your customer effort scores and support
            performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last updated: 2 min ago
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-ces-500 to-ces-600 hover:from-ces-600 hover:to-ces-700"
          >
            <Brain className="mr-2 h-4 w-4" />
            Run Predictions
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-ces-200 dark:border-ces-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Total Tickets
            </CardTitle>
            <Users className="h-4 w-4 text-ces-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total_tickets.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-success-200 dark:border-success-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Average CES Score
            </CardTitle>
            <Target className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.average_ces}
              </div>
              <Badge
                variant="secondary"
                className="bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
              >
                <TrendingDown className="mr-1 h-3 w-3" />
                -0.3
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: ≥ 4.0 (Good progress!)
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning-200 dark:border-warning-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              High Risk Tickets
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.high_risk_tickets}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CES score ≥ 6 predicted
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Pending Predictions
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.pending_predictions}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tickets awaiting analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CES Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-ces-500" />
              <span>CES Trend (Last 17 Days)</span>
            </CardTitle>
            <CardDescription>
              Daily average customer effort scores showing improvement trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
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
                    activeDot={{ r: 6, stroke: "#0ea5e9", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CES Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-ces-500" />
              <span>CES Score Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of customer effort scores across all tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.ces_distribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="score" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name === "count" ? `${value} tickets` : `${value}%`,
                      name === "count" ? "Count" : "Percentage",
                    ]}
                  />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel and Priority Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Channel */}
        <Card>
          <CardHeader>
            <CardTitle>CES by Channel</CardTitle>
            <CardDescription>
              Average effort scores across different support channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.by_channel.map((channel, index) => (
                <div
                  key={channel.channel}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium capitalize">
                        {channel.channel}
                      </p>
                      <p className="text-sm text-slate-500">
                        {channel.count} tickets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {channel.average_ces.toFixed(1)}
                    </p>
                    <div className="w-20">
                      <Progress
                        value={(channel.average_ces / 7) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle>CES by Priority</CardTitle>
            <CardDescription>
              How ticket priority affects customer effort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.by_priority.map((priority, index) => (
                <div
                  key={priority.priority}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        priority.priority === "urgent"
                          ? "destructive"
                          : priority.priority === "high"
                            ? "default"
                            : priority.priority === "normal"
                              ? "secondary"
                              : "outline"
                      }
                      className="w-16 justify-center"
                    >
                      {priority.priority}
                    </Badge>
                    <div>
                      <p className="text-sm text-slate-500">
                        {priority.count} tickets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {priority.average_ces.toFixed(1)}
                    </p>
                    <div className="w-20">
                      <Progress
                        value={(priority.average_ces / 7) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              Latest tickets with CES scores and status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/analysis">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{ticket.id}</Badge>
                    <h4 className="font-medium">{ticket.subject}</h4>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                    <span>{ticket.requester.name}</span>
                    <span>•</span>
                    <span className="capitalize">{ticket.channel}</span>
                    <span>•</span>
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={
                      ticket.status === "solved"
                        ? "default"
                        : ticket.status === "open"
                          ? "secondary"
                          : ticket.status === "pending"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {ticket.status}
                  </Badge>
                  {ticket.ces_score !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-slate-500">CES Score</p>
                      <p
                        className={`font-bold ${
                          ticket.ces_score >= 6
                            ? "text-success-600"
                            : ticket.ces_score >= 4
                              ? "text-warning-600"
                              : "text-danger-600"
                        }`}
                      >
                        {ticket.ces_score}/7
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-ces-200 dark:border-ces-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ces-100 dark:bg-ces-900">
                <BarChart3 className="h-6 w-6 text-ces-600 dark:text-ces-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Analyze Patterns</h3>
                <p className="text-sm text-slate-500">
                  Deep dive into ticket patterns
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/analysis">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Generate Predictions</h3>
                <p className="text-sm text-slate-500">
                  Predict CES for new tickets
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/predictions">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success-200 dark:border-success-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-100 dark:bg-success-900">
                <Target className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">View Recommendations</h3>
                <p className="text-sm text-slate-500">
                  Get improvement suggestions
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/recommendations">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
