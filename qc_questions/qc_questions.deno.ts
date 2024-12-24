import { Client } from "postgres";

import "https://deno.land/x/dotenv/load.ts";

const dbUrl = Deno.env.get("DB");

if (!dbUrl) {
  console.error("Error: DB environment variable not set.");
  Deno.exit(1);
}
if (!Deno.env.get("GOOGLE_API_KEY")) {
  console.error("Error: GOOGLE_API_KEY environment variable not set.");
  Deno.exit(1);
}
// read the last_url from last_uuid.txt

let lastUuid = "";
try {
  lastUuid = await Deno.readTextFile("last_uuid.txt");
} catch (error) {
  console.error("Error reading last_uud.txt:", error);
  Deno.exit(1);
}
if (lastUuid === "") {
  lastUuid = "00000000-0000-0000-0000-000000000000";
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
    .queryObject`SELECT id,question,category,subcategory,difficulty,a,b,c,d,metadata,level
    FROM questions 
    WHERE id > ${lastUuid}
    ORDER BY id
    LIMIT 10`;

  const questions = result.rows;
  if (questions.length === 0) {
    console.log("No more questions found.");
    Deno.exit(0);
  }

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
2.  The correct answer should always be answer "a".  If you detect that the answer is wrong, put the correct answer in answer "a" and create appropriate incorrect, but plausible-sounding answers in b, c, and d.
3.  If the question is outdated or no longer relevant today or no longer makes sense in current times, add a field "outdated": true to the metadata for that question.
4.  If the question appears to be aimed at a non-USA audience, add a field to the metadata "foreign" along with the country or area you think it belongs to.  Only do this if you feel that the vast majority of Americans would not be able to understand or answer the question due to cultural uniqueness.
5.  If you find any grammatical or other syntax errors in the question or any answers, fix those things.
6.  If the correct answer (a) has additional superfluous answer making it the obvious correct answer, clean up the answer to make it less obvious.
7.  If the correct answer is too obvious based on the wording of the question, clean up the question and correct answer.  For example, do this when the wording of the question gives away the answer, such as "Which item is red?  a. a red apple, b. orange, c. pear, d. plum
8.  Apply a subcategory to the question if it is missing.  The subcategory should be a more specific category within the main category.  For example, if the category is "Geography", the subcategory could be "Europe".
9.  Assign a difficulty level to the question and assign it to the "level" field.  The difficulty level should be a number between 1 and 10, with 1 being the easiest and 10 being the hardest. 
If none of these rules apply, do not make any changes to the question or answers or category.
Before making any changes, write a field to the metadata of the question named "modification".  The "modification" field is an array of objects.  Each modification made to the question should be appended to the "modification" array with the following fields:  "updated_at" with the current date/time of the update, and "change" with the text of the change that was made along with your reasoning.
If  you don't make any changes to the question, category, or answers just add an entry to the "modification" array with the "change" set to "none".
Return the results as a SQL insert commands in the format of a batch SQL insert.  Escape any embedded single-quotes with two single-quotes (i.e. 'Here''s an example') Example SQL code:
INSERT INTO questions (id,question,category,subcategory,difficulty,a,b,c,d,metadata,level) VALUES
('uuid-here','What is the capital of France?','Geography','Europe','easy','Paris','London','Berlin','Madrid','{"modification":[{"updated_at":"2022-01-01T12:00:00Z","change":"none"}]}',2),
('uuid-here','What Germany''s capital?','Geography','Europe','easy','Berlin','London','Paris','Madrid','{"modification":[{"updated_at":"2022-01-01T12:00:00Z","change":"none"}]}',2),
Return only the SQL as shown above -- do not include any other text or comments in the response.

${JSON.stringify(questions)}
`;

  // console.log("sending prompt");
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
    ?.text.trim();
  if (!geminiResponseText) {
    console.error("Error: Gemini API response is missing the expected text.");
    Deno.exit(1);
  }
  geminiResponseText = geminiResponseText.replace(/```json\n/g, "").replace(
    /```/g,
    "",
  );
  geminiResponseText = geminiResponseText.replace(
    /INSERT INTO questions \(id,question,category,subcategory,difficulty,a,b,c,d,metadata,level\) VALUES/,
    "",
  );
  geminiResponseText = geminiResponseText.replace(/\\'/g, "''");
  let updatedQuestions;
  // if geminiResponseText ends with a ; replace that with a comma
  if (geminiResponseText.endsWith(";\n")) {
    geminiResponseText = geminiResponseText.slice(0, -2) + ",\n";
  } else if (geminiResponseText.endsWith(";")) {
    geminiResponseText = geminiResponseText.slice(0, -1) + ",\n";
  }
  // replace "sql" at the beginning of the string with an empty string
  geminiResponseText = geminiResponseText.replace(/^sql/, "");
  // remove double linefeeds
  geminiResponseText = geminiResponseText.replace(/\n\n/g, "\n").trim();
  // strip trailing \n
  geminiResponseText = geminiResponseText.replace(/\n$/, "").trim();
  if (!geminiResponseText.endsWith(",")) {
    geminiResponseText += ",";
  }
  geminiResponseText += "\n";

  // write the updated questions to a file named "qc_questions.sql"
  // console.log("geminiResponseText", geminiResponseText);
  Deno.writeTextFile("qc_questions.sql", geminiResponseText, { append: true });
  // get the last uuid from the file and write it to a file named "last_uuid.txt"
  const lines = geminiResponseText.split("\n");
  // console.log("lines.length", lines.length);
  // go through the lines in reverse order to find the last uuid
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("('")) {
      lastUuid = lines[i].split("'")[1].trim();
      // verify that this is a valid uuid
      if (lastUuid.length !== 36) {
        console.error("Error: Invalid uuid found in last line.");
        Deno.exit(1);
      }
      // console.log("lastUuid", lastUuid);
      Deno.writeTextFile("last_uuid.txt", lastUuid);
      break;
    }
  }
} catch (error) {
  console.error("Error:", error);
  Deno.exit(1);
} finally {
  console.log("closing client");
  await client.end();
  Deno.exit(0);
}
