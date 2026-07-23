import { useState } from 'react';
import Modal from './Modal.jsx';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';

const emptyForm = { firstName: '', lastName: '', phoneNumber: '' };
const PHONE_PATTERN = /^[\d\s()+-]{7,20}$/;

export default function OwnerFormModal({ owner, onClose }) {
  const { addOwner, updateOwner } = useData();
  const { t, tError } = useLanguage();
  const [form, setForm] = useState(
    owner
      ? { firstName: owner.firstName, lastName: owner.lastName, phoneNumber: owner.phoneNumber }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!PHONE_PATTERN.test(form.phoneNumber.trim())) {
      setError(t('ownerForm.phoneInvalid'));
      return;
    }

    setSubmitting(true);
    try {
      if (owner) {
        await updateOwner(owner.id, form);
      } else {
        await addOwner(form);
      }
      onClose();
    } catch (err) {
      setError(tError(err.message) || t('common.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={owner ? t('ownerForm.editTitle') : t('ownerForm.addTitle')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          {t('ownerForm.firstName')}
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            required
          />
        </label>
        <label>
          {t('ownerForm.lastName')}
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            required
          />
        </label>
        <label>
          {t('ownerForm.phoneNumber')}
          <input
            type="tel"
            placeholder="555-0142"
            value={form.phoneNumber}
            onChange={(e) => update('phoneNumber', e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
