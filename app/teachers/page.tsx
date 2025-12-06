'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import { Plus, Edit, Trash2, Shield, ShieldOff } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

export default function TeachersPage() {
  const { permissions, isAdmin, can } = usePermissions();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check if user can perform any action on teachers
  const canEditOrDelete = can('canEditTeacher') || can('canDeleteTeacher');
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
    const query = searchQuery.toLowerCase();
    const filtered = teachers.filter((t) =>
      (t.name?.toLowerCase() || '').includes(query) ||
      (t.email?.toLowerCase() || '').includes(query) ||
      (t.specialization?.toLowerCase() || '').includes(query) ||
      (t.department?.name?.toLowerCase() || '').includes(query) ||
      (t.department?.code?.toLowerCase() || '').includes(query)
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
    if (!confirm(`Delete ${teacher.name}?`)) return;
    
    try {
      const res = await fetch(`/api/teachers/${teacher._id}`, { method: 'DELETE' });
      if (res.ok) fetchTeachers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleGradesPermission = async (teacher: any) => {
    try {
      const res = await fetch(`/api/teachers/${teacher._id}/toggle-grades-permission`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchTeachers();
      } else {
        alert(data.error || 'Error updating permission');
      }
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

  // Use useMemo to recalculate columns when isAdmin changes
  const columns = useMemo(() => [
    { header: 'Name', accessor: 'name', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Department', accessor: ((t: any) => t.department?.name || 'N/A') as any, sortKey: 'department.name', sortable: true },
    { header: 'Specialization', accessor: 'specialization', sortable: true },
    { header: 'Courses', accessor: ((t: any) => t.courses?.length || 0) as any, sortable: false },
    ...(isAdmin ? [{
      header: 'Grades Permission',
      accessor: ((t: any) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          t.canEditGrades
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {t.canEditGrades ? <Shield size={14} /> : <ShieldOff size={14} />}
          {t.canEditGrades ? 'Granted' : 'Denied'}
        </span>
      )) as any,
      sortable: false,
    }] : []),
  ], [isAdmin]);

  const renderActions = (teacher: any) => (
    <div className="flex items-center gap-2">
      {isAdmin && (
        <button
          onClick={() => handleToggleGradesPermission(teacher)}
          className={`p-2 rounded-lg transition-all ${
            teacher.canEditGrades
              ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
          }`}
          title={teacher.canEditGrades ? 'Revoke grades permission' : 'Grant grades permission'}
        >
          {teacher.canEditGrades ? <Shield size={18} /> : <ShieldOff size={18} />}
        </button>
      )}
      <ProtectedAction permission="canEditTeacher">
        <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800 p-2" title="Edit">
          <Edit size={18} />
        </button>
      </ProtectedAction>
      <ProtectedAction permission="canDeleteTeacher">
        <button onClick={() => handleDelete(teacher)} className="text-red-600 hover:text-red-800 p-2" title="Delete">
          <Trash2 size={18} />
        </button>
      </ProtectedAction>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teachers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage teachers and their permissions</p>
          </div>
          <ProtectedAction permission="canCreateTeacher">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Teacher
            </button>
          </ProtectedAction>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, email, department, specialization..."
        />

        <DataTable
          data={filteredTeachers}
          columns={columns}
          actions={canEditOrDelete || isAdmin ? renderActions : undefined}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700">
                <option value="">Select</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{editingTeacher ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
