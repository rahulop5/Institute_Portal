
import { useLoaderData, useOutletContext } from "react-router-dom";
import FacultyHeader from "./FacultyHeader"; 



export default function FacultyTab() {
  const data = useLoaderData(); 
  const facultyList = data?.faculties || [];
  const isStaff = data?.isStaff || false;

 
 
  return (
    <FacultyHeader
      facultyList={facultyList}
      isStaff={isStaff}
    />
  );
}