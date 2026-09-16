export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col items-center justify-center min-h-[100dvh]">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#149c77] rounded-full animate-spin"></div>
        <img 
          src="/logo_icon.png" 
          alt="Loading..." 
          className="absolute w-8 h-8 object-contain"
        />
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
    </div>
  )
}
