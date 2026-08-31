import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import './Projects.css';

const STATUS_OPTIONS = ['Planning', 'In Progress', 'Completed', 'On Hold'];

const LINK_TYPES = [
  { value: 'gpt', label: '🤖 Custom GPT', icon: '🤖', badgeClass: 'link-badge-gpt' },
  { value: 'dataset', label: '📊 Dataset', icon: '📊', badgeClass: 'link-badge-dataset' },
  { value: 'repo', label: '💻 GitHub / Code', icon: '💻', badgeClass: 'link-badge-repo' },
  { value: 'doc', label: '📄 Spec / Doc', icon: '📄', badgeClass: 'link-badge-doc' },
  { value: 'figma', label: '🎨 Figma / UI', icon: '🎨', badgeClass: 'link-badge-doc' },
  { value: 'other', label: '🔗 Resource Link', icon: '🔗', badgeClass: 'link-badge-other' }
];

const getLinkMeta = (type) => LINK_TYPES.find(t => t.value === type) || LINK_TYPES[5];

const parseLinks = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    if (typeof raw === 'string' && raw.trim()) {
      return [{ id: 'link-' + Date.now(), title: 'Project Link', url: raw.trim(), type: 'other' }];
    }
    return [];
  }
};

export default function Projects() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Quick Add Link on Card state
  const [quickAddProjectId, setQuickAddProjectId] = useState(null);
  const [quickForm, setQuickForm] = useState({ title: '', url: '', type: 'gpt' });

  // Main Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    technologies: '',
    deadline: '',
    status: 'Planning',
    progress: 0,
    notes: '',
    links: []
  });

  useEffect(() => { loadProjects(); }, [user?.id]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'projects', `/api/projects/user/${user?.id}`);
    setProjects(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({
      name: '',
      description: '',
      technologies: '',
      deadline: '',
      status: 'Planning',
      progress: 0,
      notes: '',
      links: []
    });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingItem(p);
    setForm({
      name: p.name || p.title || '',
      description: p.description || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      deadline: p.deadline || '',
      status: p.status || 'Planning',
      progress: p.progress || 0,
      notes: p.notes || '',
      links: parseLinks(p.links)
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Need a name!', 'error'); return; }
    
    const techArray = typeof form.technologies === 'string'
      ? form.technologies.split(',').map(t => t.trim()).filter(Boolean)
      : (form.technologies || []);

    const data = {
      ...form,
      title: form.name,
      technologies: techArray,
      links: JSON.stringify(form.links || []),
      userId: user?.id
    };
    
    const saved = await storageService.saveItem(user?.id, 'projects', data, '/api/projects', editingItem?.id);
    const formattedSaved = {
      ...saved,
      links: parseLinks(saved.links || data.links)
    };

    if (editingItem) {
      setProjects(p => p.map(x => String(x.id) === String(editingItem.id) ? formattedSaved : x));
    } else {
      setProjects(p => [formattedSaved, ...p]);
    }
    
    showToast('Project saved ♡');
    setShowModal(false);
  };

  const deleteProject = async (id) => {
    await storageService.deleteItem(user?.id, 'projects', id, '/api/projects');
    setProjects(p => p.filter(x => String(x.id) !== String(id)));
    showToast('Project deleted');
  };

  // Preset button action inside Modal
  const addPresetLink = (type, defaultTitle) => {
    const newLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: defaultTitle,
      url: '',
      type: type
    };
    setForm(p => ({ ...p, links: [...(p.links || []), newLink] }));
  };

  const updateModalLink = (id, field, value) => {
    setForm(p => ({
      ...p,
      links: (p.links || []).map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const removeModalLink = (id) => {
    setForm(p => ({
      ...p,
      links: (p.links || []).filter(l => l.id !== id)
    }));
  };

  // Quick Add link directly on card
  const handleQuickAddLink = async (project) => {
    if (!quickForm.url.trim()) {
      showToast('Please enter a URL!', 'error');
      return;
    }

    let url = quickForm.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const defaultTitleByType = {
      gpt: 'Custom GPT',
      dataset: 'Dataset',
      repo: 'GitHub Repo',
      doc: 'Project Doc',
      figma: 'Figma UI',
      other: 'Project Link'
    };

    const newLink = {
      id: `link-${Date.now()}`,
      title: quickForm.title.trim() || defaultTitleByType[quickForm.type] || 'Project Resource',
      url: url,
      type: quickForm.type || 'other'
    };

    const currentLinks = parseLinks(project.links);
    const updatedLinks = [...currentLinks, newLink];

    const techArray = Array.isArray(project.technologies) ? project.technologies : [];
    const payload = {
      ...project,
      title: project.name || project.title,
      technologies: techArray,
      links: JSON.stringify(updatedLinks),
      userId: user?.id
    };

    const saved = await storageService.saveItem(user?.id, 'projects', payload, '/api/projects', project.id);
    const formattedSaved = {
      ...saved,
      links: updatedLinks
    };

    setProjects(p => p.map(x => String(x.id) === String(project.id) ? formattedSaved : x));
    setQuickAddProjectId(null);
    setQuickForm({ title: '', url: '', type: 'gpt' });
    showToast('Link added to project! 🔗');
  };

  const handleRemoveLinkFromProject = async (project, linkId) => {
    const currentLinks = parseLinks(project.links);
    const updatedLinks = currentLinks.filter(l => l.id !== linkId);
    
    const techArray = Array.isArray(project.technologies) ? project.technologies : [];
    const payload = {
      ...project,
      title: project.name || project.title,
      technologies: techArray,
      links: JSON.stringify(updatedLinks),
      userId: user?.id
    };

    const saved = await storageService.saveItem(user?.id, 'projects', payload, '/api/projects', project.id);
    const formattedSaved = {
      ...saved,
      links: updatedLinks
    };

    setProjects(p => p.map(x => String(x.id) === String(project.id) ? formattedSaved : x));
    showToast('Link removed');
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard! 📋');
  };

  const statusColor = { 'Planning': 'badge-blue', 'In Progress': 'badge-yellow', 'Completed': 'badge-green', 'On Hold': 'badge-red' };

  // Filter projects by search term (search name, desc, tech, or link title/url)
  const filteredProjects = projects.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (p.name || p.title || '').toLowerCase().includes(term);
    const descMatch = (p.description || '').toLowerCase().includes(term);
    const techMatch = (Array.isArray(p.technologies) ? p.technologies.join(' ') : '').toLowerCase().includes(term);
    const links = parseLinks(p.links);
    const linkMatch = links.some(l => (l.title || '').toLowerCase().includes(term) || (l.url || '').toLowerCase().includes(term));
    return nameMatch || descMatch || techMatch || linkMatch;
  });

  return (
    <div className="tasks-page">
      <div className="page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">📁 Projects</h1>
          <p style={{ fontSize: 12, color: 'var(--brown-muted)', marginTop: 4 }}>
            Organize project tech stacks, progress, GPT links, datasets & resources ♡
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search projects or links..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 220, padding: '6px 12px', fontSize: 13 }}
          />
          <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Project</button>
        </div>
      </div>

      <div className="notes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {loading ? (
          <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}></div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => {
            const linksList = parseLinks(project.links);
            return (
              <div key={project.id} className="pixel-card">
                <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📁 {project.name || project.title}
                  </span>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      className="task-action-btn"
                      title="Edit project"
                      style={{ width: 20, height: 20, fontSize: 11, border: 'none', background: 'transparent', color: 'var(--brown-text)', cursor: 'pointer' }}
                      onClick={() => openEdit(project)}
                    >
                      ✎
                    </button>
                    <button
                      className="task-action-btn"
                      title="Delete project"
                      style={{ width: 20, height: 20, fontSize: 11, border: 'none', background: 'transparent', color: 'var(--brown-text)', cursor: 'pointer' }}
                      onClick={() => deleteProject(project.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="pixel-card-body">
                  {project.description && (
                    <p style={{ fontSize: 13, color: 'var(--brown-light)', marginBottom: 10, lineHeight: 1.4 }}>
                      {project.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className={`badge ${statusColor[project.status] || 'badge-pink'}`}>{project.status}</span>
                    {(Array.isArray(project.technologies) ? project.technologies : []).map(tech => (
                      <span key={tech} className="badge badge-pink">{tech}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span>Progress</span>
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>{project.progress || 0}%</span>
                  </div>

                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${project.progress || 0}%` }}></div>
                  </div>

                  {project.deadline && (
                    <p style={{ fontSize: 11, color: 'var(--brown-muted)', marginTop: 8 }}>
                      📅 Deadline: {project.deadline}
                    </p>
                  )}

                  {project.notes && (
                    <p style={{ fontSize: 12, color: 'var(--brown-light)', marginTop: 6, fontStyle: 'italic', background: 'var(--pink-soft)', padding: '4px 8px', borderRadius: 'var(--radius-pixel)', borderLeft: '3px solid var(--pink-primary)' }}>
                      📝 {project.notes}
                    </p>
                  )}

                  {/* Links & Datasets Section */}
                  <div className="project-links-container">
                    <div className="project-links-header">
                      <span>🔗 LINKS & DATASETS ({linksList.length})</span>
                      <button
                        className="project-link-btn"
                        onClick={() => {
                          if (quickAddProjectId === project.id) {
                            setQuickAddProjectId(null);
                          } else {
                            setQuickAddProjectId(project.id);
                            setQuickForm({ title: '', url: '', type: 'gpt' });
                          }
                        }}
                      >
                        {quickAddProjectId === project.id ? 'Close' : '+ Add Link'}
                      </button>
                    </div>

                    {/* Quick Add Form Box on Card */}
                    {quickAddProjectId === project.id && (
                      <div className="quick-add-box">
                        <div className="quick-add-title">
                          <span>+ Quick Attach Link/GPT</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <select
                              className="input-field link-edit-type"
                              value={quickForm.type}
                              onChange={e => setQuickForm(q => ({ ...q, type: e.target.value }))}
                              style={{ width: 110, fontSize: 11 }}
                            >
                              {LINK_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Title (e.g. GPT Assistant, Kaggle)"
                              value={quickForm.title}
                              onChange={e => setQuickForm(q => ({ ...q, title: e.target.value }))}
                              style={{ fontSize: 12, flex: 1 }}
                            />
                          </div>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="URL (e.g. chatgpt.com/g/... or github.com/...)"
                            value={quickForm.url}
                            onChange={e => setQuickForm(q => ({ ...q, url: e.target.value }))}
                            style={{ fontSize: 12 }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                            <button
                              className="btn btn-outline btn-sm"
                              type="button"
                              onClick={() => setQuickAddProjectId(null)}
                              style={{ padding: '4px 8px', fontSize: 9 }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              type="button"
                              onClick={() => handleQuickAddLink(project)}
                              style={{ padding: '4px 10px', fontSize: 9 }}
                            >
                              Attach Link ♡
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {linksList.length > 0 ? (
                      <div className="project-links-grid">
                        {linksList.map(link => {
                          const meta = getLinkMeta(link.type);
                          return (
                            <div key={link.id || link.url} className={`project-link-item ${meta.badgeClass}`}>
                              <div className="project-link-left">
                                <span className="project-link-icon">{meta.icon}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                  <a
                                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-link-title"
                                    title={link.url}
                                  >
                                    {link.title || 'Link Resource'}
                                  </a>
                                  <span className="project-link-url-sub">{link.url}</span>
                                </div>
                              </div>

                              <div className="project-link-actions">
                                <button
                                  className="project-link-btn"
                                  title="Copy URL"
                                  onClick={() => copyToClipboard(link.url)}
                                >
                                  📋
                                </button>
                                <a
                                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="project-link-btn"
                                  title="Open in new tab"
                                  style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}
                                >
                                  ↗
                                </a>
                                <button
                                  className="project-link-btn"
                                  title="Remove link"
                                  onClick={() => handleRemoveLinkFromProject(project, link.id)}
                                  style={{ color: '#D32F2F' }}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: 11, color: 'var(--brown-muted)', fontStyle: 'italic', margin: '4px 0' }}>
                        No attached GPT links or datasets yet. Click "+ Add Link" above!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🗂</div>
            <div className="empty-state-text">No matching projects found</div>
            <div className="empty-state-sub">Start tracking your projects, GPT links, and datasets ♡</div>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="pixel-card-header">
              {editingItem ? '✎ Edit Project & Links' : '+ New Project'}
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. AI Content Generator or Portfolio Website"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="What is this project about? Add main goals..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Technologies (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="React, Spring Boot, OpenAI API, Python, MySQL..."
                  value={form.technologies}
                  onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))}
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: 12 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Status</label>
                  <select
                    className="input-field"
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input-field"
                    value={form.progress}
                    onChange={e => setForm(p => ({ ...p, progress: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Deadline</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.deadline}
                  onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Notes</label>
                <textarea
                  className="input-field"
                  placeholder="Project notes, ideas, setup instructions..."
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Links & Datasets Modal Section */}
              <div className="input-group" style={{ background: 'var(--bg-cream)', padding: 12, border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-pixel)' }}>
                <div className="links-editor-header">
                  <label className="input-label" style={{ marginBottom: 0 }}>
                    🔗 Project Links, GPTs & Datasets
                  </label>
                </div>
                <p style={{ fontSize: 11, color: 'var(--brown-muted)', marginBottom: 8 }}>
                  Attach ChatGPT custom GPTs, Kaggle datasets, GitHub repos, or documentation:
                </p>

                {/* Quick Presets */}
                <div className="link-preset-buttons">
                  <button type="button" className="link-preset-btn" onClick={() => addPresetLink('gpt', 'Custom GPT')}>
                    🤖 + Custom GPT
                  </button>
                  <button type="button" className="link-preset-btn" onClick={() => addPresetLink('dataset', 'Dataset')}>
                    📊 + Dataset
                  </button>
                  <button type="button" className="link-preset-btn" onClick={() => addPresetLink('repo', 'GitHub Repo')}>
                    💻 + GitHub Repo
                  </button>
                  <button type="button" className="link-preset-btn" onClick={() => addPresetLink('doc', 'Project Spec')}>
                    📄 + Doc / Spec
                  </button>
                  <button type="button" className="link-preset-btn" onClick={() => addPresetLink('other', 'Resource Link')}>
                    🔗 + Custom Link
                  </button>
                </div>

                {/* Links Edit List */}
                {(form.links && form.links.length > 0) ? (
                  <div className="link-edit-list">
                    {form.links.map(link => (
                      <div key={link.id} className="link-edit-row">
                        <select
                          className="input-field link-edit-type"
                          value={link.type || 'other'}
                          onChange={e => updateModalLink(link.id, 'type', e.target.value)}
                        >
                          {LINK_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.icon} {t.value.toUpperCase()}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="input-field link-edit-input"
                          placeholder="Title (e.g. GPT Helper)"
                          value={link.title}
                          onChange={e => updateModalLink(link.id, 'title', e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <input
                          type="text"
                          className="input-field link-edit-input"
                          placeholder="URL (e.g. https://...)"
                          value={link.url}
                          onChange={e => updateModalLink(link.id, 'url', e.target.value)}
                          style={{ flex: 1.5 }}
                        />
                        <button
                          type="button"
                          className="link-delete-btn"
                          title="Remove link"
                          onClick={() => removeModalLink(link.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--brown-muted)', fontStyle: 'italic', margin: '4px 0' }}>
                    No links added yet. Click one of the preset buttons above to add!
                  </p>
                )}
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Project ♡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
