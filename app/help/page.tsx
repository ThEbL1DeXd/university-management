'use client';

import DashboardLayout from '@/components/DashboardLayout';
import ModernCard from '@/components/ModernCard';
import { 
  HelpCircle, BookOpen, MessageCircle, Video, Mail, 
  ExternalLink, Search, ChevronRight, FileText, Download
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleQuickLinkClick = (title: string) => {
    // Simuler l'action selon le lien
    if (title.includes('Documentation')) {
      alert('📚 Ouverture de la documentation complète...');
    } else if (title.includes('Tutoriels')) {
      alert('🎥 Ouverture des tutoriels vidéo...');
    } else if (title.includes('Support')) {
      alert('💬 Ouverture du formulaire de contact support...');
    } else if (title.includes('Forum')) {
      alert('🗨️ Redirection vers le forum communautaire...');
    }
  };

  const handleArticleClick = (articleTitle: string) => {
    alert(`📖 Ouverture de l'article: ${articleTitle}`);
  };

  const handleContactSupport = (type: 'email' | 'chat') => {
    if (type === 'email') {
      window.location.href = 'mailto:support@university.com?subject=Demande de support';
    } else {
      alert('💬 Chat en direct sera bientôt disponible!');
    }
  };

  const handleDownload = (type: 'pdf' | 'video') => {
    if (type === 'pdf') {
      alert('📥 Téléchargement du guide PDF en cours...');
    } else {
      alert('🎥 Ouverture de la bibliothèque vidéo...');
    }
  };

  const categories = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      icon: <BookOpen size={20} />,
      gradient: 'from-blue-500 to-cyan-500',
      articles: [
        { title: 'Comment créer un compte', views: '2.5k' },
        { title: 'Configuration de votre profil', views: '1.8k' },
        { title: 'Naviguer dans l\'interface', views: '3.2k' },
        { title: 'Personnaliser vos préférences', views: '1.2k' },
      ]
    },
    {
      id: 'students',
      title: 'Pour les étudiants',
      icon: <BookOpen size={20} />,
      gradient: 'from-green-500 to-emerald-500',
      articles: [
        { title: 'Consulter vos cours', views: '5.1k' },
        { title: 'Voir vos notes et résultats', views: '4.8k' },
        { title: 'Rejoindre un groupe', views: '2.3k' },
        { title: 'Contacter un enseignant', views: '1.9k' },
      ]
    },
    {
      id: 'teachers',
      title: 'Pour les enseignants',
      icon: <BookOpen size={20} />,
      gradient: 'from-purple-500 to-pink-500',
      articles: [
        { title: 'Créer un nouveau cours', views: '1.5k' },
        { title: 'Saisir les notes', views: '2.8k' },
        { title: 'Gérer les groupes d\'étudiants', views: '1.1k' },
        { title: 'Exporter les données', views: '890' },
      ]
    },
    {
      id: 'admin',
      title: 'Pour les administrateurs',
      icon: <BookOpen size={20} />,
      gradient: 'from-orange-500 to-amber-500',
      articles: [
        { title: 'Gérer les utilisateurs', views: '750' },
        { title: 'Configurer les départements', views: '620' },
        { title: 'Gérer les permissions', views: '540' },
        { title: 'Statistiques et rapports', views: '820' },
      ]
    },
  ];

  const quickLinks = [
    {
      title: 'Documentation complète',
      description: 'Guide détaillé de toutes les fonctionnalités',
      icon: <FileText size={24} />,
      gradient: 'from-blue-500 to-cyan-500',
      action: 'Lire la doc',
    },
    {
      title: 'Tutoriels vidéo',
      description: 'Apprenez en regardant nos vidéos tutorielles',
      icon: <Video size={24} />,
      gradient: 'from-purple-500 to-pink-500',
      action: 'Voir les vidéos',
    },
    {
      title: 'Contacter le support',
      description: 'Notre équipe est là pour vous aider',
      icon: <MessageCircle size={24} />,
      gradient: 'from-green-500 to-emerald-500',
      action: 'Envoyer un message',
    },
    {
      title: 'Forum communautaire',
      description: 'Posez vos questions à la communauté',
      icon: <MessageCircle size={24} />,
      gradient: 'from-orange-500 to-amber-500',
      action: 'Accéder au forum',
    },
  ];

  const faq = [
    {
      question: 'Comment réinitialiser mon mot de passe ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre email, et suivez les instructions reçues par email.',
    },
    {
      question: 'Puis-je modifier mes informations personnelles ?',
      answer: 'Oui, allez dans "Mon profil" depuis le menu en haut à droite, puis cliquez sur "Modifier" pour mettre à jour vos informations.',
    },
    {
      question: 'Comment consulter mes notes ?',
      answer: 'Accédez à la section "Notes" depuis le menu latéral. Vous y trouverez toutes vos notes organisées par cours et par semestre.',
    },
    {
      question: 'Comment contacter un enseignant ?',
      answer: 'Vous pouvez envoyer un message depuis la page du cours concerné, ou utiliser l\'email affiché dans le profil de l\'enseignant.',
    },
    {
      question: 'L\'application est-elle disponible sur mobile ?',
      answer: 'Oui, notre interface est entièrement responsive et fonctionne parfaitement sur tous les appareils mobiles.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Centre d'aide
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Comment pouvons-nous vous aider aujourd'hui ?
          </p>
        </div>

        {/* Search Bar */}
        <ModernCard glassmorphism>
          <div className="p-6">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans l'aide..."
                className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>
        </ModernCard>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <ModernCard key={index} glassmorphism hover>
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${link.gradient} rounded-xl flex items-center justify-center text-white mb-4`}>
                  {link.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {link.description}
                </p>
                <button 
                  onClick={() => handleQuickLinkClick(link.title)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:gap-3 transition-all cursor-pointer"
                >
                  {link.action}
                  <ExternalLink size={16} />
                </button>
              </div>
            </ModernCard>
          ))}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Parcourir par catégorie
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <ModernCard key={category.id} glassmorphism hover>
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="w-full p-6 text-left"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white`}>
                        {category.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.title}
                      </h3>
                    </div>
                    <ChevronRight 
                      size={20} 
                      className={`text-gray-400 transition-transform ${selectedCategory === category.id ? 'rotate-90' : ''}`}
                    />
                  </div>

                  {selectedCategory === category.id && (
                    <div className="space-y-2 mt-4 animate-fade-in">
                      {category.articles.map((article, index) => (
                        <button
                          key={index}
                          onClick={() => handleArticleClick(article.title)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group cursor-pointer"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {article.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {article.views} vues
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions fréquentes
          </h2>
          <ModernCard glassmorphism>
            <div className="p-6 space-y-4">
              {faq.map((item, index) => (
                <details
                  key={index}
                  open={openFaqIndex === index}
                  onToggle={(e) => {
                    const details = e.target as HTMLDetailsElement;
                    setOpenFaqIndex(details.open ? index : null);
                  }}
                  className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-gray-900 dark:text-white">
                    <span>{item.question}</span>
                    <ChevronRight size={20} className="text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </ModernCard>
        </div>

        {/* Contact Support */}
        <ModernCard gradient>
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mb-4">
              <Mail size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Vous n'avez pas trouvé ce que vous cherchiez ?
            </h2>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Notre équipe de support est disponible 24/7 pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => handleContactSupport('email')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <Mail size={18} className="inline mr-2" />
                Envoyer un email
              </button>
              <button 
                onClick={() => handleContactSupport('chat')}
                className="px-8 py-3 bg-white/20 backdrop-blur-xl text-white border border-white/30 rounded-lg font-medium hover:bg-white/30 transition-all cursor-pointer"
              >
                <MessageCircle size={18} className="inline mr-2" />
                Chat en direct
              </button>
            </div>
          </div>
        </ModernCard>

        {/* Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModernCard glassmorphism hover>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                  <Download size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Guide utilisateur PDF
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Documentation complète (12 MB)
                  </p>
                </div>
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all cursor-pointer"
                >
                  Télécharger
                </button>
              </div>
            </div>
          </ModernCard>

          <ModernCard glassmorphism hover>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  <Video size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Tutoriels vidéo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24 vidéos explicatives
                  </p>
                </div>
                <button 
                  onClick={() => handleDownload('video')}
                  className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all cursor-pointer"
                >
                  Regarder
                </button>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
