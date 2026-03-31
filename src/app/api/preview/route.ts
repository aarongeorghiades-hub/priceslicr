import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  const previewKey = process.env.PREVIEW_KEY

  if (!previewKey || key !== previewKey) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  const response = NextResponse.redirect('https://www.priceslicr.com')
  response.cookies.set('preview', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}
