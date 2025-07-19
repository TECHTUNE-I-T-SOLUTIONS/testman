import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import ChatSession from "@/lib/models/chat-session"
import "@/lib/models/study-material"
import { getStudentFromToken } from "@/utils/auth"

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const studyMode = url.searchParams.get("studyMode")

    const filter: { studentId: string; isActive: boolean; studyMode?: string } = {
      studentId: student.id,
      isActive: true,
    }
    if (studyMode) {
      filter.studyMode = studyMode
    }

    const sessions = await ChatSession.find(filter)
      .populate("materialIds", "title fileName")
      .sort({ lastActivity: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await ChatSession.countDocuments(filter)

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session._id,
        title: session.sessionTitle,
        studyMode: session.studyMode,
        materials: session.materialIds,
        messageCount: session.totalMessages,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        messages: session.messages, // Include messages for session continuation
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, studyMode, materialIds } = await req.json()

    const session = new ChatSession({
      studentId: student.id,
      sessionTitle: title || `${studyMode} Session - ${new Date().toLocaleDateString()}`,
      studyMode,
      materialIds: materialIds || [],
    })

    await session.save()

    return NextResponse.json({
      success: true,
      session: {
        id: session._id,
        title: session.sessionTitle,
        studyMode: session.studyMode,
        createdAt: session.createdAt,
      },
    })
  } catch (error) {
    console.error("Error creating chat session:", error)
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, studentId: student.id },
      { isActive: false },
      { new: true },
    )

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Session deleted successfully" })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
  }
}
