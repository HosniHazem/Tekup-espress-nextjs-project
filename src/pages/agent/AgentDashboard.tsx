import { useState, useEffect } from "react";
import { Ticket } from "../../types";
import TicketStatusBadge from "../../components/tickets/TicketStatusBadge";
import TicketPriorityBadge from "../../components/tickets/TicketPriorityBadge";
import { Loader2, Clock, CalendarClock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { ticketsAPI } from "../../utils/api";

function AgentDashboard() {
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Example stats for the agent
  const agentStats = {
    ticketsResolved: 46,
    avgResponseTime: "2.3 hours",
    avgResolutionTime: "28 hours",
    customerSatisfaction: "95%",
  };

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      setLoading(true);
      try {
        // In a real app, this would filter for tickets assigned to the current agent
        const data = await ticketsAPI.getAll();
        setAssignedTickets(
          data.filter((ticket: { status: string }) =>
            ["open", "in_progress", "resolved"].includes(ticket.status)
          )
        );
      } catch (error) {
        console.error("Error fetching assigned tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTickets();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>

      {/* Agent Stats */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Performance Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="p-6 flex flex-col items-center">
            <p className="text-gray-500 text-sm font-medium">
              Tickets Resolved
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {agentStats.ticketsResolved}
            </p>
          </div>
          <div className="p-6 flex flex-col items-center">
            <p className="text-gray-500 text-sm font-medium">
              Avg. First Response
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {agentStats.avgResponseTime}
            </p>
          </div>
          <div className="p-6 flex flex-col items-center">
            <p className="text-gray-500 text-sm font-medium">
              Avg. Resolution Time
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {agentStats.avgResolutionTime}
            </p>
          </div>
          <div className="p-6 flex flex-col items-center">
            <p className="text-gray-500 text-sm font-medium">
              Customer Satisfaction
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {agentStats.customerSatisfaction}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets assigned to the agent */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Assigned Tickets
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ticket
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Activity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedTickets.length > 0 ? (
                  assignedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TicketPriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarClock
                            size={16}
                            className="mr-1 text-gray-400"
                          />
                          {formatDistanceToNow(new Date(ticket.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1 text-gray-400" />
                          {formatDistanceToNow(new Date(ticket.updatedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <p>No tickets are currently assigned to you</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentDashboard;
