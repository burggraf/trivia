CREATE OR REPLACE FUNCTION get_random_unseen_questions(p_user_ids uuid[], p_categories text[] DEFAULT NULL, p_difficulties text[] DEFAULT NULL, p_limit integer DEFAULT 10)
    RETURNS TABLE(
        id uuid,
        question text,
        a text,
        b text,
        c text,
        d text,
        category text,
        difficulty text
    )
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.question,
        q.a,
        q.b,
        q.c,
        q.d,
        q.category,
        q.difficulty
    FROM
        questions q
    WHERE
        -- Filter by categories if provided
(p_categories IS NULL
            OR q.category = ANY(p_categories))
        AND
        -- Filter by difficulty if provided
(p_difficulties IS NULL
            OR q.difficulty = ANY(p_difficulties))
        AND NOT EXISTS(
            SELECT
                1
            FROM
                users_questions uq
            WHERE
                uq.questionid = q.id
                AND uq.userid = ANY(p_user_ids))
    ORDER BY
        random()
    LIMIT p_limit;
END;
$$
LANGUAGE plpgsql;

