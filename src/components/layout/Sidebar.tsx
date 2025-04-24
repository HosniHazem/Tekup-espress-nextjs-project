import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Settings, 
  X,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
    { name: 'Tickets', href: '/tickets', icon: Ticket, show: true },
    { name: 'Create Ticket', href: '/tickets/create', icon: PlusCircle, show: true },
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3, show: user?.role === 'admin' },
    { name: 'Agent Dashboard', href: '/agent', icon: Users, show: user?.role === 'admin' || user?.role === 'agent' },
    { name: 'Settings', href: '/profile', icon: Settings, show: true },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between md:hidden p-4">
          <div className="flex items-center">
            <span className="font-bold text-lg text-blue-600">Support Desk</span>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Logo */}
        <div className="hidden md:flex items-center h-16 px-6">
          <div className="flex items-center">
            <LifeBuoy size={24} className="text-blue-600" />
            <span className="ml-2 font-bold text-lg text-gray-900">Support Desk</span>
          </div>
        </div>
        
        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.filter(item => item.show).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
                ${isActive(item.href) 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
              onClick={() => setOpen(false)}
            >
              <item.icon size={20} className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

export default Sidebar;