import styles from "../../../../styles/StudentInProgress.module.css";
import studenitcon from "../../../../../assets/studenticon.svg";


export default function TeamCard({ data }) {
  return (
   <div className={styles.membersCard}>
                 {data.project.team.map((member, index) => (
                   <div className={styles.membersrow} key={member._id}>
                     <span>
                       <strong>{`Member ${index + 1} `}</strong>
                     </span>
                     <span className={styles.icon}>
                       <img
                         src={studenitcon}
                         alt="User Icon"
                         className={styles.userIcon}
                       />
                       {member.name}
                     </span>
                   </div>
                 ))}
               </div>
  );
}
