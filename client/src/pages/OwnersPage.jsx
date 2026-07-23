import { useState } from 'react';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import OwnerFormModal from '../components/OwnerFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function OwnersPage() {
  const { owners, dogs, loading, error, removeOwner } = useData();
  const { t } = useLanguage();
  const [editingOwner, setEditingOwner] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deletingOwner, setDeletingOwner] = useState(null);

  async function handleDelete() {
    await removeOwner(deletingOwner.id);
    setDeletingOwner(null);
  }

  function dogCountFor(ownerId) {
    return dogs.filter((d) => d.ownerId === ownerId).length;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('owners.title')}</h2>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          {t('owners.addOwner')}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading && <p>{t('common.loading')}</p>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('owners.name')}</th>
              <th>{t('owners.phone')}</th>
              <th>{t('owners.dogsCount')}</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id}>
                <td>
                  {owner.firstName} {owner.lastName}
                </td>
                <td>{owner.phoneNumber}</td>
                <td>{dogCountFor(owner.id)}</td>
                <td className="table-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingOwner(owner)}>
                    {t('common.edit')}
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setDeletingOwner(owner)}>
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && owners.length === 0 && <p>{t('owners.none')}</p>}
      </div>

      {creating && <OwnerFormModal onClose={() => setCreating(false)} />}
      {editingOwner && <OwnerFormModal owner={editingOwner} onClose={() => setEditingOwner(null)} />}
      {deletingOwner && (
        <ConfirmDialog
          title={t('owners.deleteTitle')}
          message={t('owners.deleteMessage', `${deletingOwner.firstName} ${deletingOwner.lastName}`)}
          onConfirm={handleDelete}
          onCancel={() => setDeletingOwner(null)}
        />
      )}
    </div>
  );
}
