'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

export default function TeachersPage() {
  const { permissions, isAdmin } = usePermissions();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
  });

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter((t) =>
      (t.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (t.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) setTeachers(data.data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher._id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchTeachers();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (teacher: any) => {
    if (!confirm(`Supprimer ${teacher.name} ?`)) return;
    
    try {
      const res = await fetch(`/api/teachers/${teacher._id}`, { method: 'DELETE' });
      if (res.ok) fetchTeachers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      department: typeof teacher.department === 'object' ? teacher.department._id : teacher.department,
      specialization: teacher.specialization || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({ name: '', email: '', phone: '', department: '', specialization: '' });
  };

  const columns = [
    { header: 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Département', accessor: ((t: any) => t.department?.name || 'N/A') as any },
    { header: 'Spécialisation', accessor: 'specialization' },
    { header: 'Cours', accessor: ((t: any) => t.courses?.length || 0) as any },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enseignants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gérer les enseignants</p>
          </div>
          <ProtectedAction permission="canCreateTeacher">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Ajouter un enseignant
            </button>
          </ProtectedAction>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher..."
        />

        <DataTable
          data={filteredTeachers}
          columns={columns}
          actions={(teacher) => (
            <div className="flex gap-2">
              <ProtectedAction permission="canEditTeacher">
                <button onClick={() => handleEdit(teacher)} className="text-blue-600" title="Modifier">
                  <Edit size={18} />
                </button>
              </ProtectedAction>
              <ProtectedAction permission="canDeleteTeacher">
                <button onClick={() => handleDelete(teacher)} className="text-red-600" title="Supprimer">
                  <Trash2 size={18} />
                </button>
              </ProtectedAction>
            </div>
          )}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingTeacher ? 'Modifier' : 'Ajouter'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département *</label>
              <select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Sélectionner</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Spécialisation</label>
              <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingTeacher ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
