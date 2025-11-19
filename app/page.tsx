'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Users, GraduationCap, BookOpen, Building2, TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface GlobalStats {
  role: 'admin';
  counts: {
    students: number;
    teachers: number;
    courses: number;
    departments: number;
    grades: number;
  };
  studentsByDepartment: Array<{
    name: string;
    count: number;
  }>;
  averageGrade: number;
}

interface TeacherStats {
  role: 'teacher';
  teacherInfo: {
    name: string;
    email: string;
    department: string;
    specialization: string;
  };
  counts: {
    coursesTeaching: number;
    totalStudents: number;
    gradesSubmitted: number;
    averageGrade: number;
  };
  statsByCourse: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    studentsEnrolled: number;
    gradesSubmitted: number;
    averageGrade: number;
  }>;
  gradeDistribution: Array<{
    range: string;
    count: number;
    label: string;
  }>;
  recentGrades: Array<{
    student: string;
    matricule: string;
    course: string;
    code: string;
    grade: number;
    examType: string;
    date: string;
  }>;
  recentActivity: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    studentsEnrolled: number;
    gradesSubmitted: number;
    averageGrade: number;
  }>;
}

interface StudentStats {
  role: 'student';
  studentInfo: {
    name: string;
    matricule: string;
    department: string;
  };
  counts: {
    enrolledCourses: number;
    totalGrades: number;
    averageGrade: number;
  };
  gradesByCourse: Array<{
    courseName: string;
    courseCode: string;
    average: number;
    count: number;
  }>;
  gradeDistribution: Array<{
    range: string;
    count: number;
    label: string;
  }>;
  recentGrades: Array<{
    course: string;
    code: string;
    grade: number;
    examType: string;
    date: string;
  }>;
}

type Stats = GlobalStats | TeacherStats | StudentStats;

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function HomePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Render student dashboard
  if (stats?.role === 'student') {
    return <StudentDashboard stats={stats} />;
  }

  // Render teacher dashboard
  if (stats?.role === 'teacher') {
    return <TeacherDashboard stats={stats} />;
  }

  // Render admin dashboard
  return <AdminDashboard stats={stats as GlobalStats} />;
}

