import { useState, useEffect } from 'react'
import { supabase, saveAssessmentResponse, sendNotificationEmail } from './supabase'

const questionnaire = {
  sections: [
    {
      id: 'operations',
      title: 'Operations & Workflow',
      description: 'Help us understand your current deal flow and processes.',
      questions: [
        { id: 'q1', text: 'Describe your current deal intake process from submission to credit review. What are the steps involved?', type: 'textarea' },
        { id: 'q2', text: 'How many deal submissions do you process per month?', type: 'text' },
        { id: 'q3', text: 'What percentage of submissions make it to funding?', type: 'text' },
        { id: 'q4', text: 'What is the average time from submission to credit decision?', type: 'text' },
        { id: 'q5', text: 'What are the most time-consuming manual tasks in your current process?', type: 'textarea' },
        { id: 'q6', text: 'Where do deals most commonly get stuck or delayed?', type: 'textarea' },
        { id: 'q7', text: 'How do you currently handle document organization and naming?', type: 'textarea' },
      ]
    },
    {
      id: 'documents',
      title: 'Document Processing',
      description: 'Tell us about the documents you work with.',
      questions: [
        { id: 'q8', text: 'What types of documents do you receive with each submission? (Select all that apply)', type: 'multiselect', options: ['Bank statements', 'Tax returns', 'Financial statements', 'Equipment invoices', 'Business licenses', 'Personal guarantees', 'Other'] },
        { id: 'q9', text: 'How do you currently extract data from bank statements?', type: 'select', options: ['Fully manual', 'Partially automated', 'Fully automated', 'Third-party service'] },
        { id: 'q10', text: 'What information do you pull from financial statements for credit decisioning?', type: 'textarea' },
        { id: 'q11', text: 'How do you verify document authenticity currently?', type: 'textarea' },
        { id: 'q12', text: 'What percentage of submissions arrive with incomplete or incorrect documentation?', type: 'text' },
      ]
    },
    {
      id: 'fraud',
      title: 'Fraud Prevention',
      description: 'Help us understand your current fraud detection measures.',
      questions: [
        { id: 'q13', text: 'What fraud prevention measures do you currently have in place?', type: 'textarea' },
        { id: 'q14', text: 'What types of fraud have you encountered? (Select all that apply)', type: 'multiselect', options: ['Document manipulation', 'Identity fraud', 'Stacking', 'Synthetic identity', 'Vendor fraud', 'Other'] },
        { id: 'q15', text: 'At what point in the process do you typically detect fraud?', type: 'select', options: ['At submission', 'During underwriting', 'At funding', 'Post-funding', 'Varies'] },
        { id: 'q16', text: 'What red flags do your analysts look for when reviewing submissions?', type: 'textarea' },
        { id: 'q17', text: 'How do you currently verify vendor/equipment information?', type: 'textarea' },
      ]
    },
    {
      id: 'systems',
      title: 'Systems & Integrations',
      description: 'Tell us about your current technology stack.',
      questions: [
        { id: 'q18', text: 'What loan origination system (LOS) do you use?', type: 'text' },
        { id: 'q19', text: 'What CRM do you use?', type: 'text' },
        { id: 'q20', text: 'How is your CRM integrated with your LOS?', type: 'textarea' },
        { id: 'q21', text: 'What credit bureaus do you pull from? (Select all that apply)', type: 'multiselect', options: ['Experian', 'PayNet', 'Clear', 'Dun & Bradstreet', 'Equifax', 'TransUnion', 'Other'] },
        { id: 'q22', text: 'How do you currently manage document storage?', type: 'text' },
        { id: 'q23', text: 'What communication tools do you use with brokers?', type: 'multiselect', options: ['Email', 'Portal', 'Phone', 'Secure messaging', 'Other'] },
        { id: 'q24', text: 'Are there any systems you are planning to replace or upgrade?', type: 'textarea' },
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      description: 'Help us understand your compliance requirements.',
      questions: [
        { id: 'q25', text: 'What regulatory frameworks do you need to comply with?', type: 'textarea' },
        { id: 'q26', text: 'What are your data residency requirements?', type: 'textarea' },
        { id: 'q27', text: 'What is your policy on third-party data processing?', type: 'textarea' },
        { id: 'q28', text: 'Do you have an internal IT/security team?', type: 'select', options: ['Yes, dedicated team', 'Yes, shared resources', 'No, outsourced', 'No IT/security function'] },
        { id: 'q29', text: 'What security certifications do you require from vendors? (Select all that apply)', type: 'multiselect', options: ['SOC 2', 'ISO 27001', 'PCI DSS', 'GDPR compliant', 'Other', 'Not sure'] },
        { id: 'q30', text: 'What is your stance on cloud vs. on-premise solutions?', type: 'select', options: ['Cloud preferred', 'On-premise required', 'Hybrid acceptable', 'No preference'] },
      ]
    },
    {
      id: 'credit',
      title: 'Credit Decisioning',
      description: 'Tell us about your credit review process.',
      questions: [
        { id: 'q31', text: 'What information do credit analysts need to make a decision?', type: 'textarea' },
        { id: 'q32', text: 'How is this information currently compiled and presented to analysts?', type: 'textarea' },
        { id: 'q33', text: 'What would an ideal pre-adjudication report look like?', type: 'textarea' },
        { id: 'q34', text: 'Are there specific calculations or ratios standard in your credit review?', type: 'textarea' },
        { id: 'q35', text: 'What percentage of deals are approved vs. declined vs. conditioned?', type: 'text' },
      ]
    },
    {
      id: 'strategic',
      title: 'Strategic Priorities',
      description: 'Help us understand your goals and concerns.',
      questions: [
        { id: 'q36', text: 'If you could automate one thing tomorrow, what would have the biggest impact?', type: 'textarea' },
        { id: 'q37', text: 'What does success look like 12 months from now?', type: 'textarea' },
        { id: 'q38', text: 'Are there any initiatives already in progress that this should align with?', type: 'textarea' },
        { id: 'q39', text: 'What has prevented you from implementing AI solutions so far?', type: 'textarea' },
        { id: 'q40', text: 'What concerns do you have about AI implementation?', type: 'textarea' },
      ]
    }
  ]
}

const EmergeStackLogo = () => (
  <div className="inline-flex items-center gap-0.5">
    <span className="text-xl font-black text-slate-700 tracking-tight">Emerge</span>
    <span className="text-xl font-black text-brand-orange tracking-tight">Stack</span>
  </div>
)

function App() {
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState({})
  const [respondentInfo, setRespondentInfo] = useState({ name: '', email: '', title: '', company: '' })
  const [isStarted, setIsStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const section = questionnaire.sections[currentSection]
  const progress = ((currentSection + 1) / questionnaire.sections.length) * 100

  // Save progress to localStorage
  useEffect(() => {
    if (isStarted && !isComplete) {
      localStorage.setItem('assessment_progress', JSON.stringify({
        currentSection,
        responses,
        respondentInfo
      }))
    }
  }, [currentSection, responses, respondentInfo, isStarted, isComplete])

  // Restore progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('assessment_progress')
    if (saved) {
      try {
        const { currentSection: savedSection, responses: savedResponses, respondentInfo: savedInfo } = JSON.parse(saved)
        if (savedResponses && Object.keys(savedResponses).length > 0) {
          setResponses(savedResponses)
          setRespondentInfo(savedInfo)
          setCurrentSection(savedSection)
          setIsStarted(true)
        }
      } catch (e) {
        console.error('Error restoring progress:', e)
      }
    }
  }, [])

  const handleInputChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleMultiSelect = (questionId, option) => {
    setResponses(prev => {
      const current = prev[questionId] || []
      if (current.includes(option)) {
        return { ...prev, [questionId]: current.filter(o => o !== option) }
      }
      return { ...prev, [questionId]: [...current, option] }
    })
  }

  const handleNext = () => {
    if (currentSection < questionnaire.sections.length - 1) {
      setCurrentSection(prev => prev + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Save to Supabase
      await saveAssessmentResponse(respondentInfo, responses)
      
      // Send notification email
      await sendNotificationEmail(respondentInfo)
      
      // Clear localStorage
      localStorage.removeItem('assessment_progress')
      
      setIsComplete(true)
    } catch (err) {
      console.error('Submission error:', err)
      setError('There was an error submitting your assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
      localStorage.removeItem('assessment_progress')
      setResponses({})
      setRespondentInfo({ name: '', email: '', title: '', company: '' })
      setCurrentSection(0)
      setIsStarted(false)
      setIsComplete(false)
    }
  }

  // Welcome Screen
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="max-w-3xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="bg-white shadow-lg rounded-2xl p-5 border border-slate-100">
                <EmergeStackLogo />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              AI Readiness Assessment
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
              This assessment helps us understand your current operations and identify the highest-impact opportunities for AI automation.
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Before you begin</h2>
            <div className="space-y-4 text-slate-600">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-orange font-semibold text-sm">1</span>
                </div>
                <p>This assessment covers 7 areas: operations, documents, fraud prevention, systems, security, credit decisioning, and strategic priorities.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-orange font-semibold text-sm">2</span>
                </div>
                <p>It takes approximately 15-20 minutes to complete. Your progress is saved automatically as you go.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-orange font-semibold text-sm">3</span>
                </div>
                <p>Your responses are confidential and used solely to inform our assessment and recommendations.</p>
              </div>
            </div>
          </div>

          {/* Respondent Info */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={respondentInfo.name}
                  onChange={(e) => setRespondentInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={respondentInfo.email}
                  onChange={(e) => setRespondentInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={respondentInfo.title}
                  onChange={(e) => setRespondentInfo(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="VP of Operations"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company *</label>
                <input
                  type="text"
                  value={respondentInfo.company}
                  onChange={(e) => setRespondentInfo(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="American Bank"
                />
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={() => setIsStarted(true)}
              disabled={!respondentInfo.name || !respondentInfo.email || !respondentInfo.title || !respondentInfo.company}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all duration-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Begin Assessment
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-slate-500">
            <p>Questions? Contact us at <a href="mailto:support@emergestack.dev" className="text-brand-orange hover:underline">support@emergestack.dev</a></p>
          </div>
        </div>
      </div>
    )
  }

  // Completion Screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Assessment Complete</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Thank you for completing the AI Readiness Assessment, {respondentInfo.name}. We've received your responses and will incorporate them into our analysis.
            </p>
            <div className="bg-slate-50 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-slate-800 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>Your responses will be reviewed and analyzed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>We may reach out for brief clarification if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-orange mt-1">•</span>
                  <span>Findings will be incorporated into your AI Readiness Assessment Report</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <EmergeStackLogo />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Question Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <EmergeStackLogo />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                Section {currentSection + 1} of {questionnaire.sections.length}
              </span>
              <button
                onClick={handleStartOver}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {questionnaire.sections.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSection(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  idx === currentSection 
                    ? 'bg-orange-100 text-orange-700' 
                    : idx < currentSection
                      ? 'bg-green-50 text-green-700'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {idx < currentSection && (
                  <span className="mr-1">✓</span>
                )}
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">{section.title}</h2>
          <p className="text-slate-600">{section.description}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {section.questions.map((question, qIdx) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <label className="block text-slate-800 font-medium mb-4">
                <span className="text-brand-orange mr-2">{qIdx + 1}.</span>
                {question.text}
              </label>

              {question.type === 'textarea' && (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
                  placeholder="Type your answer here..."
                />
              )}

              {question.type === 'text' && (
                <input
                  type="text"
                  value={responses[question.id] || ''}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="Type your answer here..."
                />
              )}

              {question.type === 'select' && (
                <div className="space-y-2">
                  {question.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleInputChange(question.id, option)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        responses[question.id] === option
                          ? 'border-brand-orange bg-orange-50 text-orange-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'multiselect' && (
                <div className="flex flex-wrap gap-2">
                  {question.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleMultiSelect(question.id, option)}
                      className={`px-4 py-2 rounded-xl border transition-all ${
                        (responses[question.id] || []).includes(option)
                          ? 'border-brand-orange bg-orange-50 text-orange-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {(responses[question.id] || []).includes(option) && (
                        <span className="mr-1">✓</span>
                      )}
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-200">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Previous
          </button>

          {currentSection < questionnaire.sections.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all duration-200"
            >
              Next Section
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-green-200 hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Assessment
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-slate-500">
        <p>
          support@emergestack.dev | (470) 988-3931 | 3379 Hwy 5, Suite F, Douglasville, GA 30135
        </p>
      </div>
    </div>
  )
}

export default App
