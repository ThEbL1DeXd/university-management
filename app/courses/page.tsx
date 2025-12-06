'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

export default function CoursesPage() {
  const { permissions, isStudent, can } = usePermissions();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if user can perform any action on courses
  const canEditOrDelete = can('canEditCourse') || can('canDeleteCourse');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    department: '',
    teacher: '',
    semester: 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchTeachers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = courses.filter((c) =>
      c.name?.toLowerCase().includes(query) ||
      c.code?.toLowerCase().includes(query) ||
      c.department?.name?.toLowerCase().includes(query) ||
      c.department?.code?.toLowerCase().includes(query) ||
      c.teacher?.name?.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) setDepartments(data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCourses();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (course: any) => {
    if (!confirm(`Supprimer ${course.name} ?`)) return;
    
    try {
      const res = await fetch(`/api/courses/${course._id}`, { method: 'DELETE' });
      if (res.ok) fetchCourses();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits,
      department: typeof course.department === 'object' ? course.department._id : course.department,
      teacher: typeof course.teacher === 'object' ? course.teacher?._id || '' : course.teacher || '',
      semester: course.semester,
      year: course.year,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({ name: '', code: '', description: '', credits: 3, department: '', teacher: '', semester: 1, year: new Date().getFullYear() });
  };

  const columns = [
    { header: 'Code', accessor: 'code', sortable: true },
    { header: 'Nom', accessor: 'name', sortable: true },
    { header: 'Crédits', accessor: 'credits', sortable: true },
    { header: 'Département', accessor: ((c: any) => c.department?.name || 'N/A') as any, sortKey: 'department.name', sortable: true },
    { header: 'Enseignant', accessor: ((c: any) => c.teacher?.name || 'Non assigné') as any, sortKey: 'teacher.name', sortable: true },
    { header: 'Semestre', accessor: 'semester', sortable: true },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cours</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gérer les cours</p>
          </div>
          <ProtectedAction permission="canCreateCourse">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Ajouter un cours
            </button>
          </ProtectedAction>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Rechercher par nom, code, département, enseignant..." />

        <DataTable
          data={filteredCourses}
          columns={columns}
          {...(canEditOrDelete && {
            actions: (course) => (
              <div className="flex gap-2">
                <ProtectedAction permission="canEditCourse">
                  <button onClick={() => handleEdit(course)} className="text-blue-600"><Edit size={18} /></button>
                </ProtectedAction>
                <ProtectedAction permission="canDeleteCourse">
                  <button onClick={() => handleDelete(course)} className="text-red-600"><Trash2 size={18} /></button>
                </ProtectedAction>
              </div>
            )
          })}
        />

        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCourse ? 'Modifier' : 'Ajouter'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Crédits *</label>
                <input type="number" min="1" max="10" required value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Semestre *</label>
                <select required value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Année *</label>
                <input type="number" required value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département *</label>
              <select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Sélectionner</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Enseignant</label>
              <select value={formData.teacher} onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Non assigné</option>
                {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingCourse ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
