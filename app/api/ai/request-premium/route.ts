import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import Student from "@/lib/models/student"
import { getStudentFromToken } from "@/utils/auth"

export async function POST() {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get full student details
    const studentDetails = await Student.findById(student.id)
      .populate("faculty", "name")
      .populate("department", "name")
      .populate("level", "name")

    if (!studentDetails) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Create WhatsApp message
    const message = `Hello Admin,

I would like to upgrade to Premium AI Access for Operation Save My CGPA.

*Student Details:*
• Name: ${studentDetails.name}
• Matric Number: ${studentDetails.matricNumber}
• Email: ${studentDetails.email}
• Faculty: ${studentDetails.faculty?.name || "N/A"}
• Department: ${studentDetails.department?.name || "N/A"}
• Level: ${studentDetails.level?.name || "N/A"}
• Phone: ${studentDetails.phoneNumber || "Not provided"}

*Premium Plan Request:*
• Monthly Premium Access: ₦2,500
• Unlimited AI interactions
• Priority support

Please provide your bank account details for payment. Thank you!

Best regards,
${studentDetails.name}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/2348083191228?text=${encodedMessage}`

    return NextResponse.json({
      success: true,
      whatsappUrl,
      studentName: studentDetails.name,
      premiumPrice: "₦2,500",
    })
  } catch (error) {
    console.error("Error creating premium request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
