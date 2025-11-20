// lib/models/User.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    username?: string;
    phone?: string;
    tagline?: string;
    profilePicture?: string;
    gigsCompleted: number;
    rating: number;
    portfolio: { title?: string; url?: string };
    socialLinks: string[];
    twoFactorEnabled: boolean;
    securityAlerts: boolean;
    rememberDevices: boolean;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        weekly: boolean;
    };
    billing: {
        card?: string;
        address?: string;
        plan?: string;
    };
    createdAt: Date;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        username: { type: String, trim: true },
        phone: { type: String },
        tagline: { type: String },
        profilePicture: { type: String },
        gigsCompleted: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        portfolio: {
            title: { type: String },
            url: { type: String },
        },
        socialLinks: [{ type: String }],
        twoFactorEnabled: { type: Boolean, default: false },
        securityAlerts: { type: Boolean, default: false },
        rememberDevices: { type: Boolean, default: false },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            weekly: { type: Boolean, default: true },
        },
        billing: {
            card: { type: String },
            address: { type: String },
            plan: { type: String, default: "Free" },
        },
        createdAt: { type: Date, default: Date.now },
    }
);

// Hash Password before saving
UserSchema.pre<IUser>('save', async function (next) {
    // If password is not modified, return early
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password!, salt);
        next();
    } catch (error: any) {
        return next(error);
    }
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    if (!this.password) {
        console.error("matchPassword called but password field is missing/undefined.");
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

export interface IUserModel extends Model<IUser> { }
const User: IUserModel = (mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema)) as IUserModel;
export default User;