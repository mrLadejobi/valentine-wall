import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  // 1. SECURITY CHECK: Only allow your Cron-job to trigger this
  // Make sure you have added CRON_SECRET to your Vercel Environment Variables
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. FETCH USERS: Find all users who have a Valentine wall
    // Note: We are 'joining' the profiles table to get their email and name
    const { data: walls, error } = await supabase
      .from('walls')
      .select(`
        name,
        profiles (email, full_name)
      `)
      .eq('type', 'valentine');

    if (error) throw error;
    if (!walls || walls.length === 0) {
      return NextResponse.json({ message: 'No valentine walls found.' });
    }

    // 3. PING ZAPIER: Your unique Webhook URL
    const zapierUrl = "https://hooks.zapier.com/hooks/catch/26316530/ulctexv/";
    
    const notifications = walls.map(async (wall: any) => {
      // Ensure the user has a profile and email before sending
      if (!wall.profiles?.email) return null;

      return fetch(zapierUrl, {
        method: 'POST',
        // Zapier expects data in the body
        body: JSON.stringify({
          email: wall.profiles.email,
          name: wall.profiles.full_name || 'Celebrant',
          wallName: wall.name,
          unlockDate: 'February 14th',
          dashboardUrl: `${window.location.origin}/dashboard`
        })
      });
    });

    // Wait for all pings to reach Zapier
    await Promise.all(notifications);

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${walls.length} notifications to Zapier bridge.` 
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}