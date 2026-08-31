import aboutCardImg from '../assets/about_card.png';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(74, 55, 40, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }} 
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          maxWidth: '760px',
          width: '100%',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(74, 55, 40, 0.35)',
          animation: 'popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #FF99B2',
            color: '#D9537A',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          ✕
        </button>

        {/* Display the exact image requested by user */}
        <img 
          src={aboutCardImg} 
          alt="About Moo's Planner" 
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '16px'
          }}
        />
      </div>
    </div>
  );
}
