import Modal from './Modal.jsx';
import { useLanguage } from '../LanguageContext.jsx';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel }) {
  const { t } = useLanguage();
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel ?? t('common.delete')}
        </button>
      </div>
    </Modal>
  );
}
