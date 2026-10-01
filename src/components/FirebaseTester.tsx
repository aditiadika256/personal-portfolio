import React, { useState } from "react";
import { testFirestoreConnection, runFirestoreMigration } from "../lib/migrator";
import type { MigrationLog } from "../lib/migrator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Database, CheckCircle2, AlertCircle, Loader2, Play, RefreshCw } from "lucide-react";

export const FirebaseTester: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: "",
  });
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [remoteProfile, setRemoteProfile] = useState<Record<string, unknown> | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testFirestoreConnection();
    setConnectionStatus({
      tested: true,
      success: result.success,
      message: result.message,
    });
    setTesting(false);
  };

  const handleRunMigration = async () => {
    setMigrating(true);
    setLogs([]);
    const res = await runFirestoreMigration((newLog) => {
      setLogs((prev) => [...prev, newLog]);
    });

    if (res.success) {
      // Ambil kembali data profile dari Firestore untuk verifikasi live
      try {
        const snap = await getDoc(doc(db, "metadata", "profile"));
        if (snap.exists()) {
          setRemoteProfile(snap.data() as Record<string, unknown>);
        }
      } catch (e) {
        console.error("Gagal verifikasi live read:", e);
      }
    }
    setMigrating(false);
  };

  return (
    <div style={{
      maxWidth: "760px",
      margin: "40px auto",
      padding: "28px",
      background: "#FFFFFF",
      borderRadius: "16px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      color: "#2C3E50",
      border: "1px solid #E2E8F0"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "#EEF7F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#43766C"
        }}>
          <Database size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700", color: "#1E293B" }}>
            Firebase Firestore Connection & Migration Tool
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "0.88rem", color: "#64748B" }}>
            Project ID: <code style={{ background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>{import.meta.env.VITE_FIREBASE_PROJECT_ID || "Belum diset"}</code>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={handleTestConnection}
          disabled={testing || migrating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #CBD5E1",
            background: "#F8FAFC",
            color: "#334155",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: testing ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          {testing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {testing ? "Menguji Koneksi..." : "1. Uji Koneksi Firestore"}
        </button>

        <button
          onClick={handleRunMigration}
          disabled={testing || migrating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#43766C",
            color: "#FFFFFF",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: migrating ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(67, 118, 108, 0.25)"
          }}
        >
          {migrating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {migrating ? "Sedang Migrasi Data..." : "2. Jalankan Migrasi Koleksi ATS CV"}
        </button>
      </div>

      {/* Connection Test Result */}
      {connectionStatus.tested && (
        <div style={{
          padding: "14px 16px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          background: connectionStatus.success ? "#F0FDF4" : "#FEF2F2",
          border: `1px solid ${connectionStatus.success ? "#BBF7D0" : "#FECACA"}`,
          color: connectionStatus.success ? "#166534" : "#991B1B"
        }}>
          {connectionStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div style={{ fontSize: "0.9rem" }}>
            <strong>{connectionStatus.success ? "Koneksi Berhasil:" : "Koneksi Bermasalah:"}</strong>
            <p style={{ margin: "4px 0 0" }}>{connectionStatus.message}</p>
          </div>
        </div>
      )}

      {/* Migration Realtime Logs */}
      {logs.length > 0 && (
        <div style={{
          background: "#0F172A",
          color: "#E2E8F0",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "0.85rem",
          fontFamily: "monospace",
          maxHeight: "260px",
          overflowY: "auto",
          marginBottom: "20px"
        }}>
          <div style={{ color: "#94A3B8", marginBottom: "8px", borderBottom: "1px solid #334155", paddingBottom: "4px" }}>
            --- Execution Logs ({logs.length} events) ---
          </div>
          {logs.map((log, idx) => (
            <div key={idx} style={{
              margin: "4px 0",
              color: log.type === "success" ? "#4ADE80" : log.type === "error" ? "#F87171" : "#93C5FD"
            }}>
              <span style={{ color: "#64748B", marginRight: "8px" }}>[{log.timestamp}]</span>
              {log.message}
            </div>
          ))}
        </div>
      )}

      {/* Verified Live Data Preview */}
      {remoteProfile && (
        <div style={{
          background: "#F8FAFC",
          padding: "16px",
          borderRadius: "10px",
          border: "1px solid #E2E8F0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534", fontWeight: "600", marginBottom: "8px" }}>
            <CheckCircle2 size={18} />
            Data Live Berhasil Dibaca dari Koleksi Firestore:
          </div>
          <div style={{ fontSize: "0.9rem", color: "#334155" }}>
            <strong>Nama:</strong> {String(remoteProfile.fullName)} <br />
            <strong>Role:</strong> {String(remoteProfile.editorialRole)} <br />
            <strong>Bio:</strong> {String(remoteProfile.bio).substring(0, 120)}... <br />
            <strong>Lokasi:</strong> {String(remoteProfile.location)}
          </div>
        </div>
      )}
    </div>
  );
};
