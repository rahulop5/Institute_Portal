import { useState, useEffect } from "react";
import styles from "../styles/FacultySelection.module.css";
import courseImg from "../../../../assets/math1.png";
import cross from "../../../../assets/cross.png";
import { redirect, useSubmit } from "react-router";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { API_HOST } from "../../../../config";

export default function FacultySelection({data}) {
  // const data = {
  //   email: "ananya.g25@iiits.in",
  //   started: false,
  //   courses: [
  //     {
  //       courseId: "68db5b79d78fcafe6bb12607",
  //       courseName: "Database Management Systems",
  //       courseCode: "DBMS101",
  //       faculty: [
  //         { facultyId: "68db66d77e93b1b3d114a14e", name: "Dr. Ramesh", email: "ramesh@iiits.in", dept: "CSE" },
  //         { facultyId: "68db66d77e93b1b3d114a150", name: "Dr. Priya", email: "priya@iiits.in", dept: "CSE" },
  //       ],
  //     },
  //     {
  //       courseId: "68db5b79d78fcafe6bb12609",
  //       courseName: "Computer Networks",
  //       courseCode: "CN103",
  //       faculty: [
  //         { facultyId: "68db66d77e93b1b3d114a156", name: "Dr. Anil", email: "anil@iiits.in", dept: "ECE" },
  //         { facultyId: "68db66d77e93b1b3d114a158", name: "Dr. Sneha", email: "sneha@iiits.in", dept: "ECE" },
  //         { facultyId: "68db66d77e93b1b3d114a14e", name: "Dr. Ramesh", email: "ramesh@iiits.in", dept: "CSE" },
  //       ],
  //     },
  //     {
  //       courseId: "68db5b79d78fcafe6bb1260a",
  //       courseName: "Machine Learning",
  //       courseCode: "ML104",
  //       faculty: [
  //         { facultyId: "68db66d77e93b1b3d114a156", name: "Dr. Anil", email: "anil@iiits.in", dept: "ECE" },
  //         { facultyId: "68db66d77e93b1b3d114a15c", name: "Dr. Kavya", email: "kavya@iiits.in", dept: "MDS" },
  //       ],
  //     },
  //   ],
  // };

  
  const [selectedFaculties, setSelectedFaculties] = useState({});
  const [openModal, setOpenModal] = useState(null);
  const submit=useSubmit();

  // Disable background scroll when modal is open
  useEffect(() => {
    if (openModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openModal]);

  const handleSelectFaculty = (courseId, faculty) => {
    setSelectedFaculties((prev) => {
      const current = prev[courseId] || [];
      const isSelected = current.some((f) => f.facultyId === faculty.facultyId);
      
      if (isSelected) {
        // Unselect if already selected
        return {
          ...prev,
          [courseId]: current.filter((f) => f.facultyId !== faculty.facultyId),
        };
      } else {
        // Select if not selected
        return { ...prev, [courseId]: [...current, faculty] };
      }
    });
  };

  const handleRemoveFaculty = (courseId, facultyId) => {
    setSelectedFaculties((prev) => ({
      ...prev,
      [courseId]: prev[courseId].filter((f) => f.facultyId !== facultyId),
    }));
  };

  const handleConfirm = () => setOpenModal(null);

   const allSelected = data.courses.every(
    (c) => selectedFaculties[c.courseId]?.length > 0
  );

  const formattedSelections = Object.entries(selectedFaculties).map(
    ([courseId, faculties]) => ({
      courseId,
      facultyIds: faculties.map((f) => f.facultyId),
    })
  );

  function handleProceed() {
    if (!allSelected) return;

    Swal.fire({
      title: 'Do you want to proceed to the next page?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success("Faculty details updated successfully", {
          position: "top-right",
          autoClose: 3000,
        });
        
        const payload = { selections: formattedSelections };
        // useSubmit automatically calls the matching `action()`

        const formData = new FormData();
        formData.append("reqData", JSON.stringify(payload));

        submit(formData, {
          method: "post",
          action: "selectfaculty",
          encType: "application/x-www-form-urlencoded",
        });
      }
    });
  }
    //format for sending data
  // {
  //   "selections": [
  //     {
  //       "courseId": "68db5b79d78fcafe6bb12607",
  //       "facultyIds": ["68db66d77e93b1b3d114a14e"]
  //     },
  //     {
  //       "courseId": "68db5b79d78fcafe6bb12608",
  //       "facultyIds": ["68db66d77e93b1b3d114a152", "68db66d77e93b1b3d114a154"]
  //     }
  //   ]
  // }

  return (
    <div className={styles.facultyselectionpage}>
      {/* <h1 className={styles.heading}>Feedback Form</h1> */}

      <div className={styles.facultyselectioncontainer}>
        <h2 className={styles.subheading}>Select your faculty for all courses:</h2>

        <div className={styles.courseGrid}>
          {data.courses.map((course) => (
            <div key={course.courseId} className={styles.courseCard}>
              <div className={styles.courseInfo}>
                <div className={styles.courseImage}>
                  <img src={courseImg} alt={course.courseName} />
                </div>
                <div className={styles.courseName}>
                  <h3>{course.courseName}</h3>

                  {selectedFaculties[course.courseId]?.length ? (
                    <ul className={styles.selectedList}>
                      {selectedFaculties[course.courseId].map((f) => (
                        <li key={f.facultyId} className={styles.selectedItem}>
                          <div className={styles.facultyName}>
                             {f.name}
                          </div>                       
                          <button
                            className={styles.removeBtn}
                            onClick={() => handleRemoveFaculty(course.courseId, f.facultyId)}
                          >
                            <img src={cross} alt="Remove" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noFaculty}>No faculty selected</p>
                  )}
                </div>
              </div>

              <div className={styles.facultyButton}>
                <button
                  className={styles.selectButton}
                  onClick={() => setOpenModal(course.courseId)}
                >
                  Select faculty
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          {!allSelected && (
            <div className={styles.warning}>
              ⚠️ Can only proceed once at least one faculty is selected for each course.
            </div>
          )}
          <button
            className={`${styles.proceedButton} ${!allSelected ? styles.disabled : ""}`}
            onClick={handleProceed}
          >
            Proceed
          </button>
        </div>
      </div>

      
      {openModal && (
        <div className={styles.modalBackdrop} onClick={() => setOpenModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select Faculty</h3>
              <button className={styles.closeBtn} onClick={() => setOpenModal(null)}>
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />

            <table className={styles.facultyTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.courses
                  .find((c) => c.courseId === openModal)
                  ?.faculty.map((f) => (
                    <tr key={f.facultyId}>
                      <td>{f.name}</td>
                      <td>{f.email}</td>
                      <td>{f.dept}</td>
                      <td>
                        <button
                          className={`${styles.selectBtnSmall} ${
                            selectedFaculties[openModal]?.some(
                              (sel) => sel.facultyId === f.facultyId
                            )
                              ? styles.selectedBtn
                              : ""
                          }`}
                          onClick={() => handleSelectFaculty(openModal, f)}
                        >
                          {selectedFaculties[openModal]?.some(
                            (sel) => sel.facultyId === f.facultyId
                          )
                            ? "Unselect"
                            : "Select"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className={styles.modalFooter}>
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function action({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const selectionDataJSON = formData.get("reqData");
  const data = JSON.parse(selectionDataJSON);
  // console.log(data);

  const response = await fetch(
    API_HOST + "/student/feedback/selectfaculty",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Response(
      JSON.stringify({
        message: err.message || "Failed to submit faculty selection",
      }),
      { status: response.status || 500 }
    );
  }
  const res=await response.json();
  // console.log(res);

  return redirect("/academics/feedback/student"); // adjust as needed
}
