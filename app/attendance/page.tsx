'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  QrCode,
  Download,
  Filter,
  BarChart3,
  UserCheck,
  UserX
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; matricule: string };
  course: { _id: string; name: string; code: string };
  group: { _id: string; name: string; code: string };
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkInMethod?: string;
  notes?: string;
}

interface AttendanceStats {
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const { isAdmin, isTeacher, isStudent } = usePermissions();
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, string>>({});
  
  const [qrCodeToken, setQrCodeToken] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    fetchGroups();
    fetchStats();
    fetchAttendance(); // Load all attendance records on first render
  }, []);

  useEffect(() => {
    // Only reload when filters actually change (not on initial mount)
    if (selectedCourse || selectedGroup || selectedDate !== new Date().toISOString().split('T')[0]) {
      fetchAttendance();
    }
    if (selectedGroup) {
      fetchStudentsByGroup();
    }
  }, [selectedCourse, selectedGroup, selectedDate]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.success) {
        setGroups(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  const fetchStudentsByGroup = async () => {
    if (!selectedGroup) return;
    try {
      const res = await fetch(`/api/students?groupId=${selectedGroup}`);
      const data = await res.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = '/api/attendance?';
      if (selectedCourse) url += `courseId=${selectedCourse}&`;
      if (selectedGroup) url += `groupId=${selectedGroup}&`;
      if (selectedDate) url += `date=${selectedDate}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAttendance(data.data || []);
      } else {
        console.error('API error:', data.error);
        setAttendance([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/attendance/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data || null);
      } else {
        console.error('Stats API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedCourse || !selectedGroup) {
      alert('Veuillez sélectionner un cours et un groupe');
      return;
    }

    const teacherId = (session?.user as any)?.relatedId;
    
    const records = Object.entries(attendanceMarks).map(([studentId, status]) => ({
      student: studentId,
      course: selectedCourse,
      group: selectedGroup,
      date: selectedDate,
      status,
      markedBy: teacherId,
      checkInMethod: 'manual',
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      });

      if (res.ok) {
        alert('Présences enregistrées avec succès!');
        setIsMarkingAttendance(false);
        setAttendanceMarks({});
        fetchAttendance();
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const generateQRCode = async () => {
    if (!selectedCourse || !selectedGroup) {
      alert('Veuillez sélectionner un cours et un groupe');
      return;
    }

    try {
      const res = await fetch('/api/attendance/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          groupId: selectedGroup,
          validityMinutes: 15,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setQrCodeToken(data.data.token);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'excused': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} className="text-green-500" />;
      case 'absent': return <XCircle size={16} className="text-red-500" />;
      case 'late': return <Clock size={16} className="text-yellow-500" />;
      case 'excused': return <AlertCircle size={16} className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Présences</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isStudent ? 'Consultez vos présences et absences' : 'Suivi et gestion des présences des étudiants'}
            </p>
          </div>
          
          {(isAdmin || isTeacher) && (
            <div className="flex gap-2">
              <button
                onClick={generateQRCode}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <QrCode size={20} />
                Générer QR Code
              </button>
              <button
                onClick={() => setIsMarkingAttendance(!isMarkingAttendance)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserCheck size={20} />
                {isMarkingAttendance ? 'Annuler' : 'Marquer Présences'}
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.summary.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Présents</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.summary.present}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Absents</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.summary.absent}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Retards</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.summary.late}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <BarChart3 size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Taux</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.summary.attendanceRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!isStudent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cours</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Tous les cours</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>{course.name} ({course.code})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Groupe</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Tous les groupes</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>{group.name} ({group.code})</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Marking Attendance Section */}
        {isMarkingAttendance && (isAdmin || isTeacher) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Marquer les présences - {selectedDate}
            </h3>
            
            {students.length > 0 ? (
              <>
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.matricule}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {['present', 'absent', 'late', 'excused'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setAttendanceMarks({ ...attendanceMarks, [student._id]: status })}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              attendanceMarks[student._id] === status
                                ? getStatusColor(status)
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                          >
                            {status === 'present' && 'Présent'}
                            {status === 'absent' && 'Absent'}
                            {status === 'late' && 'Retard'}
                            {status === 'excused' && 'Excusé'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleMarkAttendance}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Enregistrer les présences
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Sélectionnez un groupe pour voir les étudiants
              </p>
            )}
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Historique des présences</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {!isStudent && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Étudiant</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Matricule</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Cours</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Méthode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {attendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {!isStudent && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.student?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.student?.matricule}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.course?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status === 'present' && 'Présent'}
                          {record.status === 'absent' && 'Absent'}
                          {record.status === 'late' && 'Retard'}
                          {record.status === 'excused' && 'Excusé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkInMethod === 'qr_code' && (
                          <span className="inline-flex items-center gap-1 text-purple-600">
                            <QrCode size={14} /> QR Code
                          </span>
                        )}
                        {record.checkInMethod === 'manual' && 'Manuel'}
                        {!record.checkInMethod && '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun enregistrement de présence trouvé
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                QR Code de Présence
              </h3>
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `${window.location.origin}/api/attendance/qr?token=${qrCodeToken}`
                  )}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Les étudiants peuvent scanner ce code pour marquer leur présence.
                <br />
                <span className="text-yellow-600">Valide pendant 15 minutes</span>
              </p>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
