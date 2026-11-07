import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    visitor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor", 
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ["created", "approved", "rejected", "checked-_in", "checked_out", "cancelled"]
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    createdAt: {
        type: Date
    }, 
    remarks: {
        type: String
    }
},{
    timestamps: true
});

export default mongoose.model("Activity", activitySchema);