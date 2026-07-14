import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Users, PlaneTakeoff, Building2, Ticket,
  Landmark, Wallet, Receipt, FileText, Plus, Trash2, Search, Sparkles, AlertCircle, CheckCircle
} from "lucide-react";

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase credentials. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- UI THEME (Same Nusuk Style) ---
const formatCurr = (val) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val || 0);

export default function IkhwanSharedERP() {
  const [activeTab, setActiveTab] = useState("customers");
  const [loading, setLoading] = useState(true);
  const [formName, setFormName] = useState("");
  const [formVal, setFormVal] = useState("");
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [data, setData] = useState({
    customers: [], hajjbookings: [], umrahbookings: [], invoices: [],
    cashbook: [], expenses: [], saleparty: [], purchaseparty: []
  });

  // --- FETCH SHARED DATA ---
  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: dbRows, error } = await supabase.from('agency_data').select('*');
      
      if (error) {
        setMessage({ type: 'error', text: `Failed to load data: ${error.message}` });
        return;
      }

      const organized = {
        customers: [], hajjbookings: [], umrahbookings: [], invoices: [],
        cashbook: [], expenses: [], saleparty: [], purchaseparty: []
      };

      dbRows?.forEach(row => {
        if (organized[row.category]) {
          organized[row.category].push({ ...row.content, db_id: row.id });
        }
      });

      setData(organized);
      setMessage(null);
    } catch (err) {
      setMessage({ type: 'error', text: `Unexpected error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // --- VALIDATE AND SAVE TO SHARED DATABASE ---
  const addRecord = async () => {
    // Validation
    if (!formName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name/detail' });
      return;
    }
    if (!formVal.trim()) {
      setMessage({ type: 'error', text: 'Please enter an amount/phone' });
      return;
    }

    setMessage(null);
    try {
      const { error } = await supabase
        .from('agency_data')
        .insert([{ 
          category: activeTab, 
          content: { 
            name: formName.trim(), 
            val: formVal.trim(), 
            date: new Date().toLocaleDateString('en-PK') 
          } 
        }]);

      if (error) {
        setMessage({ type: 'error', text: `Failed to add record: ${error.message}` });
        return;
      }

      // Success: clear form and refresh
      setFormName("");
      setFormVal("");
      setMessage({ type: 'success', text: 'Record added successfully!' });
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
      await fetchEverything();
    } catch (err) {
      setMessage({ type: 'error', text: `Unexpected error: ${err.message}` });
    }
  };

  // --- DELETE FROM SHARED DATABASE ---
  const deleteRecord = async (db_id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    setMessage(null);
    try {
      const { error } = await supabase
        .from('agency_data')
        .delete()
        .eq('id', db_id);

      if (error) {
        setMessage({ type: 'error', text: `Failed to delete record: ${error.message}` });
        return;
      }

      setMessage({ type: 'success', text: 'Record deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
      
      await fetchEverything();
    } catch (err) {
      setMessage({ type: 'error', text: `Unexpected error: ${err.message}` });
    }
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div style={{ height: "100vh", display: "grid", placeContent: "center", fontFamily: "sans-serif", color: "#00754A" }}>
        <div style={{ textAlign: "center" }}>
          <Sparkles size={40} style={{ marginBottom: 16 }} />
          <p>Loading Shared Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Plus Jakarta Sans, sans-serif", background: "#f4f7f5" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: "#fff", borderRight: "1px solid #eef2f0", padding: 20, overflowY: "auto" }}>
        <h2 style={{ color: "#00754A", marginBottom: 30 }}>IKHWAN ERP</h2>
        <nav>
          {Object.keys(data).map(tab => (
            <div 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: "12px", cursor: "pointer", borderRadius: "8px",
                background: activeTab === tab ? "#00754A" : "transparent",
                color: activeTab === tab ? "#fff" : "#64748b",
                marginBottom: "5px", textTransform: "capitalize", transition: "all 0.2s"
              }}
            >
              {tab}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main style={{ flex: 1, padding: 40, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <h1 style={{ margin: 0, textTransform: "capitalize" }}>{activeTab}</h1>
          <button 
            onClick={fetchEverything} 
            disabled={loading}
            style={{ 
              padding: "10px 16px", borderRadius: "8px", border: "1px solid #ccc", 
              cursor: loading ? "not-allowed" : "pointer", 
              background: "#fff",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s"
            }}
          >
            Refresh
          </button>
        </header>

        {/* Message Alert */}
        {message && (
          <div style={{
            background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`,
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: message.type === 'error' ? '#991b1b' : '#166534'
          }}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Input Form */}
        <div style={{ background: "#fff", padding: 20, borderRadius: "12px", marginBottom: 20, display: "flex", gap: 10 }}>
          <input 
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRecord()}
            placeholder="Name/Detail" 
            style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontFamily: "inherit" }} 
          />
          <input 
            value={formVal}
            onChange={(e) => setFormVal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRecord()}
            placeholder="Amount/Phone" 
            style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontFamily: "inherit" }} 
          />
          <button 
            onClick={addRecord}
            style={{ 
              background: "#00754A", color: "#fff", border: "none", padding: "10px 20px", 
              borderRadius: "8px", cursor: "pointer", fontWeight: "600",
              display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#005a3a"}
            onMouseLeave={(e) => e.target.style.background = "#00754A"}
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Data Table */}
        <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
          {data[activeTab].length === 0 ? (
            <div style={{ 
              padding: "40px", textAlign: "center", color: "#94a3b8", 
              display: "flex", alignItems: "center", justifyContent: "center", flex: 1 
            }}>
              No records yet. Add one to get started!
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8faf9", borderBottom: "2px solid #eef2f0" }}>
                <tr>
                  <th style={{ padding: 15, textAlign: "left", fontWeight: "600" }}>Date</th>
                  <th style={{ padding: 15, textAlign: "left", fontWeight: "600" }}>Details</th>
                  <th style={{ padding: 15, textAlign: "left", fontWeight: "600" }}>Amount/Info</th>
                  <th style={{ padding: 15, textAlign: "center", fontWeight: "600" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data[activeTab].map((row) => (
                  <tr key={row.db_id} style={{ borderTop: "1px solid #eee", transition: "background 0.2s" }}>
                    <td style={{ padding: 15, fontSize: "14px" }}>{row.date}</td>
                    <td style={{ padding: 15, fontWeight: "500" }}>{row.name}</td>
                    <td style={{ padding: 15, fontSize: "14px" }}>{row.val}</td>
                    <td style={{ padding: 15, textAlign: "center" }}>
                      <button
                        onClick={() => deleteRecord(row.db_id)}
                        style={{ 
                          background: "none", border: "none", cursor: "pointer", 
                          padding: "4px", transition: "all 0.2s"
                        }}
                        title="Delete record"
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: 20, fontSize: "12px", color: "#64748b", textAlign: "right" }}>
          Total records: {data[activeTab].length}
        </div>
      </main>
    </div>
  );
}
