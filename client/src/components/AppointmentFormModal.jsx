import { useState } from 'react';
import Modal from './Modal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';

function toDateInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildInitialForm(appointment, initialStart) {
  const start = appointment ? new Date(appointment.startTime) : initialStart || new Date();
  const totalMinutes = appointment ? appointment.durationMinutes : 60;
  return {
    dogId: appointment ? String(appointment.dogId) : '',
    date: toDateInputValue(start),
    time: toTimeInputValue(start),
    hours: String(Math.floor(totalMinutes / 60)),
    minutes: String(totalMinutes % 60),
    price: appointment ? String(appointment.price) : '',
    notes: appointment ? appointment.notes : '',
  };
}

export default function AppointmentFormModal({ appointment, initialStart, onClose }) {
  const { dogs, addAppointment, updateAppointment, removeAppointment } = useData();
  const { t, tError } = useLanguage();
  const [form, setForm] = useState(buildInitialForm(appointment, initialStart));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.dogId) {
      setError(t('apptForm.pleaseSelectDog'));
      return;
    }
    const durationMinutes = Number(form.hours || 0) * 60 + Number(form.minutes || 0);
    if (durationMinutes <= 0) {
      setError(t('apptForm.durationError'));
      return;
    }
    const startTime = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(startTime.getTime())) {
      setError(t('apptForm.dateTimeError'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        dogId: Number(form.dogId),
        startTime: startTime.toISOString(),
        durationMinutes,
        price: Number(form.price || 0),
        notes: form.notes,
      };
      if (appointment) {
        await updateAppointment(appointment.id, payload);
      } else {
        await addAppointment(payload);
      }
      onClose();
    } catch (err) {
      setError(tError(err.message) || t('common.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);
    try {
      await removeAppointment(appointment.id);
      onClose();
    } catch (err) {
      setError(tError(err.message) || t('apptForm.deleteFailedError'));
      setSubmitting(false);
      setConfirmingDelete(false);
    }
  }

  if (confirmingDelete) {
    return (
      <ConfirmDialog
        title={t('apptForm.deleteConfirmTitle')}
        message={t('apptForm.deleteConfirmMessage')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    );
  }

  return (
    <Modal title={appointment ? t('apptForm.editTitle') : t('apptForm.newTitle')} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          {t('apptForm.dog')}
          {dogs.length === 0 ? (
            <span className="form-hint">{t('apptForm.needDog')}</span>
          ) : (
            <select value={form.dogId} onChange={(e) => update('dogId', e.target.value)} required>
              <option value="" disabled>
                {t('apptForm.selectDog')}
              </option>
              {dogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.breed}) — {d.ownerFirstName} {d.ownerLastName}
                </option>
              ))}
            </select>
          )}
        </label>

        <div className="form-row">
          <label>
            {t('apptForm.date')}
            <input
              type="date"
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
              required
            />
          </label>
          <label>
            {t('apptForm.startTime')}
            <input
              type="time"
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
              required
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            {t('apptForm.durationHours')}
            <input
              type="number"
              min="0"
              max="8"
              value={form.hours}
              onChange={(e) => update('hours', e.target.value)}
            />
          </label>
          <label>
            {t('apptForm.durationMinutes')}
            <input
              type="number"
              min="0"
              max="59"
              step="5"
              value={form.minutes}
              onChange={(e) => update('minutes', e.target.value)}
            />
          </label>
        </div>

        <label>
          {t('apptForm.price')}
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            required
          />
        </label>

        <label>
          {t('apptForm.notes')}
          <textarea
            rows={2}
            placeholder={t('apptForm.notesPlaceholder')}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions form-actions-split">
          {appointment && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmingDelete(true)}
              disabled={submitting}
            >
              {t('common.delete')}
            </button>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || dogs.length === 0}>
              {submitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
