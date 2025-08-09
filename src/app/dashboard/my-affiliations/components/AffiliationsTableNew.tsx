'use clinterface AffiliationsTableProps {
  affiliations: AffiliationData[];
}

const AffiliationsTable: React.FC<AffiliationsTableProps> = ({ 
  affiliations 
}) => {mport React from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { AffiliatedProduct } from '../types';

interface AffiliationsTableProps {
  affiliations: AffiliatedProduct[];
  onStatusUpdate?: (id: string, status: 'active' | 'inactive') => void;
}

const AffiliationsTable: React.FC<AffiliationsTableProps> = ({ 
  affiliations, 
  onStatusUpdate 
}) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getStatusBadge = (status: 'active' | 'inactive') => {
    if (status === 'inactive') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide bg-red-500/10 text-red-400 border border-red-500/20">
          Inactive
        </span>
      );
    }
    return null;
  };

  if (affiliations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No affiliations found</p>
        <p className="text-gray-500 text-sm mt-2">
          Start promoting products to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr,1fr,1fr,1.5fr,auto] gap-4 px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
        <div className="text-sm font-medium text-gray-300">Products</div>
        <div className="text-sm font-medium text-gray-300">Seller</div>
        <div className="text-sm font-medium text-gray-300">Price</div>
        <div className="text-sm font-medium text-gray-300">Commission</div>
        <div className="text-sm font-medium text-gray-300">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-700/30">
        {affiliations.map((affiliation) => (
          <Link 
            key={affiliation.id}
            href={`/dashboard/my-affiliations/product/${affiliation.productId}`}
            className="grid grid-cols-[2fr,1fr,1fr,1.5fr,auto] gap-4 px-6 py-4 hover:bg-gray-800/20 transition-colors group cursor-pointer"
          >
            {/* Products Column */}
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-medium text-white group-hover:text-blue-300 transition-colors">
                    {affiliation.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      (#{affiliation.productId})
                    </span>
                    {getStatusBadge(affiliation.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Column */}
            <div className="flex items-center">
              <span className="text-sm text-white">
                {affiliation.seller}
              </span>
            </div>

            {/* Price Column */}
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-[3px] rounded-md bg-white text-black font-semibold text-sm">
                {formatCurrency(affiliation.price)}
              </span>
            </div>

            {/* Commission Column */}
            <div className="flex items-center">
              <span className="text-sm text-white">
                {affiliation.commission}% commission
              </span>
            </div>

            {/* Actions Column */}
            <div className="flex items-center justify-center">
              <button 
                className="p-1 text-white hover:text-blue-400 transition-colors text-lg"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle dropdown menu
                }}
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AffiliationsTable;
