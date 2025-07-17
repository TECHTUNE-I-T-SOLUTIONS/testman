import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import ChatSession from "@/lib/models/chat-session"
import StudyMaterial from "@/lib/models/study-material"
import GeneratedContent from "@/lib/models/generated-content"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import StudyAnalytics from "@/lib/models/study-analytics"
import AIUsage from "@/lib/models/ai-usage"
import { getStudentFromToken } from "@/utils/auth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Rrlw3ymJtUIsPq7oVydiIybR8EwHSBA")

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check AI usage limits
    const usageCheck = await checkAIUsage(student.id)
    if (!usageCheck.canUse) {
      return NextResponse.json(
        { error: "Daily limit reached. Upgrade to Premium for unlimited access." },
        { status: 429 },
      )
    }

    /* ── read & normalise the request body ───────────────────────── */
    const body = (await req.json()) as Record<string, unknown>

    /* Accept any of the common field names coming from the client */
    const messageRaw =
      typeof body.message === "string"  ? body.message  :
      typeof body.prompt  === "string"  ? body.prompt   :
      typeof body.text    === "string"  ? body.text     :
      typeof body.content === "string"  ? body.content  :
      ""

    /* Bail out early if we still did not get a usable string        */
    if (messageRaw.trim() === "") {
      return NextResponse.json(
        { error: "A non‑empty message / prompt / text / content field is required." },
        { status: 400 },
      )
    }

    /* Canonical, trimmed message – use this everywhere below        */
    const message = messageRaw.trim()

    /* Pull the rest of the fields with sensible fall‑backs          */
    const studyMode           = (body.studyMode as string | undefined) ?? "chat"
    const materialIds: string[] =
      Array.isArray(body.materialIds) ? body.materialIds : []
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId : undefined
    const conversationHistory =
      Array.isArray(body.conversationHistory) ? body.conversationHistory : []
    /* ────────────────────────────────────────────────────────────── */


    // Get study materials if provided
    let materialsContent = ""
    let materials = []
    if (materialIds && materialIds.length > 0) {
      materials = await StudyMaterial.find({
        _id: { $in: materialIds },
        studentId: student.id,
        processingStatus: "completed",
      })

      materialsContent = materials
        .map((material) => `--- Content from ${material.title} ---\n${material.extractedText}`)
        .join("\n\n")
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Enhanced system prompts for educational context
    const systemPrompts = {
      questions: `You are Alex AI, an expert educational question generator for "Operation Save My CGPA" - helping University of Ilorin students excel academically.

Your role is to ONLY generate practice questions from the uploaded materials. Do not engage in general chat.

INSTRUCTIONS:
- Generate 5-10 practice questions based on the uploaded materials
- Include multiple choice, true/false, and short answer questions
- Provide clear explanations for each answer
- Focus on key concepts and important details
- Make questions challenging but fair

Format your response as:
**PRACTICE QUESTIONS**

1. [Question text]
   a) Option A
   b) Option B
   c) Option C
   d) Option D
   **Answer: [Correct option]**
   **Explanation: [Why this is correct]**

If no materials are uploaded, politely ask the student to upload study materials first.`,

      summary: `You are Alex AI, an expert educational content summarizer for "Operation Save My CGPA" - helping University of Ilorin students excel academically.

Your role is to ONLY create summaries from uploaded materials or chat content. Do not engage in general chat or generate questions.

INSTRUCTIONS:
- Create concise, well-structured summaries
- Extract key points and main concepts
- Use bullet points and clear headings
- Highlight important definitions and formulas
- Focus on what's most important for studying

Format your response as:
**SUMMARY**

## Key Topics:
- [Main topic 1]
- [Main topic 2]

## Important Concepts:
- [Concept 1]: [Brief explanation]
- [Concept 2]: [Brief explanation]

## Key Takeaways:
- [Important point 1]
- [Important point 2]

If no materials are uploaded, politely ask the student to upload study materials first.`,

      explain: `You are Alex AI, an expert educational explainer for "Operation Save My CGPA" - helping University of Ilorin students excel academically.

Your role is to ONLY provide detailed explanations of concepts from uploaded materials or questions asked by students. Do not generate questions or summaries.

INSTRUCTIONS:
- Provide clear, detailed explanations
- Break down complex concepts into simple steps
- Use examples and analogies where helpful
- Address the specific concept or question asked
- Be thorough but easy to understand

Format your response as:
**EXPLANATION**

## Concept: [Topic being explained]

## Simple Definition:
[Easy to understand definition]

## Detailed Explanation:
[Step-by-step breakdown]

## Example:
[Practical example if applicable]

## Key Points to Remember:
- [Important point 1]
- [Important point 2]

If the concept isn't clear from the materials, ask for clarification.`,

      chat: `You are Alex AI, a friendly and knowledgeable educational assistant for "Operation Save My CGPA" - helping University of Ilorin students excel academically.

In chat mode, you can:
- Answer general academic questions
- Provide study tips and strategies
- Help with understanding concepts
- Offer academic guidance and motivation
- Generate practice questions when specifically requested
- Create summaries when asked

PERSONALITY:
- Encouraging and supportive
- Professional but approachable
- Focus on helping students succeed
- Celebrate student achievements
- Offer multiple solutions to problems
- Encourage continuous learning

Remember: Your goal is to help every student save and improve their CGPA through excellent academic support!ave My CGPA" - helping University of Ilorin students excel academically.

CORE MISSION: Generate high-quality, pedagogically sound questions that enhance learning and exam preparation.

GUIDELINES:
🎯 QUESTION TYPES:
- Multiple Choice (4 options, clear distractors)
- Short Answer (2-3 sentences)
- Essay Questions (structured, analytical)
- True/False with explanations
- Fill-in-the-blank for key concepts
- Case study analysis questions

📚 EDUCATIONAL STANDARDS:
- Align with Nigerian university curriculum standards
- Test different cognitive levels (recall, understanding, application, analysis)
- Include questions for different difficulty levels (basic, intermediate, advanced)
- Focus on practical application of concepts
- Encourage critical thinking and problem-solving

✅ QUALITY ASSURANCE:
- Provide correct answers with detailed explanations
- Include marking schemes where appropriate
- Reference specific topics/chapters when possible
- Ensure questions are unambiguous and fair
- Add study tips for difficult concepts

🎓 UNILORIN CONTEXT:
- Consider local academic context and terminology
- Include relevant examples from Nigerian context where applicable
- Support students in achieving excellent CGPA

IMPORTANT: When generating questions, if the user asks for a practice exam or quiz, format your response to clearly indicate this is for practice exam creation. Start with "PRACTICE_EXAM:" followed by the questions.

If materials are provided, base questions strictly on that content. If no materials, ask students to upload their study materials first.`,

      summary: `You are Alex AI, an expert academic content summarizer for "Operation Save My CGPA" - helping University of Ilorin students master their coursework.

CORE MISSION: Create clear, comprehensive summaries that enhance understanding and retention.

GUIDELINES:
📋 SUMMARY STRUCTURE:
- Executive Summary (key takeaways)
- Main Concepts (with definitions)
- Important Details (facts, figures, examples)
- Key Relationships (how concepts connect)
- Critical Points (exam-worthy content)
- Action Items (what students should remember/do)

🎯 LEARNING OPTIMIZATION:
- Use clear, simple language
- Organize information hierarchically
- Highlight exam-relevant content
- Include memory aids and mnemonics
- Create logical flow between concepts
- Add visual organization (bullet points, numbering)

📚 ACADEMIC EXCELLENCE:
- Identify core vs. supplementary information
- Emphasize concepts likely to appear in exams
- Connect topics to broader course themes
- Suggest areas for deeper study
- Include quick review points

🎓 STUDENT SUCCESS:
- Make complex topics accessible
- Provide study strategies for difficult concepts
- Suggest how to use the summary for revision
- Include self-assessment questions

If materials are provided, summarize that content comprehensively. If no materials, ask students to upload their study materials first.`,

      explain: `You are Alex AI, an expert tutor for "Operation Save My CGPA" - dedicated to helping University of Ilorin students understand complex concepts.

CORE MISSION: Break down difficult concepts into clear, understandable explanations that promote deep learning.

GUIDELINES:
🧠 EXPLANATION METHODOLOGY:
- Start with simple definitions
- Use analogies and real-world examples
- Break complex topics into smaller parts
- Build understanding step-by-step
- Connect new concepts to familiar ones
- Use multiple explanation approaches

📚 PEDAGOGICAL TECHNIQUES:
- Socratic questioning to guide discovery
- Visual descriptions when helpful
- Practical examples from Nigerian context
- Common misconceptions and corrections
- Memory techniques and study strategies
- Practice problems when applicable

🎯 LEARNING SUPPORT:
- Adapt explanations to student's level
- Encourage questions and curiosity
- Provide multiple perspectives on topics
- Suggest additional resources when helpful
- Connect concepts to exam requirements
- Build confidence through understanding

✅ QUALITY ASSURANCE:
- Ensure accuracy and clarity
- Use appropriate academic terminology
- Provide examples and counter-examples
- Check for understanding through questions
- Offer study tips and revision strategies

Use uploaded materials as reference points, or help explain concepts students ask about directly.`,

      chat: `You are Alex AI, the AI Study Assistant for "Operation Save My CGPA" - the premier exam management platform helping University of Ilorin students and beyond achieve academic excellence.

CORE MISSION: Provide comprehensive academic support, study guidance, and educational assistance to help students excel in their studies.

PERSONALITY & APPROACH:
- Encouraging and supportive
- Professional yet friendly
- Patient and understanding
- Motivational and inspiring
- Culturally aware (Nigerian university context)

CAPABILITIES:
📚 ACADEMIC SUPPORT:
- Subject-specific help across all disciplines
- Study strategies and time management
- Exam preparation techniques
- Research and writing assistance
- Critical thinking development

🎯 STUDY OPTIMIZATION:
- Personalized learning strategies
- Memory techniques and mnemonics
- Note-taking methods
- Revision planning
- Stress management for exams

🏆 SUCCESS COACHING:
- Goal setting and achievement
- CGPA improvement strategies
- Academic planning and course selection
- Career guidance related to studies
- Motivation and confidence building

🎓 UNILORIN SPECIFIC:
- Understanding of Nigerian university system
- Local academic context and requirements
- Cultural sensitivity in examples and advice
- Support for diverse academic backgrounds

INTERACTION STYLE:
- Ask clarifying questions when needed
- Provide actionable advice
- Celebrate student achievements
- Offer multiple solutions to problems
- Encourage continuous learning

Remember: Your goal is to help every student save and improve their CGPA through excellent academic support!`,
    }

    // Build conversation context
    let conversationContext = systemPrompts[studyMode as keyof typeof systemPrompts] + "\n\n"

    if (materialsContent) {
      conversationContext += `STUDENT'S UPLOADED MATERIALS:\n${materialsContent}\n\n`
    }

    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext += "CONVERSATION HISTORY:\n"
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        conversationContext += `${msg.role === "user" ? "Student" : "Alex AI"}: ${msg.content}\n`
      })
      conversationContext += "\n"
    }

    conversationContext += `CURRENT STUDENT QUESTION: ${message}`

    const result = await model.generateContent(conversationContext)
    const response = await result.response
    const aiResponse = response.text()

    // Save or update chat session
    let chatSession
    if (sessionId) {
      chatSession = await ChatSession.findById(sessionId)
    }

    if (!chatSession) {
      const titleBase = message.trim()
      chatSession = new ChatSession({
        studentId: student.id,
        sessionTitle: titleBase.slice(0, 50) + (titleBase.length > 50 ? "…" : ""),
        studyMode,
        materialIds,
        messages: [],
        totalMessages: 0,
      })
    }

    // Add messages to session
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: message,
      timestamp: new Date(),
      metadata: { studyMode },
    }

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant" as const,
      content: aiResponse,
      timestamp: new Date(),
      metadata: { studyMode, fileReferences: materialIds },
    }

    chatSession.messages.push(userMessage, assistantMessage)
    chatSession.totalMessages += 2
    chatSession.lastActivity = new Date()

    await chatSession.save()

    // Check if this is a practice exam request and create exam
    if (
      studyMode === "questions" ||
      (studyMode === "chat" && (
        message.toLowerCase().includes("practice exam") ||
        message.toLowerCase().includes("quiz") ||
        message.toLowerCase().includes("test") ||
        message.toLowerCase().includes("create exam") ||
        message.toLowerCase().includes("generate questions")
      ))
    )
    ) {
      try {
        await createPracticeExam(student.id, chatSession._id, aiResponse, message, materialsContent, materialIds)
      } catch (error) {
        console.error("Error creating practice exam:", error)
      }
    }

    // Save generated content if it's a specific type
    if (studyMode !== "chat" && aiResponse.length > 100) {
      try {
        const generatedContent = new GeneratedContent({
          studentId: student.id,
          sessionId: chatSession._id,
          materialIds: materialIds || [],
          contentType: studyMode === "questions" ? "questions" : studyMode === "summary" ? "summary" : "explanation",
          title: `${studyMode.charAt(0).toUpperCase() + studyMode.slice(1)} - ${new Date().toLocaleDateString()}`,
          content: aiResponse,
          metadata: {
            questionCount: studyMode === "questions" ? (aiResponse.match(/\d+\./g) || []).length : undefined,
            wordCount: aiResponse.split(" ").length,
            topics: materials.map((m) => m.subject || m.title).filter(Boolean),
          },
        })

        await generatedContent.save()
        console.log("✅ Generated content saved successfully")
      } catch (error) {
        console.error("Error saving generated content:", error)
      }
    }

    // Update analytics and usage
    await Promise.all([
      updateStudyAnalytics(student.id, studyMode, materials.map((m) => m.subject || m.title).filter(Boolean)),
      incrementAIUsage(student.id),
    ])

    return NextResponse.json({
      response: aiResponse,
      sessionId: chatSession._id,
      messageCount: chatSession.totalMessages,
    })
  } catch (error) {
    console.error("Alex AI API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

async function checkAIUsage(studentId: string) {
  try {
    let aiUsage = await AIUsage.findOne({ studentId })

    if (!aiUsage) {
      // Create new usage record for first-time user
      aiUsage = new AIUsage({
        studentId,
        plan: "free",
        dailyTokensUsed: 0,
        lastResetDate: new Date(),
        totalTokensUsed: 0,
      })
      await aiUsage.save()
    }

    // Check if we need to reset daily tokens (new day)
    const now = new Date()
    const lastReset = new Date(aiUsage.lastResetDate)
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    if (isNewDay) {
      aiUsage.dailyTokensUsed = 0
      aiUsage.lastResetDate = now
      await aiUsage.save()
    }

    // Check if premium has expired
    if (aiUsage.plan === "premium" && aiUsage.premiumExpiryDate && now > aiUsage.premiumExpiryDate) {
      aiUsage.plan = "free"
      aiUsage.premiumExpiryDate = undefined
      await aiUsage.save()
    }

    const canUse = aiUsage.plan === "premium" || aiUsage.dailyTokensUsed < 15

    return { canUse, usage: aiUsage }
  } catch (error) {
    console.error("Error checking AI usage:", error)
    return { canUse: true, usage: null }
  }
}

async function incrementAIUsage(studentId: string) {
  try {
    await AIUsage.findOneAndUpdate(
      { studentId },
      {
        $inc: { dailyTokensUsed: 1, totalTokensUsed: 1 },
      },
      { upsert: true },
    )
  } catch (error) {
    console.error("Error incrementing AI usage:", error)
  }
}

async function createPracticeExam(
  studentId: string,
  sessionId: string,
  aiResponse: string,
  originalMessage: string,
  materialsContent: string,
  materialIds: string[] = [],
) {
  try {
    console.log("🔄 Creating practice exam...")

    // Parse questions from AI response or generate new ones
    let questions = await parseQuestionsFromText(aiResponse)

    if (questions.length === 0 && materialsContent) {
      // If no questions found in response, generate them directly
      questions = await generateQuestionsFromMaterials(materialsContent, 10)
    }

    if (questions.length === 0) {
      console.log("❌ No questions could be generated")
      return
    }

    // Determine exam details
    const title = originalMessage.includes("exam")
      ? `Practice Exam - ${new Date().toLocaleDateString()}`
      : `Practice Quiz - ${new Date().toLocaleDateString()}`

    const duration = Math.max(30, questions.length * 2) // 2 minutes per question, minimum 30

    const practiceExam = new AIPracticeExam({
      studentId,
      sessionId,
      title,
      questions,
      duration,
      status: "active",
      materialIds: materialIds,
      createdAt: new Date(),
    })

    await practiceExam.save()
    console.log(`✅ Created practice exam with ${questions.length} questions`)
  } catch (error) {
    console.error("Error creating practice exam:", error)
  }
}

async function parseQuestionsFromText(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Parse the following text and extract questions in JSON format. Each question should have:
- id: unique identifier (use q1, q2, etc.)
- question: the question text
- type: "multiple-choice", "true-false", or "short-answer"
- options: array of options (for multiple choice only)
- correctAnswer: correct answer (index number for multiple choice, true/false for boolean, text for short answer)
- explanation: explanation of the correct answer
- points: points for the question (default 1)

Return ONLY a valid JSON array of questions, no other text.

Text to parse:
${text}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let jsonText = response.text()

    // Clean up the response
    jsonText = jsonText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    // Try to extract JSON from the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0])
      return questions.map((q: { 
        id?: string; 
        question: string; 
        type: "multiple-choice" | "true-false" | "short-answer"; 
        options?: string[]; 
        correctAnswer: number | string | boolean; 
        explanation?: string; 
        points?: number;
        [key: string]: string | number | boolean | string[] | undefined;
      }, index: number) => ({
        ...q,
        id: q.id || `q${index + 1}`,
        points: q.points || 1,
      }))
    }

    return []
  } catch (error) {
    console.error("Error parsing questions:", error)
    return []
  }
}