// Student Dashboard Component
function StudentDashboard({ stats }: { stats: StudentStats }) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 dark:text-green-400';
    if (grade >= 80) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (grade >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceMessage = (avg: number) => {
    if (avg >= 90) return { message: 'Excellent travail ! Continue comme ça ! 🌟', color: 'text-green-600 dark:text-green-400' };
    if (avg >= 80) return { message: 'Très bon travail ! 👍', color: 'text-blue-600 dark:text-blue-400' };
    if (avg >= 70) return { message: 'Bon travail, continue tes efforts ! 💪', color: 'text-yellow-600 dark:text-yellow-400' };
    if (avg >= 60) return { message: 'Tu peux faire mieux, courage ! 📚', color: 'text-orange-600 dark:text-orange-400' };
    return { message: 'Il faut travailler davantage 🎯', color: 'text-red-600 dark:text-red-400' };
  };

  const performance = getPerformanceMessage(stats.counts.averageGrade);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header with Modern Gradient and Glassmorphism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Bienvenue, {stats.studentInfo.name} ! 👋
                </h1>
                <p className="text-white/90 mt-1 text-lg">
                  {stats.studentInfo.matricule} • {stats.studentInfo.department}
                </p>
              </div>
            </div>
            
            <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold">
                {performance.message}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - Courses */}
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.enrolledCourses}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Cours inscrits</h3>
              <p className="text-white/80 text-sm">Cours actifs ce semestre</p>
            </div>
          </div>

          {/* Card 2 - Grades */}
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.totalGrades}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Notes enregistrées</h3>
              <p className="text-white/80 text-sm">Évaluations totales</p>
            </div>
          </div>

          {/* Card 3 - Average */}
          <div className={`group relative bg-gradient-to-br ${
            stats.counts.averageGrade >= 90 ? 'from-green-500 to-emerald-600' :
            stats.counts.averageGrade >= 80 ? 'from-blue-500 to-cyan-600' :
            stats.counts.averageGrade >= 60 ? 'from-orange-500 to-amber-600' :
            'from-red-500 to-rose-600'
          } rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.averageGrade}<span className="text-2xl">/100</span></div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Moyenne générale</h3>
              <p className="text-white/80 text-sm">Performance globale</p>
            </div>
          </div>
        </div>

        {/* Charts with Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Moyennes par cours */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Moyennes par cours
              </h3>
            </div>
            {stats.gradesByCourse && stats.gradesByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.gradesByCourse} layout="vertical">
                  <defs>
                    <linearGradient id="colorAverage" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                  <YAxis 
                    type="category" 
                    dataKey="courseCode" 
                    width={80}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    className="text-gray-600 dark:text-gray-400"
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="average" fill="url(#colorAverage)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                <BookOpen size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Aucune note disponible</p>
              </div>
            )}
          </div>

          {/* Distribution des notes */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Distribution de tes notes
              </h3>
            </div>
            {stats.gradeDistribution && stats.gradeDistribution.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {stats.gradeDistribution.map((entry, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1}/>
                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={stats.gradeDistribution.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }: any) => `${label}: ${count}`}
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {stats.gradeDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${index})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                <TrendingUp size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Aucune note disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Grades - Modern Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dernières notes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vos 5 évaluations les plus récentes
                </p>
              </div>
            </div>
          </div>
          
          {stats.recentGrades && stats.recentGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cours</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Code</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Note</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentGrades.map((grade, index) => (
                    <tr 
                      key={index} 
                      className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{grade.course}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {grade.code}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {grade.examType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold ${
                            grade.grade >= 90 ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' :
                            grade.grade >= 80 ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white' :
                            grade.grade >= 70 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                            grade.grade >= 60 ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white' :
                            'bg-gradient-to-br from-red-500 to-rose-600 text-white'
                          } group-hover:scale-110 transition-transform shadow-lg`}>
                            <span className="text-2xl">{grade.grade}</span>
                            <span className="text-xs opacity-90">/100</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="opacity-50" />
                          {new Date(grade.date).toLocaleDateString('fr-FR', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 p-6">
              <Calendar size={48} className="mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">Aucune note disponible</p>
              <p className="text-sm">Les notes apparaîtront ici dès qu'elles seront publiées</p>
            </div>
          )}
        </div>

        {/* Quick Actions - Modern Cards */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
            Accès rapide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/courses"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Mes cours</h4>
                <p className="text-white/80 text-sm">Consulter mes cours inscrits</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a
              href="/grades"
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Mes notes</h4>
                <p className="text-white/80 text-sm">Voir toutes mes évaluations</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Teacher Dashboard Component - Modern Design
function TeacherDashboard({ stats }: { stats: TeacherStats }) {
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'from-green-400 to-emerald-500';
    if (grade >= 80) return 'from-blue-400 to-cyan-500';
    if (grade >= 70) return 'from-yellow-400 to-amber-500';
    if (grade >= 60) return 'from-orange-400 to-red-400';
    return 'from-red-500 to-rose-600';
  };

  const getPerformanceMessage = (avg: number) => {
    if (avg >= 85) return { message: 'Excellents résultats de vos étudiants ! 🌟', color: 'text-green-600' };
    if (avg >= 75) return { message: 'Très bons résultats globaux ! 👍', color: 'text-blue-600' };
    if (avg >= 65) return { message: 'Résultats satisfaisants 📚', color: 'text-yellow-600' };
    return { message: 'Besoin d\'accompagnement supplémentaire 🎯', color: 'text-orange-600' };
  };

  const performance = getPerformanceMessage(stats.counts.averageGrade);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header with Modern Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl shadow-2xl p-8 text-white">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Bienvenue, {stats.teacherInfo.name} ! 👨‍🏫
                </h1>
                <p className="text-white/90 mt-1 text-lg">
                  {stats.teacherInfo.specialization} • {stats.teacherInfo.department}
                </p>
              </div>
            </div>
            
            <div className="mt-6 inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold">
                {performance.message}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 - Courses Teaching */}
          <div className="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.coursesTeaching}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Cours enseignés</h3>
              <p className="text-white/80 text-sm">Ce semestre</p>
            </div>
          </div>

          {/* Card 2 - Total Students */}
          <div className="group relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.totalStudents}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Étudiants</h3>
              <p className="text-white/80 text-sm">Total inscrit</p>
            </div>
          </div>

          {/* Card 3 - Grades Submitted */}
          <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.gradesSubmitted}</div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Notes soumises</h3>
              <p className="text-white/80 text-sm">Évaluations totales</p>
            </div>
          </div>

          {/* Card 4 - Average Grade */}
          <div className={`group relative bg-gradient-to-br ${
            stats.counts.averageGrade >= 85 ? 'from-green-500 to-emerald-600' :
            stats.counts.averageGrade >= 75 ? 'from-blue-500 to-cyan-600' :
            stats.counts.averageGrade >= 65 ? 'from-orange-500 to-amber-600' :
            'from-red-500 to-rose-600'
          } rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div className="text-4xl font-bold">{stats.counts.averageGrade}<span className="text-2xl">/100</span></div>
              </div>
              <h3 className="text-lg font-semibold mb-1">Moyenne générale</h3>
              <p className="text-white/80 text-sm">Notes moyennes</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats by Course */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Moyennes par cours
              </h3>
            </div>
            {stats.statsByCourse && stats.statsByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.statsByCourse} layout="vertical">
                  <defs>
                    <linearGradient id="colorTeacherAvg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                  <YAxis 
                    type="category" 
                    dataKey="courseCode" 
                    width={80}
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
                  />
                  <Bar 
                    dataKey="averageGrade" 
                    fill="url(#colorTeacherAvg)"
                    radius={[0, 8, 8, 0]}
                    name="Moyenne"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Grade Distribution */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Distribution des notes
              </h3>
            </div>
            {stats.gradeDistribution && stats.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={index} id={`gradTeacher${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={stats.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    label={(entry: any) => `${entry.label} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {stats.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradTeacher${index % COLORS.length})`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Grades Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                  Dernières notes soumises
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  5 notes les plus récentes
                </p>
              </div>
            </div>
          </div>
          
          {stats.recentGrades && stats.recentGrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Étudiant</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Matricule</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Cours</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Note</th>
                    <th className="text-left py-4 px-6 font-semibold text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentGrades.map((grade, index) => (
                    <tr 
                      key={index} 
                      className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{grade.student}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {grade.matricule}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{grade.course}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{grade.code}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                          {grade.examType}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold bg-gradient-to-br ${getGradeColor(grade.grade)} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                            <span className="text-2xl">{grade.grade}</span>
                            <span className="text-xs opacity-90">/100</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="opacity-50" />
                          {new Date(grade.date).toLocaleDateString('fr-FR', { 
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 p-6">
              <Calendar size={48} className="mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">Aucune note disponible</p>
              <p className="text-sm">Les notes apparaîtront ici après soumission</p>
            </div>
          )}
        </div>

        {/* Course Activity Cards */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"></div>
            Activité des cours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.statsByCourse && stats.statsByCourse.slice(0, 6).map((course, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{course.courseName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{course.courseCode}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Étudiants:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{course.studentsEnrolled}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{course.gradesSubmitted}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Moyenne:</span>
                      <span className={`font-bold px-2 py-1 rounded-lg bg-gradient-to-r ${getGradeColor(course.averageGrade)} text-white text-xs`}>
                        {course.averageGrade}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg"></div>
            Accès rapide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/courses"
              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Mes cours</h4>
                <p className="text-white/80 text-sm">Gérer les cours enseignés</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a
              href="/grades"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Notes</h4>
                <p className="text-white/80 text-sm">Saisir et consulter les notes</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/students"
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">Étudiants</h4>
                <p className="text-white/80 text-sm">Liste des étudiants inscrits</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Admin/Teacher Dashboard Component
function AdminDashboard({ stats }: { stats: GlobalStats }) {

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Vue d'ensemble du système universitaire
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Étudiants"
            value={stats?.counts.students || 0}
            icon={<Users size={24} />}
            color="blue"
          />
          <StatCard
            title="Enseignants"
            value={stats?.counts.teachers || 0}
            icon={<GraduationCap size={24} />}
            color="green"
          />
          <StatCard
            title="Cours"
            value={stats?.counts.courses || 0}
            icon={<BookOpen size={24} />}
            color="purple"
          />
          <StatCard
            title="Départements"
            value={stats?.counts.departments || 0}
            icon={<Building2 size={24} />}
            color="orange"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatCard
            title="Notes enregistrées"
            value={stats?.counts.grades || 0}
            icon={<TrendingUp size={24} />}
            color="red"
            subtitle="Total des évaluations"
          />
          <StatCard
            title="Moyenne générale"
            value={stats?.averageGrade ? `${stats.averageGrade.toFixed(1)}/100` : 'N/A'}
            icon={<TrendingUp size={24} />}
            color="green"
            subtitle="Performance globale"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Students by Department */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Étudiants par département
            </h3>
            {stats?.studentsByDepartment && stats.studentsByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.studentsByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor' }}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" name="Étudiants" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Aucune donnée disponible
              </div>
            )}
          </div>

          {/* Pie Chart - Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribution par département
            </h3>
            {stats?.studentsByDepartment && stats.studentsByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.studentsByDepartment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.studentsByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions rapides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/students"
              className="flex items-center gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="font-medium text-gray-900 dark:text-white">Gérer les étudiants</span>
            </a>
            <a
              href="/teachers"
              className="flex items-center gap-3 p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <GraduationCap className="text-green-600 dark:text-green-400" size={24} />
              <span className="font-medium text-gray-900 dark:text-white">Gérer les enseignants</span>
            </a>
            <a
              href="/courses"
              className="flex items-center gap-3 p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
              <span className="font-medium text-gray-900 dark:text-white">Gérer les cours</span>
            </a>
            <a
              href="/grades"
              className="flex items-center gap-3 p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
              <span className="font-medium text-gray-900 dark:text-white">Gérer les notes</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
