import Visitor from "../models/Visitor.js"

export const getAllVisitor = async(req, res) => {
    try{
        // filter by id and query parameter
        const filter = {
            employee: req.user.id
        };
        
        // optional filter
        if(req.query.status){
            const status = req.query.status.trim().toLowerCase();

            const allowedStatus = [
                "pending", "approved", "rejected", "checked_in", "checked_out", "cancelled"
            ];

            if(!allowedStatus.includes(status)){
                return res.status(400).json({
                    message: "Invalid visitor status"
                });
            }
            filter.status = status;
        }
        // fetch the all visitor
        const visitors = await Visitor.find(filter);
        if(visitors.length === 0){
            return res.status(404).json({
                message: "No visitor found for this employee",
                count: visitors.length,
                visitors: []
            })
        }
        return res.status(200).json({
            message: `visitor fetched successfully.`,
            count: visitors.length,
            visitors
        });
    }
    catch(error){
        console.error("Error in fetching the pending visitor", error);
        return res.status(500).json({
            message: "Internal server error", error
        });
    }
}

export const approveOrReject = async(req, res) =>{
    try{
        const {id} = req.params;
        const {status, remarks} = req.body;
        
        if(!["approved","rejected"].includes(status)){
            return res.status(400).json({
                message: "Status must be approved or rejected."
            });
        }

        const visitor = await Visitor.findById(id);
        if(!visitor){
            return res.status(404).json({
                message: "Visitor not found."
            });
        }
        if(visitor.employee.toString() !== req.user.id){
            return res.status(401).json({
                message: "Invalid Employee"
            });
        }
        if(visitor.status !== "pending"){
            return res.status(400).json({
                message: "Only pending visitors are allowed"
            });
        }

        req.status = status;
        visitor.status = status;
        req.remarks = remarks;
        visitor.remarks = remarks;

        await visitor.save();

        return res.status(200).json({
            message: "Visitor status update successfully",
            visitor
        });


    }
    catch(error){
        console.error("Error in Approve or Reject Visitor");
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}