async function generateQuestionsFromMaterials(content: string, questionCount: number) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Based on the following study material, create exactly ${questionCount} practice exam questions.

Create a mix of:
- 60% Multiple choice questions (4 options each)
- 25% True/false questions
- 15% Short answer questions

Format as JSON array:
[
  {
    "id": "q1",
    "question": "Question text",
    "type": "multiple-choice",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct",
    "points": 1
  }
]


Study Material:
${content.substring(0, 6000)}

Return ONLY the JSON array, no other text.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let jsonText = response.text()

    // Clean up the response
    jsonText = jsonText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0])
      return questions.map((q: {
        id?: string
        question: string
        type: string
        options: string[]
        correctAnswer: number
        explanation?: string
        points?: number
      }, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "No explanation provided",
        points: q.points || 1,
      }))
    }

    return []
  } catch (error) {
    console.error("Error generating questions from materials:", error)
    return []
  }
}


async function updateStudyAnalytics(studentId: string, studyMode: string, topics: string[] = []) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updateData: {
      $inc: {
        chatMessages: number
        questionsGenerated: number
        summariesCreated: number
      }
      $addToSet?: {
        topicsStudied: {
          $each: string[]
        }
      }
    } = {
      $inc: {
        chatMessages: 1,
        questionsGenerated: studyMode === "questions" ? 1 : 0,
        summariesCreated: studyMode === "summary" ? 1 : 0,
      },
    }

    // Add topics to the array if provided
    if (topics.length > 0) {
      updateData.$addToSet = { topicsStudied: { $each: topics } }
    }

    await StudyAnalytics.findOneAndUpdate({ studentId, date: today, studyMode }, updateData, {
      upsert: true,
      new: true,
    })

    console.log("✅ Study analytics updated")
  } catch (error) {
    console.error("Error updating analytics:", error)
  }
}
