import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

const SlotPicker = ({ slots = [], selectedSlot, onSelectSlot, loading = false }) => {
  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-medium">Fetching real-time available slots...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No open slots on this date</p>
        <p className="text-xs text-slate-400 mt-1">Please select another date on the calendar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Time Slots</h4>
        <span className="text-xs text-orange-500 font-semibold">{slots.length} open</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
        {slots.map((slot, idx) => {
          const isSelected = selectedSlot?.startTime === slot.startTime;
          const time = new Date(slot.startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`p-3 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-amber-100 scale-[1.02]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'
              }`}
            >
              {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
              <span>{time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotPicker;
