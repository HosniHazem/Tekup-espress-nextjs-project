import { Ticket } from '../../types';

interface TicketPriorityBadgeProps {
  priority: Ticket['priority'];
  className?: string;
}

function TicketPriorityBadge({ priority, className = '' }: TicketPriorityBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const priorityClasses = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };
  
  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent"
  };

  return (
    <span className={`${baseClasses} ${priorityClasses[priority]} ${className}`}>
      {priorityLabels[priority]}
    </span>
  );
}

export default TicketPriorityBadge;