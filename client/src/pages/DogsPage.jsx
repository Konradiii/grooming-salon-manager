import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import DogFormModal from '../components/DogFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function DogsPage() {
  const { dogs, owners, loading, error, removeDog } = useData();
  const { t } = useLanguage();
  const [editingDog, setEditingDog] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingDog, setDeletingDog] = useState(null);

  async function handleDelete() {
    await removeDog(deletingDog.id);
    setDeletingDog(null);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('dogs.title')}</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreating(true)}
          disabled={owners.length === 0}
          title={owners.length === 0 ? t('dogs.needOwnerTitle') : undefined}
        >
          {t('dogs.addDog')}
        </button>
      </div>

      {owners.length === 0 && !loading && (
        <p className="form-hint">{t('dogs.needOwnerHint')}</p>
      )}
      {error && <p className="form-error">{error}</p>}
      {loading && <p>{t('common.loading')}</p>}

      <div className="card-grid">
        {dogs.map((dog) => (
          <div className="card" key={dog.id}>
            <div className="card-title-row">
              <h3>{dog.name}</h3>
              <span className="badge">{dog.breed}</span>
            </div>
            <p className="card-owner">
              {t('dogs.ownerLabel')} {dog.ownerFirstName} {dog.ownerLastName} · {dog.ownerPhoneNumber}
            </p>
            {dog.behaviorNotes && <p className="card-notes">{dog.behaviorNotes}</p>}
            <div className="card-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingDog(dog)}>
                {t('common.edit')}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setDeletingDog(dog)}>
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
        {!loading && dogs.length === 0 && <p>{t('dogs.none')}</p>}
      </div>

      {creating && <DogFormModal onClose={() => setCreating(false)} />}
      {editingDog && <DogFormModal dog={editingDog} onClose={() => setEditingDog(null)} />}
      {deletingDog && (
        <ConfirmDialog
          title={t('dogs.deleteTitle')}
          message={t('dogs.deleteMessage', deletingDog.name)}
          onConfirm={handleDelete}
          onCancel={() => setDeletingDog(null)}
        />
      )}
    </div>
  );
}
