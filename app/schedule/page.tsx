'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Modal from '@/components/Modal';
import { Calendar, Clock, MapPin, User, BookOpen, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Grid3X3, List } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

interface ISchedule {
  _id: string;
  course: { _id: string; name: string; code: string };
  teacher: { _id: string; name: string };
  group: { _id: string; name: string; level: string };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'cours' | 'td' | 'tp' | 'examen';
  semester: number;
  academicYear: string;
}

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const TYPE_COLORS = {
  cours: 'from-blue-500 to-blue-600',
  td: 'from-emerald-500 to-emerald-600',
  tp: 'from-violet-500 to-violet-600',
  examen: 'from-rose-500 to-rose-600',
};

const TYPE_BG_LIGHT = {
  cours: 'bg-blue-50 border-blue-200',
  td: 'bg-emerald-50 border-emerald-200',
  tp: 'bg-violet-50 border-violet-200',
  examen: 'bg-rose-50 border-rose-200',
};

const TYPE_TEXT = {
  cours: 'text-blue-700',
  td: 'text-emerald-700',
  tp: 'text-violet-700',
  examen: 'text-rose-700',
};

const TYPE_LABELS = {
  cours: 'Lecture',
  td: 'Tutorial',
  tp: 'Lab',
  examen: 'Exam',
};

