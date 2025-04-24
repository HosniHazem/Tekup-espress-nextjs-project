import { Ticket } from '../../types';

interface TicketStatusBadgeProps {
  status: Ticket['status'];
  className?: string;
}

function TicketStatusBadge({ status, className = '' }: TicketStatusBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const statusClasses = {
    open: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800"
  };
  
  const statusLabels = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed"
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}

export default TicketStatusBadge;