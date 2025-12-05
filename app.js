/**
 * EduCRM - Main Application Logic (Admin Panel)
 * Centro Educacional Chambarelli
 * Conectado ao Backend com SQLite
 */

// --- API Configuration ---
const API_URL = '/api';

// --- State Management ---
const store = {
    prospects: [],
    turmas: [],
    currentView: 'dashboard',

    async load() {
        await this.loadProspects();
        await this.loadTurmas();
    },

    async loadProspects() {
        try {
            const response = await fetch(`${API_URL}/prospects`);
            this.prospects = await response.json();
        } catch (error) {
            console.error('Erro ao carregar interessados:', error);
            this.prospects = [];
        }
    },

    async loadTurmas() {
        try {
            const response = await fetch(`${API_URL}/turmas`);
            this.turmas = await response.json();
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            this.turmas = [];
        }
    },

    async addProspect(data) {
        try {
            const response = await fetch(`${API_URL}/prospects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newProspect = await response.json();
            await this.loadProspects();
            router.navigate(this.currentView);
            return newProspect;
        } catch (error) {
            console.error('Erro ao adicionar interessado:', error);
            alert('Erro ao salvar interessado. Verifique se o servidor está rodando.');
        }
    },

    async updateProspectStatus(id, newStatus) {
        try {
            await fetch(`${API_URL}/prospects/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            await this.loadProspects();
            router.navigate(this.currentView);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status. Verifique se o servidor está rodando.');
        }
    }
};

// --- UI Helper ---
const ui = {
    openModal() {
        document.getElementById('modal-add-prospect').classList.remove('hidden');
    },
    closeModal() {
        document.getElementById('modal-add-prospect').classList.add('hidden');
        document.getElementById('form-add-prospect').reset();
    }
};

// --- Router ---
const router = {
    navigate(view) {
        store.currentView = view;

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeBtn = document.querySelector(`button[onclick="router.navigate('${view}')"]`);
        if (activeBtn) activeBtn.classList.add('active');

        const contentArea = document.getElementById('content-area');
        const pageTitle = document.getElementById('page-title');
        if (!contentArea) return;

        contentArea.innerHTML = '';

        switch (view) {
            case 'dashboard':
                pageTitle.innerText = 'Visão Geral';
                renderDashboard(contentArea);
                break;
            case 'funil':
                pageTitle.innerText = 'Funil de Vendas';
                renderFunil(contentArea);
                break;
            case 'prospects':
                pageTitle.innerText = 'Interessados';
                renderProspects(contentArea);
                break;
            case 'turmas':
                pageTitle.innerText = 'Turmas e Vagas';
                renderTurmas(contentArea);
                break;
        }
    }
};

// --- Renderers ---

function renderDashboard(container) {
    const total = store.prospects.length;
    const byStatus = {
        'Lead': store.prospects.filter(p => p.status === 'Lead').length,
        '1º Contato': store.prospects.filter(p => p.status === '1º Contato').length,
        'Respondeu': store.prospects.filter(p => p.status === 'Respondeu').length,
        'Visita Agendada': store.prospects.filter(p => p.status === 'Visita Agendada').length,
        'Em Negociação': store.prospects.filter(p => p.status === 'Em Negociação').length
    };

    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-title">Total de Interessados</span>
                <span class="stat-value">${total}</span>
            </div>
            <div class="stat-card" style="border-left: 3px solid #06b6d4;">
                <span class="stat-title">Lead</span>
                <span class="stat-value">${byStatus['Lead']}</span>
            </div>
            <div class="stat-card" style="border-left: 3px solid #f59e0b;">
                <span class="stat-title">1º Contato</span>
                <span class="stat-value">${byStatus['1º Contato']}</span>
            </div>
            <div class="stat-card" style="border-left: 3px solid #8b5cf6;">
                <span class="stat-title">Respondeu</span>
                <span class="stat-value">${byStatus['Respondeu']}</span>
            </div>
            <div class="stat-card" style="border-left: 3px solid #10b981;">
                <span class="stat-title">Visita Agendada</span>
                <span class="stat-value">${byStatus['Visita Agendada']}</span>
            </div>
            <div class="stat-card" style="border-left: 3px solid #ef4444;">
                <span class="stat-title">Em Negociação</span>
                <span class="stat-value">${byStatus['Em Negociação']}</span>
            </div>
        </div>
    `;
    container.innerHTML = html;
}

function renderFunil(container) {
    const stages = ['Lead', '1º Contato', 'Respondeu', 'Visita Agendada', 'Em Negociação'];
    const colors = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

    const html = `
        <div style="display:flex; gap:1rem; overflow-x:auto; padding-bottom:1rem;">
            ${stages.map((stage, idx) => {
        const prospects = store.prospects.filter(p => p.status === stage);
        return `
                    <div style="min-width:280px; background:white; border-radius:var(--radius-lg); padding:1rem; box-shadow:var(--shadow-sm);">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:3px solid ${colors[idx]};">
                            <h3 style="font-size:1rem; font-weight:600;">${stage}</h3>
                            <span style="background:${colors[idx]}; color:white; padding:0.25rem 0.5rem; border-radius:var(--radius-full); font-size:0.85rem; font-weight:600;">${prospects.length}</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.75rem; max-height:600px; overflow-y:auto;">
                            ${prospects.map(p => `
                                <div class="kanban-card">
                                    <div style="font-weight:600; margin-bottom:0.25rem;">${p.studentName}</div>
                                    <div style="font-size:0.85rem; color:#6b7280;">${p.parentName}</div>
                                    <div style="font-size:0.85rem; color:#6b7280; margin-top:0.25rem;">
                                        <i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${p.phone}
                                    </div>
                                    <div style="margin-top:0.5rem;">
                                        <select onchange="store.updateProspectStatus(${p.id}, this.value)" style="width:100%; padding:0.25rem; font-size:0.85rem; border:1px solid var(--border); border-radius:4px;">
                                            ${stages.map(s => `<option value="${s}" ${s === stage ? 'selected' : ''}>${s}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
    container.innerHTML = html;
}

function renderProspects(container) {
    const html = `
        <div class="schools-header">
            <p class="text-muted">Gerencie todos os interessados em matrícula.</p>
            <button class="btn-primary" onclick="ui.openModal()">
                <i class="fa-solid fa-plus"></i> Adicionar Interessado
            </button>
        </div>
        <div id="prospects-list" style="display:flex; flex-direction:column; gap:1.5rem;"></div>
    `;
    container.innerHTML = html;

    const list = document.getElementById('prospects-list');
    const sorted = [...store.prospects].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sorted.forEach(p => {
        const card = document.createElement('div');
        card.className = 'school-card';
        // Aumentando padding e espaçamento interno
        card.style.padding = '2rem';

        card.innerHTML = `
            <div class="school-info" style="align-items: flex-start;">
                <div style="width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <div class="school-name" style="font-size:1.5rem; display:flex; align-items:center; gap:0.75rem;">
                            <i class="fa-solid fa-user-graduate" style="color:var(--primary);"></i> ${p.studentName} 
                            <span style="font-size:0.9rem; background:var(--primary-light); color:var(--primary-dark); padding:4px 12px; border-radius:var(--radius-full); font-weight:600;">
                                <i class="fa-solid fa-book-open" style="margin-right:4px;"></i> ${p.grade}
                            </span>
                        </div>
                        <span style="font-size:1rem; font-weight:600; padding:6px 16px; border-radius:var(--radius-md); background:${getStatusColorBg(p.status)}; color:${getStatusColorText(p.status)};">
                            ${p.status}
                        </span>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:1.5rem; padding-top:1.5rem; border-top:1px solid var(--border);">
                        
                        <!-- Responsável -->
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:40px; height:40px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:2px;">Responsável</div>
                                <div style="font-weight:600;">${p.parentName}</div>
                            </div>
                        </div>

                        <!-- Telefone -->
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:40px; height:40px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div>
                                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:2px;">Telefone</div>
                                <div style="font-weight:600;">${p.phone}</div>
                            </div>
                        </div>

                        <!-- Email -->
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:40px; height:40px; background:#f3f4f6; border-radius:50%; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                            <div>
                                <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:2px;">E-mail</div>
                                <div style="font-weight:600; word-break:break-all;">${p.email}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Observação (se houver) -->
                    ${p.observation ? `
                    <div style="margin-top:1.5rem; padding:1rem; background:#fffbeb; border:1px solid #fcd34d; border-radius:var(--radius-md); display:flex; gap:0.75rem;">
                        <i class="fa-solid fa-note-sticky" style="color:#d97706; margin-top:3px;"></i>
                        <div style="color:#92400e; font-size:0.95rem;">${p.observation}</div>
                    </div>
                    ` : ''}

                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function getStatusColorBg(status) {
    const map = {
        'Lead': '#e0e7ff',
        '1º Contato': '#fef3c7',
        'Respondeu': '#ede9fe',
        'Visita Agendada': '#d1fae5',
        'Em Negociação': '#fee2e2'
    };
    return map[status] || '#f3f4f6';
}

function getStatusColorText(status) {
    const map = {
        'Lead': '#4338ca',
        '1º Contato': '#b45309',
        'Respondeu': '#6d28d9',
        'Visita Agendada': '#065f46',
        'Em Negociação': '#991b1b'
    };
    return map[status] || '#374151';
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    await store.load();
    router.navigate('dashboard');

    // Form Handler
    document.getElementById('form-add-prospect').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await store.addProspect({
            studentName: formData.get('studentName'),
            grade: formData.get('grade'),
            parentName: formData.get('parentName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            observation: formData.get('observation')
        });
        ui.closeModal();
    });
});
