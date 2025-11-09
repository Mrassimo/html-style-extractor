import React from 'react';

interface NotificationProps {
  message: string;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-md-white rounded-lg shadow-md-md-btn-primary border border-md-border p-4 flex items-center space-x-3 min-w-[300px]">
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
