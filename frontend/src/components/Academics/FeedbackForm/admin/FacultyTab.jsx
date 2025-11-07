
import { useLoaderData, useOutletContext } from "react-router-dom";
import FacultyHeader from "./FacultyHeader"; 



export default function FacultyTab() {
  const data = useLoaderData(); 
  const facultyList = data?.faculties || [];

 
 
  return (
    <FacultyHeader
      facultyList={facultyList}
    />
  );
}