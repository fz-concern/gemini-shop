import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, readLocalJson, writeLocalJson } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { BankDetails } from '@/lib/types';

const defaultBankDetails: BankDetails = {
  bankName: 'Meezan Bank Limited',
  accountTitle: 'Muhammad Fahad',
  accountNumber: '03260343607',
  iban: 'PK36MEZN0001020304050607',
  easypaisaNumber: '03260343607',
  jazzcashNumber: '03260343607',
  usdtAddress: 'TRC20-Account-Placeholder',
  instructions: 'Please transfer exact total amount and upload payment confirmation receipt screenshot.',
};

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    if (db) {
      const collection = db.collection('settings');
      const doc = await collection.findOne({ _id: 'bank_details' as any });
      if (doc && doc.details) {
        return NextResponse.json({ success: true, data: doc.details });
      }
    }

    const localData = readLocalJson<BankDetails>('bank_details.json', defaultBankDetails);
    return NextResponse.json({ success: true, data: localData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorizedAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body: BankDetails = await req.json();
    const { db } = await connectToDatabase();

    if (db) {
      const collection = db.collection('settings');
      await collection.updateOne(
        { _id: 'bank_details' as any },
        { $set: { details: body, updatedAt: new Date().toISOString() } },
        { upsert: true }
      );
    } else {
      writeLocalJson('bank_details.json', body);
    }

    return NextResponse.json({ success: true, message: 'Bank details saved successfully', data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
