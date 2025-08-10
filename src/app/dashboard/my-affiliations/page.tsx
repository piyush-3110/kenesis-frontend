"use client";

import DashboardLayout from "../components/DashboardLayout";
import { useMyAffiliationsStore } from "./store/useMyAffiliationsStore";
import AffiliationsTable from "./components/AffiliationsTable";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

const MyAffiliationsPage: React.FC = () => {
  const { affiliations, loading, loadAffiliations } = useMyAffiliationsStore();

  // Load initial data
  useEffect(() => {
    loadAffiliations();
  }, [loadAffiliations]);

  return (
    <DashboardLayout
      title="My Affiliations"
      subtitle="Manage and track your promoted products"
    >
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* My Affiliations Title */}
        <div className="flex items-center justify-between">
          <div className="relative">
            {/* <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">
              My Affiliations
            </h2> */}
            {/* Gradient line below title */}
            {/* <div 
              className="absolute bottom-0 left-0 h-[2px] w-full mt-6"
              style={{
                background: 'linear-gradient(90deg, #0680FF 0%, #010519 88.45%)'
              }}
            /> */}
          </div>
          <span className="text-gray-400 text-sm">
            {affiliations.length} products
          </span>
        </div>

        {/* Table Container with margins */}
        <div className="mx-4 md:mx-6 lg:mx-8">
          {loading ? (
            <div
              className="p-12 text-center rounded-lg"
              style={{
                border: "1.06px solid",
                borderImageSource:
                  "linear-gradient(180deg, #0680FF 0%, #010519 88.45%)",
                borderImageSlice: 1,
                background:
                  "linear-gradient(152.97deg, #000000 18.75%, rgba(0, 0, 0, 0) 100%)",
              }}
            >
              <div className="inline-flex items-center gap-3 text-gray-400">
                <RefreshCw size={20} className="animate-spin" />
                Loading affiliations...
              </div>
            </div>
          ) : (
            <AffiliationsTable affiliations={affiliations} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyAffiliationsPage;
