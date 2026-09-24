import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import Hero from '../../components/profile/Hero';
import About from '../../components/profile/About';
import ServiceCard from '../../components/profile/ServiceCard';
import Calendar from '../../components/scheduling/Calendar';
import SlotPicker from '../../components/scheduling/SlotPicker';
import CheckoutForm from '../../components/payments/CheckoutForm';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { CheckCircle2, ShieldCheck, Calendar as CalendarIcon, UserCheck, CreditCard } from 'lucide-react';

const BookingPage = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Flow Steps: 'calendar' -> 'intake' -> 'payment' -> 'confirmed'
  const [bookingStep, setBookingStep] = useState('calendar');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Selected date and slot
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Selected package (if user chooses package instead of single session)
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Intake & Client Form details
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: 'Female',
    presentingConcern: '',
    consentAgreed: false
  });

  // Confirmed session & client details after booking
  const [bookedResult, setBookedResult] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/therapists/public/${slug}`);
        if (res.data.success) {
          setProfile(res.data.therapist);
          setPackages(res.data.packages || []);
        }
      } catch (err) {
        setError('Therapist profile not found or inactive.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  // Fetch slots whenever selectedDate or therapist profile changes
  useEffect(() => {
    if (!profile || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const res = await axiosInstance.get(`/scheduling/public-slots/${profile.slug}`, {
          params: { date: selectedDate }
        });
        if (res.data.success) {
          setSlots(res.data.slots || []);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [profile, selectedDate]);

  const handleStartBooking = (pkg = null) => {
    setSelectedPackage(pkg);
    setBookingStep('calendar');
    setShowBookingModal(true);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setBookingStep('intake');
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!clientForm.consentAgreed) {
      alert('Please agree to the telehealth consent to continue.');
      return;
    }

    try {
      setSlotsLoading(true);
      // Create session booking with double-booking prevention
      const res = await axiosInstance.post('/scheduling/book', {
        therapistSlug: profile.slug,
        clientName: clientForm.name,
        clientEmail: clientForm.email,
        clientPhone: clientForm.phone,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        durationMinutes: 60,
        intakeData: {
          age: Number(clientForm.age),
          gender: clientForm.gender,
          presentingConcern: clientForm.presentingConcern
        }
      });

      if (res.data.success) {
        setBookedResult({
          session: res.data.session,
          client: res.data.client
        });
        setBookingStep('payment');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not complete slot booking.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setBookedResult(prev => ({ ...prev, payment: paymentData.payment }));
    setBookingStep('confirmed');
  };

  if (loading) return <Loader size="lg" text="Loading therapist branded portal..." />;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Practice Link Unavailable</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'This therapist link does not exist.'}</p>
          <Link to="/login" className="text-xs font-bold text-indigo-600 hover:underline">
            Are you a therapist? Log in here
          </Link>
        </div>
      </div>
    );
  }

  const sessionFee = selectedPackage ? selectedPackage.price : profile.hourlyRate;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Therapist Public Hero */}
        <Hero
          therapist={profile}
          onBookClick={() => handleStartBooking(null)}
        />

        {/* Clinical Focus and Specializations */}
        <About therapist={profile} />

        {/* Service Cards & Packages */}
        <ServiceCard
          packages={packages}
          hourlyRate={profile.hourlyRate}
          onSelectPackage={(pkg) => handleStartBooking(pkg)}
          onSelectSingleSession={() => handleStartBooking(null)}
        />

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-slate-400 py-6 border-t border-slate-200">
          Powered by <strong className="text-slate-600">Unfazed SaaS</strong> — Confidential Therapy Practice Management
        </footer>
      </div>

      {/* Multi-Step Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={
          bookingStep === 'calendar'
            ? 'Step 1: Pick an Available Time Slot'
            : bookingStep === 'intake'
            ? 'Step 2: Client Intake & Informed Consent'
            : bookingStep === 'payment'
            ? 'Step 3: Secure Razorpay Advance Payment'
            : 'Appointment Confirmed!'
        }
        maxWidth="max-w-2xl"
      >
        {/* Step 1: Calendar & Slot Selection */}
        {bookingStep === 'calendar' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
              />
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
                loading={slotsLoading}
              />
            </div>
          </div>
        )}

        {/* Step 2: Intake Form & Consent */}
        {bookingStep === 'intake' && (
          <form onSubmit={handleIntakeSubmit} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span>
                Selected Slot: <strong>{new Date(selectedSlot?.startTime).toLocaleString('en-IN')}</strong>
              </span>
              <button
                type="button"
                onClick={() => setBookingStep('calendar')}
                className="text-indigo-600 underline font-semibold"
              >
                Change
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="priya@gmail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone (WhatsApp alerts)
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={clientForm.age}
                  onChange={(e) => setClientForm({ ...clientForm, age: e.target.value })}
                  placeholder="28"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                What brings you to therapy today? (Brief intake summary)
              </label>
              <textarea
                rows={3}
                value={clientForm.presentingConcern}
                onChange={(e) => setClientForm({ ...clientForm, presentingConcern: e.target.value })}
                placeholder="Briefly describe what you would like to explore or focus on..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Digital Consent Capture Checkbox */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="consentCheck"
                required
                checked={clientForm.consentAgreed}
                onChange={(e) => setClientForm({ ...clientForm, consentAgreed: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-600 cursor-pointer">
                <strong>Informed Consent Agreement:</strong> I acknowledge that telehealth consultations are confidential and governed by clinical guidelines. I consent to receive appointment alerts via WhatsApp/Email.
              </label>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button onClick={() => setBookingStep('calendar')} variant="ghost" size="sm">
                Back
              </Button>
              <Button type="submit" loading={slotsLoading} variant="primary" size="md">
                Proceed to Payment (₹{sessionFee})
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Advance Payment via Razorpay */}
        {bookingStep === 'payment' && (
          <CheckoutForm
            amount={sessionFee}
            sessionId={bookedResult?.session?._id}
            clientId={bookedResult?.client?.id}
            therapistSlug={profile.slug}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowBookingModal(false)}
          />
        )}

        {/* Step 4: Booking Confirmed */}
        {bookingStep === 'confirmed' && (
          <div className="text-center p-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">Your Session is Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                A confirmation with calendar invite and meeting details has been sent to {clientForm.email}.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <p><strong>Therapist:</strong> {profile.name}</p>
              <p><strong>Time:</strong> {new Date(selectedSlot?.startTime).toLocaleString('en-IN')}</p>
              <p><strong>Meeting Room:</strong> {bookedResult?.session?.meetingLink || 'Virtual Secure Room'}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to={`/portal/${bookedResult?.client?.id || 'client-demo'}`}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 text-center shadow-md shadow-indigo-100"
              >
                Go to Client Portal & Live Chat
              </Link>
              <Button onClick={() => setShowBookingModal(false)} variant="secondary" size="md">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingPage;
