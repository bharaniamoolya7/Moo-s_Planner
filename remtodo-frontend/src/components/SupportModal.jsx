import { useState } from 'react';

export default function SupportModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const supportEmail = "ydkm.0707@gmail.com";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(74, 55, 40, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--white)',
        border: '3px solid var(--border-dark)',
        borderRadius: '16px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: 'var(--shadow-pixel)',
        overflow: 'hidden',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Title bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'var(--pink-light)',
          borderBottom: '2px solid var(--border-dark)',
          color: 'var(--brown-text)',
          fontFamily: 'var(--font-retro)',
          fontSize: '20px'
        }}>
          <span>💌 SUPPORT & CONTACT</span>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--brown-text)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📬</div>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: '20px', color: 'var(--brown-text)', marginBottom: '8px' }}>
            Need help or have questions?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--brown-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
            For queries, feedback, or assistance, reach out directly at:
          </p>

          <div style={{
            background: 'var(--bg-cream-light)',
            border: '2px dashed var(--border-dark)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--brown-text)', fontWeight: 'bold' }}>
              {supportEmail}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-sm btn-outline"
              style={{ padding: '4px 10px', fontSize: '9px', fontFamily: 'var(--font-pixel)' }}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>

          <a
            href={`mailto:${supportEmail}?subject=Moo's%20Planner%20Query`}
            className="btn btn-primary"
            style={{ width: '100%', textDecoration: 'none', display: 'inline-block', padding: '10px', boxSizing: 'border-box' }}
          >
            ✉ Email Us ({supportEmail})
          </a>
        </div>
      </div>
    </div>
  );
}
