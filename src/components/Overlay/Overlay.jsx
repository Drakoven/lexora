import "./Overlay.css";

function Overlay({ onClick }) {
    return (
        <div className="overlay" onClick={onClick} aria-hidden="true"></div>
    );
}

export default Overlay;