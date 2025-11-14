import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { planType, amount } = await req.json();

    // In production, install Razorpay SDK: npm install razorpay
    // For now, return a mock response
    const Razorpay = require('razorpay');

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to pence (smallest currency unit)
      currency: 'GBP',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planType,
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
