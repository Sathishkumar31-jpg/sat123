const mongoose = require("mongoose");
const fs = require("fs");

const Question = require("./models/Question");

mongoose.connect(process.env.MONGO_URI);

async function run() {
  try {

    const questions = JSON.parse(
      fs.readFileSync("./questions.json", "utf8")
    );

    const userId = "6a3b577bb61936bf7093caff";

    const finalQuestions = questions.map(q => ({
      ...q,
      createdBy: userId
    }));

    await Question.insertMany(finalQuestions);

    console.log(`${finalQuestions.length} questions inserted`);

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();