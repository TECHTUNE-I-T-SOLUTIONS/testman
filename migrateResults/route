// app/api/migrateResults/route.ts

import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";
import Question from "@/lib/models/question";

export async function GET() {
  try {
    await connectdb();

    const results = await Result.find();

    let totalUpdated = 0;

    for (const result of results) {
      let modified = false;

      for (const answer of result.answers) {
        if (!answer.options || answer.options.length === 0) {
          const question = await Question.findById(answer.questionId).lean();
          if (question && question.options) {
            answer.options = question.options;
            modified = true;
          }
        }
      }

      if (modified) {
        await result.save();
        totalUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed.",
      updatedResults: totalUpdated,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: "Migration failed" }, { status: 500 });
  }
}
