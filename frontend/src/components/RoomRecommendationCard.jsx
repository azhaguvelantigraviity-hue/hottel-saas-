import React from 'react';
import Icon from './Icon';

const RoomRecommendationCard = ({ recommendations, onAutoAssign, onSelectAlternative, onManualOverride }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="recommendation-card empty" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-light)', borderRadius: '12px' }}>
        <Icon name="info" size={32} color="var(--text-light)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-main)' }}>No available rooms match your criteria for the selected dates.</p>
        <button onClick={onManualOverride} className="btn-secondary" style={{ marginTop: '1rem' }}>Manual Selection</button>
      </div>
    );
  }

  const topRoom = recommendations[0];
  const alternatives = recommendations.slice(1);

  return (
    <div className="room-recommendation-container" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      
      {/* Top Recommendation */}
      <div className="top-recommendation" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(var(--primary-rgb), 0.05) 0%, rgba(var(--primary-rgb), 0.1) 100%)' }}>
        <div className="rec-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="badge" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
            <Icon name="star" size={14} color="#FFF" /> AI Top Match
          </div>
          <span className="match-score" style={{ fontWeight: 'bold', color: 'var(--green)', fontSize: '1.2rem' }}>
            {topRoom.score}% Match
          </span>
        </div>
        
        <div className="room-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)' }}>Room {topRoom.room.roomNumber}</h3>
            <p className="room-type" style={{ margin: '4px 0 0 0', color: 'var(--text-light)', fontSize: '1rem' }}>{topRoom.room.type} • Floor {topRoom.room.floor}</p>
          </div>
          <div className="room-price" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>₹{topRoom.room.baseRate}</div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>/ night</span>
          </div>
        </div>

        <div className="rec-reasons" style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why this room?</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {topRoom.reasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <Icon name="check" size={16} color="var(--green)"/> {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="rec-actions">
          <button 
            className="btn-primary auto-assign-btn" 
            onClick={() => onAutoAssign(topRoom)}
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            <Icon name="check" size={20}/> Auto Assign Best Room
          </button>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="alternatives" style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>Alternative Recommendations</h4>
          <div className="alt-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alternatives.map((alt, idx) => (
              <div key={idx} className="alt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div className="alt-details">
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Room {alt.room.roomNumber} <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 'normal' }}>• {alt.room.type}</span></h5>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    <span>₹{alt.room.baseRate} / night</span>
                    <span className="alt-score" style={{ color: 'var(--green)', fontWeight: '500' }}>{alt.score}% Match</span>
                  </div>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={() => onSelectAlternative(alt)}
                  style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: 'white', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Actions */}
      <div className="card-footer" style={{ padding: '1rem 1.5rem', background: 'var(--bg-light)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button 
          onClick={onManualOverride}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'underline' }}
        >
          Skip AI & Manual Override
        </button>
      </div>
    </div>
  );
};

export default RoomRecommendationCard;
