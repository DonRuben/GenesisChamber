'use client'

import { FinalAnalysis } from '@/types/debate'

interface FinalAnalysisProps {
  analysis: FinalAnalysis
}

export default function FinalAnalysisComponent({ analysis }: FinalAnalysisProps) {
  return (
    <div className="mt-16 pt-12 border-t border-gray-800 animate-fade-in">
      <h2 className="text-3xl font-bold text-orange-500 mb-8">Final Analysis</h2>
      
      {/* Executive Summary */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">Executive Summary</h3>
        <p className="text-gray-300 leading-relaxed">{analysis.executive_summary}</p>
      </section>

      {/* Key Insights */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">Key Insights</h3>
        <ul className="space-y-3">
          {analysis.key_insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-orange-500 mr-3 mt-1">•</span>
              <span className="text-gray-300">{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Items */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold text-orange-500 mb-4">Recommended Action Items</h3>
        <ol className="space-y-3">
          {analysis.action_items.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-orange-500 font-semibold mr-3">{index + 1}.</span>
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}