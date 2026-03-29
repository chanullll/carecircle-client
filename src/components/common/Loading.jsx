export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">🏥</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">CareCircle</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Loading...</p>
      </div>
    </div>
  );
}