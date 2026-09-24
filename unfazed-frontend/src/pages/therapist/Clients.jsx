import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ClientTable from '../../components/crm/ClientTable';
import ClientCard from '../../components/crm/ClientCard';
import ChatWindow from '../../components/chat/ChatWindow';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import UpgradeModal from '../../components/common/UpgradeModal';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useEntitlement } from '../../hooks/useEntitlement';
import { UserPlus, Search, Filter, MessageSquare, AlertCircle } from 'lucide-react';

const Clients = () => {
  const { user } = useAuth();
  const { canAccess } = useEntitlement();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected client for deep profile view
  const [selectedClientDetail, setSelectedClientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add client modal & forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    tags: 'General Anxiety',
    presentingConcern: ''
  });
  const [creating, setCreating] = useState(false);

  // Upgrade prompt modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Live chat modal
  const [chatClient, setChatClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/clients', {
        params: { search, status: statusFilter }
      });
      if (res.data.success) {
        setClients(res.data.clients);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleSelectClient = async (client) => {
    try {
      setDetailLoading(true);
      const res = await axiosInstance.get(`/clients/${client._id}`);
      if (res.data.success) {
        setSelectedClientDetail(res.data);
      }
    } catch (err) {
      alert('Error loading client profile: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenAddClient = () => {
    // Enforce centralized tier entitlement check!
    const entitlementCheck = canAccess('add_client');
    if (!entitlementCheck.allowed) {
      setUpgradeReason(entitlementCheck.reason);
      setShowUpgradeModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload = {
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        tags: newClientData.tags.split(',').map(t => t.trim()),
        intakeData: {
          presentingConcern: newClientData.presentingConcern
        }
      };

      const res = await axiosInstance.post('/clients', payload);
      if (res.data.success) {
        setShowAddModal(false);
        setNewClientData({ name: '', email: '', phone: '', tags: '', presentingConcern: '' });
        fetchClients();
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setUpgradeReason(err.response.data.message);
        setShowAddModal(false);
        setShowUpgradeModal(true);
      } else {
        alert(err.response?.data?.message || 'Error creating client');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Client CRM & Patient Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Compliant patient records, intake histories, and session chronologies.
          </p>
        </div>

        <Button
          onClick={handleOpenAddClient}
          variant="primary"
          icon={UserPlus}
          size="md"
        >
          Add New Client
        </Button>
      </div>

      {/* Deep Client Profile View */}
      {detailLoading ? (
        <Loader size="md" text="Loading client profile..." />
      ) : selectedClientDetail ? (
        <ClientCard
          clientDetail={selectedClientDetail}
          onBack={() => setSelectedClientDetail(null)}
          onStartChat={(c) => setChatClient(c)}
        />
      ) : null}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Clients</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Inbound Leads</option>
          </select>
        </div>
      </div>

      {/* Client List Table */}
      {loading ? (
        <Loader size="md" text="Loading clients..." />
      ) : (
        <ClientTable
          clients={clients}
          onSelectClient={handleSelectClient}
        />
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Client Record"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Client Full Name
            </label>
            <input
              type="text"
              required
              value={newClientData.name}
              onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Vikram Singhania"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newClientData.email}
              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="vikram@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={newClientData.phone}
              onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Tags (comma separated)
            </label>
            <input
              type="text"
              value={newClientData.tags}
              onChange={(e) => setNewClientData({ ...newClientData, tags: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Anxiety, Bi-weekly, Student"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Presenting Concern & Intake Summary
            </label>
            <textarea
              rows={3}
              value={newClientData.presentingConcern}
              onChange={(e) => setNewClientData({ ...newClientData, presentingConcern: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Brief summary of primary symptoms or reason for seeking therapy..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setShowAddModal(false)} variant="ghost" size="sm">
              Cancel
            </Button>
            <Button type="submit" loading={creating} variant="primary" size="sm">
              Save Client Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Live Chat Modal */}
      {chatClient && (
        <Modal
          isOpen={!!chatClient}
          onClose={() => setChatClient(null)}
          title={`Encrypted Chat with ${chatClient.name}`}
          maxWidth="max-w-2xl"
        >
          <ChatWindow
            roomId={`room_${user?._id}_${chatClient._id}`}
            senderId={user?._id}
            senderName={user?.name || 'Therapist'}
            senderRole="therapist"
            title={`Conversation with ${chatClient.name}`}
          />
        </Modal>
      )}

      {/* Feature Gating Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureReason={upgradeReason}
        recommendedTier="growth"
      />
    </div>
  );
};

export default Clients;
