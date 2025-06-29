import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { userId, firstName, lastName, email, role } = await request.json()

    console.warn('🔄 Creating user profile via API:', {
      userId,
      firstName,
      lastName,
      email,
      role
    })

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user profile using admin client
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: ''
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error (server):', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      })
      
      return NextResponse.json(
        { 
          error: true, 
          message: profileError.message,
          details: profileError.details || profileError.hint 
        },
        { status: 400 }
      )
    }

    console.warn('✅ User profile created successfully:', profileData)
    
    return NextResponse.json({ 
      success: true, 
      profile: profileData 
    })

  } catch (error) {
    console.error('Error in create-profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}