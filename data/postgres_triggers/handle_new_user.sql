CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    AS $$
DECLARE
    full_name text;
    first_name text;
    last_name text;
    name_parts text[];
    new_org_id uuid;
BEGIN
    full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '');
    IF full_name IS NOT NULL THEN
        -- Split the full name into an array
        name_parts := string_to_array(full_name, ' ');
        -- Get the last name (last element of the array)
        last_name := COALESCE(NEW.raw_user_meta_data ->> 'lastname', name_parts[array_length(name_parts, 1)], '');
        -- Get the first name (everything except the last element)
        first_name := COALESCE(NEW.raw_user_meta_data ->> 'firstname', NULLIF(array_to_string(name_parts[1:array_length(name_parts, 1) - 1], ' '), ''), '');
    ELSE
        last_name := COALESCE(NEW.raw_user_meta_data ->> 'lastname', '');
        first_name := COALESCE(NEW.raw_user_meta_data ->> 'firstname', '');
    END IF;
    -- Insert into public.profiles
    INSERT INTO public.profiles(id, email, firstname, lastname)
        VALUES (NEW.id, NEW.email, first_name, last_name);
    -- Create the org title
    full_name := NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '');
    -- Insert into public.orgs and get the new org id
    INSERT INTO public.orgs(id, title)
        VALUES (NEW.id, CONCAT(COALESCE(full_name, 'New User'), '''s Org'))
    RETURNING
        id INTO new_org_id;
    -- Insert into public.orgs_users
    INSERT INTO public.orgs_users(orgid, userid, user_role)
        VALUES (new_org_id, NEW.id, 'Admin');
    RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

