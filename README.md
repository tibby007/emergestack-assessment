# EmergeStack AI Readiness Assessment Portal

A professional, branded web application for collecting stakeholder questionnaire responses during AI Readiness Assessments.

## Features

- ✅ 7-section questionnaire covering operations, documents, fraud, systems, security, credit, and strategy
- ✅ Progress saved automatically to localStorage (respondents can resume if interrupted)
- ✅ Clean, professional UI with EmergeStack branding
- ✅ Supabase backend for secure data storage
- ✅ Email notifications when assessments are completed
- ✅ Mobile responsive design

---

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

---

## Deployment Guide

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings > API** and copy:
   - Project URL (looks like `https://abc123.supabase.co`)
   - Anon/Public key

### Step 2: Set Up Email Notifications (Optional)

1. Create an account at [resend.com](https://resend.com)
2. Add your domain and verify it
3. Get your API key
4. In Supabase, go to **Edge Functions** and deploy the notification function:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=your-resend-api-key

# Deploy the function
supabase functions deploy send-assessment-notification
```

### Step 3: Deploy to Vercel

1. Push this code to a GitHub repository

2. Go to [vercel.com](https://vercel.com) and import the repository

3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. Deploy!

5. (Optional) Add a custom domain like `assessment.emergestack.dev`

---

## Custom Domain Setup

To use `assessment.emergestack.dev`:

1. In Vercel, go to your project settings > Domains
2. Add `assessment.emergestack.dev`
3. Vercel will give you DNS records to add
4. In your domain registrar, add the CNAME record pointing to Vercel

---

## Viewing Responses

### Option 1: Supabase Dashboard
1. Log into your Supabase project
2. Go to **Table Editor > assessment_responses**
3. View all submissions with full response data

### Option 2: Export to CSV
In the Supabase SQL Editor, run:
```sql
SELECT 
    respondent_name,
    respondent_email,
    respondent_title,
    company,
    submitted_at,
    responses
FROM assessment_responses
ORDER BY submitted_at DESC;
```
Then click "Export to CSV"

---

## Customization

### Change Questions
Edit the `questionnaire` object in `src/App.jsx`

### Change Branding Colors
Edit `tailwind.config.js`:
```js
colors: {
  brand: {
    orange: '#ff6b00',  // Change this
    charcoal: '#2d3748', // Change this
  }
}
```

### Add Your Logo Image
Replace the `EmergeStackLogo` component in `src/App.jsx` with an actual image:
```jsx
const EmergeStackLogo = () => (
  <img src="/logo.png" alt="EmergeStack" className="h-10 w-auto" />
)
```
Add your logo image to the `public/` folder.

---

## File Structure

```
assessment-portal/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   ├── index.css        # Tailwind imports
│   └── supabase.js      # Supabase client & helpers
├── supabase/
│   └── functions/
│       └── send-assessment-notification/
│           └── index.ts # Email notification function
├── .env.example         # Environment variables template
├── supabase-schema.sql  # Database schema
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Support

Questions? Contact Cheryl Tibbs at support@emergestack.dev

---

© 2026 EmergeStack Development Company
