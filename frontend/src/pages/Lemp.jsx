import { useParams, useNavigation } from "react-router";

export default function Temp(){
    const navigation=useNavigation();
    const params=useParams();
    const page=params.smth;

    return <h1>{navigation.state==="loading"?"loading":(page?page:"Settings")}</h1>
}