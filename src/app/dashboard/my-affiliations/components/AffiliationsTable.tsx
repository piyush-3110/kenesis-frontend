'use client';

import React from 'react';
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
    <div className="relative">
      {/* Outer container with gradient border */}
      <div 
        className="rounded-lg p-[1.06px]"
        style={{
          background: 'linear-gradient(180deg, #0680FF 0%, #010519 88.45%)'
        }}
      >
        {/* Inner container with gradient background */}
        <div 
          className="rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)'
          }}
        >
          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {affiliations.map((affiliation) => (
              <div 
                key={affiliation.id}
                className="p-4 border-b border-gray-700/30 last:border-b-0"
              >
                <Link 
                  href={`/dashboard/my-affiliations/product/${affiliation.productId}`}
                  className="block space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-white">
                        {affiliation.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          (#{affiliation.productId})
                        </span>
                        {getStatusBadge(affiliation.status)}
                      </div>
                    </div>
                    <button 
                      className="p-1 text-white hover:text-blue-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs mb-1">Seller</span>
                      <span className="text-white">{affiliation.seller}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs mb-1">Price</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-black font-semibold text-sm">
                        {formatCurrency(affiliation.price)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-gray-400 text-xs">Commission: </span>
                    <span className="text-white">{affiliation.commission}% commission</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th 
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '21.77px',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    Products
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '21.77px',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    Seller
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '21.77px',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    Price
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '21.77px',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    Commission
                  </th>
                  <th 
                    className="text-center px-6 py-4 text-gray-300"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 400,
                      fontSize: '21.77px',
                      lineHeight: '140%',
                      letterSpacing: '0%'
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-gray-700/30">
                {affiliations.map((affiliation) => (
                  <tr key={affiliation.id} className="hover:bg-gray-800/20 transition-colors group">
                    {/* Products Column */}
                    <td className="px-6 py-4">
                      <Link 
                        href={`/dashboard/my-affiliations/product/${affiliation.productId}`}
                        className="block"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base font-medium text-white group-hover:text-blue-300 transition-colors">
                            {affiliation.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              (#{affiliation.productId})
                            </span>
                            {getStatusBadge(affiliation.status)}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Seller Column */}
                    <td className="px-6 py-4">
                      <span className="text-base text-white">
                        {affiliation.seller}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-white text-black font-semibold text-sm">
                        {formatCurrency(affiliation.price)}
                      </span>
                    </td>

                    {/* Commission Column */}
                    <td className="px-6 py-4">
                      <span className="text-base text-white">
                        {affiliation.commission}% commission
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-center">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliationsTable;
