import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'LoveWall';
    const recipient = searchParams.get('recipient') || 'Someone Special';

    return new ImageResponse(
      React.createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4a044e 0%, #1e1b4b 50%, #0284c7 100%)',
            fontFamily: 'sans-serif',
            color: 'white',
            padding: '40px',
            textAlign: 'center',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 60,
              marginBottom: 20,
            },
          },
          `💖 ${title}`
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 32,
              color: '#f472b6',
              marginTop: 10,
            },
          },
          `A digital celebration created for ${recipient}`
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              marginTop: 40,
              padding: '12px 24px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: 20,
              color: '#e2e8f0',
            },
          },
          'lovewall.app • Leave a note & send love'
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate OG image: ${errorMessage}`, {
      status: 500,
    });
  }
}
