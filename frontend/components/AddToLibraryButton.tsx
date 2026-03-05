"use client";

import { useLibrary } from "../contexts/LibraryContext";

interface AddToLibraryButtonProps {
  mediaId: string;
  mediaTitle: string;
  mediaType: string;
  posterUrl: string;
  className?: string;
  fullWidth?: boolean;
}

export default function AddToLibraryButton({ 
  mediaId, 
  mediaTitle, 
  mediaType, 
  posterUrl, 
  className = "",
  fullWidth = false 
}: AddToLibraryButtonProps) {
  const { addToLibrary, removeFromLibrary, isInLibrary } = useLibrary();

  const isSaved = isInLibrary(mediaId, mediaType);

  const toggleLibrary = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if this is inside a Link block
    if (isSaved) {
      removeFromLibrary(mediaId, mediaType);
    } else {
      addToLibrary({ mediaId, mediaTitle, mediaType, posterUrl });
    }
  };

  return (
    <button 
      onClick={toggleLibrary}
      className={`relative z-20 flex items-center justify-center gap-2 font-bold transition-all shadow-lg
        ${fullWidth ? 'w-full py-4 rounded-xl' : 'p-3 rounded-full'}
        ${isSaved 
          ? 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 group/btn' 
          : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
        } ${className}`}
      title={isSaved ? "Remove from Library" : "Add to play in Cinemac"}
    >
      {isSaved ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover/btn:hidden">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 hidden group-hover/btn:block">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {fullWidth && <span className="group-hover/btn:hidden">Saved to Library</span>}
          {fullWidth && <span className="hidden group-hover/btn:inline">Remove from Library</span>}
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {fullWidth && <span>Add to play in Cinemac</span>}
        </>
      )}
    </button>
  );
}
