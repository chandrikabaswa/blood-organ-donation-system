import React from 'react';

export const StatusBadge = ({ status, text }) => {
  const displayStatus = text || status;
  if (!status) return null;

  const normalized = status.toString().toLowerCase();

  let badgeClass = 'badge-gray';
  let dotIcon = '●';

  if (normalized === 'eligible' || normalized === 'accepted' || normalized === 'fulfilled' || normalized === 'completed') {
    badgeClass = 'badge-green';
    dotIcon = '🟢';
  } else if (normalized === 'not eligible' || normalized === 'rejected' || normalized === 'critical') {
    badgeClass = 'badge-red';
    dotIcon = '🔴';
  } else if (normalized === 'pending' || normalized === 'open') {
    badgeClass = 'badge-amber';
    dotIcon = '🟡';
  } else if (normalized === 'urgent') {
    badgeClass = 'badge-orange';
    dotIcon = '🟠';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span>{dotIcon}</span>
      <span>{displayStatus}</span>
    </span>
  );
};

export default StatusBadge;
