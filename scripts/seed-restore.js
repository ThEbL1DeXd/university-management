/**
 * Script de restauration des données - UniManage
 * 
 * Ce script restaure toutes les données de la base de données
 * à partir du fichier exported-data.json
 * 
 * Usage:
 *   node scripts/seed-restore.js          - Restaure toutes les données (efface d'abord)
 *   node scripts/seed-restore.js --append - Ajoute sans effacer
 *   node scripts/seed-restore.js --help   - Affiche l'aide
 * 
 * Collections restaurées:
 *   - departments (3)
 *   - teachers (5)
 *   - students (28)
 *   - studentgroups (7)
 *   - courses (8)
 *   - grades (27)
 *   - schedules (21)
 *   - users (9)
 *   - notifications (6)
 *   - attendances (1208)
 *   - notificationpreferences (0)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Ordre d'insertion (important pour les références)
const COLLECTION_ORDER = [
  'departments',
  'teachers', 
  'students',
  'studentgroups',
  'courses',
  'grades',
  'schedules',
  'users',
  'notifications',
  'attendances',
  'notificationpreferences',
];

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         UniManage - Script de Restauration de Données          ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node scripts/seed-restore.js [options]

Options:
  --append    Ajoute les données sans effacer les collections existantes
  --help      Affiche cette aide

Description:
  Ce script restaure toutes les données de la base de données
  à partir du fichier exported-data.json généré précédemment.

  Par défaut, le script efface toutes les collections avant
  d'insérer les nouvelles données.

Collections restaurées:
  - departments     (3 documents)
  - teachers        (5 documents)
  - students        (28 documents)
  - studentgroups   (7 documents)
  - courses         (8 documents)
  - grades          (27 documents)
  - schedules       (21 documents)
  - users           (9 documents)
  - notifications   (6 documents)
  - attendances     (1208 documents)

Exemples:
  node scripts/seed-restore.js           # Efface et restaure tout
  node scripts/seed-restore.js --append  # Ajoute sans effacer

Prérequis:
  - Le fichier .env.local doit contenir MONGODB_URI
  - Le fichier scripts/exported-data.json doit exister
`);
}

// Convertit les strings ObjectId en vrais ObjectId et les dates
function convertDocument(doc) {
  const newDoc = {};
  
  for (const [key, value] of Object.entries(doc)) {
    // Ignorer __v
    if (key === '__v') continue;
    
    if (value === null || value === undefined) {
      newDoc[key] = value;
    }
    // ObjectId (string de 24 caractères hex)
    else if (typeof value === 'string' && /^[0-9a-f]{24}$/.test(value)) {
      newDoc[key] = new mongoose.Types.ObjectId(value);
    }
    // Date ISO string
    else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      newDoc[key] = new Date(value);
    }
    // Array
    else if (Array.isArray(value)) {
      newDoc[key] = value.map(item => {
        if (typeof item === 'string' && /^[0-9a-f]{24}$/.test(item)) {
          return new mongoose.Types.ObjectId(item);
        }
        if (typeof item === 'object' && item !== null) {
          return convertDocument(item);
        }
        return item;
      });
    }
    // Object (recursive)
    else if (typeof value === 'object') {
      newDoc[key] = convertDocument(value);
    }
    else {
      newDoc[key] = value;
    }
  }
  
  return newDoc;
}

async function seedRestore(appendMode = false) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         UniManage - Restauration des Données                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Vérifier le fichier de données
  const dataFilePath = path.join(__dirname, 'exported-data.json');
  if (!fs.existsSync(dataFilePath)) {
    console.error('❌ Erreur: Le fichier exported-data.json n\'existe pas!');
    console.error('   Exécutez d\'abord: node scripts/export-data.js');
    process.exit(1);
  }

  // Charger les données
  console.log('📂 Chargement des données depuis exported-data.json...');
  const rawData = fs.readFileSync(dataFilePath, 'utf8');
  const data = JSON.parse(rawData);
  
  // Afficher un résumé
  console.log('\n📊 Données à restaurer:');
  let totalToRestore = 0;
  for (const colName of COLLECTION_ORDER) {
    const count = data[colName]?.length || 0;
    totalToRestore += count;
    console.log(`   - ${colName}: ${count} documents`);
  }
  console.log(`   ────────────────────────────`);
  console.log(`   Total: ${totalToRestore} documents`);

  // Connexion à MongoDB
  console.log('\n🔌 Connexion à MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB');

  const db = mongoose.connection.db;
  const results = {
    success: [],
    errors: []
  };

  try {
    // Effacer les collections si pas en mode append
    if (!appendMode) {
      console.log('\n🗑️  Suppression des données existantes...');
      for (const colName of [...COLLECTION_ORDER].reverse()) {
        try {
          const result = await db.collection(colName).deleteMany({});
          console.log(`   ✓ ${colName}: ${result.deletedCount} supprimés`);
        } catch (error) {
          console.log(`   ⚠ ${colName}: ${error.message}`);
        }
      }
    }

    // Insérer les données
    console.log('\n📥 Insertion des données...');
    
    for (const colName of COLLECTION_ORDER) {
      const docs = data[colName];
      
      if (!docs || docs.length === 0) {
        console.log(`   ⏭ ${colName}: aucune donnée`);
        continue;
      }

      try {
        // Préparer les documents
        const preparedDocs = docs.map(convertDocument);

        // Insérer avec insertMany
        const result = await db.collection(colName).insertMany(preparedDocs, { 
          ordered: false 
        });
        
        console.log(`   ✅ ${colName}: ${result.insertedCount} documents insérés`);
        results.success.push({ collection: colName, count: result.insertedCount });
        
      } catch (error) {
        if (error.code === 11000) {
          // Doublons - compter les insertions réussies
          const inserted = error.result?.insertedCount || 0;
          const skipped = docs.length - inserted;
          console.log(`   ⚠ ${colName}: ${inserted} insérés, ${skipped} ignorés (doublons)`);
          results.success.push({ collection: colName, count: inserted, skipped });
        } else {
          console.log(`   ❌ ${colName}: ${error.message}`);
          results.errors.push({ collection: colName, error: error.message });
        }
      }
    }

    // Afficher le résumé
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('                         RÉSUMÉ');
    console.log('════════════════════════════════════════════════════════════════\n');

    if (results.success.length > 0) {
      console.log('✅ Collections restaurées avec succès:');
      let totalDocs = 0;
      for (const item of results.success) {
        totalDocs += item.count;
        const skipped = item.skipped ? ` (${item.skipped} ignorés)` : '';
        console.log(`   - ${item.collection}: ${item.count} documents${skipped}`);
      }
      console.log(`\n   📊 Total: ${totalDocs} documents restaurés`);
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Erreurs:');
      for (const item of results.errors) {
        console.log(`   - ${item.collection}: ${item.error}`);
      }
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('           ✅ Restauration terminée avec succès!');
    console.log('════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erreur critique:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB\n');
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const appendMode = args.includes('--append');

seedRestore(appendMode)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
