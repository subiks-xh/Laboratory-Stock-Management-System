import bcrypt from "bcrypt";
import { sequelize } from "../config/mysql.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";

const sampleTestUsers = async () => {
  try {
    console.log("🔄 Starting test user creation...");

    // Sync database
    await sequelize.sync();
    console.log("✅ Database synced");

    // Create Departments first
    const departments = await Department.bulkCreate(
      [
        {
          departmentName: "Computer Science Engineering",
          departmentAcr: "CSE",
          companyId: 1,
        },
        {
          departmentName: "Electronics & Communication",
          departmentAcr: "ECE",
          companyId: 1,
        },
        {
          departmentName: "Mechanical Engineering",
          departmentAcr: "MECH",
          companyId: 1,
        },
        {
          departmentName: "Electrical Engineering",
          departmentAcr: "EEE",
          companyId: 1,
        },
        {
          departmentName: "Information Technology",
          departmentAcr: "IT",
          companyId: 1,
        },
        {
          departmentName: "Administration",
          departmentAcr: "ADMIN",
          companyId: 1,
        },
      ],
      {
        ignoreDuplicates: true,
        returning: true,
      },
    );
    console.log("✅ Departments created");

    // Create Roles
    const roles = await Role.bulkCreate(
      [
        { roleName: "Super Admin", status: "Active" },
        { roleName: "Admin", status: "Active" },
        { roleName: "Department Admin", status: "Active" },
        { roleName: "Faculty", status: "Active" },
        { roleName: "Lab Assistant", status: "Active" },
        { roleName: "Student", status: "Active" },
        { roleName: "Maintenance Staff", status: "Active" },
      ],
      {
        ignoreDuplicates: true,
        returning: true,
      },
    );
    console.log("✅ Roles created");

    // Get IDs for associations
    const superAdminRole = await Role.findOne({
      where: { roleName: "Super Admin" },
    });
    const adminRole = await Role.findOne({ where: { roleName: "Admin" } });
    const deptAdminRole = await Role.findOne({
      where: { roleName: "Department Admin" },
    });
    const facultyRole = await Role.findOne({ where: { roleName: "Faculty" } });
    const labAssistantRole = await Role.findOne({
      where: { roleName: "Lab Assistant" },
    });
    const studentRole = await Role.findOne({ where: { roleName: "Student" } });
    const maintenanceRole = await Role.findOne({
      where: { roleName: "Maintenance Staff" },
    });

    const cseDept = await Department.findOne({
      where: { departmentAcr: "CSE" },
    });
    const eceDept = await Department.findOne({
      where: { departmentAcr: "ECE" },
    });
    const mechDept = await Department.findOne({
      where: { departmentAcr: "MECH" },
    });
    const adminDept = await Department.findOne({
      where: { departmentAcr: "ADMIN" },
    });
    const itDept = await Department.findOne({ where: { departmentAcr: "IT" } });

    // Hash password for all users
    const defaultPassword = await bcrypt.hash("test123", 10);

    // Create Test Users
    const testUsers = [
      // Super Admin
      {
        userMail: "superadmin@lab.edu",
        password: defaultPassword,
        firstName: "Super",
        lastName: "Admin",
        userName: "superadmin",
        roleId: superAdminRole.roleId,
        departmentId: adminDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999999",
      },
      // System Admin
      {
        userMail: "admin@lab.edu",
        password: defaultPassword,
        firstName: "System",
        lastName: "Admin",
        userName: "admin",
        roleId: adminRole.roleId,
        departmentId: adminDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999998",
      },
      // Department Admin - CSE
      {
        userMail: "cseadmin@lab.edu",
        password: defaultPassword,
        firstName: "CSE",
        lastName: "Admin",
        userName: "cseadmin",
        roleId: deptAdminRole.roleId,
        departmentId: cseDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999997",
      },
      // Department Admin - ECE
      {
        userMail: "eceadmin@lab.edu",
        password: defaultPassword,
        firstName: "ECE",
        lastName: "Admin",
        userName: "eceadmin",
        roleId: deptAdminRole.roleId,
        departmentId: eceDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999996",
      },
      // Faculty - CSE
      {
        userMail: "csefaculty@lab.edu",
        password: defaultPassword,
        firstName: "Dr. John",
        lastName: "Smith",
        userName: "csefaculty",
        roleId: facultyRole.roleId,
        departmentId: cseDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999995",
      },
      // Faculty - ECE
      {
        userMail: "ecefaculty@lab.edu",
        password: defaultPassword,
        firstName: "Dr. Sarah",
        lastName: "Johnson",
        userName: "ecefaculty",
        roleId: facultyRole.roleId,
        departmentId: eceDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999994",
      },
      // Lab Assistant - CSE
      {
        userMail: "cselab@lab.edu",
        password: defaultPassword,
        firstName: "CSE Lab",
        lastName: "Assistant",
        userName: "cselab",
        roleId: labAssistantRole.roleId,
        departmentId: cseDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999993",
      },
      // Lab Assistant - ECE
      {
        userMail: "ecelab@lab.edu",
        password: defaultPassword,
        firstName: "ECE Lab",
        lastName: "Assistant",
        userName: "ecelab",
        roleId: labAssistantRole.roleId,
        departmentId: eceDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999992",
      },
      // Students
      {
        userMail: "student1@lab.edu",
        password: defaultPassword,
        firstName: "Alice",
        lastName: "Brown",
        userName: "student1",
        roleId: studentRole.roleId,
        departmentId: cseDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999991",
      },
      {
        userMail: "student2@lab.edu",
        password: defaultPassword,
        firstName: "Bob",
        lastName: "Davis",
        userName: "student2",
        roleId: studentRole.roleId,
        departmentId: eceDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999990",
      },
      {
        userMail: "student3@lab.edu",
        password: defaultPassword,
        firstName: "Charlie",
        lastName: "Wilson",
        userName: "student3",
        roleId: studentRole.roleId,
        departmentId: mechDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999989",
      },
      // Maintenance Staff
      {
        userMail: "maintenance@lab.edu",
        password: defaultPassword,
        firstName: "Mike",
        lastName: "Maintenance",
        userName: "maintenance",
        roleId: maintenanceRole.roleId,
        departmentId: adminDept.departmentId,
        status: "Active",
        emailVerified: true,
        mobileNumber: "9999999988",
      },
    ];

    // Insert users
    const createdUsers = await User.bulkCreate(testUsers, {
      ignoreDuplicates: true,
      returning: true,
    });

    console.log("✅ Test users created successfully!");
    console.log(`📊 Total users created: ${createdUsers.length}`);

    // Display login credentials
    console.log("\n🔐 LOGIN CREDENTIALS FOR TESTING:");
    console.log("═══════════════════════════════════════════════════");

    console.log("\n👑 SUPER ADMIN:");
    console.log("   Email: superadmin@lab.edu");
    console.log("   Password: test123");
    console.log("   Role: Super Admin | Department: Administration");

    console.log("\n🛡️ SYSTEM ADMIN:");
    console.log("   Email: admin@lab.edu");
    console.log("   Password: test123");
    console.log("   Role: Admin | Department: Administration");

    console.log("\n🏢 DEPARTMENT ADMINS:");
    console.log("   CSE Admin - Email: cseadmin@lab.edu | Password: test123");
    console.log("   ECE Admin - Email: eceadmin@lab.edu | Password: test123");

    console.log("\n👨‍🏫 FACULTY:");
    console.log(
      "   CSE Faculty - Email: csefaculty@lab.edu | Password: test123",
    );
    console.log(
      "   ECE Faculty - Email: ecefaculty@lab.edu | Password: test123",
    );

    console.log("\n🔬 LAB ASSISTANTS:");
    console.log("   CSE Lab - Email: cselab@lab.edu | Password: test123");
    console.log("   ECE Lab - Email: ecelab@lab.edu | Password: test123");

    console.log("\n👩‍🎓 STUDENTS:");
    console.log(
      "   Student 1 - Email: student1@lab.edu | Password: test123 (CSE)",
    );
    console.log(
      "   Student 2 - Email: student2@lab.edu | Password: test123 (ECE)",
    );
    console.log(
      "   Student 3 - Email: student3@lab.edu | Password: test123 (MECH)",
    );

    console.log("\n🔧 MAINTENANCE:");
    console.log(
      "   Maintenance - Email: maintenance@lab.edu | Password: test123",
    );

    console.log("\n═══════════════════════════════════════════════════");
    console.log("✅ All test users ready for role-based testing!");
  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await sequelize.close();
  }
};

// Run the script
sampleTestUsers();
