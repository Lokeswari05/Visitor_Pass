import mongoose from "mongoose";


export const connectDB = async () => {
    try{
        if(!process.env.MONGO_URI){
            throw new Error("MONGO_URI is missing");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB is connected");
        console.log("Ready State:", mongoose.connection.readyState);
    }
    catch(error){
        console.log("MongoDB connection error:", error.message);
            process.exit(1);
    }
}

