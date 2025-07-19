import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectdb()
    const { id } = params
    const body = await req.json()

    const exam = await AIPracticeExam.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )

    if (!exam) {
      return NextResponse.json(
        { error: "AI exam not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ exam })
  } catch (error) {
    console.error("Error updating AI exam:", error)
    return NextResponse.json(
      { error: "Failed to update AI exam" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectdb()
    const { id } = params

    const exam = await AIPracticeExam.findByIdAndDelete(id)

    if (!exam) {
      return NextResponse.json(
        { error: "AI exam not found" },
        { status: 404 }
      )
    }

    // Also delete related results
    const { default: AIPracticeExamResult } = await import("@/lib/models/ai-practice-exam-result")
    await AIPracticeExamResult.deleteMany({ examId: id })

    return NextResponse.json({ message: "AI exam deleted successfully" })
  } catch (error) {
    console.error("Error deleting AI exam:", error)
    return NextResponse.json(
      { error: "Failed to delete AI exam" },
      { status: 500 }
    )
  }
} 