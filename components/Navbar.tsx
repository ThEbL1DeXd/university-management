'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useSession } from 'next-auth/react';
import { Moon, Sun, Bell, Search, Settings, ChevronDown, X, BookOpen, Users, GraduationCap, BarChart3, Building2, Award } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const { can, canAccess, role, isLoading } = usePermissions();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('👋 Bonjour');
  const [currentDate, setCurrentDate] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set greeting and date on client side only
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('🌅 Bonjour');
    } else if (hour < 18) {
      setGreeting('☀️ Bon après-midi');
    } else {
      setGreeting('🌙 Bonsoir');
    }
    
    setCurrentDate(new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowSettings(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchModal]);

  // Quick search items (tous les items possibles)
  const allQuickSearchItems = [
    { icon: <Users size={20} />, title: 'Étudiants', path: '/students', gradient: 'from-blue-500 to-cyan-500', permission: 'canViewAllStudents' as const },
    { icon: <GraduationCap size={20} />, title: 'Enseignants', path: '/teachers', gradient: 'from-green-500 to-emerald-500', permission: 'canViewAllTeachers' as const },
    { icon: <BookOpen size={20} />, title: 'Cours', path: '/courses', gradient: 'from-purple-500 to-pink-500', permission: 'canViewAllCourses' as const },
    { icon: <Award size={20} />, title: 'Notes', path: '/grades', gradient: 'from-orange-500 to-amber-500', permission: null }, // Toujours visible
    { icon: <Users size={20} />, title: 'Groupes', path: '/groups', gradient: 'from-indigo-500 to-purple-500', permission: 'canViewAllGroups' as const },
    { icon: <Building2 size={20} />, title: 'Départements', path: '/departments', gradient: 'from-red-500 to-rose-500', permission: 'canViewAllDepartments' as const },
  ];

  // Filtrer les items selon les permissions de l'utilisateur
  const quickSearchItems = allQuickSearchItems.filter(item => {
    // Si pas de permission requise, toujours visible
    if (!item.permission) return true;
    // Sinon, vérifier si l'utilisateur a la permission
    return can(item.permission);
  });

  const handleSearch = (item: typeof quickSearchItems[0]) => {
    router.push(item.path);
    setShowSearchModal(false);
    setSearchQuery('');
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left Side - Greeting & Title */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="hidden lg:block w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {mounted ? `${greeting}, ${session?.user?.name?.split(' ')[0] || 'Utilisateur'} !` : 'Bienvenue !'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {mounted ? currentDate : '...'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button 
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gray-100/80 dark:bg-gray-700/50 hover:bg-gray-200/80 dark:hover:bg-gray-600/50 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-600 group cursor-pointer"
            aria-label="Search"
          >
            <Search size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Rechercher...</span>
            <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-110 group"
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              <Moon 
                size={20} 
                className={`absolute inset-0 text-gray-700 dark:text-gray-300 transition-all duration-300 ${
                  theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`} 
              />
              <Sun 
                size={20} 
                className={`absolute inset-0 text-yellow-500 transition-all duration-300 ${
                  theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
                }`} 
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-orange-400/0 group-hover:from-yellow-400/10 group-hover:to-orange-400/10 rounded-xl transition-all duration-200"></div>
          </button>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hidden lg:flex p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-90 group"
              aria-label="Settings"
            >
              <Settings size={20} className="text-gray-700 dark:text-gray-300 transition-transform duration-200" />
            </button>

            {/* Settings Dropdown */}
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Paramètres</h3>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Theme Setting */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Thème de l'interface
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (theme !== 'light') toggleTheme();
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                            theme === 'light'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <Sun size={16} className="inline mr-2" />
                          Clair
                        </button>
                        <button
                          onClick={() => {
                            if (theme !== 'dark') toggleTheme();
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg border transition-all ${
                            theme === 'dark'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <Moon size={16} className="inline mr-2" />
                          Sombre
                        </button>
                      </div>
                    </div>

                    {/* Language Setting */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Langue
                      </label>
                      <select className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>🇫🇷 Français</option>
                        <option>🇬🇧 English</option>
                        <option>🇪🇸 Español</option>
                        <option>🇩🇪 Deutsch</option>
                      </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notifications
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Notifications email</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Sons des notifications</span>
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Notifications push</span>
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <button 
                      onClick={() => router.push('/settings')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg"
                    >
                      Tous les paramètres
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-3 pr-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105 group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown 
                size={18} 
                className={`hidden md:block text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {session?.user?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                        <span className="font-medium">Mon profil</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg group-hover:scale-110 group-hover:rotate-90 transition-transform">⚙️</span>
                        <span className="font-medium">Paramètres</span>
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push('/help');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg group-hover:scale-110 transition-transform">❓</span>
                        <span className="font-medium">Aide</span>
                      </span>
                    </button>
                    <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Ajouter la logique de déconnexion ici
                        if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                          router.push('/api/auth/signout');
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                        <span className="font-medium">Déconnexion</span>
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher des pages, étudiants, cours..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-lg"
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Accès rapide
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickSearchItems
                  .filter(item => 
                    searchQuery === '' || 
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.title}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↑</kbd>
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↓</kbd>
                    <span className="ml-1">pour naviguer</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd>
                    <span className="ml-1">pour sélectionner</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
                  <span className="ml-1">pour fermer</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
