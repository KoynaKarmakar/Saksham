// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';
import { apiHandler } from '@/lib/middleware/auth';

async function loginHandler(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ message: 'Please enter email and password' }, { status: 400 });
    }

    try {
        // Explicitly select password to run the matchPassword method
        const user = await User.findOne({ email }).select('+password');

        if (user && user.password && (await user.matchPassword(password))) {

            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json(
                {
                    user: userObj,
                    token: generateToken(user._id.toString()),
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Server error during login' }, { status: 500 });
    }
}

export const POST = apiHandler(loginHandler);