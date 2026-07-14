import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Users, PlaneTakeoff, Building2, Ticket,
  Landmark, Wallet, Receipt, FileText, Plus, Trash2, Search, Sparkles
} from "lucide-react";

// --- PASTE YOUR KEYS HERE ---
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "your-anon-public-key";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- UI THEME (Same Nusuk Style) ---
const formatCurr = (val) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val || 0);

export default function IkhwanSharedERP() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
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
    const { data: dbRows, error } = await supabase.from('agency_data').select('*');
    
    if (!error && dbRows) {
      const organized = {
        customers: [], hajjbookings: [], umrahbookings: [], invoices: [],
        cashbook: [], expenses: [], saleparty: [], purchaseparty: []
      };
      dbRows.forEach(row => {
        if (organized[row.category]) {
          organized[row.category].push({ ...row.content, db_id: row.id });
        }
      });
      setData(organized);
    }
    setLoading(false);
  };

  // --- SAVE TO SHARED DATABASE ---
  const addRecord = async (category, formData) => {
    const { error } = await supabase
      .from('agency_data')
      .insert([{ category, content: formData }]);

    if (!error) fetchEverything(); // Refresh data for everyone
  };

  // --- DELETE FROM SHARED DATABASE ---
  const deleteRecord = async (db_id) => {
    const { error } = await supabase
      .from('agency_data')
      .delete()
      .eq('id', db_id);

    if (!error) fetchEverything();
  };

  // --- RENDER LOGIC ---
  if (loading) return <div style={{ height: "100vh", display: "grid", placeContent: "center", fontFamily: "sans-serif", color: "#00754A" }}>Loading Shared Database...</div>;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Plus Jakarta Sans, sans-serif", background: "#f4f7f5" }}>
      {/* Sidebar (Shortened for brevity) */}
      <aside style={{ width: 260, background: "#fff", borderRight: "1px solid #eef2f0", padding: 20 }}>
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
                marginBottom: "5px", textTransform: "capitalize"
              }}
            >
              {tab}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main style={{ flex: 1, padding: 40, overflowY: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
          <h1>{activeTab.toUpperCase()}</h1>
          <button onClick={fetchEverything} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}>
            Refresh Cloud Data
          </button>
        </header>

        {/* Input Form */}
        <div style={{ background: "#fff", padding: 20, borderRadius: "12px", marginBottom: 20, display: "flex", gap: 10 }}>
          <input id="f1" placeholder="Name/Detail" style={{ flex: 1, padding: 10 }} />
          <input id="f2" placeholder="Amount/Phone" style={{ flex: 1, padding: 10 }} />
          <button 
            onClick={() => {
              const d1 = document.getElementById('f1').value;
              const d2 = document.getElementById('f2').value;
              addRecord(activeTab, { name: d1, val: d2, date: new Date().toLocaleDateString() });
              document.getElementById('f1').value = '';
              document.getElementById('f2').value = '';
            }}
            style={{ background: "#00754A", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}
          >
            Add to Cloud
          </button>
        </div>

        {/* Data Table */}
        <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f8faf9" }}>
              <tr>
                <th style={{ padding: 15, textAlign: "left" }}>Date</th>
                <th style={{ padding: 15, textAlign: "left" }}>Details</th>
                <th style={{ padding: 15, textAlign: "left" }}>Amount/Info</th>
                <th style={{ padding: 15, textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data[activeTab].map((row) => (
                <tr key={row.db_id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 15 }}>{row.date}</td>
                  <td style={{ padding: 15, fontWeight: "bold" }}>{row.name}</td>
                  <td style={{ padding: 15 }}>{row.val}</td>
                  <td style={{ padding: 15 }}>
                    <Trash2 size={18} color="red" cursor="pointer" onClick={() => deleteRecord(row.db_id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
