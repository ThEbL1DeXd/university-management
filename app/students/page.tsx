'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DataTable from '@/components/DataTable';
import SearchBar from '@/components/SearchBar';
import Modal from '@/components/Modal';
import AdvancedFilters, { FilterOption } from '@/components/AdvancedFilters';
import ExportButton from '@/components/ExportButton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { IStudent } from '@/models/Student';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedAction from '@/components/ProtectedAction';

export default function StudentsPage() {
  const { permissions, isAdmin, can } = usePermissions();
  const [students, setStudents] = useState<IStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<IStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  
  // Check if user can perform any action on students
  const canEditOrDelete = can('canEditStudent') || can('canDeleteStudent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    matricule: '',
    email: '',
    phone: '',
    department: '',
    enrolledCourses: [] as string[],
    dateOfBirth: '',
    address: '',
    academicYear: '2024-2025',
    currentYear: 1,
    status: 'active' as 'active' | 'inactive' | 'graduated' | 'suspended',
  });

  // Définition des filtres avancés
  const filterOptions: FilterOption[] = useMemo(() => [
    {
      key: 'department',
      label: 'Département',
      type: 'select',
      options: departments.map(d => ({ value: d._id, label: d.name })),
    },
    {
      key: 'currentYear',
      label: "Année d'étude",
      type: 'select',
      options: [
        { value: '1', label: 'L1 - Licence 1' },
        { value: '2', label: 'L2 - Licence 2' },
        { value: '3', label: 'L3 - Licence 3' },
        { value: '4', label: 'M1 - Master 1' },
        { value: '5', label: 'M2 - Master 2' },
      ],
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'graduated', label: 'Diplômé' },
        { value: 'suspended', label: 'Suspendu' },
      ],
    },
    {
      key: 'academicYear',
      label: 'Année scolaire',
      type: 'select',
      options: [
        { value: '2024-2025', label: '2024-2025' },
        { value: '2023-2024', label: '2023-2024' },
        { value: '2022-2023', label: '2022-2023' },
      ],
    },
  ], [departments]);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...students];
    
    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) => {
        const dept = student.department as any;
        return (
          (student.name?.toLowerCase() || '').includes(query) ||
          (student.matricule?.toLowerCase() || '').includes(query) ||
          (student.email?.toLowerCase() || '').includes(query) ||
          (dept?.name?.toLowerCase() || '').includes(query) ||
          (dept?.code?.toLowerCase() || '').includes(query)
        );
      });
    }
    
    // Filtres avancés
    if (advancedFilters.department) {
      filtered = filtered.filter(s => {
        const dept = s.department as any;
        return dept?._id === advancedFilters.department;
      });
    }
    if (advancedFilters.currentYear) {
      filtered = filtered.filter(s => s.currentYear === parseInt(advancedFilters.currentYear));
    }
    if (advancedFilters.status) {
      filtered = filtered.filter(s => s.status === advancedFilters.status);
    }
    if (advancedFilters.academicYear) {
      filtered = filtered.filter(s => s.academicYear === advancedFilters.academicYear);
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, students, advancedFilters]);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) setStudents(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
      const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchStudents();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (student: IStudent) => {
    if (!confirm(`Supprimer ${student.name} ?`)) return;
    
    try {
      const res = await fetch(`/api/students/${student._id}`, { method: 'DELETE' });
      if (res.ok) fetchStudents();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (student: IStudent) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      matricule: student.matricule,
      email: student.email,
      phone: student.phone || '',
      department: typeof student.department === 'object' ? (student.department as any)._id : student.department,
      enrolledCourses: student.enrolledCourses?.map((c: any) => typeof c === 'object' ? c._id : c) || [],
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      address: student.address || '',
      academicYear: student.academicYear || '2024-2025',
      currentYear: student.currentYear || 1,
      status: student.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      matricule: '',
      email: '',
      phone: '',
      department: '',
      enrolledCourses: [],
      dateOfBirth: '',
      address: '',
      academicYear: '2024-2025',
      currentYear: 1,
      status: 'active',
    });
  };

  const columns = [
    { header: 'Matricule', accessor: 'matricule' as keyof IStudent, sortable: true },
    { header: 'Nom', accessor: 'name' as keyof IStudent, sortable: true },
    { header: 'Email', accessor: 'email' as keyof IStudent, sortable: true },
    {
      header: 'Département',
      accessor: ((student: IStudent) => {
        const dept = student.department as any;
        return dept?.name || 'N/A';
      }) as any,
      sortKey: 'department.name',
      sortable: true,
    },
    {
      header: 'Année',
      accessor: ((student: IStudent) => {
        const yearLabels: { [key: number]: string } = {
          1: 'L1',
          2: 'L2',
          3: 'L3',
          4: 'M1',
          5: 'M2'
        };
        return yearLabels[student.currentYear] || `Année ${student.currentYear}`;
      }) as any,
      sortKey: 'currentYear',
      sortable: true,
    },
    {
      header: 'Année Scolaire',
      accessor: 'academicYear' as keyof IStudent,
      sortable: true,
    },
    {
      header: 'Statut',
      accessor: ((student: IStudent) => {
        const statusLabels: { [key: string]: string } = {
          'active': '✅ Actif',
          'inactive': '⏸️ Inactif',
          'graduated': '🎓 Diplômé',
          'suspended': '🚫 Suspendu'
        };
        return statusLabels[student.status] || student.status;
      }) as any,
      sortKey: 'status',
      sortable: true,
    },
    {
      header: 'Cours inscrits',
      accessor: ((student: IStudent) => {
        return Array.isArray(student.enrolledCourses) ? student.enrolledCourses.length : 0;
      }) as any,
      sortable: false,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Étudiants</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gérer les étudiants de l'université ({filteredStudents.length} résultats)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProtectedAction permission="canEditStudent">
              <ExportButton type="students" filters={advancedFilters} />
            </ProtectedAction>
            <ProtectedAction permission="canCreateStudent">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Ajouter un étudiant
              </button>
            </ProtectedAction>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom, matricule, email, département..."
            />
          </div>
          <AdvancedFilters
            filters={filterOptions}
            values={advancedFilters}
            onChange={(key, value) => setAdvancedFilters(prev => ({ ...prev, [key]: value }))}
            onReset={() => setAdvancedFilters({})}
          />
        </div>

        <DataTable
          data={filteredStudents}
          columns={columns}
          {...(canEditOrDelete && {
            actions: (student) => (
              <div className="flex gap-2">
                <ProtectedAction permission="canEditStudent">
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Modifier"
                  >
                    <Edit size={18} />
                  </button>
                </ProtectedAction>
                <ProtectedAction permission="canDeleteStudent">
                  <button
                    onClick={() => handleDelete(student)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </ProtectedAction>
              </div>
            )
          })}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matricule *
                </label>
                <input
                  type="text"
                  required
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Département *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un département</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année Scolaire *
                </label>
                <input
                  type="text"
                  required
                  placeholder="2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Année d'étude *
                </label>
                <select
                  required
                  value={formData.currentYear}
                  onChange={(e) => setFormData({ ...formData, currentYear: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value={1}>L1 - Licence 1ère année</option>
                  <option value={2}>L2 - Licence 2ème année</option>
                  <option value={3}>L3 - Licence 3ème année</option>
                  <option value={4}>M1 - Master 1ère année</option>
                  <option value={5}>M2 - Master 2ème année</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'graduated' | 'suspended' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="graduated">Diplômé</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStudent ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
