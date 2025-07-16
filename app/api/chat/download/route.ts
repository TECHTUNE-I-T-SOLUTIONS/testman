import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import ChatSession from "@/lib/models/chat-session"
import { getStudentFromToken } from "@/utils/auth"

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const sessionId = url.searchParams.get("sessionId")
    const format = url.searchParams.get("format") || "txt"

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      studentId: student.id,
    }).populate("materialIds", "title fileName")

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    let content = ""
    let contentType = "text/plain"
    let filename = `chat-session-${session.sessionTitle.replace(/[^a-zA-Z0-9]/g, "-")}`

    if (format === "txt") {
      content = generateTextContent(session)
      contentType = "text/plain"
      filename += ".txt"
    } else if (format === "json") {
      content = JSON.stringify(session, null, 2)
      contentType = "application/json"
      filename += ".json"
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading chat session:", error)
    return NextResponse.json({ error: "Failed to download session" }, { status: 500 })
  }
}

function generateTextContent(session: {
  sessionTitle: string;
  studyMode: string;
  createdAt: string | number | Date;
  lastActivity: string | number | Date;
  totalMessages: number;
  materialIds?: Array<{ title: string; fileName: string }>;
  messages: Array<{
    timestamp: string | number | Date;
    role: string;
    content: string;
  }>;
}): string {
  const header = `
=================================================
OPERATION SAVE MY CGPA - AI STUDY ASSISTANT
=================================================

Session: ${session.sessionTitle}
Study Mode: ${session.studyMode.toUpperCase()}
Created: ${new Date(session.createdAt).toLocaleString()}
Last Activity: ${new Date(session.lastActivity).toLocaleString()}
Total Messages: ${session.totalMessages}

Materials Used:
${session.materialIds?.map((material: { title: string; fileName: string }) => `- ${material.title} (${material.fileName})`).join("\n") || "None"}

=================================================
CONVERSATION
=================================================

`

  const messages = session.messages
    .map((msg: { timestamp: string | number | Date; role: string; content: string }) => {
      const timestamp = new Date(msg.timestamp).toLocaleString()
      const role = msg.role === "user" ? "STUDENT" : "ALEX AI"
      return `[${timestamp}] ${role}:\n${msg.content}\n\n`
    })
    .join("")

  const footer = `
=================================================
END OF CONVERSATION
=================================================

Generated on: ${new Date().toLocaleString()}
Operation Save My CGPA - AI Study Assistant
Helping students achieve academic excellence!
`

  return header + messages + footer
}
