import React from 'react';

const GitLabIcon = React.memo(({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.43.43 0 0 1 .4.27l2.42 7.45h7.36l2.42-7.45a.43.43 0 0 1 .4-.27.42.42 0 0 1 .39.21l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
  </svg>
));

export default GitLabIcon;
