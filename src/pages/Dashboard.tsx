import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DashboardMetrics, TimelineData, Ticket } from "../types";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TicketCard from "../components/tickets/TicketCard";
import { analyticsAPI, ticketsAPI } from "../utils/api";

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [metricsData, timelineData, ticketsData] = await Promise.all([
          analyticsAPI.getDashboardMetrics(),
          analyticsAPI.getTimelineData(),
          ticketsAPI.getAll(),
        ]);

        setMetrics(metricsData);
        setTimelineData(timelineData);
        setRecentTickets(ticketsData.slice(0, 3)); // Get just the most recent 3 tickets
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tickets
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {metrics.totalTickets}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Open Tickets
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {metrics.openTickets}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Resolved Tickets
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {metrics.resolvedTickets}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Resolution Time
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {metrics.averageResolutionTime} hrs
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Ticket Activity
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="open"
                stackId="1"
                stroke="#FBBF24"
                fill="#FEF3C7"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stackId="1"
                stroke="#34D399"
                fill="#D1FAE5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white p-6 shadow rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
          <a
            href="/tickets"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </a>
        </div>
        <div className="space-y-4">
          {recentTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
          {recentTickets.length === 0 && (
            <p className="text-gray-500 text-center py-4">No tickets found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
