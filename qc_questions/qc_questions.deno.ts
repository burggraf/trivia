import { Client } from "postgres";
import "https://deno.land/x/dotenv/load.ts";

const dbUrl = Deno.env.get("DB");

if (!dbUrl) {
  console.error("Error: DB environment variable not set.");
  Deno.exit(1);
}

const url = new URL(dbUrl);
const client = new Client({
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  hostname: url.hostname,
  port: parseInt(url.port),
  ssl: {
    rejectUnauthorized: false,
  },
});

const categories = [
  "Arts & Literature",
  "Entertainment",
  "Food and Drink",
  "General Knowledge",
  "Geography",
  "History",
  "Pop Culture",
  "Science",
  "Sports",
  "Technology",
];

try {
  await client.connect();
  const result = await client
    .queryObject`SELECT id,question,category,subcategory,difficulty,a,b,c,d, metadata FROM questions LIMIT 20`;

  const questions = result.rows;
  console.log("got questions");
  const prompt =
    `You are an expert trivia question editor with perfect grammar and skills in English.  Analyze the following set of questoins and fix any questions, answers, or categories according to the following rules:
1.  Check that the question is correctly classified into one of the following 10 categories:
 Arts & Literature
 Entertainment
 Food and Drink
 General Knowledge
 Geography
 History
 Pop Culture
 Science
 Sports
 Technology
If the question is in the wrong category, assign it to the correct category.
2. The correct answer should always be answer "a".  If you detect that the answer is wrong, put the correct answer in answer "a" and create appropriate incorrect, but plausible-sounding answers in b, c, and d.
3. If the question is outdated or no longer relevant today or no longer makes sense in current times, add a field "outdated": true to the metadata for that question.
4. If the question appears to be aimed at a non-USA audience, add a field to the metadata "foreign" along with the country or area you think it belongs to.  Only do this if you feel that the vast majority of Americans would not be able to understand or answer the question due to cultural uniqueness.
5.  If you find any grammatical or other syntax errors in the question or any answers, fix those things.
6. If the correct answer (a) has additional superfluous answer making it the obvious correct answer, clean up the answer to make it less obvious.
7.  If the correct answer is too obvious based on the wording of the question, clean up the question and correct answer.  For example, do this when the wording of the question gives away the answer, such as "Which item is red?  a. a red apple, b. orange, c. pear, d. plum
If none of these rules apply, do not make any changes to the question or answers or category.
Before making any changes, write a field to the metadata of the question named "modification".  The "modification" field is an array of objects.  Each modification made to the question should be appended to the "modification" array with the following fields:  "updated_at" with the current date/time of the update, and "change" with the text of the change that was made along with your reasoning.
Return the results as a JSON object containing an array of updated questions.  If  you don't make any changes to the question, category, or answers just add an entry to the "modification" array with the "change" set to "none".

${JSON.stringify(questions)}
`;

  console.log("sending prompt");
  const geminiResponse = await (
    await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" +
        Deno.env.get("GOOGLE_API_KEY"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
        }),
      },
    )
  ).json();

  let geminiResponseText = geminiResponse?.candidates?.[0]?.content?.parts?.[0]
    ?.text;
  if (!geminiResponseText) {
    console.error("Error: Gemini API response is missing the expected text.");
    Deno.exit(1);
  }
  geminiResponseText = geminiResponseText.replace(/```json\n/g, "").replace(
    /```/g,
    "",
  );
  let updatedQuestions;
  console.log("geminiResponseText", geminiResponseText);
  try {
    updatedQuestions = JSON.parse(geminiResponseText);
    console.log("got updated questions");
    console.log(updatedQuestions);
  } catch (e) {
    console.error("Error: Failed to parse Gemini API response:", e);
    Deno.exit(1);
  }

  for (const updatedQuestion of updatedQuestions) {
    const now = new Date().toISOString();
    const { id, question, category, a, b, c, d, metadata } = updatedQuestion;
    const modification = {
      updated_at: now,
      change: updatedQuestion.modification
        ? updatedQuestion.modification[0].change
        : "none",
    };
    const newMetadata = metadata
      ? {
        ...metadata,
        modification: metadata.modification
          ? [...metadata.modification, modification]
          : [modification],
      }
      : { modification: [modification] };

    await client.queryObject`
      UPDATE questions
      SET
        question = ${question},
        category = ${category},
        a = ${a},
        b = ${b},
        c = ${c},
        d = ${d},
        metadata = ${JSON.stringify(newMetadata)}
      WHERE id = ${id}
    `;
  }

  const jsonResult = JSON.stringify(updatedQuestions, null, 2);

  console.log(jsonResult);
} catch (e) {
  console.error("Error:", e);
  Deno.exit(1);
} finally {
  await client.end();
}
