import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"                   // ← add
import { connectdb } from "@/lib/connectdb"
import StudyMaterial from "@/lib/models/study-material"
import { getStudentFromToken } from "@/utils/auth"

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const materialId = url.searchParams.get("materialId")

    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 })
    }

    /* ── NEW: guard against temp/invalid ids ───────────────── */
    if (!mongoose.isValidObjectId(materialId)) {
      return NextResponse.json(
        { error: "Invalid material id" },
        { status: 400 },
      )
    }
    /* ───────────────────────────────────────────────────────── */

    const material = await StudyMaterial.findOne({ _id: materialId, studentId: student.id })

    if (!material) {
      return NextResponse.json({ error: "Study material not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: material._id,
      title: material.title,
      status: material.processingStatus,
      extractedTextPreview: material.extractedText
        ? material.extractedText.substring(0, 200) + "…"
        : "",
    })
  } catch (error) {
    console.error("Error fetching material status:", error)
    return NextResponse.json({ error: "Failed to fetch material status" }, { status: 500 })
  }
}
