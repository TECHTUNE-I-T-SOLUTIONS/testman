import { NextResponse } from "next/server";
import Exam from "@/lib/models/exams";
import Question from "@/lib/models/question";
import Course from "@/lib/models/course";
import { connectdb } from "@/lib/connectdb";

export async function GET(req: Request) {
  await connectdb();
  const url = new URL(req.url);
  const examId = url.searchParams.get("examId");
  const courseIdOrName = url.searchParams.get("courseId");

  try {
    if (examId) {
      const exam = await Exam.findById(examId)
        .populate("courseId", "name")
        .populate("questions");
      if (!exam) {
        return NextResponse.json(
          { message: "Exam not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(exam, { status: 200 });
    }

    if (courseIdOrName) {
      let filter = {};
      if (courseIdOrName.length === 24) {
        filter = { courseId: courseIdOrName };
      } else {
        const course = await Course.findOne({ name: courseIdOrName });
        if (!course) {
          return NextResponse.json(
            { message: "Course not found" },
            { status: 404 }
          );
        }
        filter = { courseId: course._id };
      }
      const exams = await Exam.find(filter)
        .populate("courseId", "name")
        .populate("questions");
      return NextResponse.json(exams, { status: 200 });
    }

    const exams = await Exam.find()
      .populate("courseId", "name")
      .populate("questions");
    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectdb();
  try {
    const {
      courseId,
      title,
      selectedQuestions,
      duration,
      scheduledTime,
      isPublished,
    } = await req.json();

    if (!courseId || !title || !selectedQuestions?.length || !duration) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await Question.updateMany(
      { _id: { $in: selectedQuestions } },
      { $set: { isSelectedForExam: true } }
    );

    const newExam = new Exam({
      courseId,
      title,
      questions: selectedQuestions,
      duration,
      scheduledTime: scheduledTime || null,
      isPublished: isPublished || false,
    });

    await newExam.save();
    return NextResponse.json(
      { message: "Exam created successfully!", exam: newExam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { message: "Failed to create exam" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  await connectdb();
  try {
    const { examId, title, questions, duration, scheduledTime, isPublished } =
      await req.json();

    if (!examId) {
      return NextResponse.json(
        { message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      { title, questions, duration, scheduledTime, isPublished },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exam updated successfully!", exam: updatedExam },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { message: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await connectdb();
  try {
    const { examId } = await req.json();

    if (!examId) {
      return NextResponse.json(
        { message: "Exam ID is required" },
        { status: 400 }
      );
    }

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exam deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { message: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
