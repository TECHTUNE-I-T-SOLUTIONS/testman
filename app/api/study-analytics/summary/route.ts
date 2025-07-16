import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import ChatSession from "@/lib/models/chat-session"
import StudyMaterial from "@/lib/models/study-material"
import GeneratedContent from "@/lib/models/generated-content"
import { getStudentFromToken } from "@/utils/auth"

export async function GET() {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get study statistics
    const [totalSessions, totalMaterials, totalContent] = await Promise.all([
      ChatSession.countDocuments({ studentId: student.id }),
      StudyMaterial.countDocuments({ studentId: student.id }),
      GeneratedContent.countDocuments({ studentId: student.id }),
    ])

    // Get total messages from all sessions
    const sessions = await ChatSession.find({ studentId: student.id }, { totalMessages: 1 })
    const totalMessages = sessions.reduce((sum, session) => sum + (session.totalMessages || 0), 0)

    return NextResponse.json({
      totalSessions,
      totalMessages,
      totalMaterials,
      totalContent,
    })
  } catch (error) {
    console.error("Error fetching study analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
