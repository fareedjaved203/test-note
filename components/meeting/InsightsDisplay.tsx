import InsightCard from './InsightCard';

interface ActionItem {
  who: string;
  what: string;
  when?: string;
}

interface Deadline {
  task: string;
  date: string;
}

interface Insights {
  summary: string;
  actionItems?: ActionItem[];
  keyDecisions?: string[];
  nextSteps?: string[];
  deadlines?: Deadline[];
  questions?: string[];
}

interface InsightsDisplayProps {
  insights: Insights;
}

export default function InsightsDisplay({ insights }: InsightsDisplayProps) {
  return (
    <div className="space-y-6">
      <InsightCard
        title="Summary"
        icon="📝"
        borderColor="border-blue-500"
        bgColor="bg-blue-100"
        height="h-64"
      >
        <p className="text-gray-700 leading-relaxed pr-2">{insights.summary}</p>
      </InsightCard>
      
      <div className="grid gap-6 md:grid-cols-2">
        {insights.actionItems && insights.actionItems.length > 0 && (
          <InsightCard
            title="Action Items"
            icon="✅"
            borderColor="border-green-500"
            bgColor="bg-green-100"
          >
            <div className="space-y-3 pr-2">
              {insights.actionItems!.map((item, i: number) => (
                <div key={i} className="bg-green-50 p-3 my-5 rounded-lg">
                  <div className="font-semibold text-green-800">{item.who}</div>
                  <div className="text-gray-700">{item.what}</div>
                  {item.when && <div className="text-sm text-green-600 mt-1">Due: {item.when}</div>}
                </div>
              ))}
            </div>
          </InsightCard>
        )}
        
        {insights.keyDecisions && insights.keyDecisions.length > 0 && (
          <InsightCard
            title="Key Decisions"
            icon="⚡"
            borderColor="border-yellow-500"
            bgColor="bg-yellow-100"
          >
            <div className="space-y-2 pr-2">
              {insights.keyDecisions!.map((decision: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 my-3">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span className="text-gray-700">{decision}</span>
                </div>
              ))}
            </div>
          </InsightCard>
        )}
        
        {insights.nextSteps && insights.nextSteps.length > 0 && (
          <InsightCard
            title="Next Steps"
            icon="🚀"
            borderColor="border-purple-500"
            bgColor="bg-purple-100"
          >
            <div className="space-y-2 pr-2">
              {insights.nextSteps!.map((step: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 my-3">
                  <span className="text-purple-500 mt-1">•</span>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </InsightCard>
        )}
        
        {insights.deadlines && insights.deadlines.length > 0 && (
          <InsightCard
            title="Important Deadlines"
            icon="⏰"
            borderColor="border-red-500"
            bgColor="bg-red-100"
          >
            <div className="space-y-3 pr-2">
              {insights.deadlines!.map((deadline, i: number) => (
                <div key={i} className="bg-red-50 p-3 rounded-lg">
                  <div className="font-semibold text-red-800">{deadline.task}</div>
                  <div className="text-red-600 text-sm">{deadline.date}</div>
                </div>
              ))}
            </div>
          </InsightCard>
        )}
        
        {insights.questions && insights.questions.length > 0 && (
          <InsightCard
            title="Questions/Issues"
            icon="❓"
            borderColor="border-orange-500"
            bgColor="bg-orange-100"
          >
            <div className="space-y-2 pr-2">
              {insights.questions!.map((question: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 my-3">
                  <span className="text-orange-500 mt-1">•</span>
                  <span className="text-gray-700">{question}</span>
                </div>
              ))}
            </div>
          </InsightCard>
        )}
      </div>
    </div>
  );
}