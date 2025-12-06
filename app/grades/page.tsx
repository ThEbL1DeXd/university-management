'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

export default function GradesPage() {
  const { data: session } = useSession();
  const { permissions, isStudent, isAdmin, isTeacher, can } = usePermissions();
  const [grades, setGrades] = useState<any[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherCanEditGrades, setTeacherCanEditGrades] = useState(false);
  
  // Check if user can perform any action on grades
  // For teachers, we need to check the canEditGrades field from the database
  const canEditOrDelete = isAdmin || (isTeacher && teacherCanEditGrades);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    student: '',
    course: '',
    grade: 0,
    examType: 'Final',
    comments: '',
  });

  // Check if the current teacher has permission to edit grades
  const checkTeacherGradesPermission = async () => {
    try {
      const relatedId = (session?.user as any)?.relatedId;
      if (!relatedId) {
        console.log('No relatedId found');
        return;
      }
      
      const res = await fetch(`/api/teachers/${relatedId}`);
      const data = await res.json();
      console.log('Teacher data:', data);
      if (data.success && data.data) {
        setTeacherCanEditGrades(data.data.canEditGrades === true);
      }
    } catch (error) {
      console.error('Error checking teacher permission:', error);
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchStudents();
    fetchCourses();
  }, []);

  // Check teacher permission when session is available
  useEffect(() => {
    if (isTeacher && session?.user) {
      checkTeacherGradesPermission();
    }
  }, [isTeacher, session]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = grades.filter((g) =>
      g.student?.name?.toLowerCase().includes(query) ||
      g.student?.matricule?.toLowerCase().includes(query) ||
      g.course?.name?.toLowerCase().includes(query) ||
      g.course?.code?.toLowerCase().includes(query) ||
      g.examType?.toLowerCase().includes(query) ||
      g.grade?.toString().includes(query)
    );
    setFilteredGrades(filtered);
  }, [searchQuery, grades]);

  const fetchGrades = async () => {
    try {
      const res = await fetch('/api/grades');
      const data = await res.json();
      if (data.success) setGrades(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Error:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGrade ? `/api/grades/${editingGrade._id}` : '/api/grades';
      const method = editingGrade ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchGrades();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (grade: any) => {
    if (!confirm('Supprimer cette note ?')) return;
    
    try {
      const res = await fetch(`/api/grades/${grade._id}`, { method: 'DELETE' });
      if (res.ok) fetchGrades();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setFormData({
      student: typeof grade.student === 'object' ? grade.student._id : grade.student,
      course: typeof grade.course === 'object' ? grade.course._id : grade.course,
      grade: grade.grade,
      examType: grade.examType,
      comments: grade.comments || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
    setFormData({ student: '', course: '', grade: 0, examType: 'Final', comments: '' });
  };

  const columns = [
    { header: 'Étudiant', accessor: ((g: any) => g.student?.name || 'N/A') as any, sortKey: 'student.name', sortable: true },
    { header: 'Matricule', accessor: ((g: any) => g.student?.matricule || 'N/A') as any, sortKey: 'student.matricule', sortable: true },
    { header: 'Cours', accessor: ((g: any) => g.course?.name || 'N/A') as any, sortKey: 'course.name', sortable: true },
    { header: 'Type', accessor: 'examType', sortable: true },
    { 
      header: 'Note', 
      accessor: ((g: any) => `${g.grade}/100`) as any,
      sortKey: 'grade',
      sortable: true,
      cell: (value: any, grade: any) => (
        <span className={`font-semibold ${grade.grade >= 60 ? 'text-green-600' : 'text-red-600'}`}>
          {value}
        </span>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gérer les notes des étudiants</p>
          </div>
          {canEditOrDelete && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Ajouter une note
            </button>
          )}
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par étudiant, matricule, cours, type..."
        />

        <DataTable
          data={filteredGrades}
          columns={columns}
          actions={canEditOrDelete ? (grade) => (
            <div className="flex gap-2">
              <button onClick={() => handleEdit(grade)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                <Edit size={18} />
              </button>
              {isAdmin && (
                <button onClick={() => handleDelete(grade)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ) : undefined}
        />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGrade ? 'Modifier' : 'Ajouter'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Étudiant *</label>
              <select required value={formData.student} onChange={(e) => setFormData({ ...formData, student: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Sélectionner</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.matricule})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cours *</label>
              <select required value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Sélectionner</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type d'examen *</label>
                <select required value={formData.examType} onChange={(e) => setFormData({ ...formData, examType: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (0-100) *</label>
                <input type="number" min="0" max="100" required value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commentaires</label>
              <textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingGrade ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
