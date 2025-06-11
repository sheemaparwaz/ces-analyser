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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Play,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
import { mockTickets, mockPredictions, mockAnalytics } from "@/lib/mockData";

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export default function Predictions() {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const runPredictions = async () => {
    setIsRunning(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsRunning(false);
    setShowResults(true);
  };

  const pendingTickets = mockTickets.filter(
    (ticket) => ticket.ces_score === undefined,
  );
  const predictedTickets = mockTickets.filter((ticket) =>
    mockPredictions.some((pred) => pred.ticket_id === ticket.id),
  );

  const riskDistribution = [
    { name: "High Risk (0-3)", value: 127, color: "#ef4444" },
    { name: "Medium Risk (4-5)", value: 89, color: "#f59e0b" },
    { name: "Low Risk (6-7)", value: 142, color: "#22c55e" },
  ];

  const confidenceData = mockPredictions.map((pred) => ({
    ticket_id: pred.ticket_id,
    confidence: pred.confidence * 100,
    predicted_score: pred.predicted_score,
  }));

  const accuracyMetrics = {
    overall_accuracy: 87.3,
    precision: 84.2,
    recall: 89.1,
    f1_score: 86.6,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            CES Predictions
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            AI-powered customer effort score predictions for incoming tickets
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runPredictions}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Predictions
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            <Brain className="mr-2 h-4 w-4" />
            Configure Model
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isRunning && (
        <Alert className="border-ces-200 bg-ces-50 dark:border-ces-800 dark:bg-ces-900/20">
          <Brain className="h-4 w-4 text-ces-600" />
          <AlertDescription className="text-ces-800 dark:text-ces-200">
            Processing {pendingTickets.length} tickets through the CES
            prediction model...
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Pending Predictions
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingTickets.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CES score ≤ 3 predicted
            </p>
          </CardContent>
        </Card>

        <Card className="border-success-200 dark:border-success-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Model Accuracy
            </CardTitle>
            <Target className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {accuracyMetrics.overall_accuracy}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on 2,340 validated predictions
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning-200 dark:border-warning-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              High Risk Predictions
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              127
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Predicted CES ≥ 5
            </p>
          </CardContent>
        </Card>

        <Card className="border-ces-200 dark:border-ces-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Avg Confidence
            </CardTitle>
            <Brain className="h-4 w-4 text-ces-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              89%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Model confidence level
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="model">Model Performance</TabsTrigger>
          <TabsTrigger value="factors">Key Factors</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions">
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pending Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    <span>Pending Predictions</span>
                  </CardTitle>
                  <CardDescription>
                    Tickets awaiting CES score predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTickets.slice(0, 5).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{ticket.id}</Badge>
                            <span className="font-medium">
                              {ticket.subject}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {ticket.requester.name} • {ticket.channel} •{" "}
                            {ticket.priority}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Pending</Badge>
                          <Button size="sm" variant="ghost">
                            <Zap className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingTickets.length > 5 && (
                      <p className="text-center text-sm text-slate-500">
                        +{pendingTickets.length - 5} more tickets
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>
                    Predicted CES score distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [
                            `${value} tickets`,
                            "Count",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {riskDistribution.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-ces-500" />
                  <span>Recent Predictions</span>
                </CardTitle>
                <CardDescription>
                  Latest CES score predictions with confidence levels and
                  contributing factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockPredictions.map((prediction) => {
                    const ticket = mockTickets.find(
                      (t) => t.id === prediction.ticket_id,
                    );
                    if (!ticket) return null;

                    return (
                      <div
                        key={prediction.ticket_id}
                        className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline">#{ticket.id}</Badge>
                              <h3 className="font-semibold">
                                {ticket.subject}
                              </h3>
                              <Badge
                                variant={
                                  prediction.predicted_score >= 6
                                    ? "default"
                                    : prediction.predicted_score >= 4
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                Predicted: {prediction.predicted_score}/7
                              </Badge>
                            </div>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">
                              {ticket.description}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                              <span>{ticket.requester.name}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {ticket.channel}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div>
                              <p className="text-sm text-slate-500">
                                Confidence
                              </p>
                              <p className="font-bold">
                                {Math.round(prediction.confidence * 100)}%
                              </p>
                            </div>
                            <Progress
                              value={prediction.confidence * 100}
                              className="w-20"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            Contributing Factors
                          </h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            {prediction.factors.map((factor, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium text-sm">
                                    {factor.factor}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {factor.impact > 0 ? "+" : ""}
                                    {factor.impact.toFixed(1)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {factor.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Confidence Distribution</CardTitle>
                  <CardDescription>
                    Distribution of model confidence levels across predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { range: "60-70%", count: 12 },
                          { range: "70-80%", count: 34 },
                          { range: "80-90%", count: 89 },
                          { range: "90-95%", count: 145 },
                          { range: "95-100%", count: 78 },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis dataKey="range" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          formatter={(value: any) => [
                            `${value} predictions`,
                            "Count",
                          ]}
                        />
                        <Bar
                          dataKey="count"
                          fill="#0ea5e9"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confidence vs Predicted Score</CardTitle>
                  <CardDescription>
                    Relationship between model confidence and predicted CES
                    scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={confidenceData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          type="number"
                          dataKey="confidence"
                          domain={[60, 100]}
                          tickFormatter={(value) => `${value}%`}
                          className="text-xs"
                        />
                        <YAxis
                          type="number"
                          dataKey="predicted_score"
                          domain={[0, 7]}
                          className="text-xs"
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            name === "confidence" ? `${value}%` : `${value}/7`,
                            name === "confidence"
                              ? "Confidence"
                              : "Predicted CES",
                          ]}
                        />
                        <Scatter fill="#0ea5e9" fillOpacity={0.7} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Insights</CardTitle>
                <CardDescription>
                  Key insights from the prediction analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-success-600" />
                      <h3 className="font-semibold text-success-800 dark:text-success-200">
                        High Accuracy
                      </h3>
                    </div>
                    <p className="text-sm text-success-700 dark:text-success-300">
                      Model achieves 87% accuracy on test data with consistent
                      performance across different ticket types.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-warning-600" />
                      <h3 className="font-semibold text-warning-800 dark:text-warning-200">
                        Priority Correlation
                      </h3>
                    </div>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      Strong correlation between ticket priority and predicted
                      CES scores - higher priority tickets show increased
                      effort.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-ces-50 dark:bg-ces-900/20 border border-ces-200 dark:border-ces-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-ces-600" />
                      <h3 className="font-semibold text-ces-800 dark:text-ces-200">
                        Channel Impact
                      </h3>
                    </div>
                    <p className="text-sm text-ces-700 dark:text-ces-300">
                      Phone channel consistently shows highest predicted CES
                      scores, suggesting need for process improvements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="model">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Overall Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accuracyMetrics.overall_accuracy}%
                  </div>
                  <Progress
                    value={accuracyMetrics.overall_accuracy}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Precision</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accuracyMetrics.precision}%
                  </div>
                  <Progress
                    value={accuracyMetrics.precision}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recall</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accuracyMetrics.recall}%
                  </div>
                  <Progress value={accuracyMetrics.recall} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">F1 Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {accuracyMetrics.f1_score}%
                  </div>
                  <Progress value={accuracyMetrics.f1_score} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance Details</CardTitle>
                <CardDescription>
                  Detailed performance metrics and validation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Training Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Training Data
                        </p>
                        <p className="font-semibold">18,432 labeled tickets</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Validation Data
                        </p>
                        <p className="font-semibold">2,340 test tickets</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Last Updated
                        </p>
                        <p className="font-semibold">January 15, 2024</p>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Model Type
                        </p>
                        <p className="font-semibold">Gradient Boosting</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Feature Importance</h3>
                    <div className="space-y-3">
                      {[
                        { feature: "Ticket Priority", importance: 0.28 },
                        { feature: "Support Channel", importance: 0.22 },
                        { feature: "Time to First Response", importance: 0.18 },
                        { feature: "Ticket Category", importance: 0.15 },
                        { feature: "Customer Tier", importance: 0.12 },
                        { feature: "Agent Experience", importance: 0.05 },
                      ].map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.feature}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32">
                              <Progress
                                value={item.importance * 100}
                                className="h-2"
                              />
                            </div>
                            <span className="text-sm font-medium w-12">
                              {Math.round(item.importance * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="factors">
          <Card>
            <CardHeader>
              <CardTitle>Key Prediction Factors</CardTitle>
              <CardDescription>
                Understanding what drives customer effort score predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">High Impact Factors</h3>
                  {[
                    {
                      factor: "Ticket Priority",
                      description:
                        "Urgent and high priority tickets typically result in higher CES scores due to stress and complexity.",
                      impact: "Very High",
                    },
                    {
                      factor: "Support Channel",
                      description:
                        "Phone support shows consistently higher effort scores compared to chat and email channels.",
                      impact: "High",
                    },
                    {
                      factor: "Response Time",
                      description:
                        "Longer initial response times correlate with increased customer effort perception.",
                      impact: "High",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.factor}</h4>
                        <Badge
                          variant={
                            item.impact === "Very High"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {item.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Medium Impact Factors</h3>
                  {[
                    {
                      factor: "Ticket Category",
                      description:
                        "Technical issues and billing inquiries tend to have higher effort scores than general questions.",
                      impact: "Medium",
                    },
                    {
                      factor: "Customer History",
                      description:
                        "Customers with previous high-effort interactions are more likely to report higher CES scores.",
                      impact: "Medium",
                    },
                    {
                      factor: "Agent Experience",
                      description:
                        "Less experienced agents may require more back-and-forth, increasing customer effort.",
                      impact: "Medium",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.factor}</h4>
                        <Badge variant="secondary">{item.impact}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
