/**
 * Vednova MFD Admin Portal Controller
 * Version: 2.5 (Multi-Partner & Multi-Admin Architecture)
 * 
 * Manages firm-wide client policy audits, partner co-admins, RM team members,
 * and seamless bridging into individual client policy vaults strictly scoped
 * to the authenticated MFD distributor.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Session check: ensure user is logged in
  if (typeof VednovaDB !== 'undefined') {
    const session = VednovaDB.getActiveSession();
    if (!session) {
      const params = new URLSearchParams(window.location.search);
      if (!params.has('preview')) {
        window.location.href = 'mfd-login.html';
        return;
      }
    }
  }

  syncAdminProfileHeader();
  renderAdminOverview();
  renderRmDropdowns();
  renderClientsTable();
  renderTeamGrid();
  loadFirmSettings();
  loadFirmLogoPreview();
});

function switchAdminTab(tabKey) {
  const session = VednovaDB.getActiveSession();
  if (session && session.isRM && tabKey !== 'clients') {
    tabKey = 'clients'; // RM cannot switch to team or firm settings
  }
  const tabs = ['clients', 'team', 'firm'];
  tabs.forEach(t => {
    const btn = document.getElementById(`adm-tab-${t}`);
    const panel = document.getElementById(`adm-panel-${t}`);
    if (btn) {
      if (t === tabKey) {
        btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-gold-500 text-ink-950 transition shadow';
      } else {
        btn.className = 'px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition';
      }
    }
    if (panel) panel.classList.toggle('hidden', t !== tabKey);
  });
}

function renderAdminOverview() {
  const session = VednovaDB.getActiveSession();
  const isRM = session && session.isRM;
  const myRmId = session ? session.rmId : null;

  const allClients = VednovaDB.getClients();
  const team = VednovaDB.getTeam();

  const clients = (isRM && myRmId)
    ? allClients.filter(c => c.rmId === myRmId)
    : allClients;

  let totalPolicies = 0;
  let totalPremium = 0;
  let totalAvoided = 0;

  clients.forEach(c => {
    totalPolicies += (c.policies ? c.policies.length : 0);
    totalPremium += (c.annualRunRate || 0);
    totalAvoided += (c.avoidedPremiums || 0);
  });

  const clientLabel = isRM ? `${clients.length} Assigned Families` : `${clients.length} Families`;
  const policyLabel = isRM ? `${totalPolicies} Serviced Policies` : `${totalPolicies} Policies`;
  const roleLabel = isRM ? (session.adminRole || 'Active RM') : `${team.length} Active Members`;

  document.getElementById('stat-total-clients').textContent = clientLabel;
  document.getElementById('stat-total-policies').textContent = policyLabel;
  document.getElementById('stat-total-premium').textContent = `${VednovaMath.formatINR(totalPremium, true)}/yr`;
  document.getElementById('stat-sip-pipeline').textContent = `${VednovaMath.formatINR(totalAvoided, true)}/yr`;
  document.getElementById('stat-total-rms').textContent = roleLabel;

  const clientSub = document.getElementById('stat-clients-sub');
  if (clientSub) {
    clientSub.textContent = isRM ? 'Assigned to your desk' : 'Across all active RMs';
  }

  const policiesSub = document.getElementById('stat-policies-sub');
  if (policiesSub) {
    policiesSub.textContent = totalPolicies > 0 ? 'ULIP, Endowment & Traditional' : 'No policies uploaded yet';
  }

  const premiumSub = document.getElementById('stat-premium-sub');
  if (premiumSub) {
    premiumSub.textContent = totalPremium > 0 ? 'Total client outlays' : 'Awaiting client policy entry';
  }

  const sipSub = document.getElementById('stat-sip-pipeline-sub');
  if (sipSub) {
    if (totalAvoided > 0) {
      const monthlySip = Math.round(totalAvoided / 12);
      sipSub.textContent = `~${VednovaMath.formatINR(monthlySip, true)}/mo new equity SIPs`;
    } else {
      sipSub.textContent = '₹0/mo redirected to SIPs';
    }
  }

  const card5Title = document.getElementById('stat-card-5-title');
  if (card5Title) {
    card5Title.textContent = isRM ? 'Servicing Role' : 'Firm Team Members';
  }
  const card5Sub = document.getElementById('stat-card-5-sub');
  if (card5Sub) {
    card5Sub.textContent = isRM ? (session.adminRole || 'Active RM') : 'Assigned & servicing';
  }
}

function renderRmDropdowns() {
  const team = VednovaDB.getTeam();
  const session = VednovaDB.getActiveSession();
  const isRM = session && session.isRM;
  const myRmId = session ? session.rmId : null;

  // RM filter select in client table
  const filterSelect = document.getElementById('rm-filter-select');
  if (filterSelect) {
    if (isRM) {
      filterSelect.style.display = 'none';
    } else {
      filterSelect.style.display = '';
      let curVal = filterSelect.value || 'ALL';
      filterSelect.innerHTML = `<option value="ALL">All Servicing RMs & Partners</option>` + 
        team.map(m => `<option value="${m.id}">${m.name} ${m.isAdmin ? '👑' : ''}</option>`).join('');

      if (team.some(m => m.id === curVal) || curVal === 'ALL') {
        filterSelect.value = curVal;
      } else {
        filterSelect.value = 'ALL';
      }
    }
  }

  // RM assign select in register new client modal
  const modalSelect = document.getElementById('new-client-rm');
  if (modalSelect) {
    modalSelect.innerHTML = team.map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('');
    if (isRM && myRmId && team.some(m => m.id === myRmId)) {
      modalSelect.value = myRmId;
    }
  }
}

function renderClientsTable() {
  const tbody = document.getElementById('clients-table-tbody');
  if (!tbody) return;

  const session = VednovaDB.getActiveSession();
  const isRM = session && session.isRM;
  const myRmId = session ? session.rmId : null;

  const clients = VednovaDB.getClients();
  const branchFilter = document.getElementById('branch-filter-select').value;
  const rmFilterEl = document.getElementById('rm-filter-select');
  const rmFilter = (isRM && myRmId) ? myRmId : (rmFilterEl ? rmFilterEl.value : 'ALL');
  const search = document.getElementById('client-search-input').value.trim().toLowerCase();

  const filtered = clients.filter(c => {
    if (isRM && myRmId && c.rmId !== myRmId) return false;
    if (branchFilter !== 'ALL') {
      const bInfo = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
        ? VednovaSOP.resolveBranch(c)
        : null;
      if (bInfo && bInfo.key !== branchFilter && c.serviceBranch !== branchFilter) return false;
      if (!bInfo && c.serviceBranch !== branchFilter) return false;
    }
    if (!isRM && rmFilter !== 'ALL' && c.rmId !== rmFilter) return false;
    if (search) {
      const matchName = c.clientName.toLowerCase().includes(search);
      const matchCase = c.caseId.toLowerCase().includes(search);
      const matchPolicy = (c.policies || []).some(p => p.productName.toLowerCase().includes(search));
      if (!matchName && !matchCase && !matchPolicy) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-500 font-mono">
          ${isRM ? 'No client plans currently assigned to your desk.' : 'No client plans match the selected criteria for this firm.'}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const bInfo = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
      ? VednovaSOP.resolveBranch(c)
      : null;
    const branchKey = bInfo ? bInfo.key : c.serviceBranch;
    const branchBadge = branchKey === 'NAVY'
      ? '<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono">⚓ Navy (DSOPF)</span>'
      : branchKey === 'ARMY'
      ? '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">⚔️ Army (DSOPF)</span>'
      : branchKey === 'AIR_FORCE'
      ? '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-mono">✈️ Air Force (DSOPF)</span>'
      : branchKey === 'PARAMILITARY'
      ? '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">🛡️ Govt (GPF)</span>'
      : branchKey === 'CIVILIAN_SALARIED'
      ? '<span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono">💼 Corporate (EPF 8.25%)</span>'
      : '<span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">👔 Civilian (PPF & SGB)</span>';

    const statusCounts = c.statusCounts || { surrender: 1, paidUp: 0, continue: 1 };

    return `
      <tr class="hover:bg-navy-900/50 transition">
        <td class="py-3.5 px-4">
          <div class="font-serif text-white font-semibold text-sm">${c.clientName}</div>
          <span class="font-mono text-[10px] text-gold-400 font-bold tracking-wider">${c.caseId}</span>
        </td>
        <td class="py-3.5 px-4">
          ${branchBadge}
          <span class="block text-[10px] text-slate-400 mt-1">${c.branchTitle || ''}</span>
        </td>
        <td class="py-3.5 px-4">
          ${isRM ? `<span class="text-slate-200 font-medium">${c.assignedRM || 'Unassigned'}</span>` : `
            <select onchange="handleReassignClient('${c.caseId}', this.value)" class="bg-navy-950 border border-slate-700 hover:border-gold-500/60 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-gold-400 transition cursor-pointer max-w-[190px]">
              ${(typeof VednovaDB !== 'undefined' ? VednovaDB.getTeam() : []).map(m => `<option value="${m.id}" ${c.rmId === m.id ? 'selected' : ''}>${m.name} (${m.role ? m.role.split('(')[0].trim() : 'RM'}${m.isAdmin ? ' 👑' : ''})</option>`).join('')}
            </select>
          `}
        </td>
        <td class="py-3.5 px-4 font-mono text-slate-300">
          ${c.policies ? c.policies.length : 0} Policies
        </td>
        <td class="py-3.5 px-4 font-mono font-bold text-slate-200">
          ${VednovaMath.formatINR(c.annualRunRate)}
        </td>
        <td class="py-3.5 px-4">
          <span class="text-[11px] font-mono text-slate-300">
            <strong class="text-rose-400">${statusCounts.surrender || 0} Exit</strong> · 
            <strong class="text-amber-400">${statusCounts.paidUp || 0} Paid-Up</strong> · 
            <strong class="text-emerald-400">${statusCounts.continue || 0} Keep</strong>
          </span>
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="openClientVault('${c.caseId}')" class="px-2.5 py-1 rounded bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-[11px] transition shadow" title="Open Client Policy Vault">
              Open Vault ↗
            </button>
            <button onclick="copyClientVaultLink('${c.caseId}')" class="p-1.5 rounded bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700 transition" title="Copy Shareable Link">
              🔗
            </button>
            <button onclick="exportClientReport('${c.caseId}')" class="p-1.5 rounded bg-navy-900 hover:bg-navy-800 text-slate-300 hover:text-white border border-slate-700 transition" title="Generate PDF Report">
              📄
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.filterClientsTable = function() {
  renderClientsTable();
};

window.openClientVault = function(caseId) {
  window.open(`vault.html?caseId=${encodeURIComponent(caseId)}`, '_blank');
};

window.copyClientVaultLink = function(caseId) {
  const url = `${window.location.origin}${window.location.pathname.replace('mfd-admin.html', '')}vault.html?caseId=${encodeURIComponent(caseId)}`;
  navigator.clipboard.writeText(url).then(() => {
    alert(`Client Vault link copied to clipboard!\n\n${url}`);
  }).catch(() => {
    prompt('Copy client vault link:', url);
  });
};

window.exportClientReport = function(caseId) {
  const client = VednovaDB.getClientByCaseId(caseId);
  const firm = (client && typeof VednovaDB !== 'undefined') ? VednovaDB.getFirmByClient(client) : VednovaDB.getFirm();
  if (client && typeof VednovaPDF !== 'undefined') {
    VednovaPDF.generateReport('B', client, 0.08, client.serviceBranch, firm);
  }
};

function renderTeamGrid() {
  const container = document.getElementById('team-members-grid');
  if (!container) return;

  const team = VednovaDB.getTeam();
  const session = VednovaDB.getActiveSession();
  const isRM = session && session.isRM;

  // Hide add member button and partner banner for standard RMs
  const addBtn = document.getElementById('btn-open-add-team-modal');
  if (addBtn) addBtn.style.display = isRM ? 'none' : '';
  const adminBanner = document.getElementById('admin-privileges-banner');
  if (adminBanner) adminBanner.style.display = isRM ? 'none' : '';

  container.innerHTML = team.map(m => {
    const isAdmin = m.isAdmin || (m.role && m.role.toLowerCase().includes('admin'));
    const isPrimary = m.isPrimaryAdmin || m.id === 'rm_01' || m.id === 'rm_awp_01';

    const adminBadge = isAdmin
      ? '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold">👑 Admin Partner</span>'
      : '<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">👤 Servicing RM</span>';

    let actionButton = '';
    if (isRM) {
      actionButton = '<span class="text-[10px] text-slate-500 font-mono">Team Colleague</span>';
    } else if (isPrimary) {
      actionButton = '<span class="text-[10px] text-slate-500 font-mono italic">Primary Founder</span>';
    } else if (isAdmin) {
      actionButton = `<button onclick="toggleAdminPrivilege('${m.id}')" class="text-[10px] text-slate-400 hover:text-amber-300 transition underline">Demote to RM</button>`;
    } else {
      actionButton = `<button onclick="toggleAdminPrivilege('${m.id}')" class="text-[10px] text-gold-400 hover:text-gold-300 font-semibold transition flex items-center gap-1"><span>👑</span> Make Admin Partner</button>`;
    }

    const deleteButton = (!isPrimary && !isRM)
      ? `<button onclick="handleRemoveTeamMember('${m.id}')" class="text-slate-500 hover:text-rose-400 text-xs transition p-1" title="Remove Member">✕</button>`
      : '';

    const passwordButton = !isRM
      ? `<button onclick="openChangeRmPasswordModal('${m.id}')" class="text-[10px] text-slate-400 hover:text-gold-300 transition flex items-center gap-1 font-mono px-2 py-0.5 rounded bg-navy-950 border border-slate-800 hover:border-slate-700" title="Set or Change RM Password"><span>🔑</span> Password</button>`
      : '';

    return `
      <div class="bg-panel-800/90 border border-slate-800 p-5 rounded-xl relative overflow-hidden shadow">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-full bg-navy-900 border border-slate-700 flex items-center justify-center font-serif text-gold-400 font-bold text-sm">
            ${m.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div class="flex items-center gap-1.5">
            ${adminBadge}
            ${deleteButton}
          </div>
        </div>

        <h4 class="text-base font-serif text-white font-medium mb-0.5">${m.name}</h4>
        <p class="text-xs text-slate-400 font-mono mb-3">${m.role}</p>

        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div>
            <span class="text-slate-500 block text-[10px] uppercase">Clients</span>
            <strong class="text-white">${m.clientsCount || 0} Audited</strong>
          </div>
          <div>
            <span class="text-slate-500 block text-[10px] uppercase">SIP Pipeline</span>
            <strong class="text-emerald-400 font-mono">${VednovaMath.formatINR(m.activeSIPPipeline || 0, true)}</strong>
          </div>
        </div>

        <div class="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">${m.email || ''}</span>
            ${passwordButton}
          </div>
          ${actionButton}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleAdminPrivilege = function(memberId) {
  const updated = VednovaDB.toggleTeamMemberAdmin(memberId);
  if (updated) {
    const statusText = updated.isAdmin ? 'granted Full Administrator & Business Partner rights' : 'demoted to servicing Relationship Manager';
    alert(`${updated.name} has been ${statusText}.`);
    renderTeamGrid();
    renderRmDropdowns();
  }
};

window.handleRemoveTeamMember = function(memberId) {
  const team = VednovaDB.getTeam();
  const member = team.find(m => m.id === memberId);
  const memberName = member ? member.name : 'this member';

  if (confirm(`Are you sure you want to remove ${memberName} from your firm roster?\n\nAny client portfolios currently assigned to ${memberName} will be automatically reassigned to the Principal Admin with zero data loss.`)) {
    const res = VednovaDB.deleteTeamMember(memberId);
    if (res.success) {
      let msg = `${res.deletedName} has been removed from the firm roster.`;
      if (res.reassignedCount > 0) {
        msg += `\n\n${res.reassignedCount} client portfolio(s) were automatically reassigned to Admin: ${res.reassignedTo}.`;
      }
      alert(msg);
      renderTeamGrid();
      renderRmDropdowns();
      renderClientsTable();
      renderAdminOverview();
    } else {
      alert(res.message || 'Could not remove team member.');
    }
  }
};

window.handleReassignClient = function(caseId, targetRmId) {
  const res = VednovaDB.reassignClient(caseId, targetRmId);
  if (res.success) {
    alert(`Client ${res.client.clientName} (${caseId}) successfully reassigned to ${res.assignedRM}!`);
    renderClientsTable();
    renderTeamGrid();
    renderAdminOverview();
  } else {
    alert(res.message || 'Could not reassign client.');
  }
};

window.openChangeRmPasswordModal = function(memberId) {
  const team = VednovaDB.getTeam();
  const m = team.find(t => t.id === memberId);
  if (!m) return;
  document.getElementById('change-rm-id').value = m.id;
  document.getElementById('change-rm-name').textContent = m.name;
  document.getElementById('change-rm-meta').textContent = `${m.email || 'No email'} · ${m.role}`;
  document.getElementById('change-rm-new-password').value = '';
  document.getElementById('change-rm-password-modal').classList.remove('hidden');
};

window.closeChangeRmPasswordModal = function() {
  document.getElementById('change-rm-password-modal').classList.add('hidden');
};

window.generateRandomRMPassword = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  let pwd = '';
  for (let i = 0; i < 10; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  document.getElementById('change-rm-new-password').value = pwd;
};

window.handleSaveRmPassword = function(e) {
  e.preventDefault();
  const rmId = document.getElementById('change-rm-id').value;
  const newPass = document.getElementById('change-rm-new-password').value.trim();
  if (!newPass || newPass.length < 4) {
    alert('Please enter a valid password (minimum 4 characters).');
    return;
  }
  const res = VednovaDB.updateTeamMemberPassword(rmId, newPass);
  if (res.success) {
    alert(`Password for ${res.member.name} updated successfully to: "${newPass}"\n\nThey can now sign in using their official email and this password.`);
    closeChangeRmPasswordModal();
  } else {
    alert(res.message || 'Failed to update password.');
  }
};

function loadFirmSettings() {
  const firm = VednovaDB.getFirm();
  const session = VednovaDB.getActiveSession();
  const isRM = session && session.isRM;

  const nameEl = document.getElementById('setting-firm-name');
  if (nameEl) { nameEl.value = firm.firmName || ''; nameEl.disabled = isRM; }
  const yearEl = document.getElementById('setting-firm-year');
  if (yearEl) { yearEl.value = firm.establishedYear || 1998; yearEl.disabled = isRM; }
  const arnEl = document.getElementById('setting-firm-arn');
  if (arnEl) { arnEl.value = firm.arn || ''; arnEl.disabled = isRM; }
  const emailEl = document.getElementById('setting-firm-email');
  if (emailEl) { emailEl.value = firm.email || ''; emailEl.disabled = isRM; }
  const tagEl = document.getElementById('setting-firm-tagline');
  if (tagEl) { tagEl.value = firm.tagline || ''; tagEl.disabled = isRM; }

  // RM Notice & Button visibility
  const noticeEl = document.getElementById('rm-settings-notice');
  if (noticeEl) noticeEl.classList.toggle('hidden', !isRM);

  const saveBtn = document.getElementById('btn-save-firm-settings');
  if (saveBtn) saveBtn.style.display = isRM ? 'none' : '';

  const aiLogoBtn = document.getElementById('btn-ai-logo-open');
  if (aiLogoBtn) aiLogoBtn.style.display = isRM ? 'none' : '';

  const dropzone = document.getElementById('logo-dropzone');
  if (dropzone) {
    dropzone.style.pointerEvents = isRM ? 'none' : '';
    dropzone.style.opacity = isRM ? '0.6' : '1';
  }

  const headerSubtext = document.getElementById('header-firm-subtext');
  if (headerSubtext && firm) {
    headerSubtext.textContent = `${(firm.firmName || '').toUpperCase()} · ${(firm.arn || '').toUpperCase()}`;
  }

  loadFirmLogoPreview();
}

window.saveFirmSettings = function(e) {
  e.preventDefault();
  const session = VednovaDB.getActiveSession();
  if (session && session.isRM) {
    alert('Access Restricted: Only Admin Partners can modify firm settings and white-label co-branding.');
    return;
  }
  const existing = VednovaDB.getFirm();
  const firm = {
    ...existing,
    firmName: document.getElementById('setting-firm-name').value.trim(),
    establishedYear: Number(document.getElementById('setting-firm-year').value),
    arn: document.getElementById('setting-firm-arn').value.trim(),
    email: document.getElementById('setting-firm-email').value.trim(),
    tagline: document.getElementById('setting-firm-tagline').value.trim()
  };
  VednovaDB.saveFirm(firm);
  loadFirmSettings();
  syncAdminProfileHeader();
  alert('Firm profile & white-label settings updated successfully!');
};

function syncAdminProfileHeader() {
  const firm = VednovaDB.getFirm();
  if (!firm) return;

  const session = VednovaDB.getActiveSession();
  const isAdmin = session ? !session.isRM : true;
  const isRM = session ? !!session.isRM : false;

  const adminName = (session && session.adminName) ? session.adminName : (firm.adminName || 'Rohit Dev');
  const adminRole = (session && session.adminRole) ? session.adminRole : (firm.adminRole || 'Principal MFD (Admin)');
  const initials = adminName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD';

  const avatarEl = document.getElementById('admin-avatar-initials');
  if (avatarEl) avatarEl.textContent = initials;

  const nameEl = document.getElementById('admin-profile-name');
  if (nameEl) nameEl.textContent = adminName;

  const roleEl = document.getElementById('admin-profile-role');
  if (roleEl) {
    roleEl.innerHTML = `
      <span>${adminRole}</span>
      <span class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${isAdmin ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'}">
        ${isAdmin ? '👑 Admin' : '👤 Servicing RM'}
      </span>
    `;
  }

  // Header portal role badge
  const portalBadge = document.getElementById('portal-role-badge');
  if (portalBadge) {
    if (isRM) {
      portalBadge.textContent = 'SERVICING RM PORTAL';
      portalBadge.className = 'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30';
    } else {
      portalBadge.textContent = 'MFD ADMIN PORTAL';
      portalBadge.className = 'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/15 text-gold-400 border border-gold-500/30';
    }
  }

  // Header add team button
  const headerAddTeamBtn = document.getElementById('header-add-team-btn');
  if (headerAddTeamBtn) {
    headerAddTeamBtn.style.display = isRM ? 'none' : '';
  }

  // Role-based Navigation Tabs (Remove Team & Firm Settings for RM logins)
  const tabTeam = document.getElementById('adm-tab-team');
  const tabFirm = document.getElementById('adm-tab-firm');
  const tabClients = document.getElementById('adm-tab-clients');
  if (isRM) {
    if (tabTeam) tabTeam.style.display = 'none';
    if (tabFirm) tabFirm.style.display = 'none';
    if (tabClients) tabClients.textContent = 'My Client Plans';
    switchAdminTab('clients');
  } else {
    if (tabTeam) tabTeam.style.display = '';
    if (tabFirm) tabFirm.style.display = '';
    if (tabClients) tabClients.textContent = 'All Client Plans (Firm-wide)';
  }

  // Header firm subtext
  const headerSubtext = document.getElementById('header-firm-subtext');
  if (headerSubtext) {
    headerSubtext.textContent = `${(firm.firmName || '').toUpperCase()} · ${(firm.arn || '').toUpperCase()}`;
  }

  // Firm label next to tabs
  const firmLabel = document.getElementById('admin-current-firm-label');
  if (firmLabel) {
    firmLabel.textContent = `${firm.firmName} (Est. ${firm.establishedYear || 1998})`;
  }

  // Handle Distributor Logo in header
  const logoContainer = document.getElementById('mfd-logo-container');
  if (logoContainer) {
    if (firm.logoUrl) {
      logoContainer.innerHTML = `<img id="mfd-header-logo" src="${firm.logoUrl}" alt="${firm.firmName} Logo" class="h-10 max-w-[170px] object-contain filter drop-shadow">`;
    } else {
      const firmInitials = (firm.firmName || 'MFD').split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
      logoContainer.innerHTML = `
        <div class="h-9 px-3 rounded-lg bg-navy-900 border border-gold-500/40 flex items-center justify-center gap-1.5 text-gold-300 font-serif font-bold text-xs tracking-wider shadow">
          <span>🏛️</span>
          <span>${firmInitials}</span>
        </div>
      `;
    }
  }
}

// ==========================================
// DISTRIBUTOR LOGO & AI BRAND ARCHITECT
// ==========================================

let activeAIStyle = 'heritage';
let activeAIPalette = 'gold_navy';
let activeAISeed = 1;
let currentGeneratedSVG = '';

function loadFirmLogoPreview() {
  const firm = VednovaDB.getFirm();
  const box = document.getElementById('firm-logo-preview-box');
  if (!box) return;

  if (firm && firm.logoUrl) {
    box.innerHTML = `<img src="${firm.logoUrl}" alt="${firm.firmName} Logo" class="max-h-16 max-w-full object-contain filter drop-shadow">`;
  } else {
    const initials = (firm && firm.firmName) 
      ? firm.firmName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()
      : 'MFD';
    box.innerHTML = `
      <div class="flex items-center gap-2 text-gold-400/80 font-serif font-bold text-xs tracking-wider">
        <span>🏛️</span>
        <span>${initials} (Default Monogram)</span>
      </div>
    `;
  }
}

window.handleLogoFileUpload = async function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const statusEl = document.getElementById('upload-status-indicator');
  if (statusEl) {
    statusEl.classList.remove('hidden', 'text-rose-400');
    statusEl.classList.add('text-emerald-400');
    statusEl.textContent = 'Processing logo file...';
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds 5MB limit. Please upload a smaller image or PDF.');
    if (statusEl) statusEl.classList.add('hidden');
    return;
  }

  const fileName = file.name.toLowerCase();

  // If PDF file
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    if (typeof pdfjsLib === 'undefined') {
      alert('PDF parser is still loading. Please wait 2 seconds or upload a PNG/JPG.');
      if (statusEl) statusEl.classList.add('hidden');
      return;
    }

    try {
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          const page = await pdf.getPage(1);

          // Render at 3x scale for crisp 300 DPI vector output
          const viewport = page.getViewport({ scale: 3.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport: viewport }).promise;

          const dataUrl = canvas.toDataURL('image/png');
          saveNewLogo(dataUrl, `✓ PDF logo "${file.name}" rendered & saved at 300 DPI!`);
        } catch (err) {
          console.error('PDF Logo Render Error:', err);
          alert('Failed to process PDF logo. Please ensure it is an uncorrupted PDF or upload PNG/JPG.');
          if (statusEl) statusEl.classList.add('hidden');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error('PDF Reader Error:', e);
      alert('Unable to read PDF file.');
      if (statusEl) statusEl.classList.add('hidden');
    }
  } else {
    // Image file (PNG, JPG, JPEG, SVG)
    const reader = new FileReader();
    reader.onload = function(e) {
      saveNewLogo(e.target.result, `✓ Logo "${file.name}" uploaded and applied!`);
    };
    reader.readAsDataURL(file);
  }
};

function saveNewLogo(logoDataUrl, successMessage) {
  const firm = VednovaDB.getFirm();
  if (!firm) return;

  firm.logoUrl = logoDataUrl;
  VednovaDB.saveFirm(firm);

  loadFirmLogoPreview();
  syncAdminProfileHeader();

  const statusEl = document.getElementById('upload-status-indicator');
  if (statusEl) {
    statusEl.classList.remove('hidden', 'text-rose-400');
    statusEl.classList.add('text-emerald-400');
    statusEl.textContent = successMessage;
    setTimeout(() => {
      statusEl.classList.add('hidden');
    }, 4500);
  }
}

window.resetFirmLogo = function() {
  const firm = VednovaDB.getFirm();
  if (!firm) return;

  if (confirm('Reset distributor brand logo to default?')) {
    if (firm.arn && firm.arn.toUpperCase() === 'ARN-48291') {
      firm.logoUrl = 'assets/zenith-logo.svg';
    } else {
      firm.logoUrl = null;
    }
    VednovaDB.saveFirm(firm);
    loadFirmLogoPreview();
    syncAdminProfileHeader();

    const statusEl = document.getElementById('upload-status-indicator');
    if (statusEl) {
      statusEl.classList.remove('hidden', 'text-rose-400');
      statusEl.classList.add('text-emerald-400');
      statusEl.textContent = 'Distributor logo restored to system default.';
      setTimeout(() => statusEl.classList.add('hidden'), 3500);
    }
  }
};

// ==========================================
// AI BRAND ARCHITECT ENGINE
// ==========================================

window.openAILogoModal = function() {
  const session = VednovaDB.getActiveSession();
  if (session && session.isRM) {
    alert('Access Restricted: Only Admin Partners can modify firm branding.');
    return;
  }
  const firm = VednovaDB.getFirm();
  if (!firm) return;

  document.getElementById('ai-input-name').value = firm.firmName || '';
  document.getElementById('ai-input-year').value = firm.establishedYear || 2014;
  document.getElementById('ai-input-tagline').value = firm.tagline || 'FIDUCIARY WEALTH & ADVISORY';
  
  selectAIArchetype('heritage');
  document.getElementById('ai-logo-modal').classList.remove('hidden');
  triggerAIGeneration(false);
};

window.closeAILogoModal = function() {
  document.getElementById('ai-logo-modal').classList.add('hidden');
};

window.selectAIArchetype = function(styleKey) {
  activeAIStyle = styleKey;
  const styles = ['heritage', 'sovereign', 'modern', 'defence'];
  styles.forEach(s => {
    const btn = document.getElementById(`ai-arch-${s}`);
    if (btn) {
      if (s === styleKey) {
        btn.className = 'p-3 rounded-xl border-2 border-gold-500 bg-navy-900 text-left transition relative group shadow-md shadow-gold-500/10';
      } else {
        btn.className = 'p-3 rounded-xl border border-slate-700 bg-navy-950 hover:border-slate-500 text-left transition relative group';
      }
    }
  });
  triggerAIGeneration(false);
};

window.toggleAIPreviewBg = function(mode) {
  const stage = document.getElementById('ai-preview-stage');
  const darkBtn = document.getElementById('ai-bg-dark-btn');
  const lightBtn = document.getElementById('ai-bg-light-btn');

  if (mode === 'light') {
    stage.className = 'h-32 w-full rounded-xl bg-white border border-slate-300 flex items-center justify-center p-4 transition-colors relative overflow-hidden shadow-inner';
    lightBtn.className = 'px-2.5 py-1 text-[10px] font-mono rounded bg-slate-200 text-ink-950 font-bold';
    darkBtn.className = 'px-2.5 py-1 text-[10px] font-mono rounded text-slate-400 hover:text-white';
  } else {
    stage.className = 'h-32 w-full rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-center p-4 transition-colors relative overflow-hidden';
    darkBtn.className = 'px-2.5 py-1 text-[10px] font-mono rounded bg-slate-800 text-gold-400 font-bold';
    lightBtn.className = 'px-2.5 py-1 text-[10px] font-mono rounded text-slate-400 hover:text-white';
  }
};

window.triggerAIGeneration = function(animate = false) {
  const name = document.getElementById('ai-input-name').value.trim() || 'Apex Wealth Partners';
  const year = document.getElementById('ai-input-year').value || '2014';
  const tagline = document.getElementById('ai-input-tagline').value.trim() || 'FIDUCIARY WEALTH & ADVISORY';
  const palette = document.getElementById('ai-input-palette').value || 'gold_navy';

  if (animate) {
    activeAISeed++;
    const overlay = document.getElementById('ai-loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
    setTimeout(() => {
      renderCurrentAISVG(name, year, tagline, palette);
      if (overlay) overlay.classList.add('hidden');
    }, 280);
  } else {
    renderCurrentAISVG(name, year, tagline, palette);
  }
};

function getPaletteColors(paletteKey) {
  switch (paletteKey) {
    case 'sapphire':
      return {
        primary: '#38BDF8',
        secondary: '#BAE6FD',
        dark: '#0369A1',
        fill: '#081930',
        textDark: '#FFFFFF',
        textLight: '#0F172A',
        subDark: '#94A3B8',
        subLight: '#475569'
      };
    case 'emerald':
      return {
        primary: '#34D399',
        secondary: '#A7F3D0',
        dark: '#059669',
        fill: '#06261E',
        textDark: '#FFFFFF',
        textLight: '#0F172A',
        subDark: '#94A3B8',
        subLight: '#475569'
      };
    case 'ruby_bronze':
      return {
        primary: '#FBBF24',
        secondary: '#FDE68A',
        dark: '#B45309',
        fill: '#240F17',
        textDark: '#FFFFFF',
        textLight: '#0F172A',
        subDark: '#94A3B8',
        subLight: '#475569'
      };
    case 'gold_navy':
    default:
      return {
        primary: '#F59E0B',
        secondary: '#FDE68A',
        dark: '#B45309',
        fill: '#091528',
        textDark: '#FFFFFF',
        textLight: '#0F172A',
        subDark: '#94A3B8',
        subLight: '#475569'
      };
  }
}

function renderCurrentAISVG(name, year, tagline, palette) {
  const firm = VednovaDB.getFirm();
  const arn = (firm && firm.arn) ? firm.arn : 'ARN-887766';
  
  currentGeneratedSVG = generateVectorLogoSVG(activeAIStyle, name, year, arn, tagline, palette, activeAISeed);

  const container = document.getElementById('ai-preview-content');
  if (container) {
    container.innerHTML = currentGeneratedSVG;
  }
}

function generateVectorLogoSVG(style, name, year, arn, tagline, paletteKey, seed) {
  const c = getPaletteColors(paletteKey);

  // Extract initials (up to 3 characters)
  const words = name.split(/\s+/).filter(Boolean);
  const initials = (words.length > 1)
    ? words.map(w => w[0]).join('').substring(0, 3).toUpperCase()
    : name.substring(0, 2).toUpperCase();

  // Escape XML characters
  const esc = (str) => (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const safeName = esc(name.toUpperCase());
  const safeTagline = esc(tagline.toUpperCase());
  const safeArn = esc(arn.toUpperCase());

  let emblemMarkup = '';

  if (style === 'heritage') {
    // Roman Laurel Wreath with Concentric Rings & Heritage Banner
    emblemMarkup = `
      <g transform="translate(60, 60)">
        <!-- Outer Concentric Golden Ring -->
        <circle cx="0" cy="0" r="48" fill="none" stroke="${c.primary}" stroke-width="1.6" stroke-dasharray="2 3" opacity="0.85"/>
        <circle cx="0" cy="0" r="44" fill="${c.fill}" stroke="${c.secondary}" stroke-width="1.2"/>
        <circle cx="0" cy="0" r="38" fill="none" stroke="${c.dark}" stroke-width="0.8"/>

        <!-- Laurel Wreath Left -->
        <path d="M 0 38 C -22 36 -36 20 -36 -4 C -36 -24 -20 -36 0 -40" fill="none" stroke="${c.primary}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M -12 30 Q -24 24 -28 15 Q -22 18 -12 24" fill="${c.primary}"/>
        <path d="M -24 16 Q -34 8 -36 -2 Q -30 2 -22 10" fill="${c.primary}"/>
        <path d="M -28 -2 Q -36 -12 -34 -22 Q -28 -16 -24 -6" fill="${c.primary}"/>
        <path d="M -22 -18 Q -26 -28 -16 -34 Q -14 -26 -16 -16" fill="${c.primary}"/>

        <!-- Laurel Wreath Right -->
        <path d="M 0 38 C 22 36 36 20 36 -4 C 36 -24 20 -36 0 -40" fill="none" stroke="${c.primary}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 12 30 Q 24 24 28 15 Q 22 18 12 24" fill="${c.primary}"/>
        <path d="M 24 16 Q 34 8 36 -2 Q 30 2 22 10" fill="${c.primary}"/>
        <path d="M 28 -2 Q 36 -12 34 -22 Q 28 -16 24 -6" fill="${c.primary}"/>
        <path d="M 22 -18 Q 26 -28 16 -34 Q 14 -26 16 -16" fill="${c.primary}"/>

        <!-- Zenith Crown Star -->
        <polygon points="0,-43 2,-38 7,-38 3,-35 5,-30 0,-33 -5,-30 -3,-35 -7,-38 -2,-38" fill="${c.secondary}"/>

        <!-- Center Initials -->
        <text x="0" y="7" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="${initials.length > 2 ? '17' : '21'}" font-weight="700" fill="${c.secondary}" letter-spacing="1">
          ${initials}
        </text>

        <!-- Foundation Scroll -->
        <rect x="-24" y="24" width="48" height="12" rx="3" fill="${c.primary}" stroke="${c.dark}" stroke-width="0.8"/>
        <text x="0" y="33" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="800" fill="${c.fill}" letter-spacing="0.8">
          EST. ${year}
        </text>
      </g>
    `;
  } else if (style === 'sovereign') {
    // Sovereign Shield with Stars & Fortress Bastion
    emblemMarkup = `
      <g transform="translate(60, 60)">
        <!-- Outer Beveled Shield -->
        <path d="M -36 -38 L 36 -38 C 36 -38 40 4 34 22 C 28 38 0 49 0 49 C 0 49 -28 38 -34 22 C -40 4 -36 -38 -36 -38 Z" fill="${c.fill}" stroke="${c.primary}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M -30 -32 L 30 -32 C 30 -32 34 4 28 18 C 22 32 0 42 0 42 C 0 42 -22 32 -28 18 C -34 4 -30 -32 -30 -32 Z" fill="none" stroke="${c.secondary}" stroke-width="1" opacity="0.6"/>

        <!-- Top Sovereign Stars -->
        <polygon points="-16,-24 -14.5,-20 -10,-20 -13.5,-17.5 -12,-13 -16,-15.5 -20,-13 -18.5,-17.5 -22,-20 -17.5,-20" fill="${c.secondary}"/>
        <polygon points="0,-27 1.5,-23 6,-23 2.5,-20.5 4,-16 0,-18.5 -4,-16 -2.5,-20.5 -6,-23 -1.5,-23" fill="${c.secondary}"/>
        <polygon points="16,-24 17.5,-20 22,-20 18.5,-17.5 20,-13 16,-15.5 12,-13 13.5,-17.5 10,-20 14.5,-20" fill="${c.secondary}"/>

        <!-- Center Fiduciary Pillars / Monogram -->
        <circle cx="0" cy="5" r="19" fill="${c.fill}" stroke="${c.primary}" stroke-width="1.2"/>
        <text x="0" y="12" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="${initials.length > 2 ? '15' : '18'}" font-weight="800" fill="${c.secondary}" letter-spacing="1">
          ${initials}
        </text>

        <!-- Security Baseline Bar -->
        <line x1="-18" y1="28" x2="18" y2="28" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round"/>
      </g>
    `;
  } else if (style === 'modern') {
    // Modern Isometric Hexagonal Polygon Monogram
    emblemMarkup = `
      <g transform="translate(60, 60)">
        <!-- Hexagon Perimeter -->
        <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" fill="${c.fill}" stroke="${c.primary}" stroke-width="2.5" stroke-linejoin="round"/>
        <!-- Inner Geometric Facets -->
        <polygon points="0,-38 34,-19 34,19 0,38 -34,19 -34,-19" fill="none" stroke="${c.secondary}" stroke-width="1" stroke-dasharray="4 2" opacity="0.7"/>
        <line x1="0" y1="-48" x2="0" y2="-38" stroke="${c.primary}" stroke-width="1.5"/>
        <line x1="42" y1="-24" x2="34" y2="-19" stroke="${c.primary}" stroke-width="1.5"/>
        <line x1="42" y1="24" x2="34" y2="19" stroke="${c.primary}" stroke-width="1.5"/>
        <line x1="0" y1="48" x2="0" y2="38" stroke="${c.primary}" stroke-width="1.5"/>
        <line x1="-42" y1="24" x2="-34" y2="19" stroke="${c.primary}" stroke-width="1.5"/>
        <line x1="-42" y1="-24" x2="-34" y2="-19" stroke="${c.primary}" stroke-width="1.5"/>

        <!-- Bold High-Tech Monogram -->
        <text x="0" y="9" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="${initials.length > 2 ? '18' : '22'}" font-weight="900" fill="${c.secondary}" letter-spacing="2">
          ${initials}
        </text>
      </g>
    `;
  } else if (style === 'defence') {
    // Defence Desk: Crossed Ceremonial Sabres, Tri-Service Stars & Insignia Roundel
    emblemMarkup = `
      <g transform="translate(60, 60)">
        <!-- Crossed Ceremonial Sabres -->
        <g stroke="${c.primary}" stroke-width="2.2" stroke-linecap="round">
          <!-- Sabre 1: Top-Left to Bottom-Right -->
          <line x1="-38" y1="-38" x2="38" y2="38"/>
          <line x1="33" y1="33" x2="42" y2="28" stroke-width="1.8"/>
          <!-- Sabre 2: Top-Right to Bottom-Left -->
          <line x1="38" y1="-38" x2="-38" y2="38"/>
          <line x1="-33" y1="33" x2="-42" y2="28" stroke-width="1.8"/>
        </g>

        <!-- Central Defence Roundel -->
        <circle cx="0" cy="0" r="32" fill="${c.fill}" stroke="${c.primary}" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="27" fill="none" stroke="${c.secondary}" stroke-width="0.9" stroke-dasharray="3 2"/>

        <!-- Armed Forces Tri-Service Stars -->
        <polygon points="0,-23 1.5,-19 6,-19 2.5,-16.5 4,-12 0,-14.5 -4,-12 -2.5,-16.5 -6,-19 -1.5,-19" fill="${c.secondary}"/>

        <!-- Monogram / Emblem Core -->
        <text x="0" y="8" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="${initials.length > 2 ? '15' : '19'}" font-weight="800" fill="${c.secondary}">
          ${initials}
        </text>

        <!-- Military Desk Ribbon -->
        <rect x="-26" y="13" width="52" height="11" rx="2" fill="${c.primary}" stroke="${c.dark}" stroke-width="0.8"/>
        <text x="0" y="21.5" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" font-weight="900" fill="${c.fill}" letter-spacing="1">
          DEFENCE DESK
        </text>
      </g>
    `;
  }

  // Dynamic Typography Component with Executive Card Backing
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" width="460" height="120">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
      .logo-title { font-family: 'Cinzel', Georgia, serif; font-weight: 700; font-size: 20px; letter-spacing: 0.05em; }
      .logo-sub { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-weight: 700; font-size: 8.5px; letter-spacing: 0.22em; }
      .logo-meta { font-family: 'Plus Jakarta Sans', monospace; font-weight: 600; font-size: 8px; letter-spacing: 0.16em; }
    </style>
  </defs>

  <!-- Executive Card Backing (Crisp on both Dark Portals & White PDF Dossiers) -->
  <rect x="2" y="2" width="456" height="116" rx="14" fill="${c.fill}" stroke="${c.primary}" stroke-width="1.2"/>

  <!-- Insignia Emblem Group -->
  ${emblemMarkup}

  <!-- Typography Right Column -->
  <g transform="translate(132, 0)">
    <!-- Distributor Firm Title -->
    <text x="0" y="49" class="logo-title" fill="#FFFFFF">
      ${safeName}
    </text>

    <!-- Divider Bar -->
    <line x1="0" y1="60" x2="304" y2="60" stroke="${c.primary}" stroke-width="1.2" opacity="0.6"/>

    <!-- Subtitle / Tagline -->
    <text x="0" y="76" class="logo-sub" fill="${c.primary}">
      ${safeTagline}
    </text>

    <!-- Fiduciary Accreditation & Year -->
    <text x="0" y="93" class="logo-meta" fill="${c.secondary}" opacity="0.9">
      AMFI REGISTERED · ${safeArn} · EST. ${year}
    </text>
  </g>
</svg>
  `.trim();

  return svg;
}

window.downloadAILogoSVG = function() {
  if (!currentGeneratedSVG) return;
  const blob = new Blob([currentGeneratedSVG], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const firm = VednovaDB.getFirm();
  const slug = (firm?.firmName || 'firm').toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.href = url;
  a.download = `${slug}-brand-logo.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.applyAIGeneratedLogo = function() {
  if (!currentGeneratedSVG) {
    alert('Please generate a logo first.');
    return;
  }

  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(currentGeneratedSVG);
  saveNewLogo(dataUrl, '✓ AI synthesized brand logo applied to your firm profile!');
  closeAILogoModal();
};

window.handleMfdLogout = function() {
  if (confirm('Do you want to log out of the MFD Admin Portal?')) {
    if (typeof VednovaDB !== 'undefined') {
      VednovaDB.logout();
    }
    window.location.href = 'mfd-login.html';
  }
};

// Modal 1: Register New Client
window.openNewClientModal = function() {
  renderRmDropdowns();
  document.getElementById('new-client-modal').classList.remove('hidden');
};

window.closeNewClientModal = function() {
  document.getElementById('new-client-modal').classList.add('hidden');
};

// Modal 2: Add Partner or Team Member
window.openAddTeamMemberModal = function() {
  const session = VednovaDB.getActiveSession();
  if (session && session.isRM) {
    alert('Access Restricted: Only Admin Partners can manage firm team members.');
    return;
  }
  document.getElementById('add-team-member-modal').classList.remove('hidden');
};

window.closeAddTeamMemberModal = function() {
  document.getElementById('add-team-member-modal').classList.add('hidden');
};

window.handleAddTeamMember = function(e) {
  e.preventDefault();
  const name = document.getElementById('new-member-name').value.trim();
  const email = document.getElementById('new-member-email').value.trim();
  const phone = document.getElementById('new-member-phone').value.trim();
  const role = document.getElementById('new-member-role').value.trim();
  const accessLevel = document.getElementById('new-member-access-level').value;

  const isAdmin = accessLevel === 'ADMIN';

  const newMember = {
    name,
    email,
    phone,
    role: isAdmin && !role.toLowerCase().includes('partner') && !role.toLowerCase().includes('admin')
      ? `${role} (Admin Partner)`
      : role,
    isAdmin,
    clientsCount: 0,
    activeSIPPipeline: 0,
    status: 'ACTIVE'
  };

  VednovaDB.addTeamMember(newMember);
  closeAddTeamMemberModal();

  // Reset form
  document.getElementById('new-member-name').value = '';
  document.getElementById('new-member-email').value = '';
  document.getElementById('new-member-phone').value = '';
  document.getElementById('new-member-role').value = '';

  renderTeamGrid();
  renderRmDropdowns();
  renderAdminOverview();

  const successMsg = isAdmin 
    ? `Business Partner ${name} has been added with Full Administrator privileges!`
    : `Team member ${name} has been added as a servicing Relationship Manager.`;
  alert(successMsg);
};

window.handleCreateClient = function(e) {
  e.preventDefault();
  const name = document.getElementById('new-client-name').value.trim();
  const branch = document.getElementById('new-client-branch').value;
  const rmId = document.getElementById('new-client-rm').value;

  const firm = VednovaDB.getFirm();
  const team = VednovaDB.getTeam();
  const rmObj = team.find(t => t.id === rmId) || team[0] || { name: firm.adminName, role: firm.adminRole, id: 'rm_admin' };

  const branchInfo = (typeof VednovaSOP !== 'undefined' && VednovaSOP.resolveBranch)
    ? VednovaSOP.resolveBranch(branch)
    : null;
  const branchTitle = branchInfo
    ? `${branchInfo.name} (${branchInfo.categoryLabel})`
    : (branch === 'CIVILIAN_SALARIED' ? 'Corporate & Salaried Professional' : 'Civilian Client');

  const caseNum = Math.floor(10 + Math.random() * 90);
  const prefix = (firm.arn && firm.arn.toUpperCase() === 'ARN-48291') 
    ? 'VN-2026' 
    : (firm.arn ? firm.arn.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase() + '-2026' : 'VN-2026');
  const caseId = `${prefix}-${branch}-${caseNum}`;

  const newClient = {
    caseId,
    firmId: firm.id,
    firmArn: firm.arn,
    clientName: name,
    serviceBranch: branch,
    branchTitle: branchTitles[branch] || 'Client',
    assignedRM: `${rmObj.name} (${rmObj.role})`,
    rmId: rmObj.id,
    reviewDate: new Date().toISOString().split('T')[0],
    annualRunRate: 400000,
    avoidedPremiums: 200000,
    futureCommitmentsAvoided: 1600000,
    statusCounts: { surrender: 1, paidUp: 0, continue: 1 },
    policies: [
      {
        id: 'P01',
        maskedId: '****' + Math.floor(1000 + Math.random() * 9000),
        productName: 'HDFC Life Click 2 Wealth (ULIP)',
        uin: '101L133V03',
        insurer: 'HDFC Life Insurance',
        owner: name,
        insured: name,
        isULIP: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2021-01-15',
        maturityDate: '2031-01-15',
        ppt: 10,
        pt: 10,
        premiumsPaid: 5,
        remainingPremiumsCount: 5,
        nextDue: '15 Jan 2027',
        hasAccidentalRider: false
      },
      {
        id: 'P02',
        maskedId: '****' + Math.floor(1000 + Math.random() * 9000),
        productName: 'ICICI Pru GIFT Long-Term',
        uin: '105N185V12',
        insurer: 'ICICI Prudential Life',
        owner: name,
        insured: name,
        isULIP: false,
        isGuaranteedIncome: true,
        annualPremium: 200000,
        sumAssured: 2000000,
        issueDate: '2023-05-15',
        maturityDate: '2037-05-15',
        ppt: 12,
        pt: 14,
        premiumsPaid: 3,
        remainingPremiumsCount: 9,
        nextDue: '15 May 2027',
        hasAccidentalRider: false,
        incrementalXIRR: 0.0715,
        guaranteedIncomeAmount: 284330
      }
    ]
  };

  VednovaDB.saveClient(newClient);
  closeNewClientModal();
  renderAdminOverview();
  renderClientsTable();
  renderTeamGrid();

  // Open the newly created client's vault immediately in a new tab
  window.open(`vault.html?caseId=${encodeURIComponent(caseId)}`, '_blank');
};
