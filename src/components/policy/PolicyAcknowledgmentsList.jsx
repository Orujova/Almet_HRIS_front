// PolicyAcknowledgmentsList.jsx komponent yaradın
"use client";

import { useState, useEffect } from "react";
import { CheckCircle, User, Clock, Mail } from "lucide-react";
import { getPolicyAcknowledgments } from "@/services/policyService";

export default function PolicyAcknowledgmentsList({ policyId, darkMode }) {
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policyId) {
      loadAcknowledgments();
    }
  }, [policyId]);

  const loadAcknowledgments = async () => {
    setLoading(true);
    try {
      const data = await getPolicyAcknowledgments(policyId);
      setAcknowledgments(data.results || data || []);
    } catch (err) {
      console.error('Error loading acknowledgments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading acknowledgments...</div>;
  }

  return (
    <div className={`rounded-lg border p-4 ${
      darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <CheckCircle className="w-5 h-5 text-green-500" />
        Policy Acknowledgments ({acknowledgments.length})
      </h3>

      {acknowledgments.length === 0 ? (
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No acknowledgments yet
        </p>
      ) : (
        <div className="space-y-3">
          {acknowledgments.map((ack) => (
            <div
              key={ack.id}
              className={`p-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-green-900/20' : 'bg-green-50'
                  }`}>
                    <User className={`w-4 h-4 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {ack.employee_name}
                    </p>
                    <div className={`flex items-center gap-2 text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {ack.employee_email}
                      </span>
                      <span>•</span>
                      <span>ID: {ack.employee_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`text-xs ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(ack.acknowledged_at).toLocaleDateString()}
                </div>
              </div>
              
              {ack.notes && (
                <p className={`text-sm mt-2 pl-11 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span className="font-medium">Note:</span> {ack.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}