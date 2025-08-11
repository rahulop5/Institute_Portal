import { Form } from "react-router";
import logout from "../../assets/logout.png"

export default function LogoutButton(){
    return (
        <li>
            <Form action="/logout" method="post" >
                <img src={logout} alt={`logout Icon`} height="24" width="24" />
                <button className="logoutbutton" >Logout</button>
            </Form>
        </li>
    );
}