interface InsightCardProps {
  title: string;
  icon: string;
  borderColor: string;
  bgColor: string;
  children: React.ReactNode;
  height?: string;
}

export default function InsightCard({ title, icon, borderColor, bgColor, children, height = "h-96" }: InsightCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg border-l-4 ${borderColor} ${height} overflow-hidden`}>
      <div className="flex items-center p-6 pb-4">
        <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mr-3`}>
          <span className="font-bold">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <div className="mx-6 mb-6 h-80 overflow-y-auto rounded-lg">
        {children}
      </div>
    </div>
  );
}