import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, 
        trim: true
    },
    email: {
        type: String,
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true
    }, 
    password: {
        type: String,
        required: true, 
        minlength: 6,
        select: false // pw is excluded from normal queries
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "receptionist", "employee"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});
//hashing
// userSchema.pre("save", async function () {

//     if (!this.isModified("password")) return;

//     this.password = await bcrypt.hash(
//         this.password,
//         12
//     );
// });

export default mongoose.model("User", userSchema);