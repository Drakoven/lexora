import "./Modal.css";

function Modal({ children }) {
  return (
    <section className="modal">
      {children}
    </section>
  );
}

export default Modal;