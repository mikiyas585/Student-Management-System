import React, { useEffect, useState } from 'react';

const AnimationTest = () => {
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  // Create particles for testing
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 8 + 's',
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: 'var(--bg-primary)', color: 'white', minHeight: '100vh' }}>
      <h1 className="text-gradient-animated" style={{ fontSize: '36px', marginBottom: '30px' }}>
        Animation Test Component
      </h1>

      <div style={{ marginBottom: '40px' }}>
        <button 
          className="clay-btn clay-btn-coral btn-pulse" 
          onClick={() => setVisible(!visible)}
          style={{ marginRight: '20px' }}
        >
          Toggle Visibility
        </button>
        
        <button className="clay-btn clay-btn-teal hover-scale-depth">
          Hover Scale Button
        </button>
      </div>

      {/* Particle Test */}
      <div className="particle-container" style={{ position: 'relative', height: '300px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '10px', marginBottom: '40px' }}>
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.animationDelay,
              '--direction': particle.direction
            }}
          />
        ))}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)' }}>
          Particle Animation Test Area
        </div>
      </div>

      {/* Enhanced Shapes Test */}
      <div style={{ position: 'relative', height: '200px', marginBottom: '40px', overflow: 'hidden', borderRadius: '10px' }}>
        <div className="hero-shape-enhanced hero-shape-enhanced-1" />
        <div className="hero-shape-enhanced hero-shape-enhanced-2" />
        <div className="hero-shape-enhanced hero-shape-enhanced-3" />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: 2 }}>
          Enhanced Floating Shapes
        </div>
      </div>

      {/* Scroll Reveal Test */}
      <div className={`reveal-on-scroll ${visible ? 'revealed' : ''}`} style={{ 
        padding: '30px', 
        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
        borderRadius: '20px',
        marginBottom: '20px'
      }}>
        <h3>Scroll Reveal Test</h3>
        <p>This section reveals with animation when scrolled into view or when toggled.</p>
      </div>

      <div className={`reveal-on-scroll delay-100 ${visible ? 'revealed' : ''}`} style={{ 
        padding: '30px', 
        backgroundColor: 'rgba(6, 214, 160, 0.1)', 
        borderRadius: '20px',
        marginBottom: '20px'
      }}>
        <h3>Delayed Scroll Reveal</h3>
        <p>This section has a 100ms delay before revealing.</p>
      </div>

      {/* Enhanced Clay Card Test */}
      <div className="clay-card clay-card-enhanced hover-scale-depth" style={{ padding: '30px', marginBottom: '30px' }}>
        <h3>Enhanced Clay Card</h3>
        <p>This card has enhanced hover effects with shine animation and 3D depth.</p>
        <button className="clay-btn clay-btn-amber btn-pulse" style={{ marginTop: '15px' }}>
          Animated Button
        </button>
      </div>

      {/* Loading Spinner Test */}
      <div style={{ padding: '30px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', marginBottom: '30px' }}>
        <h3>Loading Spinner</h3>
        <div className="loading-spinner" style={{ margin: '20px auto' }} />
        <p>Advanced multi-layer loading spinner animation.</p>
      </div>

      {/* Progress Bar Test */}
      <div style={{ padding: '30px', backgroundColor: 'rgba(22, 28, 70, 0.5)', borderRadius: '20px' }}>
        <h3>Enhanced Progress Bar</h3>
        <div className="xp-track-enhanced" style={{ 
          height: '20px', 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          borderRadius: '10px',
          position: 'relative',
          margin: '20px 0'
        }}>
          <div style={{ 
            width: '65%', 
            height: '100%', 
            background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'progressShine 2s linear infinite'
            }} />
          </div>
        </div>
        <p>Progress bar with enhanced shine animation.</p>
      </div>

      {/* Enhanced Typed Cursor Test */}
      <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <h3>Enhanced Typed Cursor</h3>
        <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', margin: '20px 0' }}>
          Type something here<span className="typed-cursor-enhanced">|</span>
        </div>
      </div>

      {/* Enhanced Tooltip Test */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <h3>Enhanced Animations Summary</h3>
        <p>The following enhanced animations have been implemented:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Particle Effects with floating animation</li>
          <li>Enhanced floating shapes with gradient backgrounds</li>
          <li>Scroll-triggered reveal animations with delays</li>
          <li>Enhanced clay cards with shine effects</li>
          <li>Button pulse animations</li>
          <li>3D hover effects with depth</li>
          <li>Advanced loading spinner with multiple layers</li>
          <li>Progress bar shine animations</li>
          <li>Enhanced typed cursor with glow</li>
          <li>Text gradient animations</li>
          <li>Modal entrance animations</li>
          <li>Tooltip animations</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationTest;