const ScrollBtn = ({children, disabled = false, onClick = () => {}}) => {
    const onPropagateClick = () => {
        if (disabled) return;
        onClick();
    }
    return  <span className={`scrollBtn ${disabled ? 'disabled' : ''}`} onClick={() => onPropagateClick()}>{children}</span>
}

export default ScrollBtn;