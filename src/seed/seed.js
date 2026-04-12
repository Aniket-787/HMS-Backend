const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');


const seedSuperAdmin = async ()=>{
    try {
        const existing = await userModel.findOne({role:"SUPER_ADMIN"});
        if(existing){
            console.log('SuperAdmin already exists');
            return ;
        }
        const hashPassword = await bcrypt.hash("admin123",10)

        const superAdmin = await userModel.create({
            name:"Super Admin",
            email:"superadmin@gmail.com",
            password:hashPassword,
            phone:7595132541,
            role:"SUPER_ADMIN",
            hospitalId:null
        })

        await superAdmin.save();
        console.log("SuperAdmin created successfully!")
    } catch (error) {
        console.error("Error seeding SuperAdmin:", error.message);
    }
};

module.exports = seedSuperAdmin;