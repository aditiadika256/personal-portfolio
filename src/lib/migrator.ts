import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import fallbackData from "../data/fallbackCv.json";

export interface MigrationLog {
  timestamp: string;
  type: "info" | "success" | "error";
  message: string;
}

export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Tes baca dokumen profile di metadata
    const testRef = doc(db, "metadata", "profile");
    await getDoc(testRef);
    return {
      success: true,
      message: `Terhubung sukses ke Firestore project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Koneksi gagal: ${errorMsg}. Pastikan Rules Firestore sudah diset 'allow read, write: if true;' saat migrasi.`,
    };
  }
}

export async function runFirestoreMigration(
  onLog?: (log: MigrationLog) => void
): Promise<{ success: boolean; logs: MigrationLog[] }> {
  const logs: MigrationLog[] = [];

  const addLog = (type: MigrationLog["type"], message: string) => {
    const log: MigrationLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    logs.push(log);
    if (onLog) onLog(log);
  };

  try {
    addLog("info", `Memulai migrasi data ke Firebase Project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}...`);

    // 1. Migrasi Metadata Profile
    addLog("info", "Mengunggah koleksi 'metadata/profile'...");
    await setDoc(doc(db, "metadata", "profile"), fallbackData.profile);
    addLog("success", "Koleksi 'metadata/profile' berhasil disimpan.");

    // 2. Migrasi Projects
    addLog("info", `Mengunggah ${fallbackData.projects.length} dokumen ke koleksi 'projects'...`);
    for (const project of fallbackData.projects) {
      await setDoc(doc(db, "projects", project.id), project);
      addLog("success", `Project: ${project.title} tersimpan.`);
    }

    // 3. Migrasi Experiences
    addLog("info", `Mengunggah ${fallbackData.experiences.length} dokumen ke koleksi 'experiences'...`);
    for (const exp of fallbackData.experiences) {
      await setDoc(doc(db, "experiences", exp.id), exp);
      addLog("success", `Experience: ${exp.role} @ ${exp.institution} tersimpan.`);
    }

    // 4. Migrasi Educations
    addLog("info", `Mengunggah ${fallbackData.educations.length} dokumen ke koleksi 'educations'...`);
    for (const edu of fallbackData.educations) {
      await setDoc(doc(db, "educations", edu.id), edu);
      addLog("success", `Education: ${edu.degree} tersimpan.`);
    }

    // 5. Migrasi Certifications
    addLog("info", `Mengunggah ${fallbackData.certifications.length} dokumen ke koleksi 'certifications'...`);
    for (const cert of fallbackData.certifications) {
      await setDoc(doc(db, "certifications", cert.id), cert);
      addLog("success", `Certification: ${cert.name} tersimpan.`);
    }

    // 6. Migrasi Skills
    addLog("info", "Mengunggah matriks keahlian ke koleksi 'skills/matrix'...");
    await setDoc(doc(db, "skills", "matrix"), fallbackData.skills);
    addLog("success", "Koleksi 'skills/matrix' berhasil disimpan.");

    addLog("success", "🎉 Seluruh data CV Aditia Dika telah berhasil dimigrasikan ke Firestore!");
    return { success: true, logs };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    addLog("error", `Gagal melakukan migrasi: ${errorMsg}`);
    return { success: false, logs };
  }
}
