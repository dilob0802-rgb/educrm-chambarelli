const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da raiz do projeto
app.use(express.static(path.join(__dirname, '..')));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// ==================== ROTAS DE PROSPECTS ====================

// GET - Listar todos os interessados
app.get('/api/prospects', (req, res) => {
    db.all('SELECT * FROM prospects ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Buscar interessado por ID
app.get('/api/prospects/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM prospects WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Interessado não encontrado' });
            return;
        }
        res.json(row);
    });
});

// POST - Criar novo interessado
app.post('/api/prospects', (req, res) => {
    const { studentName, grade, parentName, phone, email } = req.body;

    if (!studentName || !grade || !parentName || !phone || !email) {
        res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        return;
    }

    const sql = `INSERT INTO prospects (studentName, grade, parentName, phone, email, status, date) 
                 VALUES (?, ?, ?, ?, ?, 'Lead', ?)`;
    const date = new Date().toISOString();

    db.run(sql, [studentName, grade, parentName, phone, email, date], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            studentName,
            grade,
            parentName,
            phone,
            email,
            status: 'Lead',
            date
        });
    });
});

// PATCH - Atualizar status do interessado
app.patch('/api/prospects/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        res.status(400).json({ error: 'Status é obrigatório' });
        return;
    }

    // Buscar status anterior para histórico
    db.get('SELECT status FROM prospects WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const statusAnterior = row ? row.status : null;

        // Atualizar status
        const sql = `UPDATE prospects SET status = ?, lastContactDate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const now = Date.now();

        db.run(sql, [status, now, id], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Registrar no histórico
            db.run(
                'INSERT INTO historico (prospect_id, status_anterior, status_novo) VALUES (?, ?, ?)',
                [id, statusAnterior, status]
            );

            res.json({ message: 'Status atualizado', changes: this.changes });
        });
    });
});

// PUT - Atualizar interessado completo
app.put('/api/prospects/:id', (req, res) => {
    const { id } = req.params;
    const { studentName, grade, parentName, phone, email, status } = req.body;

    const sql = `UPDATE prospects 
                 SET studentName = ?, grade = ?, parentName = ?, phone = ?, email = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;

    db.run(sql, [studentName, grade, parentName, phone, email, status, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Interessado atualizado', changes: this.changes });
    });
});

// DELETE - Deletar interessado
app.delete('/api/prospects/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM prospects WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Interessado deletado', changes: this.changes });
    });
});

// ==================== ROTAS DE TURMAS ====================

// GET - Listar todas as turmas
app.get('/api/turmas', (req, res) => {
    db.all('SELECT * FROM turmas ORDER BY serie, turma', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET - Buscar turma por ID
app.get('/api/turmas/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM turmas WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Turma não encontrada' });
            return;
        }
        res.json(row);
    });
});

// PUT - Atualizar turma (matriculados)
app.put('/api/turmas/:id', (req, res) => {
    const { id } = req.params;
    const { matriculados } = req.body;

    if (matriculados === undefined) {
        res.status(400).json({ error: 'Campo matriculados é obrigatório' });
        return;
    }

    db.run('UPDATE turmas SET matriculados = ? WHERE id = ?', [matriculados, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Turma atualizada', changes: this.changes });
    });
});

// ==================== ROTAS DE HISTÓRICO ====================

// GET - Histórico de um prospect
app.get('/api/historico/:prospect_id', (req, res) => {
    const { prospect_id } = req.params;

    db.all(
        'SELECT * FROM historico WHERE prospect_id = ? ORDER BY data DESC',
        [prospect_id],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// ==================== ROTA RAIZ ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'start.html'));
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log(`🎓 EduCRM Backend - Chambarelli`);
    console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log('🗄️  Banco de dados: SQLite (database.db)');
    console.log('========================================');
    console.log('');
});
