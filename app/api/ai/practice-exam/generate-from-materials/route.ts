import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import StudyMaterial from "@/lib/models/study-material"
import AIPracticeExam, {
  type IAIPracticeExam,
  type IQuestion,
} from "@/lib/models/ai-practice-exam"
import StudyAnalytics from "@/lib/models/study-analytics"
import { getStudentFromToken } from "@/utils/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

/* ──────────────────────────────────────────────────
   ❶  Require a real API‑key – no hard‑coded fallback
   ────────────────────────────────────────────────── */
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable")
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/* ──────────────────────────────────────────────────
   ❷  POST handler
   ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    await connectdb()

    /* ─ Auth ─────────────────────────────────────── */
    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* ─ Validate body ────────────────────────────── */
    const { materialIds, sessionId } = await req.json()

    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return NextResponse.json({ error: "No study material IDs provided" }, { status: 400 })
    }

    /* ─ Fetch & validate materials ───────────────── */
    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      studentId: student.id,
      processingStatus: "completed",
    })

    if (materials.length === 0) {
      return NextResponse.json(
        { error: "No processed study materials found for the given IDs" },
        { status: 404 },
      )
    }

    const combinedText = materials.map((m) => m.extractedText).join("\n\n---\n\n")
    if (!combinedText.trim()) {
      return NextResponse.json(
        { error: "Extracted text is empty for the selected materials" },
        { status: 400 },
      )
    }

    const subject = materials[0]?.subject || "General Study"
    console.log(`🧠 Generating practice exam from ${materials.length} materials…`)

    /* ─ Call Gemini with retry mechanism ──────────── */
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      }
    })

    let aiRaw: string
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        console.log(`🤖 Calling Gemini (attempt ${attempts + 1}/${maxAttempts})...`)

        const geminiResp = await model.generateContent(prompt)
        const response = await geminiResp.response

        if (!response) {
          throw new Error("Empty response from Gemini")
        }

        aiRaw = response.text()
        if (!aiRaw || aiRaw.trim().length === 0) {
          throw new Error("Empty text response from Gemini")
        }

        console.log(`✅ Gemini responded with ${aiRaw.length} characters`)
        break

      } catch (err) {
        attempts++
        console.error(`❌ Gemini attempt ${attempts} failed:`, err)

        if (attempts >= maxAttempts) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error"
          if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
            return NextResponse.json({ error: "AI service quota exceeded. Please try again later." }, { status: 429 })
          }
          return NextResponse.json({ error: "AI generation failed after multiple attempts" }, { status: 502 })
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }

    /* ─ Extract pure JSON (strip ```json …``` if needed) ─ */
    const extracted = aiRaw.match(/```json\n([\s\S]*?)\n```/)?.[1] ?? aiRaw

    /* ─ Parse & map to our schema ─────────────────── */
    let questions: IQuestion[] = []
 try {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const rawQs: any[] = JSON.parse(extracted)

 questions = rawQs.map((q, idx): IQuestion => ({
 id: `q-${idx + 1}`,
 question: q.questionText ?? q.question,
 type: q.questionType,
 options: q.options ?? [],
 correctAnswer: q.correctAnswer,
 explanation: q.explanation ?? "",
 points: 1,
 }))

 if (
 !Array.isArray(questions) ||
 questions.some((q) => !q.question || !q.type || q.correctAnswer === undefined)
 ) {
 throw new Error("AI response missing required fields")
 }
 } catch (err) {
 console.error("Failed to parse AI JSON:", err)
 console.error("Raw AI response:", extracted)
 return NextResponse.json(
 { error: "AI failed to generate valid questions. Please try again." },
 { status: 500 },
 )
 }

    /* ─ Create & save exam ────────────────────────── */
    const examTitle = `Practice Exam: ${materials[0].title}`
    const duration = Math.max(30, questions.length * 2) // 2 mins per Q, min 30

    const newExam: IAIPracticeExam = new AIPracticeExam({
      studentId: student.id,
      sessionId,                       // optional
      title: examTitle,
      subject,
      questions,
      duration,
      status: "active",
      materialIds: materials.map((m) => m._id),
      createdAt: new Date(),
    })

    await newExam.save()
    console.log(`✅ Saved practice exam: ${newExam.title}`)

    /* ─ Update analytics ──────────────────────────── */
    await updateStudyAnalyticsForExamGeneration(student.id, questions.length, subject)

    return NextResponse.json({
      success: true,
      exam: {
        id: newExam._id,
        title: newExam.title,
        questionsCount: newExam.questions.length,
        duration: newExam.duration,
        status: newExam.status,
      },
    })
  } catch (err) {
    console.error("Error generating practice exam:", err)
    let msg = "Failed to generate practice exam."
    if (err instanceof Error) {
      msg = /503|overloaded/i.test(err.message)
        ? "AI service is overloaded. Please try again later."
        : /quota|limit/i.test(err.message)
          ? "API quota exceeded. Please try again later."
          : /network|fetch/i.test(err.message)
            ? "Network error. Please check your connection."
            : err.message
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/* ──────────────────────────────────────────────────
   ❸  Analytics helper
   ────────────────────────────────────────────────── */
async function updateStudyAnalyticsForExamGeneration(
  studentId: string,
  questionsGenerated: number,
  subject: string,
) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updateData: {
      $inc: { questionsGenerated: number }
      $addToSet?: { topicsStudied: string }
    } = {
      $inc: { questionsGenerated },
    }
    if (subject) updateData.$addToSet = { topicsStudied: subject }

    await StudyAnalytics.findOneAndUpdate(
      { studentId, date: today, studyMode: "exam_generation" },
      updateData,
      { upsert: true, new: true },
    )
    console.log("📊 Study analytics updated")
  } catch (err) {
    console.error("Error updating analytics:", err)
  }
}