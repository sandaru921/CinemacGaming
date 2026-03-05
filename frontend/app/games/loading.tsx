export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-cinemac-purple/30 border-t-cinemac-purple rounded-full animate-spin"></div>
      <h2 className="text-2xl font-bold mt-6 animate-pulse">Loading Games...</h2>
      <p className="text-gray-500 mt-2">Loading the ultimate gaming catalog.</p>
    </div>
  );
}
