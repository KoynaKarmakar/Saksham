// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';
import { apiHandler } from '@/lib/middleware/auth';

async function signupHandler(req: NextRequest) {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({ message: 'Please enter all required fields' }, { status: 400 });
    }

    // Check if user already exists (Mongoose unique index handles race condition)
    const userExists = await User.findOne({ email });
    if (userExists) {
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    try {
        const newUser = await User.create({ name, email, password });

        const user = newUser.toObject();
        delete user.password;

        return NextResponse.json(
            {
                user,
                token: generateToken(user._id.toString()),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ message: 'Server error during signup' }, { status: 500 });
    }
}

export const POST = apiHandler(signupHandler);