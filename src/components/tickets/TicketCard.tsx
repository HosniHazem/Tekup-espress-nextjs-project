import { Link } from "react-router-dom";
import { Ticket } from "../../types";
import TicketStatusBadge from "./TicketStatusBadge";
import TicketPriorityBadge from "./TicketPriorityBadge";
import { CalendarClock, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TicketCardProps {
  ticket: Ticket;
}

function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link
      to={`/tickets/${ticket._id}`}
      className="block hover:bg-gray-50 transition-colors duration-150 ease-in-out"
    >
      <div className="p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {ticket.title}
          </h3>
          <div className="flex space-x-2">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarClock size={16} className="mr-1" />
            {formatDistanceToNow(new Date(ticket.createdAt), {
              addSuffix: true,
            })}
          </div>

          <div className="flex items-center">
            <MessageSquare size={16} className="mr-1" />
            {ticket.comments.length}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TicketCard;
