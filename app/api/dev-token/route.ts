import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.VERCEL_ENV) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const accessToken = await auth0.getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      );
    }

    return NextResponse.json(
        accessToken
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
}