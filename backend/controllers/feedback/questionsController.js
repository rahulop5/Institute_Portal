import Question from "../../models/feedback/Question.js";

// Get all active questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .select('text type order')
      .sort({ order: 1 });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ 
      message: "Failed to fetch questions", 
      error: error.message 
    });
  }
};
