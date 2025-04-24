import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Ticket, Comment } from "../types";
import TicketStatusBadge from "../components/tickets/TicketStatusBadge";
import TicketPriorityBadge from "../components/tickets/TicketPriorityBadge";
import { Loader2, Send, Calendar, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { ticketsAPI } from "../utils/api";

function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAgent = user?.role === "agent" || user?.role === "admin";

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await ticketsAPI.getById(id);
        setTicket(data);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        setError("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleStatusChange = async (newStatus: Ticket["status"]) => {
    if (!ticket || !id) return;

    setStatusChanging(true);
    try {
      const updatedTicket = await ticketsAPI.update(id, {
        status: newStatus,
      });
      setTicket({
        ...ticket,
        status: newStatus,
        updatedAt: updatedTicket.updatedAt,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
      setError("Failed to update ticket status");
    } finally {
      setStatusChanging(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim() || !id) return;

    setSubmittingComment(true);
    try {
      const newComment = await ticketsAPI.addComment(id, comment);
      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        };
      });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-sm text-red-700">{error || "Ticket not found"}</p>
        <button
          onClick={() => navigate("/tickets")}
          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/tickets")}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          &larr; Back to tickets
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Ticket header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">
              {ticket.title}
            </h1>
            <div className="flex space-x-2">
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
            </div>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              Created{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
              {ticket.assignedTo
                ? `Assigned to ${ticket.assignedTo.name}`
                : "Unassigned"}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {ticket.category}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket description */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">
            Description
          </h2>
          <p className="text-gray-900 whitespace-pre-line">
            {ticket.description}
          </p>
        </div>

        {/* Status actions - only visible to agents/admins */}
        {isAgent && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange("open")}
                disabled={ticket.status === "open" || statusChanging}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                  ticket.status === "open"
                    ? "bg-yellow-100 text-yellow-800 cursor-default"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Open
              </button>
              <button
                onClick={() => handleStatusChange("in_progress")}
                disabled={ticket.status === "in_progress" || statusChanging}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                  ticket.status === "in_progress"
                    ? "bg-blue-100 text-blue-800 cursor-default"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("resolved")}
                disabled={ticket.status === "resolved" || statusChanging}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                  ticket.status === "resolved"
                    ? "bg-green-100 text-green-800 cursor-default"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Resolved
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                disabled={ticket.status === "closed" || statusChanging}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                  ticket.status === "closed"
                    ? "bg-gray-100 text-gray-800 cursor-default"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Closed
              </button>

              {statusChanging && (
                <span className="inline-flex items-center text-sm text-gray-500">
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Updating...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Comments ({ticket.comments.length})
          </h2>

          <div className="space-y-6 mb-6">
            {ticket.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              ticket.comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        comment.isStaff
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <User size={20} />
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {comment.userName}
                        {comment.isStaff && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Staff
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(comment.createdAt),
                          "MMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                    <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form */}
          <form onSubmit={handleSubmitComment}>
            <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <textarea
                rows={3}
                name="comment"
                id="comment"
                className="block w-full py-3 border-0 resize-none focus:ring-0 sm:text-sm"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>

              <div className="py-2 px-3 flex justify-between items-center">
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    Support team will be notified
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!comment.trim() || submittingComment}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !comment.trim() || submittingComment
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {submittingComment ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TicketDetails;
