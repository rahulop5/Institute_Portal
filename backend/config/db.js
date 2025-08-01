import mongoose from "mongoose";

async function connectDB(){
    try{
        await mongoose.connect("mongodb://localhost:27017/clgproject", {
            dbName: "clgproject",
        });
        console.log("DB connected");
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectDB;