"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Search, ChevronRight, ChevronLeft, Check } from "lucide-react"
import CustomInput from "../input/custom-input"

export interface TransferListItem {
  id: string
  label: string
}

interface TransferListProps {
  sourceTitle?: string
  targetTitle?: string
  sourceItems: TransferListItem[]
  targetItems: TransferListItem[]
  onChange?: (sourceItems: TransferListItem[], targetItems: TransferListItem[]) => void
  className?: string
}

const TransferList: React.FC<TransferListProps> = ({
  sourceTitle = "Source",
  targetTitle = "Target",
  sourceItems: initialSourceItems = [],
  targetItems: initialTargetItems = [],
  onChange,
  className = "",
}) => {
  const [sourceItems, setSourceItems] = useState<TransferListItem[]>(initialSourceItems)
  const [targetItems, setTargetItems] = useState<TransferListItem[]>(initialTargetItems)
  const [selectedSourceItems, setSelectedSourceItems] = useState<string[]>([])
  const [selectedTargetItems, setSelectedTargetItems] = useState<string[]>([])
  const [sourceSearchQuery, setSourceSearchQuery] = useState("")
  const [targetSearchQuery, setTargetSearchQuery] = useState("")

  useEffect(() => {
    setSourceItems(initialSourceItems)
  }, [])

  useEffect(() => {
    setTargetItems(initialTargetItems)
  }, [])

  useEffect(() => {
    onChange?.(sourceItems, targetItems)
  }, [sourceItems, targetItems, onChange])

  const filteredSourceItems = useMemo(() => {
    return sourceItems.filter((item) => item.label.toLowerCase().includes(sourceSearchQuery.toLowerCase()))
  }, [sourceItems, sourceSearchQuery])

  const filteredTargetItems = useMemo(() => {
    return targetItems.filter((item) => item.label.toLowerCase().includes(targetSearchQuery.toLowerCase()))
  }, [targetItems, targetSearchQuery])

  const handleMoveToTarget = () => {
    const itemsToMove = sourceItems.filter((item) => selectedSourceItems.includes(item.id))
    setSourceItems(sourceItems.filter((item) => !selectedSourceItems.includes(item.id)))
    setTargetItems([...targetItems, ...itemsToMove])
    setSelectedSourceItems([])
  }

  const handleMoveToSource = () => {
    const itemsToMove = targetItems.filter((item) => selectedTargetItems.includes(item.id))
    setTargetItems(targetItems.filter((item) => !selectedTargetItems.includes(item.id)))
    setSourceItems([...sourceItems, ...itemsToMove])
    setSelectedTargetItems([])
  }

  const toggleSourceItemSelection = (id: string) => {
    setSelectedSourceItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const toggleTargetItemSelection = (id: string) => {
    setSelectedTargetItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const selectAllSourceItems = () => {
    setSelectedSourceItems(filteredSourceItems.map((item) => item.id))
  }

  const deselectAllSourceItems = () => {
    setSelectedSourceItems([])
  }

  const selectAllTargetItems = () => {
    setSelectedTargetItems(filteredTargetItems.map((item) => item.id))
  }

  const deselectAllTargetItems = () => {
    setSelectedTargetItems([])
  }

  const handleMoveAllToTarget = () => {
    setTargetItems([...targetItems, ...sourceItems])
    setSourceItems([])
    setSelectedSourceItems([])
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${className}`}>
      
      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{sourceTitle}</h3>

        <CustomInput
          placeholder="Search..."
          value={sourceSearchQuery}
          onChange={(e) => setSourceSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <button onClick={selectAllSourceItems} className="text-sm text-gray-600 hover:text-gray-900">
              Select all
            </button>
            <button onClick={deselectAllSourceItems} className="text-sm text-gray-600 hover:text-gray-900">
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
                  onClick={() => toggleSourceItemSelection(item.id)}
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
            <div className="flex items-center justify-center h-full text-gray-500">No items found</div>
          )}
        </div>
      </div>

      <div className="flex md:flex-col justify-center items-center gap-2 py-4">
        <button
          onClick={handleMoveToTarget}
          disabled={selectedSourceItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            selectedSourceItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected items to target"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={handleMoveAllToTarget}
          disabled={sourceItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            sourceItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move all items to target"
        >
          <span className="text-xs font-bold">ALL</span>
        </button>
        <button
          onClick={handleMoveToSource}
          disabled={selectedTargetItems.length === 0}
          className={`p-2 rounded-full border-2 ${
            selectedTargetItems.length === 0
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-primary-light text-primary-light hover:bg-primary-light hover:text-white"
          }`}
          title="Move selected items to source"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 border-2 border-primary-light rounded-[24px] p-4">
        <h3 className="text-lg font-medium mb-3 px-2">{targetTitle}</h3>

        <CustomInput
          placeholder="Search..."
          value={targetSearchQuery}
          onChange={(e) => setTargetSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="mb-3"
        />

        <div className="flex justify-between mb-2 px-2">
          <div className="flex gap-2">
            <button onClick={selectAllTargetItems} className="text-sm text-gray-600 hover:text-gray-900">
              Select all
            </button>
            <button onClick={deselectAllTargetItems} className="text-sm text-gray-600 hover:text-gray-900">
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
                  onClick={() => toggleTargetItemSelection(item.id)}
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
            <div className="flex items-center justify-center h-full text-gray-500">No items found</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferList
