'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  ClipboardList,
  LogOut,
  Menu,
  X,
  UsersRound,
  Sparkles,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';
import { canAccessRoute, UserRole } from '@/lib/permissions';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Étudiants', href: '/students', icon: Users },
  { name: 'Enseignants', href: '/teachers', icon: GraduationCap },
  { name: 'Cours', href: '/courses', icon: BookOpen },
  { name: 'Groupes', href: '/groups', icon: UsersRound },
  { name: 'Départements', href: '/departments', icon: Building2 },
  { name: 'Notes', href: '/grades', icon: ClipboardList },
  { name: 'Présences', href: '/attendance', icon: UserCheck },
  { name: 'Emploi du temps', href: '/schedule', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  const userRole = (session?.user as any)?.role as UserRole || 'student';

  // Filtrer les éléments du menu selon le rôle
  const filteredMenuItems = menuItems.filter(item => canAccessRoute(userRole, item.href));

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Get role badge color
  const getRoleBadge = () => {
    switch(userRole) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      case 'teacher':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'student':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
      >
        {isOpen ? <X size={24} className="text-gray-700 dark:text-gray-200" /> : <Menu size={24} className="text-gray-700 dark:text-gray-200" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={`
          fixed top-0 left-0 h-full w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl z-40
          transition-all duration-300 ease-in-out border-r border-gray-200/50 dark:border-gray-700/50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        <div suppressHydrationWarning className="flex flex-col h-full relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          {/* Logo */}
          <div className="relative p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  UniManage
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Gestion Universitaire
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <ul className="space-y-1.5">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                        ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-105'
                        }
                      `}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                      )}
                      
                      <div className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'}
                      `}>
                        <Icon size={20} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                      </div>
                      <span className="font-medium">{item.name}</span>
                      
                      {/* Hover effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-200"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="relative p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-950/30">
            {session?.user && (
              <div className="mb-3 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {session.user.name || session.user.email}
                    </p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge()} shadow-sm mt-1`}>
                      {userRole === 'admin' ? '👑 Admin' : userRole === 'teacher' ? '👨‍🏫 Enseignant' : '👨‍🎓 Étudiant'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="group flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
          border-radius: 3px;
        }
        
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99);
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </>
  );
}
