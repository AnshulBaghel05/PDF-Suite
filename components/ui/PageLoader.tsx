export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center space-y-4">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-white font-medium">Loading tool...</p>
          <p className="text-gray-400 text-sm">Please wait</p>
        </div>
      </div>
    </div>
  );
}
