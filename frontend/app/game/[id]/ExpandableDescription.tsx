"use client";

import { useState } from "react";

export default function ExpandableDescription({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 250;

  if (!text) {
    return <p className="text-gray-300 font-light italic">No description available.</p>;
  }

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength) + (shouldTruncate ? "..." : "");

  return (
    <div className="space-y-3">
      <p className="text-gray-300 leading-relaxed text-lg font-light">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-cinemac-blue hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
