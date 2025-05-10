// utils/fetchStudentDetails.ts
export async function fetchStudentDetails(matricNumber: string) {
  try {
    const res = await fetch(`/api/students/${matricNumber}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch student");

    const data = await res.json();
    return data.student; // assuming API returns { student: {...} }
  } catch (error) {
    console.error("Error fetching student details:", error);
    return null;
  }
}
