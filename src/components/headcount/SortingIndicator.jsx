import { SortAsc, SortDesc, ArrowUpDown } from "lucide-react";

const SortingIndicator = ({ direction }) => {
  if (direction === 'asc') {
    return <SortAsc size={14} className="ml-1" />;
  } else if (direction === 'desc') {
    return <SortDesc size={14} className="ml-1" />;
  }
  return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
};

export default SortingIndicator;