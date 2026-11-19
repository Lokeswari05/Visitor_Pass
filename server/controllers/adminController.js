import User from "../models/User.js"
import Visitor from "../models/Visitor.js";
import Activity from "../models/Activity.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const getDashboard = async(req, res) => {
    // try promise.all() for parallel exceution instead if countDocuments()
    try{
        // user
        const totalUsers = await User.countDocuments();
        // if(totalUsers === 0){
        //     return res.status(200).json({
        //         message: "dashboard statistics fetched Successfully",
        //         totalUsers
        //     });
        // }
        const totalAdmins = await User.countDocuments({
            role: "admin"
        });
        const totalReceptionists = await User.countDocuments({
            role: "receptionist"
        });
        const totalEmployees = await User.countDocuments({
            role: "employee"
        });

        // active/inactive
        const activeUsers = await User.countDocuments({
            isActive: true
        });
        const inactiveUsers = await User.countDocuments({
            isActive: false
        });

        //visitor
        const totalVisitors = await Visitor.countDocuments();
        const pendingVisitors = await Visitor.countDocuments({
            status: "pending"
        });
        const approvedVisitors = await Visitor.countDocuments({
            status: "approved"
        });
        const rejectedVisitors = await Visitor.countDocuments({
            status: "rejected"
        });
        const checkedInVisitors = await Visitor.countDocuments({
            status: "checked_in"
        });
        const checkedOutVisitors = await Visitor.countDocuments({
            status: "checked_out"
        });

        //today's visitor - use visitDate and checkIn date according to requirements 
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);

        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const todayVisitors = await Visitor.countDocuments({
            visitDate: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            }
        });

        res.status(200).json({
            message: "Dashboard statistics fetched successfully",
            totalUsers,
            activeUsers,
            inactiveUsers,
            totalAdmins,
            totalReceptionists,
            totalEmployees,
            totalVisitors,
            pendingVisitors,
            approvedVisitors,
            rejectedVisitors,
            checkedInVisitors,
            checkedOutVisitors,
            todayVisitors
        });
    }
    catch(error) {
        console.error("Error fetching the dashboard statistics");
        return res.status(500).json({
            message: "Error fetching dashboard statistics",
            error: error.message
        });
    }
}

export const getAllUsers = async (req, res) => {
    try{
        const filter = {};
        if(req.query.isActive){
            const isActive = req.query.isActive.trim().toLowerCase();
            const allowedStatus = ["true", "false"];

            if(!allowedStatus.includes(isActive)){
                return res.status(400).json({
                    message: "Invalid active Status."
                })
            }
            // filter.isActive = isActive; // mongoose query handles the casting
            filter.isActive = isActive === "true";
        }
        if(req.query.role){
            const role = req.query.role.trim().toLowerCase();
            const allowedRoles = ["admin", "receptionist", "employee"];

            if(!allowedRoles.includes(role)){
                return res.status(400).json({
                    message: "Invalid User details. Please Check the role."
                })
            }
            filter.role = role;
        }

        const users = await User.find(filter).select("-password");
        // if(users.length === 0){
        //     return res.status(200).json({
        //         message: "No User found. Please Register first"
        //     });
        // }// also use ternary operator 

        return res.status(200).json({
            message: users.length === 0 ?
                "No User found. Please Register first" :
                "All user accounts fetched successsfully",
            totalUsers: users.length,
            users
        });
    }catch(error){
        console.error("Error fetching the users details ");
        return res.status(500).json({
            message: "Error Fetching the user details",
            error: error.message
        });
    }
}

export const getUser = async(req, res) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid user Id"
            })
        }

        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }
        return res.status(200).json({
            message: "User details fetch successfully",
            user
        });
    }catch(error){
        console.error("Error fetching the user using ID");
        return res.status(500).json({
            message: "Error fetching the user by Id",
            error: error.message
        })
    }
}

