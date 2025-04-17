
"use client";

import { Search, ChevronRight, ChevronLeft, Check } from "lucide-react";
import CustomInput from "../input/custom-input";
import { useCompanyTransfer } from "@/providers/CompanyTransfer";

interface CompanyTransferListProps {
  sourceTitle?: string;
  targetTitle?: string;
  className?: string;
}

const CompanyTransferList: React.FC<CompanyTransferListProps> = ({
  sourceTitle = "Available Companies",
  targetTitle = "Selected Companies",
  className = "",
}) => {
  const {
    isLoading,
    filteredSourceItems,
    filteredTargetItems,
    sourceSearchQuery,
    targetSearchQuery,
    setSourceSearchQuery,
    setTargetSearchQuery,
    selectedSourceItems,
    selectedTargetItems,
    toggleSelection,
    selectAll,
    deselectAll,
    moveToTarget,
    moveToSource,
    moveAllToTarget,
  } = useCompanyTransfer();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading companies...</div>;
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      {/* Source List */}
      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{sourceTitle}</h3>

        <CustomInput
          placeholder="Search companies..."
          value={sourceSearchQuery}
          onChange={(e) => setSourceSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <button 
              onClick={() => selectAll("source")} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Select all
            </button>
            <button 
              onClick={() => deselectAll("source")} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedSourceItems.length} of {filteredSourceItems.length} selected
          </div>
        </div>

        <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-[16px]">
          {filteredSourceItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredSourceItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedSourceItems.includes(item.id) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleSelection(item.id, "source")}
                >
                  <div className="w-5 h-5 mr-3 flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedSourceItems.includes(item.id)
                          ? "border-primary-light bg-primary-light"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedSourceItems.includes(item.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-body-m">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No companies found</div>
          )}
        </div>
      </div>

      {/* Transfer Controls */}
      <div className="flex md:flex-col justify-center items-center gap-2 py-4">
        <button
          onClick={() => moveToTarget(selectedSourceItems)}
          disabled={selectedSourceItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            selectedSourceItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected companies to target"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={moveAllToTarget}
          disabled={filteredSourceItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            filteredSourceItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move all companies to target"
        >
          <span className="text-xs font-bold">ALL</span>
        </button>
        <button
          onClick={() => moveToSource(selectedTargetItems)}
          disabled={selectedTargetItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            selectedTargetItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected companies to source"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Target List */}
      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{targetTitle}</h3>

        <CustomInput
          placeholder="Search selected companies..."
          value={targetSearchQuery}
          onChange={(e) => setTargetSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <button 
              onClick={() => selectAll("target")} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Select all
            </button>
            <button 
              onClick={() => deselectAll("target")} 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {selectedTargetItems.length} of {filteredTargetItems.length} selected
          </div>
        </div>

        <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-[16px]">
          {filteredTargetItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredTargetItems.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                    selectedTargetItems.includes(item.id) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleSelection(item.id, "target")}
                >
                  <div className="w-5 h-5 mr-3 flex-shrink-0">
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedTargetItems.includes(item.id)
                          ? "border-primary-light bg-primary-light"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedTargetItems.includes(item.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-body-m">{item.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No selected companies</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyTransferList;

// // Usage example in a page
// // pages/companies/selection.tsx
// "use client";

// import React from "react";
// import { CompanyTransferProvider } from "../../context/CompanyTransferProvider";
// import CompanyTransferList from "../../components/CompanyTransferList";
// import CustomInput from "../input/custom-input";

// export default function CompanySelectionPage() {
//   return (
//     <div className="container mx-auto py-8">
//       <h1 className="text-2xl font-bold mb-6">Select Companies</h1>
      
//       <CompanyTransferProvider>
//         <CompanyTransferList 
//           sourceTitle="Available Companies" 
//           targetTitle="Selected Companies" 
//         />
        
//         {/* Example: Submit button to use selected companies */}
//         <div className="mt-6 flex justify-end">
//           <button className="bg-primary-light text-white px-4 py-2 rounded-md hover:bg-primary">
//             Save Selection
//           </button>
//         </div>
//       </CompanyTransferProvider>
//     </div>
//   );
//}