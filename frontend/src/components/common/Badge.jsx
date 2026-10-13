import React from 'react';

export const Badge = ({ status, text, customClass = '' }) => {
  const getBadgeType = (val) => {
    switch (val?.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'resolved':
      case 'active':
      case 'verified':
        return 'badge-success';
      case 'pending':
      case 'under_review':
      case 'in_progress':
        return 'badge-warning';
      case 'rejected':
      case 'overdue':
      case 'suspended':
      case 'urgent':
        return 'badge-danger';
      case 'tenant':
      case 'owner':
      case 'admin':
        return 'badge-primary';
      default:
        return 'badge-neutral';
    }
  };

  const displayText = text || status?.replace('_', ' ') || 'Unknown';

  return (
    <span className={`badge ${getBadgeType(status)} ${customClass}`}>
      {displayText}
    </span>
  );
};
