CREATE OR REPLACE FUNCTION get_game_status(p_gameid uuid)
    RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN(
        SELECT
            gamestate
        FROM
            games
        WHERE
            id = p_gameid);
END;
$$;

