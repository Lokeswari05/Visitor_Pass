import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import dns from "node:dns";
import authRouter from "./routes/authRoutes.js";


dotenv.config(); 

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// db
connectDB();

// routes
app.get("/",(req, res) => {
    res.send("VPMS is running....");
}); 

app.use("/api/auth/",authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    console.log(`http://localhost:${PORT}`)
});
// const startServer = async () => {
//     await connectDB();

//     app.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });
// };

// startServer();