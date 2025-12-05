const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'database.db');

// Criar conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar no banco:', err.message);
    } else {
        console.log('✅ Conectado ao banco SQLite');
        initDatabase();
    }
});

// Inicializar tabelas
function initDatabase() {
    // Tabela de Interessados (Prospects)
    db.run(`
        CREATE TABLE IF NOT EXISTS prospects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentName TEXT NOT NULL,
            grade TEXT NOT NULL,
            parentName TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            status TEXT DEFAULT 'Lead',
            observation TEXT,
            date TEXT NOT NULL,
            lastContactDate INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela prospects:', err.message);
        } else {
            // Tenta adicionar a coluna 'observation' se ela não existir (para bancos legados)
            db.run('ALTER TABLE prospects ADD COLUMN observation TEXT', (err) => {
                // Ignora erro se a coluna já existir
            });
            console.log('✅ Tabela prospects criada/verificada');
        }
    });

    // Tabela de Turmas
    db.run(`
        CREATE TABLE IF NOT EXISTS turmas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            serie TEXT NOT NULL,
            turma TEXT NOT NULL,
            matriculados INTEGER DEFAULT 0,
            vagas INTEGER NOT NULL,
            periodo TEXT
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela turmas:', err.message);
        } else {
            console.log('✅ Tabela turmas criada/verificada');
            seedTurmas();
        }
    });

    // Tabela de Histórico
    db.run(`
        CREATE TABLE IF NOT EXISTS historico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prospect_id INTEGER NOT NULL,
            status_anterior TEXT,
            status_novo TEXT NOT NULL,
            data DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (prospect_id) REFERENCES prospects(id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela historico:', err.message);
        } else {
            console.log('✅ Tabela historico criada/verificada');
        }
    });
}

// Popular tabela de turmas com dados do Chambarelli
function seedTurmas() {
    db.get('SELECT COUNT(*) as count FROM turmas', (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar turmas:', err.message);
            return;
        }

        // Só popula se estiver vazio
        if (row.count === 0) {
            const turmas = [
                { serie: 'Berçário', turma: 'BER', matriculados: 0, vagas: 5, periodo: null },
                { serie: 'MAT1', turma: 'M1A', matriculados: 2, vagas: 13, periodo: 'Manhã' },
                { serie: 'MAT1', turma: 'M1B', matriculados: 4, vagas: 13, periodo: 'Tarde' },
                { serie: 'MAT2', turma: 'M2A', matriculados: 6, vagas: 13, periodo: 'Manhã' },
                { serie: 'MAT2', turma: 'M2B', matriculados: 12, vagas: 13, periodo: 'Tarde' },
                { serie: 'PRE1', turma: 'PRE1A', matriculados: 2, vagas: 24, periodo: 'Manhã' },
                { serie: 'PRE1', turma: 'PRE1B', matriculados: 8, vagas: 24, periodo: 'Tarde' },
                { serie: 'PRE2', turma: 'PRE2A', matriculados: 8, vagas: 18, periodo: 'Manhã' },
                { serie: 'PRE2', turma: 'PRE2B', matriculados: 5, vagas: 18, periodo: 'Tarde' },
                { serie: '1º Ano', turma: '102', matriculados: 5, vagas: 19, periodo: null },
                { serie: '1º Ano', turma: '101', matriculados: 10, vagas: 19, periodo: null },
                { serie: '2º Ano', turma: '201', matriculados: 20, vagas: 17, periodo: 'Manhã' },
                { serie: '2º Ano', turma: '202', matriculados: 15, vagas: 17, periodo: 'Tarde' },
                { serie: '3º Ano', turma: '302', matriculados: 6, vagas: 23, periodo: null },
                { serie: '3º Ano', turma: '301', matriculados: 9, vagas: 23, periodo: null },
                { serie: '4º Ano', turma: '401', matriculados: 11, vagas: 23, periodo: 'Manhã' },
                { serie: '4º Ano', turma: '402', matriculados: 7, vagas: 23, periodo: 'Tarde' },
                { serie: '5º Ano', turma: '502', matriculados: 6, vagas: 18, periodo: null },
                { serie: '5º Ano', turma: '501', matriculados: 26, vagas: 18, periodo: null },
                { serie: '6º Ano', turma: '621', matriculados: 1, vagas: 21, periodo: null },
                { serie: '6º Ano', turma: '611', matriculados: 19, vagas: 3, periodo: null },
                { serie: '7º Ano', turma: '711', matriculados: 7, vagas: 15, periodo: 'Manhã' },
                { serie: '7º Ano', turma: '721', matriculados: 10, vagas: 12, periodo: 'Tarde' },
                { serie: '8º Ano', turma: '811', matriculados: 2, vagas: 20, periodo: null },
                { serie: '9º Ano', turma: '911', matriculados: 4, vagas: 18, periodo: null }
            ];

            const stmt = db.prepare('INSERT INTO turmas (serie, turma, matriculados, vagas, periodo) VALUES (?, ?, ?, ?, ?)');

            turmas.forEach(t => {
                stmt.run(t.serie, t.turma, t.matriculados, t.vagas, t.periodo);
            });

            stmt.finalize(() => {
                console.log('✅ 25 turmas do Chambarelli inseridas no banco!');
            });
        }
    });
}

module.exports = db;
