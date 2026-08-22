import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../model/user.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
    try {
        // 1. Connect to MongoDB
           connectDB()

        // 2. Check if Admin already exists
        const adminExists = await User.findOne({ role: 'Admin' });
        
        if (adminExists) {
            console.log('✅ Admin user already exists.');
            console.log(`   📧 Email: ${adminExists.email}`);
            console.log('   ⚠️  If you forgot the password, use the "Forgot Password" feature.');
            console.log('   🔒 Or run: node scripts/resetPassword.js');
            process.exit(0);
        }

        // 3. Admin credentials (from .env or defaults)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@astu.edu.et';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const adminName = process.env.ADMIN_NAME || 'System Administrator';
        const adminPhone = process.env.ADMIN_PHONE || '0912345678';

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // 5. Create the Admin user
        const admin = new User({
            fullName: adminName,
            email: adminEmail.toLowerCase().trim(),
            password: hashedPassword,
            phone: adminPhone,
            role: 'Admin',
            isActive: true,
        });

        await admin.save();

        // 6. Success message
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   📧 Email: ${adminEmail}`);
        console.log(`   🔑 Password: ${adminPassword}`);
        console.log(`   👤 Name: ${adminName}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   ⚠️  Please change this password after first login.');
        console.log('   🚀 You can now login to the system.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();