export const updateUser = async(req, res) => {
    try{
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const existingUser = await User.findById(id);
        if(!existingUser){
            return res.status(404).json({
                message: "User not found"
            });
        }

        const {name, email, phone, role} = req.body;

        if(name !== undefined){
            if(!name.trim()){
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }
            existingUser.name = name.trim();
        }

        if(email !== undefined){
            const cleanEmail = email.trim().toLowerCase();
            const duplicateEmail = await User.findOne({
                email: cleanEmail, 
                _id: {$ne: id} // here we exclude the current user id and check whether the other user uses the same email 
            });
            if(duplicateEmail){
                return res.status(409).json({
                    message: "Email aldready exists"
                });
            }
            existingUser.email = cleanEmail ;
        }

        if(phone !== undefined){
            const cleanPhone = phone.toString().replace(/\D/g, "");
            if(cleanPhone.length !== 10){
                return res.status(400).json({
                    message: "phone must contain exactly 10 digits"
                });
            }
            existingUser.phone = cleanPhone;
        }

        if(role !== undefined){
            const cleanRole = role.trim().toLowerCase();
            const allowedRoles = ["admin", "receptionist", "employee"];
            if(!allowedRoles.includes(cleanRole)){
                return res.status(400).json({
                    message: "Invalid role"
                });
            }
            existingUser.role = cleanRole;
        }

        await existingUser.save();

        return res.status(200).json({
            message: "User details updated successfully",
            existingUser:{
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                phone: existingUser.phone,
                role: existingUser.role,
                isActive: existingUser.isActive
            }
        });
    }
    catch(error){
        console.error("Error updating the user");
        return res.status(500).json({
            message: "Error updating the user details",
            error: error.message
        })
    }
}

export const updateUserStatus = async(req, res) => {
    try{
        const {id} = req.params;
        const {isActive} = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const existingUser = await User.findById(id);
        
        if(!existingUser){
            return res.status(404).json({
                message: "User not found"
            });
        } 
        //only boolean
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "Active status must be a boolean"
            });
        }
        // const allowedStatus = ["true", "false"];
        // if(!allowedStatus.includes(isActive)){
        //     return res.status(401).json({
        //         message: "Invalid user status"
        //     });
        // }
        existingUser.isActive = isActive;
        await existingUser.save();

        return res.status(200).json({
            message: "User status updated successfully",
            existingUser:{
                _id: existingUser._id,
                name: existingUser.name,
                role: existingUser.role,
                isActive: existingUser.isActive
            }
        });

    }catch(error){
        console.error("Error manage the user status");
        return res.status(500).json({
            message: "Error managing the user status",
            error:error.message
        })
    }
}

