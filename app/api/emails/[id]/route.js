import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Handle PATCH requests to update email priority
export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const { priority } = body
    const { id } = params
    
    if (!priority) {
      return NextResponse.json({ 
        error: 'Priority is required' 
      }, { status: 400 })
    }

    // Update priority in database
    const { data, error } = await supabase
      .from('email_priorities')
      .update({ priority: priority })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ 
        error: 'Email not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Priority updated successfully' 
    })

  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json({ 
      error: 'Failed to update priority',
      details: error.message 
    }, { status: 500 })
  }
}