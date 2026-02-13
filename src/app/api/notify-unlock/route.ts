import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  // 1. Security Check
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch Users (Joining profiles to get email)
    const { data: walls, error } = await supabase
      .from('walls')
      .select(`
        name,
        profiles (email, full_name)
      `)
      .eq('type', 'valentine');

    if (error) throw error;
    if (!walls || walls.length === 0) return NextResponse.json({ message: 'No walls found' });

    const makeUrl = "https://hook.eu1.make.com/ex1r82vnehazfg1cglbmahrdtvug24es";
    
    // 3. Send to Zapier
    const notifications = walls.map(async (wall: any) => {
      // CRITICAL: If no email exists, skip this user
      if (!wall.profiles?.email) {
        console.log(`Skipping wall ${wall.name} - No owner email found`);
        return null;
      }

      return fetch(makeUrl, {
        method: 'POST',
        // ADDED HEADERS: This is why Zapier likely saw an empty "To" field
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: wall.profiles.email, // This maps to the orange bubble in Zapier
          name: wall.profiles.full_name || 'Celebrant',
          wallName: wall.name,
          dashboardUrl: "https://thelovewall.vercel.app/dashboard"
        })
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ 
      success: true, 
      count: walls.length 
    });

  } catch (err: any) {
    console.error("Notify Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}