import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [owners, setOwners] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ownersData, dogsData, appointmentsData] = await Promise.all([
        api.owners.list(),
        api.dogs.list(),
        api.appointments.list(),
      ]);
      setOwners(ownersData);
      setDogs(dogsData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      owners,
      dogs,
      appointments,
      loading,
      error,
      refresh,
      async addOwner(data) {
        const owner = await api.owners.create(data);
        setOwners((prev) => [...prev, owner].sort(compareOwners));
        return owner;
      },
      async updateOwner(id, data) {
        const owner = await api.owners.update(id, data);
        setOwners((prev) => prev.map((o) => (o.id === owner.id ? owner : o)).sort(compareOwners));
        return owner;
      },
      async removeOwner(id) {
        await api.owners.remove(id);
        await refresh();
      },
      async addDog(data) {
        const dog = await api.dogs.create(data);
        setDogs((prev) => [...prev, dog].sort(compareDogs));
        return dog;
      },
      async updateDog(id, data) {
        const dog = await api.dogs.update(id, data);
        setDogs((prev) => prev.map((d) => (d.id === dog.id ? dog : d)).sort(compareDogs));
        return dog;
      },
      async removeDog(id) {
        await api.dogs.remove(id);
        await refresh();
      },
      async addAppointment(data) {
        const appointment = await api.appointments.create(data);
        setAppointments((prev) => [...prev, appointment].sort(compareAppointments));
        return appointment;
      },
      async updateAppointment(id, data) {
        const appointment = await api.appointments.update(id, data);
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointment.id ? appointment : a)).sort(compareAppointments)
        );
        return appointment;
      },
      async removeAppointment(id) {
        await api.appointments.remove(id);
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      },
    }),
    [owners, dogs, appointments, loading, error, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function compareOwners(a, b) {
  return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
}

function compareDogs(a, b) {
  return a.name.localeCompare(b.name);
}

function compareAppointments(a, b) {
  return new Date(a.startTime) - new Date(b.startTime);
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