export default function SchedulePage() {
  const { isAdmin } = usePermissions();
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [scheduleByDay, setScheduleByDay] = useState<Record<string, ISchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ISchedule | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    course: '',
    teacher: '',
    group: '',
    dayOfWeek: 'monday',
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    type: 'cours' as 'cours' | 'td' | 'tp' | 'examen',
    semester: 1,
    academicYear: '2024-2025',
  });

  useEffect(() => {
    fetchSchedules();
    if (isAdmin) {
      fetchCourses();
      fetchTeachers();
      fetchGroups();
    }
  }, [selectedSemester, isAdmin]);

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`/api/schedules?semester=${selectedSemester}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data.schedules);
        setScheduleByDay(data.data.byDay);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) setTeachers(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.success) setGroups(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSchedule ? `/api/schedules/${editingSchedule._id}` : '/api/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        fetchSchedules();
        handleCloseModal();
      } else {
        alert(data.error || 'Error saving schedule');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (schedule: ISchedule) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const res = await fetch(`/api/schedules/${schedule._id}`, { method: 'DELETE' });
      if (res.ok) fetchSchedules();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (schedule: ISchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      course: schedule.course._id,
      teacher: schedule.teacher._id,
      group: schedule.group._id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      type: schedule.type,
      semester: schedule.semester,
      academicYear: schedule.academicYear,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setFormData({
      course: '',
      teacher: '',
      group: '',
      dayOfWeek: 'monday',
      startTime: '08:00',
      endTime: '10:00',
      room: '',
      type: 'cours',
      semester: selectedSemester,
      academicYear: '2024-2025',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading schedule...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter schedules by type
  const filteredScheduleByDay = Object.fromEntries(
    Object.entries(scheduleByDay).map(([day, daySchedules]) => [
      day,
      selectedType === 'all' ? daySchedules : daySchedules.filter(s => s.type === selectedType)
    ])
  );

  const totalClasses = schedules.length;
  const todayClasses = scheduleByDay[DAYS[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1]?.key]?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 text-white">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold">Class Schedule</h1>
              </div>
              <p className="text-blue-100 max-w-md">
                View and manage your weekly class timetable. Stay organized with your courses.
              </p>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Total Classes</p>
                    <p className="text-xl font-bold">{totalClasses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Today</p>
                    <p className="text-xl font-bold">{todayClasses} classes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}
                  title="Grid View"
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'timeline' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/10'}`}
                  title="Timeline View"
                >
                  <List size={20} />
                </button>
              </div>

              {/* Semester Selector */}
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value={1} className="text-gray-900">Semester 1</option>
                <option value={2} className="text-gray-900">Semester 2</option>
              </select>
              
              <ProtectedAction permission="canEditCourse">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20"
                >
                  <Plus size={20} />
                  Add Class
                </button>
              </ProtectedAction>
            </div>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Filter size={16} />
            Filter by type:
          </span>
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedType === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === key
                  ? `bg-gradient-to-r ${TYPE_COLORS[key as keyof typeof TYPE_COLORS]} text-white shadow-lg`
                  : `${TYPE_BG_LIGHT[key as keyof typeof TYPE_BG_LIGHT]} ${TYPE_TEXT[key as keyof typeof TYPE_TEXT]} border hover:shadow-md`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Schedule Grid View */}
        {viewMode === 'grid' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Days Header */}
            <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-900/50">
              {DAYS.map((day, index) => {
                const isToday = new Date().getDay() === (index + 1) % 7;
                return (
                  <div 
                    key={day.key} 
                    className={`p-4 text-center border-b border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${
                      isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className={`text-xs uppercase tracking-wider ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {day.short}
                    </span>
                    <h3 className={`font-bold mt-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {day.label}
                    </h3>
                    {isToday && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Schedule Cards */}
            <div className="grid grid-cols-6 min-h-[600px]">
              {DAYS.map((day, index) => {
                const isToday = new Date().getDay() === (index + 1) % 7;
                return (
                  <div 
                    key={day.key} 
                    className={`p-3 border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${
                      isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {(filteredScheduleByDay[day.key] || [])
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => (
                          <div
                            key={schedule._id}
                            className={`group relative bg-gradient-to-br ${TYPE_COLORS[schedule.type]} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
                          >
                            {/* Time Badge */}
                            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                              {schedule.startTime}
                            </div>

                            {/* Course Info */}
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                                  {schedule.course.code}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm leading-tight line-clamp-2">
                                {schedule.course.name}
                              </h4>
                            </div>

                            {/* Details */}
                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-xs text-white/90">
                                <Clock size={12} className="shrink-0" />
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/90">
                                <MapPin size={12} className="shrink-0" />
                                <span>Room {schedule.room}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/90">
                                <User size={12} className="shrink-0" />
                                <span className="truncate">{schedule.teacher.name}</span>
                              </div>
                            </div>

                            {/* Type & Group Badge */}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                {TYPE_LABELS[schedule.type]}
                              </span>
                              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                {schedule.group.name}
                              </span>
                            </div>
                            
                            {/* Action buttons on hover */}
                            {isAdmin && (
                              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(schedule); }}
                                  className="p-1.5 bg-white/30 backdrop-blur-sm rounded-lg hover:bg-white/50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(schedule); }}
                                  className="p-1.5 bg-white/30 backdrop-blur-sm rounded-lg hover:bg-red-500/50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      {(filteredScheduleByDay[day.key] || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
                          <Calendar size={32} className="opacity-50 mb-2" />
                          <span className="text-sm">No classes</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const daySchedules = (filteredScheduleByDay[day.key] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
              const isToday = new Date().getDay() === (index + 1) % 7;
              
              if (daySchedules.length === 0) return null;
              
              return (
                <div 
                  key={day.key} 
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border ${
                    isToday ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900' : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className={`px-6 py-4 ${isToday ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isToday ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <h3 className={`text-lg font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {day.label}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">Today</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {daySchedules.length} {daySchedules.length === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {daySchedules.map((schedule) => (
                      <div 
                        key={schedule._id} 
                        className="group flex items-stretch hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Time Column */}
                        <div className="w-24 shrink-0 p-4 flex flex-col items-center justify-center border-r border-gray-100 dark:border-gray-700">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{schedule.startTime}</span>
                          <span className="text-xs text-gray-400">to {schedule.endTime}</span>
                        </div>
                        
                        {/* Color Bar */}
                        <div className={`w-1.5 bg-gradient-to-b ${TYPE_COLORS[schedule.type]}`}></div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${TYPE_BG_LIGHT[schedule.type]} ${TYPE_TEXT[schedule.type]}`}>
                                  {schedule.course.code}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300`}>
                                  {TYPE_LABELS[schedule.type]}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {schedule.course.name}
                              </h4>
                            </div>
                            
                            {isAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(schedule)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(schedule)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {schedule.teacher.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              Room {schedule.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen size={14} />
                              {schedule.group.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Class Type Legend</h3>
          <div className="flex flex-wrap items-center gap-6">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${TYPE_COLORS[key as keyof typeof TYPE_COLORS]} shadow-md`}></div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingSchedule ? 'Edit Schedule' : 'Add New Class'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Course *
                </label>
                <select
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Teacher *
                </label>
                <select
                  required
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Group *
                </label>
                <select
                  required
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a group</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Day *
                </label>
                <select
                  required
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Room *
                </label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="A101"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="cours">Lecture</option>
                  <option value="td">Tutorial (TD)</option>
                  <option value="tp">Lab (TP)</option>
                  <option value="examen">Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Semester *
                </label>
                <select
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all"
              >
                {editingSchedule ? 'Update Schedule' : 'Add Class'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
