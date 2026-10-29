const OBSSI = ({ label, count, increment, decrement, disabled }) => {
  return (
    <div style={{pointerEvents: disabled ? "none" : "unset", opacity: disabled ? "0.4" : "1"}} className="input-group">
      
      <div className="obssi-buttons">
        <div className="obssi-column">
          <div className="count">{count}</div>
          <button className="undo-button" onClick={decrement}>Undo</button>
        </div>
        <button className="add-button" onClick={increment}>{label}</button>
      </div>
    </div>
  );
};

export default OBSSI;