import React from 'react';
import { Eye, Clock, Phone, Mail, Tag } from 'lucide-react';

const ClientTable = ({ clients = [], onSelectClient }) => {
  if (clients.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <p className="text-slate-500 text-sm">No clients match your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Client Name</th>
              <th className="py-3.5 px-6">Contact Info</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Tags</th>
              <th className="py-3.5 px-6">Consent</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {clients.map((client) => {
              const statusColors = {
                active: 'bg-amber-50 text-amber-700 border-amber-200',
                inactive: 'bg-slate-100 text-slate-600 border-slate-200',
                lead: 'bg-amber-50 text-amber-700 border-amber-200'
              };

              return (
                <tr key={client._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <span>{client.name}</span>
                      {client.intakeData?.presentingConcern && (
                        <p className="text-xs text-slate-400 font-normal truncate max-w-xs">
                          {client.intakeData.presentingConcern}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        statusColors[client.status] || statusColors.active
                      }`}
                    >
                      {client.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {(client.tags || []).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {client.consentAgreed ? (
                      <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Signed
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Pending</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onSelectClient(client)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-500" />
                      View Profile
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
