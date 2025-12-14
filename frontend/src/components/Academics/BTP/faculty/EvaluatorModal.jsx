import { Form, redirect } from "react-router";
import styles from "../../../styles/EvaluatorModal.module.css";
import { FaUserCircle } from "react-icons/fa";
import idcard from "../../../../assets/idcard.svg";
import bin from "../../../../assets/bin.svg";
import { API_HOST } from "../../../../config";

export default function EvaluatorModal({ projid, students, onClose, isEvaluator }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* <button className={styles.closeButton} type="button" onClick={onClose}>
          ✖
        </button> */}

        <h2 className={styles.heading}>Evaluation</h2>

        <Form method="post" action={!isEvaluator?"/academics/btp/faculty/evaluateguide": "/academics/btp/faculty/evaluateevaluator"}>
          {/* Hidden projid */}
          <input type="hidden" name="projid" value={projid} />

          <div className={styles.cardsContainer}>
            {students.map((student, index) => (
              <div key={student._id} className={styles.studentCard}>
                <div className={styles.heading}>
                  <FaUserCircle className={styles.avatarIcon} />
                  <div className={styles.studentName}>{student.name}</div>
                </div>

                <div className={styles.infodata}>
                  <div className={styles.infoText}>
                    <div className={styles.rollNumber}>
                      <div className={styles.rollNumberImg}>
                        <img src={idcard} alt="ID card" />
                      </div>
                      <div className={styles.rollNumberDetailsDiv}>
                        <div className={styles.label}>Roll Number</div>
                        <div className={styles.rollNumberValue}>
                          {student.rollNumber}
                        </div>
                      </div>
                    </div>

                    <div className={styles.binLabel}>
                      <div className={styles.binLabelImg}>
                        <img src={bin} alt="Bin Icon" />
                      </div>
                      <div className={styles.binLabelDetailsDiv}>
                        <div className={styles.label}>Bin Number</div>
                        <div className={styles.binNumberValue}>
                          {student.bin}
                        </div>
                      </div>
                    </div>
                  </div>

                  <label className={styles.marksInputLabel}>
                    Enter marks:
                  </label>
                  <div className={styles.marksInputContainer}>
                    <input
                      type="hidden"
                      name={`marks[${index}][studentId]`}
                      value={student._id}
                    />
                    <input
                      type="number"
                      name={`marks[${index}][guidemarks]`}
                      className={styles.marksInput}
                      max={50}
                      required
                    />
                    <span className={styles.outOf}>/50</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.remarksContainer}>
            <label className={styles.remarksLabel}>Enter team remarks:</label>
            <textarea
              name="remark"
              className={styles.remarksInput}
              maxLength={200}
              placeholder="Type here..."
              required
            />
            <div className={styles.charLimitWarning}>
              ⚠️ 200 Character limit.
            </div>
          </div>

          <div className={styles.footer}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" required />
              <span>
                I acknowledge that submission triggers deadline initialization
                for evaluators.
              </span>
            </label>

            <button className={styles.submitButton} type="submit">
              Submit
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export async function evaluateGuideAction({ request }) {
  const formData = await request.formData();
  const token=localStorage.getItem("token");

  const projid = formData.get("projid");
  const remark = formData.get("remark");

  // Extract marks array
  const marks = [];
  let index = 0;
  while (formData.get(`marks[${index}][studentId]`)) {
    marks.push({
      studentId: formData.get(`marks[${index}][studentId]`),
      guidemarks: Number(formData.get(`marks[${index}][guidemarks]`)),
    });
    index++;
  }
  console.log(projid);
  // console.log(marks);
  // console.log(remark);

  const res = await fetch(API_HOST + "/faculty/btp/evaluateguide", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projid, remark, marks }),
  });

  const popo=await res.json()
  console.log(popo);

  if (!res.ok) {
    const popo=await res.json()
    console.log(popo);
    console.error("Evaluation failed:", await res.json());
    throw new Error("Failed to submit evaluation");
  }

  return redirect(`/academics/btp/faculty/${projid}`);
}

export async function evaluateEvaluatorAction({ request }) {
  const formData = await request.formData();
  const token=localStorage.getItem("token");

  const projid = formData.get("projid");
  const remark = formData.get("remark");

  // Extract marks array
  const marks = [];
  let index = 0;
  while (formData.get(`marks[${index}][studentId]`)) {
    marks.push({
      studentId: formData.get(`marks[${index}][studentId]`),
      marks: Number(formData.get(`marks[${index}][guidemarks]`)),
    });
    index++;
  }
  console.log(projid);
  // console.log(marks);
  // console.log(remark);

  const res = await fetch(API_HOST + "/faculty/btp/evaluateevaluator", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projid, remark, panelmarks: marks }),
  });

  const popo=await res.json()
  console.log(popo);

  if (!res.ok) {
    const popo=await res.json()
    console.log(popo);
    console.error("Evaluation failed:", await res.json());
    throw new Error("Failed to submit evaluation");
  }

  return redirect(`/academics/btp/faculty/evaluator/${projid}`);
}