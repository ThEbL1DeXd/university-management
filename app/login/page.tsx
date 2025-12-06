'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, User, GraduationCap, Shield, Copy, Check } from 'lucide-react';

// Demo accounts for easy login
const demoAccounts = [
  {
    role: 'Admin',
    email: 'admin@university.edu',
    password: 'password123',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    description: 'Accès complet'
  },
  {
    role: 'Enseignant',
    email: 'jean.dupont@university.edu',
    password: 'password123',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Jean Dupont - INFO'
  },
  {
    role: 'Enseignant',
    email: 'marie.lambert@university.edu',
    password: 'password123',
    icon: GraduationCap,
    color: 'from-purple-500 to-pink-500',
    description: 'Marie Lambert - INFO'
  },
  {
    role: 'Étudiant',
    email: 'alice.martin@etu.university.edu',
    password: 'password123',
    icon: User,
    color: 'from-green-500 to-emerald-500',
    description: 'Alice Martin - L1 INFO'
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (account: typeof demoAccounts[0], index: number) => {
    setEmail(account.email);
    setPassword(account.password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <LogIn className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            UniManage
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Système de Gestion Universitaire
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Login Cards */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Connexion rapide (cliquez pour remplir)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account, index) => {
              const Icon = account.icon;
              return (
                <button
                  key={index}
                  onClick={() => fillCredentials(account, index)}
                  className="group relative p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 text-left overflow-hidden"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${account.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  
                  <div className="relative flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${account.color} text-white flex-shrink-0`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {account.role}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {account.description}
                      </p>
                    </div>
                    {copiedIndex === index ? (
                      <Check size={14} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Copy size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Password hint */}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Lock size={12} />
              <span>Mot de passe pour tous: <code className="px-1.5 py-0.5 bg-amber-200 dark:bg-amber-800 rounded font-mono font-bold">password123</code></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
