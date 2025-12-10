'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Bell, 
  Mail, 
  Smartphone,
  Clock,
  Moon,
  Globe,
  Save,
  CheckCircle,
  GraduationCap,
  Calendar,
  UserCheck,
  Megaphone,
  AlertTriangle,
  Timer
} from 'lucide-react';

interface NotificationPrefs {
  gradeNotifications: { enabled: boolean; email: boolean; push: boolean };
  scheduleNotifications: { enabled: boolean; email: boolean; push: boolean };
  attendanceNotifications: { enabled: boolean; email: boolean; push: boolean };
  announcementNotifications: { enabled: boolean; email: boolean; push: boolean };
  reminderNotifications: { enabled: boolean; email: boolean; push: boolean };
  alertNotifications: { enabled: boolean; email: boolean; push: boolean };
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  dailyDigest: { enabled: boolean; time: string };
  language: 'fr' | 'en' | 'ar';
}

const defaultPrefs: NotificationPrefs = {
  gradeNotifications: { enabled: true, email: true, push: true },
  scheduleNotifications: { enabled: true, email: true, push: true },
  attendanceNotifications: { enabled: true, email: false, push: true },
  announcementNotifications: { enabled: true, email: true, push: true },
  reminderNotifications: { enabled: true, email: false, push: true },
  alertNotifications: { enabled: true, email: true, push: true },
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  dailyDigest: { enabled: false, time: '08:00' },
  language: 'fr',
};

const notificationTypes = [
  { key: 'gradeNotifications', label: 'Notes', icon: GraduationCap, color: 'text-purple-500', description: 'Nouvelles notes et résultats' },
  { key: 'scheduleNotifications', label: 'Emploi du temps', icon: Calendar, color: 'text-blue-500', description: 'Changements de cours et horaires' },
  { key: 'attendanceNotifications', label: 'Présences', icon: UserCheck, color: 'text-green-500', description: 'Absences et retards' },
  { key: 'announcementNotifications', label: 'Annonces', icon: Megaphone, color: 'text-orange-500', description: 'Annonces générales' },
  { key: 'reminderNotifications', label: 'Rappels', icon: Timer, color: 'text-cyan-500', description: 'Rappels de cours et devoirs' },
  { key: 'alertNotifications', label: 'Alertes', icon: AlertTriangle, color: 'text-red-500', description: 'Alertes importantes' },
];

export default function NotificationSettingsPage() {
  const { data: session } = useSession();
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/notifications/preferences');
      const data = await res.json();
      if (data.success && data.data) {
        setPrefs({ ...defaultPrefs, ...data.data });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationType = (
    typeKey: string,
    field: 'enabled' | 'email' | 'push',
    value: boolean
  ) => {
    setPrefs((prev: any) => ({
      ...prev,
      [typeKey]: {
        ...prev[typeKey],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="text-blue-500" />
              Préférences de Notifications
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Personnalisez comment et quand vous recevez vos notifications
            </p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
          >
            {saved ? <CheckCircle size={20} /> : <Save size={20} />}
            {saving ? 'Enregistrement...' : saved ? 'Enregistré!' : 'Enregistrer'}
          </button>
        </div>

        {/* Types de notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Types de notifications
          </h2>
          
          <div className="space-y-4">
            {notificationTypes.map(({ key, label, icon: Icon, color, description }) => (
              <div 
                key={key} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${color}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Toggle Principal */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-500">Activé</span>
                    <input
                      type="checkbox"
                      checked={(prefs as any)[key]?.enabled ?? true}
                      onChange={(e) => updateNotificationType(key, 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                  
                  {/* Email */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Mail size={18} className={`${(prefs as any)[key]?.email ? 'text-blue-500' : 'text-gray-400'}`} />
                    <input
                      type="checkbox"
                      checked={(prefs as any)[key]?.email ?? false}
                      onChange={(e) => updateNotificationType(key, 'email', e.target.checked)}
                      disabled={!(prefs as any)[key]?.enabled}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </label>
                  
                  {/* Push */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Smartphone size={18} className={`${(prefs as any)[key]?.push ? 'text-green-500' : 'text-gray-400'}`} />
                    <input
                      type="checkbox"
                      checked={(prefs as any)[key]?.push ?? false}
                      onChange={(e) => updateNotificationType(key, 'push', e.target.checked)}
                      disabled={!(prefs as any)[key]?.enabled}
                      className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heures silencieuses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="text-indigo-500" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Heures silencieuses
            </h2>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 dark:text-gray-400">
              Désactivez les notifications pendant certaines heures
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {prefs.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Début
                </label>
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fin
                </label>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Résumé quotidien */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-cyan-500" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Résumé quotidien
            </h2>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 dark:text-gray-400">
              Recevez un résumé de vos notifications chaque jour
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.dailyDigest.enabled}
                onChange={(e) => setPrefs({ 
                  ...prefs, 
                  dailyDigest: { ...prefs.dailyDigest, enabled: e.target.checked } 
                })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
            </label>
          </div>
          
          {prefs.dailyDigest.enabled && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure d'envoi
              </label>
              <input
                type="time"
                value={prefs.dailyDigest.time}
                onChange={(e) => setPrefs({ 
                  ...prefs, 
                  dailyDigest: { ...prefs.dailyDigest, time: e.target.value } 
                })}
                className="w-full max-w-xs px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          )}
        </div>

        {/* Langue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-emerald-500" size={24} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Langue des notifications
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'fr', label: 'Français', flag: '🇫🇷' },
              { value: 'en', label: 'English', flag: '🇬🇧' },
              { value: 'ar', label: 'العربية', flag: '🇸🇦' },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => setPrefs({ ...prefs, language: lang.value as 'fr' | 'en' | 'ar' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  prefs.language === lang.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{lang.flag}</span>
                <span className={`font-medium ${
                  prefs.language === lang.value ? 'text-emerald-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
