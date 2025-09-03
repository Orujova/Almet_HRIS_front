


const StatusBadge = ({ status }) => {
  const statusConfig = {
    'DRAFT': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Draft' },
    'COMPLETED': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' }
  };

  const config = statusConfig[status] || statusConfig['DRAFT'];
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge
