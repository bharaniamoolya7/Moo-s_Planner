import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { vaultStorage } from '../services/vaultStorage';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { QuickThemeToggle } from '../components/ThemeSelector';
import './DocumentVault.css';

export default function DocumentVault() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Upload State
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const userId = user?.id || 'guest';

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await vaultStorage.getAll(userId);
      setDocuments(docs || []);
    } catch (e) {
      console.error('Failed to load documents:', e);
      showToast('Error loading documents from vault');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  // Determine file type category from MIME or extension
  const getFileTypeCategory = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const type = file.type.toLowerCase();

    if (type.includes('pdf') || ext === 'pdf') return 'pdf';
    if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (type.includes('word') || type.includes('officedocument.wordprocessingml') || ['doc', 'docx'].includes(ext)) return 'word';
    if (type.includes('text') || ['txt', 'md', 'csv', 'json', 'js', 'py', 'java', 'html', 'css'].includes(ext)) return 'text';
    return 'other';
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    let count = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileTypeCat = getFileTypeCategory(file);

      try {
        const dataUrl = await readFileAsDataURL(file);
        let textContent = '';
        if (fileTypeCat === 'text') {
          textContent = await readFileAsText(file);
        }

        await vaultStorage.save({
          name: file.name,
          size: file.size,
          type: file.type,
          fileType: fileTypeCat,
          category: uploadCategory,
          data: dataUrl,
          textContent,
          userId,
          starred: false,
          description: ''
        });
        count++;
      } catch (err) {
        console.error('File read error:', err);
      }
    }

    if (count > 0) {
      showToast(`Saved ${count} document(s) to Vault ♡`);
      loadDocuments();
    }
    setUploading(false);
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  const handleDelete = async (id) => {
    await vaultStorage.delete(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
    showToast('Document removed');
  };

  const handleToggleStar = async (id) => {
    const updated = await vaultStorage.toggleStar(id);
    if (updated) {
      setDocuments(prev => prev.map(d => d.id === id ? { ...d, starred: updated.starred } : d));
      if (selectedDoc?.id === id) {
        setSelectedDoc(prev => ({ ...prev, starred: updated.starred }));
      }
    }
  };

  const handleUpdateDoc = async (updatedDoc) => {
    await vaultStorage.save(updatedDoc);
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    setSelectedDoc(updatedDoc);
    showToast('Document updated ♡');
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Stats calculation
  const totalDocs = documents.length;
  const totalSizeBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0);
  const pdfCount = documents.filter(d => d.fileType === 'pdf').length;
  const imageCount = documents.filter(d => d.fileType === 'image').length;
  const wordCount = documents.filter(d => d.fileType === 'word').length;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filtering & Sorting
  let filtered = documents.filter(doc => {
    const matchesQuery = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
    let matchesType = true;
    if (typeFilter === 'starred') matchesType = doc.starred;
    else if (typeFilter !== 'ALL') matchesType = doc.fileType === typeFilter;

    return matchesQuery && matchesCategory && matchesType;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
    return 0;
  });

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📕';
      case 'image': return '🖼';
      case 'word': return '📄';
      case 'text': return '📝';
      default: return '📦';
    }
  };

  return (
    <div className="vault-container">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">📁 Document Vault</h1>
          <p className="page-subtitle">Save, organize and preview your PDFs, images, Word docs & notes anytime.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn btn-pink"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        multiple 
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.svg,.txt,.md,.csv,.json"
        onChange={e => handleFileUpload(e.target.files)}
      />

      {/* Vault Overview Stats */}
      <div className="vault-stats-grid">
        <div className="vault-stat-card">
          <div className="vault-stat-icon">📄</div>
          <div>
            <div className="vault-stat-label">TOTAL DOCUMENTS</div>
            <div className="vault-stat-value">{totalDocs}</div>
          </div>
        </div>
        <div className="vault-stat-card">
          <div className="vault-stat-icon">💾</div>
          <div>
            <div className="vault-stat-label">VAULT STORAGE</div>
            <div className="vault-stat-value">{formatSize(totalSizeBytes)}</div>
          </div>
        </div>
        <div className="vault-stat-card">
          <div className="vault-stat-icon">📕</div>
          <div>
            <div className="vault-stat-label">PDF & WORD DOCS</div>
            <div className="vault-stat-value">{pdfCount + wordCount}</div>
          </div>
        </div>
        <div className="vault-stat-card">
          <div className="vault-stat-icon">🖼</div>
          <div>
            <div className="vault-stat-label">IMAGES & MEDIA</div>
            <div className="vault-stat-value">{imageCount}</div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        className={`vault-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="vault-dropzone-icon">📥</div>
        <div className="vault-dropzone-title">DRAG & DROP FILES HERE OR CLICK TO BROWSE</div>
        <div className="vault-dropzone-sub">Supports PDF documents, Word (.docx), PNG/JPG images, Text & Code files</div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--white)', padding: '6px 14px', border: '1px solid var(--border-dark)', borderRadius: '2px' }} onClick={e => e.stopPropagation()}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-pixel)' }}>Category:</span>
          <select 
            value={uploadCategory} 
            onChange={e => setUploadCategory(e.target.value)}
            style={{ border: 'none', background: 'none', fontFamily: 'var(--font-body)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="General">General</option>
            <option value="Study / College">Study / College</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Projects">Projects</option>
            <option value="Receipts">Receipts</option>
          </select>
        </div>
      </div>

      {/* Search, Filter & Control Toolbar */}
      <div className="vault-filter-bar">
        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="🔍 Search documents by title or notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '13px' }}
          />
        </div>

        {/* Format Filter Tabs */}
        <div className="vault-tabs">
          {[
            { id: 'ALL', label: 'All Files' },
            { id: 'pdf', label: 'PDFs 📕' },
            { id: 'image', label: 'Images 🖼' },
            { id: 'word', label: 'Word 📄' },
            { id: 'text', label: 'Text 📝' },
            { id: 'starred', label: 'Starred ⭐' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`vault-tab-btn ${typeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setTypeFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorting & Layout toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            className="input-field"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '12px', width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="size">Size (Largest)</option>
          </select>

          <button 
            className={`btn btn-outline btn-sm ${viewMode === 'grid' ? 'btn-pink' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
            style={{ padding: '6px 10px' }}
          >
            ⊞
          </button>
          <button 
            className={`btn btn-outline btn-sm ${viewMode === 'list' ? 'btn-pink' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
            style={{ padding: '6px 10px' }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-pixel)', alignSelf: 'center', color: 'var(--brown-muted)' }}>Category:</span>
        {['ALL', 'General', 'Study / College', 'Work', 'Personal', 'Projects', 'Receipts'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '4px 10px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              border: '1px solid var(--border-dark)',
              background: categoryFilter === cat ? 'var(--mauve)' : 'var(--white)',
              color: categoryFilter === cat ? 'var(--white)' : 'var(--brown-text)',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Document Content */}
      {loading ? (
        <div className="loading-spinner" />
      ) : filtered.length === 0 ? (
        <div className="pixel-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
          <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', marginBottom: '8px' }}>
            {searchQuery ? 'NO MATCHING DOCUMENTS FOUND' : 'YOUR VAULT IS EMPTY'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--brown-muted)', marginBottom: '16px' }}>
            {searchQuery ? 'Try adjusting your search terms or filters.' : 'Upload PDFs, images, Word docs, and text notes to view them anytime!'}
          </p>
          {!searchQuery && (
            <button className="btn btn-primary btn-sm" onClick={() => fileInputRef.current?.click()}>
              + Add First Document
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="vault-grid">
          {filtered.map(doc => (
            <div key={doc.id} className="doc-card">
              <div className="doc-card-header" onClick={() => setSelectedDoc(doc)} style={{ cursor: 'pointer' }}>
                <button 
                  className="doc-star-btn"
                  onClick={(e) => { e.stopPropagation(); handleToggleStar(doc.id); }}
                  title="Star Document"
                >
                  {doc.starred ? '⭐' : '☆'}
                </button>

                {doc.fileType === 'image' && doc.data ? (
                  <img src={doc.data} alt={doc.name} className="doc-thumbnail-img" />
                ) : (
                  <div className="doc-thumbnail-icon">
                    {getFileIcon(doc.fileType)}
                  </div>
                )}
              </div>

              <div className="doc-card-body">
                <div className="doc-title" title={doc.name} onClick={() => setSelectedDoc(doc)} style={{ cursor: 'pointer' }}>
                  {doc.name}
                </div>
                
                <div className="doc-meta">
                  <span>{formatSize(doc.size)}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <span className="badge badge-pink" style={{ fontSize: '7px' }}>{doc.category}</span>
                </div>

                <div className="doc-card-footer">
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1, padding: '4px 6px', fontSize: '8px' }}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    👁 View
                  </button>
                  <button 
                    className="btn btn-pink btn-sm" 
                    style={{ padding: '4px 8px', fontSize: '8px' }}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = doc.data;
                      a.download = doc.name;
                      a.click();
                    }}
                    title="Download"
                  >
                    📥
                  </button>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ padding: '4px 8px', fontSize: '8px', color: '#E85D5D', borderColor: '#E85D5D' }}
                    onClick={() => handleDelete(doc.id)}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vault-list">
          {filtered.map(doc => (
            <div key={doc.id} className="doc-list-item">
              <div className="doc-list-info" onClick={() => setSelectedDoc(doc)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '24px' }}>{getFileIcon(doc.fileType)}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--brown-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--brown-muted)', marginTop: '2px' }}>
                    {formatSize(doc.size)} • Added {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-pink">{doc.category}</span>
                <button 
                  onClick={() => handleToggleStar(doc.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  {doc.starred ? '⭐' : '☆'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setSelectedDoc(doc)}>
                  👁 View
                </button>
                <button 
                  className="btn btn-pink btn-sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = doc.data;
                    a.download = doc.name;
                    a.click();
                  }}
                >
                  📥
                </button>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ color: '#E85D5D', borderColor: '#E85D5D' }}
                  onClick={() => handleDelete(doc.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onDelete={handleDelete}
          onToggleStar={handleToggleStar}
          onUpdate={handleUpdateDoc}
        />
      )}
    </div>
  );
}
