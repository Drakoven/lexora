import "./AvatarPicker.css";
import { AVATARS } from "../../constants/avatars.js";
import Modal from "../Modal/Modal.jsx";
import Overlay from "../Overlay/Overlay.jsx";

function AvatarPicker({ currentAvatar, onSelect, onClose }) {
  return (
    <>
      <Overlay onClick={onClose} />

      <Modal>
        <h2 className="avatar-picker-title">Choisis ton avatar</h2>

        <div className="avatar-picker-grid">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.key}
              type="button"
              className={
                avatar.key === currentAvatar
                  ? "avatar-picker-option is-selected"
                  : "avatar-picker-option"
              }
              onClick={() => onSelect(avatar.key)}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}

export default AvatarPicker;
