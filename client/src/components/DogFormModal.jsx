import { useState } from 'react';
import Modal from './Modal.jsx';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';

const emptyForm = { name: '', breed: '', behaviorNotes: '', ownerId: '' };

export default function DogFormModal({ dog, onClose }) {
  const { owners, addDog, updateDog } = useData();
  const { t, tError } = useLanguage();
  const [form, setForm] = useState(
    dog
      ? {
          name: dog.name,
          breed: dog.breed,
          behaviorNotes: dog.behaviorNotes,
          ownerId: String(dog.ownerId),
        }
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
    if (!form.ownerId) {
      setError(t('dogForm.pleaseSelectOwner'));
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, ownerId: Number(form.ownerId) };
      if (dog) {
        await updateDog(dog.id, payload);
      } else {
        await addDog(payload);
      }
      onClose();
    } catch (err) {
      setError(tError(err.message) || t('common.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={dog ? t('dogForm.editTitle') : t('dogForm.addTitle')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          {t('dogForm.name')}
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </label>
        <label>
          {t('dogForm.breed')}
          <input
            type="text"
            value={form.breed}
            onChange={(e) => update('breed', e.target.value)}
            required
          />
        </label>
        <label>
          {t('dogForm.owner')}
          {owners.length === 0 ? (
            <span className="form-hint">{t('dogForm.needOwner')}</span>
          ) : (
            <select value={form.ownerId} onChange={(e) => update('ownerId', e.target.value)} required>
              <option value="" disabled>
                {t('dogForm.selectOwner')}
              </option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.firstName} {o.lastName}
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          {t('dogForm.behavior')}
          <textarea
            rows={3}
            placeholder={t('dogForm.behaviorPlaceholder')}
            value={form.behaviorNotes}
            onChange={(e) => update('behaviorNotes', e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || owners.length === 0}>
            {submitting ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
