import { useState, useEffect } from 'react';
import Button from '../../../components/common/Button';
import { Plus, Trash2, Calendar, Heart, GraduationCap, Home as HomeIcon, Baby } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const eventTypes = [
  { value: 'marriage', label: 'Marriage', icon: Heart },
  { value: 'childbirth', label: 'Childbirth', icon: Baby },
  { value: 'education', label: 'Higher Education', icon: GraduationCap },
  { value: 'home', label: 'Buying Home', icon: HomeIcon },
  { value: 'retirement', label: 'Retirement', icon: Calendar },
  { value: 'other', label: 'Other Event', icon: Calendar }
];

export function Step7LifeEvents({ formData, updateFormData }) {
  const [lifeEvents, setLifeEvents] = useState(formData.lifeEvents || []);

  useEffect(() => {
    if (lifeEvents.length === 0) {
      addLifeEvent();
    }
  }, []);

  useEffect(() => {
    updateFormData({ lifeEvents });
  }, [lifeEvents]);

  const addLifeEvent = () => {
    setLifeEvents([...lifeEvents, {
      id: Date.now(),
      type: '',
      description: '',
      expectedYear: '',
      estimatedCost: '',
      savingsStarted: '',
      notes: ''
    }]);
  };

  const removeLifeEvent = (id) => {
    setLifeEvents(lifeEvents.filter(e => e.id !== id));
  };

  const updateLifeEvent = (id, field, value) => {
    setLifeEvents(lifeEvents.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const getEventIcon = (type) => {
    const event = eventTypes.find(e => e.value === type);
    if (!event) return Calendar;
    return event.icon;
  };

  const getEventColor = (type) => {
    const colors = {
      marriage: 'pink',
      childbirth: 'purple',
      education: 'blue',
      home: 'emerald',
      retirement: 'orange',
      other: 'gray'
    };
    return colors[type] || 'gray';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-900">
          Plan for major life events to ensure you're financially prepared. Add expected costs and timelines for each milestone.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Major Life Events</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLifeEvent}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Event Type Selection Cards - Mobile Friendly */}
      {lifeEvents.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {eventTypes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                addLifeEvent();
                setTimeout(() => {
                  updateLifeEvent(lifeEvents[lifeEvents.length - 1]?.id, 'type', value);
                }, 100);
              }}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
            >
              <Icon className="w-8 h-8 text-emerald-600" />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {lifeEvents.map((event) => {
          const EventIcon = getEventIcon(event.type);
          const colorClass = getEventColor(event.type);

          return (
            <div
              key={event.id}
              className={`bg-white border-2 border-${colorClass}-200 rounded-lg p-4 space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 bg-${colorClass}-100 rounded-lg`}>
                    <EventIcon className={`w-5 h-5 text-${colorClass}-600`} />
                  </div>
                  <h4 className="font-semibold text-gray-900">
                    {event.type ? eventTypes.find(e => e.value === event.type)?.label : 'Life Event'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => removeLifeEvent(event.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  disabled={lifeEvents.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={event.type}
                    onChange={(e) => updateLifeEvent(event.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Year</label>
                  <input
                    type="number"
                    value={event.expectedYear}
                    onChange={(e) => updateLifeEvent(event.id, 'expectedYear', e.target.value)}
                    placeholder={new Date().getFullYear() + 5}
                    min={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
                <input
                  type="text"
                  value={event.description}
                  onChange={(e) => updateLifeEvent(event.id, 'description', e.target.value)}
                  placeholder="Brief description of the event"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={event.estimatedCost}
                      onChange={(e) => updateLifeEvent(event.id, 'estimatedCost', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Savings Started</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">₹</span>
                    <input
                      type="number"
                      value={event.savingsStarted}
                      onChange={(e) => updateLifeEvent(event.id, 'savingsStarted', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  value={event.notes}
                  onChange={(e) => updateLifeEvent(event.id, 'notes', e.target.value)}
                  placeholder="Any additional details or considerations..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {event.estimatedCost && event.expectedYear && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Time until event:</span>{' '}
                    {event.expectedYear - new Date().getFullYear()} years
                    {event.savingsStarted && (
                      <>
                        {' • '}
                        <span className="font-semibold">Remaining to save:</span>{' '}
                        {formatCurrency(parseFloat(event.estimatedCost) - parseFloat(event.savingsStarted || 0))}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Event Costs Summary */}
      {lifeEvents.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <h4 className="text-lg font-semibold mb-3">Life Events Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Events</p>
              <p className="text-2xl font-bold">{lifeEvents.filter(e => e.type).length}</p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Estimated Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  lifeEvents.reduce((sum, e) => sum + (parseFloat(e.estimatedCost) || 0), 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Savings Started</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  lifeEvents.reduce((sum, e) => sum + (parseFloat(e.savingsStarted) || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