export const getAllVisitors = async(req, res) => {
    try{
        const filter = {};
        if(req.query.employee){
            const employeeId = req.query.employee;
            const employeeUser = await User.findById(employeeId);
            if(!employeeUser){
                return res.status(404).json({
                    message: "User not found"
                });
            }
            if(employeeUser.role !== "employee"){
                return res.status(403).json({
                    message: "check the role of the ID"
                });
            }
            filter.employee = employeeUser._id;
        
        }
        if(req.query.receptionist){
            const receptionistId = req.query.receptionist;

            const receptionistUser = await User.findById(receptionistId);
            if(!receptionistUser){
                return res.status(404).json({
                    message: "Receptionist not found"
                });
            }
            if (receptionistUser.role !== "receptionist") {
                return res.status(400).json({
                    message: "The given user is not a receptionist"
                });
            }
            filter.receptionist = receptionistUser._id;
        }

        if(req.query.status){
            const status = req.query.status.trim().toLowerCase();
            const allowedStatus = ["pending", "approved", "rejected", "checked_in", "checked_out", "cancelled"];

            if(!allowedStatus.includes(status)){
                return res.status(401).json({
                    message: "Invalid User status."
                });
            }
            filter.status = status;
        }

        if(req.query.visitDate){
            const visitDate = req.query.visitDate.trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
                return res.status(400).json({
                    message: "Invalid visitDate format. Use YYYY-MM-DD"
                });
            }
            //
            const [year, month, day] = visitDate.split("-").map(Number);
            //split string --> array(string datatype).map(number) --> array(number dt) --> finally return as array destructing
           
            const date = new Date(year, month - 1, day); //In js month starts with 0s, jan-0 (1-1)
            //date object la invalid date --> normalize the date(automatically)

            if(
                date.getFullYear() !== year ||
                date.getMonth() !== month - 1 ||
                date.getDate() !== day
            ){
                return res.status(400).json({
                    message: "Invalid visitDate"
                });
            }

            // const date = new Date(visitDate);
            // if(Number.NaN(date.getTime())){
            //     return res.status(400).json({
            //         message: "Invalid visitDate"
            //     });
            // }
            const startDate = new Date(`${visitDate}T00:00:00`);
            const endDate = new Date(startDate);
            
            endDate.setDate(endDate.getDate() + 1);

            filter.visitDate = {
                $gte: startDate,
                $lt: endDate
            };
        }

        
        const visitors = await Visitor.find(filter)
                .populate("employee", "name email")
                .populate("receptionist", "name email")
                .sort({ createdAt: -1 });

        if(visitors.length === 0){
            return res.status(200).json({
                message: "No Visitor found. Please Register first"
            });
        }// also use ternary operator
        return res.status(200).json({
            message: "All visitors accounts fetched successsfully",
            totalVisitors: visitors.length,
            visitors
        });
    }catch(error){
        console.error("Error fetching the visitor details ");
        return res.status(500).json({
            message: "Error Fetching the visitor details",
            error: error.message
        });
    }
}

export const getVisitor = async(req, res) => {
    try{
        const {id} = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid visitor Id"
            })
        }

        const visitor = await Visitor.findById(id)
            .populate("employee", "name email")
            .populate("receptionist", "name email");
        if(!visitor){
            return res.status(404).json({
                message: "Visitor not found"
            });
        }
        return res.status(200).json({
            message: "Visitor details fetch successfully",
            visitor
        });
    }catch(error){
        console.error("Error fetching the visitor using ID");
        return res.status(500).json({
            message: "Error fetching the visitor by Id",
            error: error.message
        });
    }
}

export const getActivity = async(req, res) => {
    try{
        const filter = {};
        if(req.query.employee){
            const employeeId = req.query.employee;
            if (!mongoose.Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json({
                    message: "Invalid employee ID"
                });
            }

            const employeeUser = await User.findById(employeeId);
            if(!employeeUser){
                return res.status(404).json({
                    message: "User not found"
                });
            }
            if(employeeUser.role !== "employee"){
                return res.status(400).json({
                    message: "Invalid role"
                })
            }
            const employeeVisitor = await Visitor.find({
                employee: employeeUser._id,
            }).select("_id");// select visitor id's only

            const visitorId = employeeVisitor.map(
                visitor => visitor._id
            );//id receives as a array
            filter.visitor = {
                $in: visitorId
            }; //only given visitor activity be included
        
        }
        if(req.query.performedBy){
            const performedBy = req.query.performedBy ;
            if(!mongoose.Types.ObjectId.isValid(performedBy)){
                return res.status(400).json({
                    message: "Invalid performedBy ID"
                });
            }

            const user = await User.findById(performedBy);
            if(!user){
                return res.status(404).json({
                    message: "User not found"
                });
            }
        
            filter.performedBy = user._id;
        }

        if(req.query.action){
            const action = req.query.action;
            const allowedActions = ["created", "approved", "rejected", "checked_in", "checked_out","cancelled"];
            if(!allowedActions.includes(action)){
                return res.status(400).json({
                    message: " Invalid actions"
                });
            }
            filter.action = action;
        }
        const activity = await Activity.find(filter).populate("visitor").populate("performedBy", "name email role").sort({createdAt: -1});
        return res.status(200).json({
            message: "Activity records fetch successfully",
            count: activity.length,
            activity
        });

    }catch(error){
        console.error("Error fetching all activity records");
        return res.status(500).json({
            message: "Internal server Error",
            error: error.message
        })
    }
}