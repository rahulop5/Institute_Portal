import hand from '../../../assets/update.svg'
export default function AddUpdateCard() {
  return (
    
    <div className="Addupdate">
    <h2 >ADD an Update</h2>
    <div className="add-update-card">
      

      <div className="add-update-body">
        <div className="update-input-label">
        <img src={hand} alt="" />
        <label htmlFor="update-text">Update</label>
        </div>
       <div className="update-input"> 
        <div className="update-input-wrapper">
          <textarea
            id="update-text"
            className="update-textarea"
            
            placeholder="Write an Update in here."
            rows={3}
          />
        </div>

        <div className="update-submit-wrapper">
          <button className="update-submit-button">Add Update</button>
        </div>
       </div> 
      </div>
    </div>
    </div>
   
  );
}
