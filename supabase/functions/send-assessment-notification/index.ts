// Supabase Edge Function: send-assessment-notification
// This sends an email notification when someone completes the assessment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const NOTIFICATION_EMAIL = 'support@emergestack.dev' // Your email

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { respondentName, respondentEmail, respondentTitle, company } = await req.json()

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'EmergeStack Assessment <notifications@emergestack.dev>',
        to: [NOTIFICATION_EMAIL],
        subject: `New Assessment Submission: ${company}`,
        html: `
          <h2>New AI Readiness Assessment Submitted</h2>
          <p>A new assessment has been completed:</p>
          <ul>
            <li><strong>Name:</strong> ${respondentName}</li>
            <li><strong>Email:</strong> ${respondentEmail}</li>
            <li><strong>Title:</strong> ${respondentTitle}</li>
            <li><strong>Company:</strong> ${company}</li>
            <li><strong>Submitted:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>Log into your <a href="https://supabase.com/dashboard">Supabase Dashboard</a> to view the full responses.</p>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})
