import { useCallback, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import pl from 'date-fns/locale/pl';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useData } from '../DataContext.jsx';
import { useLanguage } from '../LanguageContext.jsx';
import AppointmentFormModal from '../components/AppointmentFormModal.jsx';

const locales = { 'en-US': enUS, pl };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date, options) => startOfWeek(date, { ...options, weekStartsOn: 1 }),
  getDay,
  locales,
});

function formatMoney(value, t) {
  const amount = Number(value).toFixed(2);
  const symbol = t('calendar.currencySymbol');
  return t('calendar.currencyBefore') ? `${symbol}${amount}` : `${amount} ${symbol}`;
}

function formatTimeRange(start, end, locale) {
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleTimeString(locale, opts)} – ${end.toLocaleTimeString(locale, opts)}`;
}

function AppointmentEvent({ event, t, locale }) {
  const { appointment } = event.resource;
  return (
    <div className="rbc-appointment-event">
      <strong>
        {appointment.dogName} · {appointment.dogBreed}
      </strong>
      <span>{formatTimeRange(event.start, event.end, locale)}</span>
      <span className="rbc-appointment-extra">
        {appointment.ownerFirstName} {appointment.ownerLastName} · {appointment.ownerPhoneNumber}
      </span>
      <span className="rbc-appointment-extra">{formatMoney(appointment.price, t)}</span>
    </div>
  );
}

export default function CalendarPage() {
  const { appointments, dogs, loading, error } = useData();
  const { t, language } = useLanguage();
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [modalState, setModalState] = useState(null);

  const locale = language === 'pl' ? 'pl-PL' : 'en-US';

  const messages = useMemo(
    () => ({
      today: t('calendar.today'),
      previous: t('calendar.back'),
      next: t('calendar.next'),
      month: t('calendar.month'),
      week: t('calendar.week'),
      day: t('calendar.day'),
      agenda: t('calendar.agenda'),
      date: t('calendar.date'),
      time: t('calendar.time'),
      event: t('calendar.event'),
      allDay: t('calendar.allDay'),
      noEventsInRange: t('calendar.noEventsInRange'),
      showMore: (n) => t('calendar.showMore', n),
    }),
    [t]
  );

  const events = useMemo(
    () =>
      appointments.map((appointment) => {
        const start = new Date(appointment.startTime);
        const end = new Date(start.getTime() + appointment.durationMinutes * 60000);
        return {
          id: appointment.id,
          title: `${appointment.dogName} (${appointment.dogBreed})`,
          start,
          end,
          resource: { appointment },
        };
      }),
    [appointments]
  );

  const handleSelectSlot = useCallback(
    ({ start }) => {
      if (dogs.length === 0) return;
      setModalState({ mode: 'create', initialStart: start });
    },
    [dogs]
  );

  const handleSelectEvent = useCallback((event) => {
    setModalState({ mode: 'edit', appointment: event.resource.appointment });
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t('calendar.title')}</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalState({ mode: 'create', initialStart: new Date() })}
          disabled={dogs.length === 0}
        >
          {t('calendar.newAppointment')}
        </button>
      </div>

      {dogs.length === 0 && !loading && (
        <p className="form-hint">{t('calendar.needDogHint')}</p>
      )}
      {error && <p className="form-error">{error}</p>}

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          culture={language === 'pl' ? 'pl' : 'en-US'}
          messages={messages}
          events={events}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          step={15}
          timeslots={4}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: '100%' }}
          components={{ event: (props) => <AppointmentEvent {...props} t={t} locale={locale} /> }}
          eventPropGetter={() => ({ className: 'rbc-appointment-block' })}
        />
      </div>

      {modalState?.mode === 'create' && (
        <AppointmentFormModal
          initialStart={modalState.initialStart}
          onClose={() => setModalState(null)}
        />
      )}
      {modalState?.mode === 'edit' && (
        <AppointmentFormModal
          appointment={modalState.appointment}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
