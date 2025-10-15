'use client';

import { useState } from 'react';
import { WatchlistGroupData } from './types';
import { WatchlistItem } from './WatchlistItem';

interface WatchlistGroupProps extends WatchlistGroupData {
  watchlistId: string;
  isDefault?: boolean;
  onAddToken?: () => void;
  onDelete?: () => void;
}

export function WatchlistGroup({
  title,
  icon,
  items,
  defaultExpanded = true,
  watchlistId,
  isDefault = false,
  onAddToken,
  onDelete
}: WatchlistGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showMenu, setShowMenu] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-4 relative">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#1a1a1a] transition-colors duration-200 rounded-lg group">
        <button
          onClick={toggleExpand}
          className="flex items-center space-x-2 flex-1"
        >
          <span className="text-base">{icon}</span>
          <span className="text-[#e0e0e0] text-sm font-semibold uppercase tracking-wide">
            {title}
          </span>
          <span className="text-gray-600 text-xs">
            ({items.length})
          </span>
        </button>

        <div className="flex items-center gap-1">
          {/* Add Token Button */}
          {onAddToken && (
            <button
              onClick={onAddToken}
              className="p-1.5 rounded hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
              title="Add token"
            >
              <svg
                className="w-4 h-4 text-gray-400 hover:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}

          {/* Menu Button (Delete) */}
          {!isDefault && onDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded hover:bg-gray-700/50 transition-colors opacity-0 group-hover:opacity-100"
                title="Options"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Expand/Collapse Icon */}
          <button
            onClick={toggleExpand}
            className="p-1"
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Items List with Smooth Animation */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-1 space-y-0.5">
          {items.map((item) => (
            <WatchlistItem
              key={item.symbol}
              symbol={item.symbol}
              name={item.name}
              price={item.price}
              change24h={item.change24h}
              icon={item.icon}
              watchlistId={watchlistId}
              canRemove={!isDefault}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
