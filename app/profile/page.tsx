'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ModernCard from '@/components/ModernCard';
import { useSession } from 'next-auth/react';
import { User, Mail, Shield, Calendar, MapPin, Phone, Edit2, Camera } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || 'Alice Johnson',
    email: session?.user?.email || 'alice.johnson@student.com',
    role: 'Étudiant',
    phone: '+33 6 12 34 56 78',
    address: 'Paris, France',
    joinDate: '15 septembre 2024',
    studentId: 'STU-2024-001',
    department: 'Informatique',
    year: '3ème année',
    bio: 'Étudiante passionnée par le développement web et les technologies cloud. Membre active du club de programmation.',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Sauvegarder les modifications
    console.log('Sauvegarde des données:', formData);
    alert('✅ Profil mis à jour avec succès!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Annuler les modifications
    setIsEditing(false);
    // Réinitialiser avec les données originales si nécessaire
  };

  const handlePhotoChange = () => {
    alert('📸 Fonctionnalité de changement de photo sera bientôt disponible!');
  };

  const stats = [
    { label: 'Cours suivis', value: '8', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Moyenne', value: '85/100', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Présence', value: '95%', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Projets', value: '12', gradient: 'from-orange-500 to-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mon Profil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez vos informations personnelles
            </p>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:scale-105"
          >
            <Edit2 size={18} />
            {isEditing ? 'Enregistrer' : 'Modifier'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <ModernCard key={index} glassmorphism hover>
              <div className={`h-2 w-full bg-gradient-to-r ${stat.gradient} rounded-t-xl`}></div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </ModernCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ModernCard glassmorphism>
              <div className="p-6">
                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                    {formData.name[0].toUpperCase()}
                  </div>
                  <button 
                    onClick={handlePhotoChange}
                    className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-white dark:border-gray-700 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Camera size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Name & Role */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formData.name}
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full">
                    <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formData.role}
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 truncate">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center">
                      <MapPin size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{formData.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Inscrit le {formData.joinDate}</span>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2">
            <ModernCard glassmorphism>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <User size={20} className="text-blue-600 dark:text-blue-400" />
                  Informations détaillées
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student ID */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Numéro d'étudiant
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Département
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Année
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                    Biographie
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {isEditing && (
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
                    >
                      Enregistrer les modifications
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
