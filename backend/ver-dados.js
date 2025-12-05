const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

console.log('\n📊 ===== DADOS DO BANCO =====\n');

// Listar todos os interessados
db.all('SELECT * FROM prospects ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
        console.error('Erro:', err);
        return;
    }

    console.log(`🎓 INTERESSADOS (${rows.length} cadastrados):\n`);

    if (rows.length === 0) {
        console.log('   Nenhum interessado cadastrado ainda.\n');
    } else {
        rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.studentName} (${row.grade})`);
            console.log(`      Responsável: ${row.parentName}`);
            console.log(`      Telefone: ${row.phone}`);
            console.log(`      Email: ${row.email}`);
            console.log(`      Status: ${row.status}`);
            console.log(`      Cadastrado em: ${row.created_at}`);
            console.log('');
        });
    }

    // Listar turmas
    db.all('SELECT * FROM turmas', [], (err, turmas) => {
        if (err) {
            console.error('Erro:', err);
            return;
        }

        console.log(`\n🏫 TURMAS (${turmas.length} cadastradas)\n`);

        db.close();
    });
});
