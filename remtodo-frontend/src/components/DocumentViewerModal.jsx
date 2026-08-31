import { useState } from 'react';

export default function DocumentViewerModal({ doc, onClose, onDelete, onToggleStar, onUpdate }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [editing, setEditing] = useState(false);
  const [editCategory, setEditCategory] = useState(doc?.category || 'General');
  const [editDescription, setEditDescription] = useState(doc?.description || '');

  if (!doc) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveEdit = () => {
    onUpdate({ ...doc, category: editCategory, description: editDescription });
    setEditing(false);
  };

  const renderFilePreview = () => {
    const type = doc.fileType;

    if (type === 'image') {
      return (
        <div style={{ textAlign: 'center', background: '#000', padding: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          <img
            src={doc.data}
            alt={doc.name}
            style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '2px' }}
          />
        </div>
      );
    }

    if (type === 'pdf') {
      return (
        <div style={{ width: '100%', height: '520px', background: '#525659', borderRadius: '4px', overflow: 'hidden' }}>
          <iframe
            src={doc.data}
            title={doc.name}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    if (type === 'text') {
      return (
        <div style={{
          background: 'var(--bg-cream-light)',
          border: '2px solid var(--border-dark)',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '13px',
          maxHeight: '450px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'var(--brown-text)'
        }}>
          {doc.textContent || (doc.data?.startsWith('data:text') ? atob(doc.data.split(',')[1] || '') : 'Plain text document')}
        </div>
      );
    }

    if (type === 'word') {
      return (
        <div style={{
          background: 'var(--white)',
          border: '2px solid var(--border-dark)',
          padding: '24px',
          textAlign: 'center',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>📄</div>
          <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', marginBottom: '8px' }}>
            {doc.name}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--brown-muted)', marginBottom: '16px' }}>
            Microsoft Word Document ({formatSize(doc.size)})
          </p>

          {doc.textContent ? (
            <div style={{
              textAlign: 'left',
              background: 'var(--bg-cream-light)',
              padding: '16px',
              border: '1px solid var(--border-light)',
              marginBottom: '20px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontSize: '13px'
            }}>
              <strong>Text Content Preview:</strong>
              <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{doc.textContent}</p>
            </div>
          ) : (
            <div style={{ background: 'var(--pink-soft)', padding: '16px', border: '1px solid var(--border-pink)', marginBottom: '20px', fontSize: '13px' }}>
              Word documents can be viewed directly by downloading or opening in Word / Office 365.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleDownload}>
              📥 Download Word Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        background: 'var(--white)',
        border: '2px solid var(--border-dark)',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
        <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', marginBottom: '8px' }}>
          {doc.name}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--brown-muted)', marginBottom: '20px' }}>
          File format: {doc.type} ({formatSize(doc.size)})
        </p>
        <button className="btn btn-primary" onClick={handleDownload}>
          📥 Download File
        </button>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '92%', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>
              {doc.fileType === 'pdf' ? '📕' : doc.fileType === 'image' ? '🖼' : doc.fileType === 'word' ? '📄' : doc.fileType === 'text' ? '📝' : '📦'}
            </span>
            <span style={{ fontSize: '11px', textTransform: 'none', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => onToggleStar(doc.id)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              title="Toggle Favorite"
            >
              {doc.starred ? '⭐' : '☆'}
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: '12px', color: 'var(--brown-text)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-Header & Controls */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-cream-light)', borderBottom: '2px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="badge badge-pink">{doc.category}</span>
            <span className="badge badge-blue">{doc.fileType.toUpperCase()}</span>
            <span style={{ fontSize: '12px', color: 'var(--brown-muted)' }}>{formatSize(doc.size)}</span>
            <span style={{ fontSize: '12px', color: 'var(--brown-muted)' }}>• Added {new Date(doc.uploadedAt).toLocaleDateString()}</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : '✏ Edit Info'}
            </button>
            <button className="btn btn-pink btn-sm" onClick={handleDownload}>
              📥 Download
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pixel-card-body" style={{ padding: '16px' }}>
          {editing ? (
            <div style={{ background: 'var(--bg-cream-light)', padding: '16px', border: '2px solid var(--border-dark)', borderRadius: '4px', marginBottom: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', marginBottom: '12px' }}>EDIT DOCUMENT DETAILS</h4>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                  <option value="General">General</option>
                  <option value="Study / College">Study / College</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Projects">Projects</option>
                  <option value="Receipts">Receipts</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Notes / Description</label>
                <textarea 
                  className="input-field" 
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)} 
                  placeholder="Add notes about this document..."
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          ) : null}

          {doc.description && !editing && (
            <div style={{ background: 'var(--pink-soft)', border: '1px solid var(--border-pink)', padding: '10px 14px', marginBottom: '14px', borderRadius: '4px', fontSize: '13px' }}>
              <strong>Notes:</strong> {doc.description}
            </div>
          )}

          {renderFilePreview()}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-cream)', borderTop: '2px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn btn-outline btn-sm" 
            style={{ color: '#E85D5D', borderColor: '#E85D5D' }}
            onClick={() => {
              if (window.confirm(`Delete document "${doc.name}"?`)) {
                onDelete(doc.id);
                onClose();
              }
            }}
          >
            🗑 Delete Document
          </button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
