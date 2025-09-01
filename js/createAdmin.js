const admin = require('./adminSetup'); // Import the initialized Admin SDK

async function createAdminUser() {
  const predefinedUid = 'admin1'; // Predefined UID for the admin user
  const adminEmail = 'admin1@gmail.com';
  const adminPassword = 'securepassword123';

  try {
    // Step 1: Create the admin user with a predefined UID
    const userRecord = await admin.auth().createUser({
      uid: predefinedUid,
      email: adminEmail,
      password: adminPassword,
      displayName: 'Admin User',
      emailVerified: true // Optionally mark the email as verified
    });

    console.log('Admin user created successfully:', userRecord.toJSON());

    // Step 2: Assign custom claims to the user (e.g., admin role)
    await admin.auth().setCustomUserClaims(predefinedUid, { role: 'admin' });

    console.log('Admin role assigned via custom claims.');

    // Step 3: Store admin-specific data in a separate "admins" table
    const db = admin.database();
    const adminRef = db.ref(`admins/${predefinedUid}`); // Store in a dedicated "admins" node
    await adminRef.set({
      uid: predefinedUid,
      email: adminEmail,
      createdAt: new Date().toISOString(),
      role: 'admin' // Explicitly store the role for reference
    });

    console.log('Admin data saved to the "admins" table.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Call the function to create the admin user
createAdminUser();