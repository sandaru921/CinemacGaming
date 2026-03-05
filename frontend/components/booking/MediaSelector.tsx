import { useLibrary, LibraryItem } from "../../contexts/LibraryContext";
import Image from "next/image";

interface MediaSelectorProps {
  selectedMedia: LibraryItem | null;
  onSelect: (media: LibraryItem) => void;
}

export default function MediaSelector({ selectedMedia, onSelect }: MediaSelectorProps) {
  const { library } = useLibrary();

  if (library.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center shadow-xl">
        <h3 className="text-xl font-bold mb-2">What do you want to play/watch?</h3>
        <p className="text-gray-400 text-sm mb-4">Your library is currently empty.</p>
        <p className="text-cinemac-blue text-sm">
          You can book a room now and decide later, or go to the Games/Movies pages to add items to your library.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-2xl font-bold mb-6">What do you want to play/watch? <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span></h3>
      
      <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x pb-4">
        {library.map((item) => {
          const isSelected = selectedMedia?.mediaId === item.mediaId && selectedMedia?.mediaType === item.mediaType;
          return (
            <div 
              key={`${item.mediaType}-${item.mediaId}`}
              onClick={() => onSelect(item)}
              className={`snap-start shrink-0 w-[140px] md:w-[160px] cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 relative
                ${isSelected ? 'border-cinemac-blue scale-105 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-gray-800 hover:border-gray-500 hover:scale-[1.02]'}`}
            >
              <div className="w-full aspect-[2/3] relative">
                {item.posterUrl ? (
                  <Image src={item.posterUrl} alt={item.mediaTitle} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-xs text-gray-500">No Image</div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-cinemac-blue text-white rounded-full p-2 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold uppercase border border-gray-700">
                  {item.mediaType}
                </div>
              </div>
              <div className="p-3 bg-gray-900">
                <p className="text-xs font-bold truncate text-center">{item.mediaTitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
