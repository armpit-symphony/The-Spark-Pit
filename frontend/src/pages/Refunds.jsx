import React, { useState, useEffect } from 'react';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await fetch('/admin/refunds');
      const data = await response.json();
      if (data.success) {
        setRefunds(data.data);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load refunds' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async (paymentIntentId) => {
    setProcessingId(paymentIntentId);
    try {
      const response = await fetch(`/admin/refunds/${paymentIntentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Admin processed refund' })
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Refund processed successfully' });
        fetchRefunds();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process refund' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process refund' });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      processed: 'bg-green-500/20 text-green-400 border-green-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <div className="border-b border-amber-500/20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span className="text-amber-500">Refund</span> Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Process and manage customer refunds</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message.text}
            <button 
              onClick={() => setMessage(null)}
              className="float-right text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-amber-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Refunds</p>
            <p className="text-2xl font-bold text-amber-500" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {refunds.length}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-amber-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {refunds.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800/50 border border-amber-500/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Processed</p>
            <p className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {refunds.filter(r => r.status === 'processed').length}
            </p>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-gray-800/50 border border-amber-500/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
                <p className="mt-2">Loading refunds...</p>
              </div>
            ) : refunds.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No refunds found
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-amber-500/20">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Payment ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Customer</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Reason</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 font-mono text-sm text-gray-300">
                        {refund.payment_intent_id}
                      </td>
                      <td className="p-4 text-gray-300">
                        {refund.customer_email}
                      </td>
                      <td className="p-4 text-amber-400 font-medium" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {refund.formatted_amount}
                      </td>
                      <td className="p-4 text-gray-300 text-sm max-w-xs truncate">
                        {refund.reason}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(refund.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {refund.status === 'pending' && (
                          <button
                            onClick={() => handleProcessRefund(refund.payment_intent_id)}
                            disabled={processingId === refund.payment_intent_id}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 
                                     rounded text-sm font-medium transition-colors disabled:opacity-50
                                     disabled:cursor-not-allowed"
                            style={{ fontFamily: 'Rajdhani, sans-serif' }}
                          >
                            {processingId === refund.payment_intent_id ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" 
                                          stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" 
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                              </span>
                            ) : 'Process Refund'}
                          </button>
                        )}
                        {refund.status === 'processed' && (
                          <span className="text-green-400 text-sm">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refunds;
