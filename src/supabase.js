import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to save assessment response
export async function saveAssessmentResponse(respondentInfo, responses) {
  const { data, error } = await supabase
    .from('assessment_responses')
    .insert([
      {
        respondent_name: respondentInfo.name,
        respondent_email: respondentInfo.email,
        respondent_title: respondentInfo.title,
        company: respondentInfo.company,
        responses: responses,
        submitted_at: new Date().toISOString()
      }
    ])
    .select
  
  if (error) {
    console.error('Error saving response:', error)
    throw error
  }
  
  return data
}

// Helper function to send notification email via Edge Function
export async function sendNotificationEmail(respondentInfo) {
  try {
    const { data, error } = await supabase.functions.invoke('send-assessment-notification', {
      body: {
        respondentName: respondentInfo.name,
        respondentEmail: respondentInfo.email,
        respondentTitle: respondentInfo.title,
        company: respondentInfo.company
      }
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error sending notification:', error)
    // Don't throw - email notification failure shouldn't block submission
  }
}
