import React from 'react';
import './MessageTooltip.css';
import { AppSettings } from '../config/settings';

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
            tooltipStyle.top = `${position.y + AppSettings.TOOLTIPS.VERTICAL_OFFSET}%`;
        } else {
            tooltipStyle.top = `${position.y - AppSettings.TOOLTIPS.VERTICAL_OFFSET}%`;
        }

        if (isNearLeftEdge) {
            tooltipStyle.left = `${position.x + AppSettings.TOOLTIPS.HORIZONTAL_OFFSET}%`;
        } else if (isNearRightEdge) {
            tooltipStyle.left = `${position.x - AppSettings.TOOLTIPS.HORIZONTAL_OFFSET}%`;
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