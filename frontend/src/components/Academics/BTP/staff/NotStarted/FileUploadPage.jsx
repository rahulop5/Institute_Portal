import FileUpload from "./fileUpload";
import styles from '../styles/FileUpload.module.css'

export default function FileUploadPage() {
  return (
    <div className={styles.container}>
      <h1>Team Formation Initialization</h1>
      <div className={styles.uploadSection}>
       <FileUpload />
      </div>
    </div>
  );
}