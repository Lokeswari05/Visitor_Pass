import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Visitor from "../models/Visitor.js";

export const RegisterVisitor = async(req, res) => {
    try{
        const {visitorName, email, phone, employee, visitDate, purpose, expectedArrival, remarks} = req.body; //cannot receive status by fronntend it leads to approved by receptionist without get approval
        // receptionist not needed, we use req.user.id from the jwt middleware to get the id 

        if(!visitorName|| !phone || !purpose || !employee || !visitDate || !expectedArrival){ // email and remarks are optiional
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        
        const employeeUser = await User.findOne({
            _id : employee,
            role: "employee",
            // isActive: true
        })
        if(!employeeUser){
            return res.status(404).json({
                message: "Employee not found"
            });
        }
        if(!employeeUser.isActive){
            return res.status(403).json({
                message: "Employee account not in active"
            });
        }

        const visit = new Date(visitDate);
        const arrival = new Date(expectedArrival);

        if(Number.isNaN(visit.getTime()) || Number.isNaN(arrival.getTime())){
            // getTime --> return date in ms timestamp
            return res.status(400).json({
                message: "Invalid Visit date or arrival date"
            });
        }

        // to check the past date
        const today = new Date();
        today.setHours(0,0,0,0);

        const visitDay = new Date(visitDate);
        visitDay.setHours(0,0,0,0);

        if(visitDay < today || arrival < new Date()){// visitDay not in past or arrival date and time not below to current
            return res.status(403).json({
                message: "Visit Date or arrival date not be in past"
            })
        }

        if(visitDay.getTime() !== new Date(arrival).setHours(0,0,0,0)){
            return res.status(403).json({
                message: "Visit date and arrival date must be same"
            });
        }
        //Check  active visitor first - checked-in visitor cannot checkedin untill checkedout
        const activeVisitor = await Visitor.findOne({
            phone: phone.trim(),
            status: "checked_in"
        });
        if(activeVisitor){
            return res.status(409).json({
                message: "Active visitor cannot be checked_in. Checed_out is required first "
            })
        }

        const pendingCount = await Visitor.countDocuments({
            employee,
            status: "pending"
        });
        if(pendingCount >= 3){
            return res.status(400).json({
                message: "Employee aldready has 3 pending visitors"
            });
        }

        const duplicateVisitor = await Visitor.findOne({
            phone: phone.trim(),
            visitDate: {
                $gte: visitDay,
                $lt: new Date(visitDay.getTime() + 24 * 60 * 60 * 1000),
            },
            employee,
            status: {$ne: "cancelled"},
        });
        if(duplicateVisitor){
            return res.status(409).json({
                message: "Duplicate Visitor are not valid"
            });
        }

        const visitor = await Visitor.create({
            visitorName: visitorName.trim(),
            email,
            phone: phone.trim(),
            employee: employeeUser._id,
            receptionist: req.user.id,
            purpose: purpose.trim(),
            visitDate: visitDay,
            expectedArrival: arrival,
            remarks: remarks,
        });

        const activity = await Activity.create({
            visitor: visitor._id,
            action: "created",
            performedBy: req.user._id,
            remarks:  remarks
        });

        return res.status(201).json({
            message: "Visitor created successfully",
            visitor
        });
    }
    catch(error){
        console.error("Visitor Registration Error", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

export const checkIn = async (req, res) => {
    try{
        
        const {id} = req.params;
        
        const visitor = await Visitor.findById(id);
        if(!visitor){
            return res.status(404).json({
                message: "visitor not found"
            });
        }
        if(visitor.status === "checked_in"){
            return res.status(400).json({
                message: "Visitor is already checked in. Check-out is required first."
            });
        }
        
        if(visitor.status !== "approved"){
            return res.status(400).json({
                message: "only approved visitors are allowed to checkIn"
            });
        }

        visitor.status = "checked_in";
        visitor.checkIn = new Date();
        await visitor.save();
        
        const activity = await Activity.create({
            visitor: visitor._id,
            action: "checked_in",
            performedBy: req.user.id
        });

        return res.status(200).json({
            message: "visitor status update (checkIn) successfully",
            visitor,
            activity
        });
    }
    catch(error){
        console.error("Error in CheckIn the visitor",error);
        return res.status(500).json({
            message: "Error in update the CheckIn status"
        });
    }
}

export const checkOut = async (req, res) => {
    try{
        
        const {id} = req.params;
        
        const visitor = await Visitor.findById(id);
        if(!visitor){
            return res.status(404).json({
                message: "visitor not found"
            });
        }
        if(visitor.status === "checked_out"){
            return res.status(400).json({
                message: "checkedOut visitors are not allowed to checkOut again"
            });
        }
        
        if(visitor.status !== "checked_in"){
            return res.status(400).json({
                message: "only checkedIn visitors are allowed to checkOut"
            });
        }

        visitor.status = "checked_out";
        visitor.checkOut = new Date();
        await visitor.save();
        
        const activity = await Activity.create({
            visitor: visitor._id,
            action: "checked_out",
            performedBy: req.user.id
        });

        return res.status(200).json({
            message: "visitor status update (checkIn) successfully",
            visitor,
            activity
        });
    }
    catch(error){
        console.error("Error in CheckOut the visitor");
        return res.status(500).json({
            message: "Error in update the CheckOut status"
        });
    }
}

export const getVisitorActivity = async (req, res) => {
    try{
        const {id} = req.params;

        const visitor = await Visitor.findById(id);
        if(!visitor){
            return res.status(404).json({
                message : "visitor not found"
            });
        }
        if(req.user.role !== "employee" && visitor.employee.toString() !== req.user.id){
            return res.status(403).json({
                message: "Access Denied. You are not an authorized employee to view visitor activity."
            })
        }

        const activity = await Activity.find({visitor: visitor.id}).populate("performedBy").sort({createdAt: -1});
        if(!activity){
            return res.status(400).json({
                message: "activity records not found"
            });
        }

        return res.status(200).json({
            message: `visitor-${visitor.visitorName} activity record fetched successfully`,
            visitor: visitor.id,
            visitorName: visitor.visitorName,
            activity
        });
    }
    catch(error){
        console.log("Error fetching the visitor acctivity records", error);
        return res.status(500).json({
            message: "Error fetching the visitor activity records", error
        });
    }
}