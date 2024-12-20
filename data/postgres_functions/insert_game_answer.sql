-- Function to insert a game answer and translate it based on the game key
CREATE OR REPLACE FUNCTION insert_game_answer(p_userid uuid, p_gameid uuid, p_questionid uuid, p_answer text, p_question_index integer)
    RETURNS VOID
    AS $$
DECLARE
    v_keys text[];
    v_real_answer text;
BEGIN
    -- Get the game keys
    SELECT
        keys INTO v_keys
    FROM
        games_keys
    WHERE
        id = p_gameid;
    -- Translate the answer
    CASE p_answer
    WHEN 'a' THEN
        v_real_answer := SUBSTRING(v_keys[p_question_index + 1], 1, 1);
    WHEN 'b' THEN
        v_real_answer := SUBSTRING(v_keys[p_question_index + 1], 2, 1);
    WHEN 'c' THEN
        v_real_answer := SUBSTRING(v_keys[p_question_index + 1], 3, 1);
    WHEN 'd' THEN
        v_real_answer := SUBSTRING(v_keys[p_question_index + 1], 4, 1);
    ELSE
        RAISE EXCEPTION 'Invalid answer: %', p_answer;
    END CASE;
    -- Insert the answer into games_answers
    INSERT INTO games_answers(userid, gameid, questionid, answer)
        VALUES (p_userid, p_gameid, p_questionid, v_real_answer);
        END;
$$
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public;

