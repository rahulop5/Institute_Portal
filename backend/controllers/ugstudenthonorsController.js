import UGStudentHonors from "../models/UGStudentHonors.js";

export const getHonorsStudentDashboard=async()=>{
    try{
        const user=await UGStudentHonors.findOne({
            email: req.user.email
        });
        if(!user){
            return res.status(404).json({
                message: "Error finding the student"
            });
        }
        return res.status(200).json({
            message: "Honors Dashboard"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error loading the Honors dashboard"
        });
    }
}