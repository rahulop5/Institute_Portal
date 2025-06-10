import Faculty from "../models/Faculty.js";

export const authFacultyMiddleware=async (req, res, next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const token=authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role!=="Faculty"){
            return res.status(403).json({
                message: "You dont have access to this page"
            });
        }
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(403).json({
            message: "Invalid or Expired Token"
        });
    }
}

export const getFacultyBTPDashboard=async (req, res)=>{
    
}

export const releaseTopics=async (req, res)=>{

}