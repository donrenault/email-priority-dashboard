import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Handle POST requests from n8n
export async function POST(request) {
  try {
    const body = await request.json()
    console.log('Received data:', body)
    
    // Extract data - handle both direct fields and nested json structure
    const emailData = body.json || body
    const { 
      Sender_name, 
      Sender_email, 
      summary, 
      why_attention, 
      priority_hml 
    } = emailData

    // Insert into database
    const { data, error } = await supabase
      .from('email_priorities')
      .insert([{ 
        sender_name: Sender_name,
        sender_email: Sender_email,
        summary,
        attention_reason: why_attention,
        priority: priority_hml,
        created_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email priority saved successfully' 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error.message 
    }, { status: 500 })
  }
}

// Handle GET requests to fetch email priorities
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('email_priorities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error.message 
    }, { status: 500 })
  }
}