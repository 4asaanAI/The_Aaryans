import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { method, userId, contact } = await req.json();

    if (!method || !userId || !contact) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        method,
        sent_to: contact,
        expires_at: expiresAt,
        verified: false,
      });

    if (dbError) throw dbError;

    if (method === 'email') {
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: 'noreply@yourdomain.com',
            to: contact,
            subject: 'Password Reset OTP',
            html: `<p>Your password reset OTP is: <strong>${token}</strong></p><p>This OTP is valid for 10 minutes.</p>`,
          });
        } else {
          console.log('RESEND_API_KEY not configured. OTP:', token);
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    } else if (method === 'phone') {
      try {
        const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
        
        if (twilioSid && twilioToken && twilioPhone) {
          const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
            },
            body: new URLSearchParams({
              To: contact,
              From: twilioPhone,
              Body: `Your password reset OTP is: ${token}. Valid for 10 minutes.`,
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Twilio error:', errorData);
          }
        } else {
          console.log('Twilio not configured. OTP:', token);
        }
      } catch (error) {
        console.error('SMS sending error:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `OTP sent to ${contact}` }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});