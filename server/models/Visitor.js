import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    visitorName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    }, 
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receptionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    phone: {
        type: String,
        required: true, 
        trim: true
    },
    purpose: {
        type: String,
        required: true,
    },
    visitDate: {
        type: Date,
        required: true
    },
    expectedArrival: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date,
        default: null
    },
    checkOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "checked_in", "checked_out", "cancelled"],
        default: "pending"
    }, 
    remark: {
        type: String, 
        default: ""
    }
},{
    timestamps: true
});

export default mongoose.model("Visitor", visitorSchema);