export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="h-10 w-3/4 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-2/3 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
