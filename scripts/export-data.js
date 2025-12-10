/**
 * Script d'export des données - UniManage
 * 
 * Ce script exporte toutes les données de la base de données
 * vers un fichier JSON (exported-data.json)
 * 
 * Usage:
 *   node scripts/export-data.js              - Export toutes les collections
 *   node scripts/export-data.js --pretty     - Export formaté (par défaut)
 *   node scripts/export-data.js --compact    - Export compact (une ligne)
 *   node scripts/export-data.js --output=file.json - Spécifier le fichier de sortie
 *   node scripts/export-data.js --help       - Affiche l'aide
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           UniManage - Script d'Export de Données               ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/export-data.js [options]

Options:
  --pretty       Format JSON lisible (défaut)
  --compact      Format JSON compact (une ligne)
  --output=FILE  Fichier de sortie (défaut: exported-data.json)
  --help         Affiche cette aide

Description:
  Ce script exporte toutes les collections de la base de données
  MongoDB vers un fichier JSON.

  Le fichier exporté peut être utilisé avec seed-restore.js
  pour restaurer les données.

Collections exportées:
  - departments
  - teachers
  - students
  - studentgroups
  - courses
  - grades
  - schedules
  - users
  - notifications
  - attendances
  - notificationpreferences

Exemples:
  node scripts/export-data.js
  node scripts/export-data.js --compact
  node scripts/export-data.js --output=backup-2025-12-06.json
`);
}

async function exportData(options = {}) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           UniManage - Export des Données                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Connexion à MongoDB
  console.log('🔌 Connexion à MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  const db = mongoose.connection.db;
  
  try {
    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 ${collections.length} collections trouvées\n`);

    const data = {};
    let totalDocs = 0;

    console.log('📥 Export des collections:');
    
    for (const col of collections) {
      const docs = await db.collection(col.name).find({}).toArray();
      data[col.name] = docs;
      totalDocs += docs.length;
      console.log(`   ✅ ${col.name}: ${docs.length} documents`);
    }

    // Écrire le fichier
    const outputFile = options.output || path.join(__dirname, 'exported-data.json');
    const jsonContent = options.compact 
      ? JSON.stringify(data) 
      : JSON.stringify(data, null, 2);
    
    fs.writeFileSync(outputFile, jsonContent);
    
    const fileSize = fs.statSync(outputFile).size;
    const fileSizeStr = fileSize > 1024 * 1024 
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(fileSize / 1024).toFixed(2)} KB`;

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('                         RÉSUMÉ');
    console.log('════════════════════════════════════════════════════════════════\n');
    console.log(`   📊 Total: ${totalDocs} documents`);
    console.log(`   📁 Fichier: ${outputFile}`);
    console.log(`   📦 Taille: ${fileSizeStr}`);
    console.log(`   📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('              ✅ Export terminé avec succès!');
    console.log('════════════════════════════════════════════════════════════════\n');

    console.log('💡 Pour restaurer ces données:');
    console.log('   node scripts/seed-restore.js\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB\n');
  }
}

// Parse arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const options = {
  compact: args.includes('--compact'),
  output: args.find(a => a.startsWith('--output='))?.split('=')[1]
};

exportData(options)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
