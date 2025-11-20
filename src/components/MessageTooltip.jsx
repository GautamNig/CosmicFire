import React from 'react';
import './MessageTooltip.css';

export default function MessageTooltip({ message, user, position, currentUser }) {
  const getTooltipData = () => {
    const isTopHalf = position.y < 50;
    const isNearLeftEdge = position.x < 20;
    const isNearRightEdge = position.x > 80;
    
    const username = user.email.split('@')[0];
    const isCurrentUserMessage = currentUser && user.id === currentUser.id;

    // Determine arrow direction based on star position
    let arrowClass = '';
    let tooltipStyle = {};

    // Always center horizontally, position vertically based on star
    tooltipStyle = {
      left: `${position.x}%`,
      transform: 'translateX(-50%)'
    };

    if (isTopHalf) {
      arrowClass = 'arrow-down';
      tooltipStyle.top = `${position.y + 12}%`; // Position below star with more space
    } else {
      arrowClass = 'arrow-up';
      tooltipStyle.top = `${position.y - 12}%`; // Position above star with more space
    }

    // Horizontal edge adjustments
    if (isNearLeftEdge) {
      arrowClass += ' arrow-left';
      tooltipStyle.left = `${position.x + 8}%`;
    } else if (isNearRightEdge) {
      arrowClass += ' arrow-right';
      tooltipStyle.left = `${position.x - 8}%`;
    }

    const bubbleClass = `tooltip-bubble ${isCurrentUserMessage ? 'current-user' : 'other-user'} ${arrowClass}`;

    return { style: tooltipStyle, bubbleClass, username, isCurrentUserMessage };
  };

  const { style, bubbleClass, username, isCurrentUserMessage } = getTooltipData();

  console.log('🎨 Rendering tooltip:', {
    message: message.content,
    user: username,
    position,
    bubbleClass
  });

  return (
    <div className="message-tooltip" style={style}>
      <div className={bubbleClass}>
        <div className="message-header">
          <span className="username">{username}</span>
          <span className="message-time">
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <div className="message-content">
          {message.content}
        </div>
      </div>
    </div>
  );
}