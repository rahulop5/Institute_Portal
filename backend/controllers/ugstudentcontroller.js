import BTP from "../models/BTP.js";
import UGStudent from "../models/UGStudent.js";


export const getBTPDashboard=async (req, res)=>{
    if(req.user&&req.user.role!="UGStudent"){
        return res.status(403).json({
            message: "You must be a Student to access this page"
        })
    }
    const user=await UGStudent.findOne({
        email: req.user.email
    });
    console.log(user);
}