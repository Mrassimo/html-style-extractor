import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  // onClose is optional to preserve existing usage; if provided, it is invoked
  // after the exit transition completes.
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide timing preserved via CSS slide-up animation semantics; we only
  // handle the fade-out / exit transition here. Parent behavior remains the same.
  useEffect(() => {
    // If the message changes, ensure the notification is visible again.
    setIsVisible(true);
  }, [message]);

  const handleClose = () => {
    // Trigger exit animation; actual unmount is delegated to parent via onClose
    // after the transition has finished.
    setIsVisible(false);
  };

  const handleTransitionEnd = () => {
    if (!isVisible && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`
          bg-md-white rounded-lg shadow-md-md-btn-primary border border-md-border p-4
          flex items-center space-x-3 min-w-[300px]
          animate-slide-up
          transition-all duration-300 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        `}
        onClick={handleClose}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-md-green rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-md-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-md-primary">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-2 h-2 bg-md-green rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
