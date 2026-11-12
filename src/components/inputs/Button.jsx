const Button = ({ label, disabled, onClick, type }) => {
  return (
    <>
    <button className={type + ' input-button ' + (disabled ? "disabled" : "")} onClick={onClick}>
      {label}
    </button>
    </>
  );
};

export default Button;