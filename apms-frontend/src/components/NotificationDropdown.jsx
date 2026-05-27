import React from 'react';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const NotificationDropdown = ({ notifications, onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div 
      className="dl-dropdown dl-notif-dropdown" 
      style={{ 
        right: 0, 
        width: '320px', 
        maxHeight: '400px', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        className="dl-dropdown-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '14px 16px 12px',
          borderBottom: '1px solid #f0ebe3'
        }}
      >
        <div className="dl-dd-name" style={{ fontSize: '14px', fontWeight: 500, color: '#1a0a0a' }}>Notifications</div>
        <div 
          className="dl-profile-role-badge" 
          style={{ 
            fontSize: '9.5px',
            background: '#fdf5f5',
            color: '#8b1a1a',
            border: '0.5px solid rgba(139,26,26,0.2)',
            borderRadius: '5px',
            padding: '2px 7px',
            fontWeight: 500
          }}
        >
          {unreadCount} Unread
        </div>
      </div>
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
            No notifications available
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid #f0ebe3',
                background: n.readStatus ? 'transparent' : 'rgba(139,26,26,0.03)',
                transition: 'background 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div 
                  style={{ 
                    fontWeight: n.readStatus ? 400 : 600, 
                    fontSize: '13px', 
                    color: '#1a0a0a', 
                    lineHeight: '1.4'
                  }}
                >
                  {n.title}
                </div>
                {!n.readStatus && (
                  <button 
                    onClick={(e) => onMarkAsRead(n.id, e)}
                    style={{ 
                      background: '#faf8f5', 
                      border: '1px solid #ede8e0', 
                      color: '#8b1a1a', 
                      cursor: 'pointer', 
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                    title="Mark as read"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f5f0eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#faf8f5';
                    }}
                  >
                    <CheckIcon />
                  </button>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: '#666', marginTop: '4px', lineHeight: '1.4' }}>
                {n.message}
              </div>
              {n.projectTitle && (
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#d4a017', marginTop: '4px' }}>
                  Project: {n.projectTitle}
                </div>
              )}
              <div style={{ fontSize: '9.5px', color: '#aaa', marginTop: '4px' }}>
                {getRelativeTime(n.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
