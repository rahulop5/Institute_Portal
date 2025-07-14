import { useParams } from "react-router";

export default function Temp(){
    const params=useParams();
    const page=params.smth;

    return <h1>{page?page:"Settings"}</h1>
}