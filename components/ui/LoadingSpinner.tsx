interface LoadingSpinnerProps {
  message: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
        <div>
          <p className="text-blue-700 font-semibold">Processing Meeting</p>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}