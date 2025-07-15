import { useRouteError } from "react-router"

//could do a whole lot better
export default function ErrorPage(){
    const error=useRouteError();
    let message = 'Something went wrong!';
    message=error?.data?.message;

    return (
        <>
            <h1>Error Page</h1>
            <p>{message}</p>
        </>
    )
}