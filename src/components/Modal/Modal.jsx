import "./Modal.css";

function Modal({ children }) {
  return (
    <section className="modal" role="dialog" aria-modal="true">
      {children}
    </section>
  );
}

export default Modal;