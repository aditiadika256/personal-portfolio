import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import fallbackData from "../data/fallbackCv.json";
import type {
  PortfolioData,
  Profile,
  Project,
  Experience,
  Education,
  Certification,
  SkillMatrix,
} from "../types/portfolio";

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData>(fallbackData as unknown as PortfolioData);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Timeout Promise untuk graceful fallback jika jaringan lambat / offline
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Firebase query timeout")), 4000)
    );

    const fetchCollectionSafely = async <T>(
      collectionName: string,
      fallbackList: T[]
    ): Promise<T[]> => {
      try {
        // Try with orderBy order asc first
        let snapshot;
        try {
          snapshot = await getDocs(query(collection(db, collectionName), orderBy("order", "asc")));
        } catch {
          // Fallback to simple getDocs without orderBy (avoids index or field requirement issues)
          snapshot = await getDocs(collection(db, collectionName));
        }

        if (snapshot && !snapshot.empty) {
          const list: any[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          // Sort client-side if order exists
          list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
          return list as T[];
        }
      } catch (err) {
        console.warn(`Firestore read failed for collection '${collectionName}', falling back:`, err);
      }
      return fallbackList;
    };

    const firestorePromise = async (): Promise<PortfolioData> => {
      // 1. Fetch Profile
      let profile = fallbackData.profile as Profile;
      try {
        const profileSnap = await getDoc(doc(db, "metadata", "profile"));
        if (profileSnap.exists()) {
          profile = { ...fallbackData.profile, ...profileSnap.data() } as Profile;
        }
      } catch (err) {
        console.warn("Firestore profile read failed, using fallback:", err);
      }

      // 2. Fetch Projects
      const projects = await fetchCollectionSafely<Project>(
        "projects",
        fallbackData.projects as unknown as Project[]
      );

      // 3. Fetch Experiences
      const experiences = await fetchCollectionSafely<Experience>(
        "experiences",
        fallbackData.experiences as Experience[]
      );

      // 4. Fetch Educations
      const educations = await fetchCollectionSafely<Education>(
        "educations",
        fallbackData.educations as Education[]
      );

      // 5. Fetch Certifications
      const certifications = await fetchCollectionSafely<Certification>(
        "certifications",
        fallbackData.certifications as Certification[]
      );

      // 6. Fetch Skills
      let skills = fallbackData.skills as SkillMatrix;
      try {
        const skillsSnap = await getDoc(doc(db, "skills", "matrix"));
        if (skillsSnap.exists()) {
          skills = { ...fallbackData.skills, ...skillsSnap.data() } as SkillMatrix;
        }
      } catch (err) {
        console.warn("Firestore skills read failed, using fallback:", err);
      }

      console.info("[Portfolio Data] Loaded successfully from Firestore (with fallback support).");

      return {
        profile,
        projects,
        experiences,
        educations,
        certifications,
        skills,
      };
    };

    try {
      const liveData = await Promise.race([firestorePromise(), timeoutPromise]);
      setData(liveData);
      setIsFallback(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn("[Portfolio Data] Menggunakan fallback local data (fallbackCv.json):", errMsg);
      setData(fallbackData as unknown as PortfolioData);
      setIsFallback(true);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, isFallback, error, refetch: fetchData };
}
