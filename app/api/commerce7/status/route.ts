import { NextResponse } from 'next/server';

export async function GET() {
  const configured = Boolean(
    process.env.COMMERCE7_APP_ID &&
    process.env.COMMERCE7_APP_SECRET &&
    process.env.COMMERCE7_TENANT_ID,
  );

  return NextResponse.json({
    configured,
    tenant: configured ? process.env.COMMERCE7_TENANT_ID : null,
  });
}
