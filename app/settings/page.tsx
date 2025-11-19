'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ModernCard from '@/components/ModernCard';
import { 
  Settings, Bell, Moon, Sun, Globe, Lock, Database, 
  Palette, Zap, Shield, Mail, Volume2, Eye, Download, Trash2 
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    soundNotifications: true,
    autoSave: true,
    twoFactorAuth: false,
    showEmail: true,
    language: 'fr',
    timezone: 'Europe/Paris',
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSaveSettings = () => {
    console.log('Sauvegarde des paramètres:', settings);
    alert('✅ Paramètres sauvegardés avec succès!');
  };

  const handleResetSettings = () => {
    if (confirm('Voulez-vous réinitialiser tous les paramètres à leurs valeurs par défaut ?')) {
      setSettings({
        emailNotifications: true,
        pushNotifications: false,
        soundNotifications: true,
        autoSave: true,
        twoFactorAuth: false,
        showEmail: true,
        language: 'fr',
        timezone: 'Europe/Paris',
      });
      alert('✅ Paramètres réinitialisés!');
    }
  };

  const handleChangePassword = () => {
    alert('🔒 Redirection vers la page de changement de mot de passe...');
  };

  const handleExportData = () => {
    alert('📥 Export de vos données en cours...\nVous recevrez un email avec le fichier ZIP.');
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ ATTENTION: Cette action est irréversible!\n\nÊtes-vous sûr de vouloir supprimer votre compte ?')) {
      if (confirm('Confirmer la suppression définitive du compte ?')) {
        alert('🗑️ Votre demande de suppression a été enregistrée.\nVous recevrez un email de confirmation.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configurez votre expérience utilisateur
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin-slow" />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance */}
          <ModernCard glassmorphism>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Palette size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apparence</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Thème de l'interface
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (theme !== 'light') toggleTheme(); }}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                        theme === 'light'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <Sun size={20} className="inline mr-2" />
                      Clair
                    </button>
                    <button
                      onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <Moon size={20} className="inline mr-2" />
                      Sombre
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Langue
                  </label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Notifications */}
          <ModernCard glassmorphism>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
              </div>

              <div className="space-y-4">
                <ToggleSetting
                  icon={<Mail size={18} />}
                  label="Notifications par email"
                  description="Recevoir les notifications importantes par email"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <ToggleSetting
                  icon={<Bell size={18} />}
                  label="Notifications push"
                  description="Activer les notifications push sur le navigateur"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <ToggleSetting
                  icon={<Volume2 size={18} />}
                  label="Sons de notification"
                  description="Jouer un son lors de nouvelles notifications"
                  checked={settings.soundNotifications}
                  onChange={() => handleToggle('soundNotifications')}
                />
              </div>
            </div>
          </ModernCard>

          {/* Security */}
          <ModernCard glassmorphism>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sécurité</h2>
              </div>

              <div className="space-y-4">
                <ToggleSetting
                  icon={<Lock size={18} />}
                  label="Authentification à deux facteurs"
                  description="Ajouter une couche de sécurité supplémentaire"
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <ToggleSetting
                  icon={<Eye size={18} />}
                  label="Afficher mon email publiquement"
                  description="Autres utilisateurs peuvent voir votre email"
                  checked={settings.showEmail}
                  onChange={() => handleToggle('showEmail')}
                />
                
                <div className="pt-4">
                  <button 
                    onClick={handleChangePassword}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all hover:shadow-lg cursor-pointer"
                  >
                    <Lock size={18} className="inline mr-2" />
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Preferences */}
          <ModernCard glassmorphism>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Préférences</h2>
              </div>

              <div className="space-y-4">
                <ToggleSetting
                  icon={<Database size={18} />}
                  label="Sauvegarde automatique"
                  description="Enregistrer automatiquement vos modifications"
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                    <Globe size={18} />
                    Fuseau horaire
                  </label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">America/New York (GMT-5)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Data Management */}
        <ModernCard glassmorphism>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Database size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gestion des données</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleExportData}
                className="flex items-center gap-3 px-6 py-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-all group cursor-pointer"
              >
                <Download size={20} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Exporter mes données</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Télécharger toutes vos informations</p>
                </div>
              </button>

              <button 
                onClick={handleDeleteAccount}
                className="flex items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all group cursor-pointer"
              >
                <Trash2 size={20} className="text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Supprimer mon compte</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Action irréversible</p>
                </div>
              </button>
            </div>
          </div>
        </ModernCard>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={handleResetSettings}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all cursor-pointer"
          >
            Réinitialiser
          </button>
          <button 
            onClick={handleSaveSettings}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Toggle Setting Component
function ToggleSetting({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
      <div className="flex items-start gap-3 flex-1">
        <div className="text-gray-600 dark:text-gray-400 mt-1 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
      </label>
    </div>
  );
}
