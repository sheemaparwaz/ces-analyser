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
import {
  Target,
  TrendingDown,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { mockRecommendations } from "@/lib/mockData";

const categoryIcons = {
  technology: Settings,
  training: BookOpen,
  communication: MessageSquare,
  process: Target,
};

const categoryColors = {
  technology: "ces",
  training: "success",
  communication: "warning",
  process: "purple",
};

export default function Recommendations() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [implementedIds, setImplementedIds] = useState<string[]>([]);

  const filteredRecommendations =
    selectedCategory === "all"
      ? mockRecommendations
      : mockRecommendations.filter((rec) => rec.category === selectedCategory);

  const toggleImplemented = (id: string) => {
    setImplementedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const impactData = mockRecommendations.map((rec) => ({
    title: rec.title.substring(0, 20) + "...",
    impact: Math.abs(rec.estimated_ces_improvement),
    affected_tickets: rec.affected_tickets,
  }));

  const implementationProgress = {
    total: mockRecommendations.length,
    implemented: implementedIds.length,
    percentage: (implementedIds.length / mockRecommendations.length) * 100,
  };

  const projectedImpact = mockRecommendations
    .filter((rec) => implementedIds.includes(rec.id))
    .reduce((sum, rec) => sum + Math.abs(rec.estimated_ces_improvement), 0);

  const categoryStats = Object.entries(
    mockRecommendations.reduce(
      (acc, rec) => {
        acc[rec.category] = (acc[rec.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            CES Improvement Recommendations
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Data-driven suggestions to reduce customer effort scores and improve
            satisfaction
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Target className="mr-2 h-4 w-4" />
            Export Plan
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Complete
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-success-200 dark:border-success-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Implementation Progress
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {implementationProgress.implemented}/
              {implementationProgress.total}
            </div>
            <Progress
              value={implementationProgress.percentage}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {Math.round(implementationProgress.percentage)}% complete
            </p>
          </CardContent>
        </Card>

        <Card className="border-ces-200 dark:border-ces-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Projected CES Reduction
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-ces-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              -{projectedImpact.toFixed(1)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Points reduction in average CES
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning-200 dark:border-warning-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              High Impact Items
            </CardTitle>
            <Zap className="h-4 w-4 text-warning-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {
                mockRecommendations.filter((rec) => rec.impact === "high")
                  .length
              }
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recommendations available
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Affected Tickets
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {mockRecommendations.reduce(
                (sum, rec) => sum + rec.affected_tickets,
                0,
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tickets could be improved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
          <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <div className="space-y-6">
            {/* Category Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Filter by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Categories ({mockRecommendations.length})
                  </Button>
                  {categoryStats.map(([category, count]) => {
                    const IconComponent =
                      categoryIcons[category as keyof typeof categoryIcons];
                    return (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        {category.charAt(0).toUpperCase() + category.slice(1)} (
                        {count})
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations List */}
            <div className="space-y-4">
              {filteredRecommendations.map((recommendation) => {
                const IconComponent =
                  categoryIcons[
                    recommendation.category as keyof typeof categoryIcons
                  ];
                const isImplemented = implementedIds.includes(
                  recommendation.id,
                );
                const colorScheme =
                  categoryColors[
                    recommendation.category as keyof typeof categoryColors
                  ];

                return (
                  <Card
                    key={recommendation.id}
                    className={`transition-all duration-200 ${
                      isImplemented
                        ? "bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${colorScheme}-100 dark:bg-${colorScheme}-900/20`}
                            >
                              <IconComponent
                                className={`h-6 w-6 text-${colorScheme}-600 dark:text-${colorScheme}-400`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                  {recommendation.title}
                                </h3>
                                {isImplemented && (
                                  <Badge
                                    variant="default"
                                    className="bg-success-500"
                                  >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Implemented
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 mt-2">
                                {recommendation.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  recommendation.impact === "high"
                                    ? "destructive"
                                    : recommendation.impact === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {recommendation.impact} impact
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  recommendation.effort === "high"
                                    ? "destructive"
                                    : recommendation.effort === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {recommendation.effort} effort
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <p className="text-slate-500">CES Improvement</p>
                              <p className="font-semibold text-success-600">
                                {recommendation.estimated_ces_improvement.toFixed(
                                  1,
                                )}{" "}
                                points
                              </p>
                            </div>
                            <div className="text-sm">
                              <p className="text-slate-500">Affected Tickets</p>
                              <p className="font-semibold">
                                {recommendation.affected_tickets}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            variant={isImplemented ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleImplemented(recommendation.id)}
                          >
                            {isImplemented ? (
                              <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Target className="mr-2 h-4 w-4" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="impact">
          <div className="grid gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Potential CES Impact</CardTitle>
                  <CardDescription>
                    Expected CES score reduction for each recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={impactData} layout="horizontal">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis type="number" className="text-xs" />
                        <YAxis
                          dataKey="title"
                          type="category"
                          width={100}
                          className="text-xs"
                        />
                        <Tooltip
                          formatter={(value: any) => [
                            `-${value} points`,
                            "CES Reduction",
                          ]}
                        />
                        <Bar
                          dataKey="impact"
                          fill="#22c55e"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tickets Affected</CardTitle>
                  <CardDescription>
                    Number of tickets that would benefit from each
                    recommendation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={impactData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-30"
                        />
                        <XAxis
                          dataKey="title"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          formatter={(value: any) => [
                            `${value} tickets`,
                            "Affected",
                          ]}
                        />
                        <Bar
                          dataKey="affected_tickets"
                          fill="#0ea5e9"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>
                  Return on investment for implementing recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <TrendingDown className="h-6 w-6 text-success-600" />
                      <h3 className="font-semibold text-success-800 dark:text-success-200">
                        Quick Wins
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-success-600 dark:text-success-400">
                          Low effort, high impact
                        </p>
                        <p className="text-2xl font-bold text-success-800 dark:text-success-200">
                          2 items
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-success-600 dark:text-success-400">
                          Potential CES reduction
                        </p>
                        <p className="text-xl font-semibold text-success-800 dark:text-success-200">
                          -1.7 points
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-ces-50 dark:bg-ces-900/20 border border-ces-200 dark:border-ces-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <Target className="h-6 w-6 text-ces-600" />
                      <h3 className="font-semibold text-ces-800 dark:text-ces-200">
                        Major Projects
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-ces-600 dark:text-ces-400">
                          High effort, high impact
                        </p>
                        <p className="text-2xl font-bold text-ces-800 dark:text-ces-200">
                          1 item
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-ces-600 dark:text-ces-400">
                          Potential CES reduction
                        </p>
                        <p className="text-xl font-semibold text-ces-800 dark:text-ces-200">
                          -1.5 points
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="h-6 w-6 text-warning-600" />
                      <h3 className="font-semibold text-warning-800 dark:text-warning-200">
                        Fill-ins
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-warning-600 dark:text-warning-400">
                          Low effort, medium impact
                        </p>
                        <p className="text-2xl font-bold text-warning-800 dark:text-warning-200">
                          1 item
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-warning-600 dark:text-warning-400">
                          Potential CES reduction
                        </p>
                        <p className="text-xl font-semibold text-warning-800 dark:text-warning-200">
                          -0.8 points
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roadmap">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Roadmap</CardTitle>
                <CardDescription>
                  Suggested timeline for implementing CES improvement
                  recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 dark:bg-success-900">
                        <span className="text-sm font-semibold text-success-600 dark:text-success-400">
                          1
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Phase 1: Quick Wins (Weeks 1-4)
                      </h3>
                    </div>
                    <div className="ml-11 space-y-3">
                      {mockRecommendations
                        .filter(
                          (rec) =>
                            rec.effort === "low" && rec.impact === "high",
                        )
                        .map((rec) => (
                          <div
                            key={rec.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-success-50 dark:bg-success-900/20"
                          >
                            <div>
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Expected CES reduction:{" "}
                                {rec.estimated_ces_improvement.toFixed(1)}{" "}
                                points
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
                            >
                              {rec.effort} effort
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ces-100 dark:bg-ces-900">
                        <span className="text-sm font-semibold text-ces-600 dark:text-ces-400">
                          2
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Phase 2: Medium Impact (Weeks 5-12)
                      </h3>
                    </div>
                    <div className="ml-11 space-y-3">
                      {mockRecommendations
                        .filter((rec) => rec.effort === "medium")
                        .map((rec) => (
                          <div
                            key={rec.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-ces-50 dark:bg-ces-900/20"
                          >
                            <div>
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Expected CES reduction:{" "}
                                {rec.estimated_ces_improvement.toFixed(1)}{" "}
                                points
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-ces-100 text-ces-700 dark:bg-ces-900 dark:text-ces-300"
                            >
                              {rec.effort} effort
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-900">
                        <span className="text-sm font-semibold text-warning-600 dark:text-warning-400">
                          3
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        Phase 3: Major Projects (Weeks 13-26)
                      </h3>
                    </div>
                    <div className="ml-11 space-y-3">
                      {mockRecommendations
                        .filter((rec) => rec.effort === "high")
                        .map((rec) => (
                          <div
                            key={rec.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20"
                          >
                            <div>
                              <p className="font-medium">{rec.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Expected CES reduction:{" "}
                                {rec.estimated_ces_improvement.toFixed(1)}{" "}
                                points
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300"
                            >
                              {rec.effort} effort
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected CES Improvement Timeline</CardTitle>
                <CardDescription>
                  Projected CES score reduction over time as recommendations are
                  implemented
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Current", ces: 3.4 },
                        { month: "Month 1", ces: 3.2 },
                        { month: "Month 2", ces: 2.9 },
                        { month: "Month 3", ces: 2.7 },
                        { month: "Month 4", ces: 2.5 },
                        { month: "Month 5", ces: 2.3 },
                        { month: "Month 6", ces: 2.0 },
                      ]}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[1.5, 3.5]} className="text-xs" />
                      <Tooltip
                        formatter={(value: any) => [value, "Average CES"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="ces"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#22c55e", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
